import React, { useState, useContext, createContext, useRef, useCallback, useMemo, useEffect } from 'react';
import { TroopModel } from './TroopModel';
import { Troop, HexCoordinates, PathNode } from '../../entities/Troop';
import { Hoplite, Frondeur, Messager, Commandant, Squad } from '../../entities/TroopTypes';

interface TroopManagerContextType {
    troops: Troop[];
    selectedTroop: string | null;
    selectTroop: (id: string) => void;
    getTroopAtHex: (row: number, col: number) => Troop | undefined;
    splitMoveTroop: (sourceId: string, newHexCoord: HexCoordinates, splitCounts: { [type: string]: number }) => void;
    path: HexCoordinates[];
    setPath: (path: HexCoordinates[]) => void;
    isMoving: boolean;
    startMoving: (id: string, target: HexCoordinates) => void;
    addTroop: (type: string, hexCoord: HexCoordinates) => void;
}

const TroopManagerContext = createContext<TroopManagerContextType | null>(null);

const INITIAL_TROOPS: Troop[] = [];

export const useTroopManager = () => {
    const context = useContext(TroopManagerContext);
    if (!context) {
        throw new Error('useTroopManager must be used within a TroopManagerProvider');
    }
    return context;
};

interface TroopManagerProviderProps {
    children: React.ReactNode;
}

export const TroopManagerProvider: React.FC<TroopManagerProviderProps> = ({ children }) => {
    const [troops, setTroops] = useState<Troop[]>(INITIAL_TROOPS);
    const [selectedTroop, setSelectedTroop] = useState<string | null>(null);
    const [path, setPath] = useState<HexCoordinates[]>([]);
    const [isMoving, setIsMoving] = useState(false);
    const [movingTroop, setMovingTroop] = useState<string | null>(null);
    const [currentPathIndex, setCurrentPathIndex] = useState(0);
    const [targetTroopId, setTargetTroopId] = useState<string | null>(null);
    const [pendingMoves, setPendingMoves] = useState<{ id: string, target: HexCoordinates }[]>([]);
    const [currentTroopCreation, setCurrentTroopCreation] = useState<{ hexCoord: HexCoordinates, type: string, currentIndex: number } | null>(null);

    // Effet pour initialiser les commandants
    useEffect(() => {
        const initialCities = [
            { name: 'Athens', territory: 'Attica', hexCoord: { row: 59, col: 62 } },
            { name: 'Sparta', territory: 'Pelopponesus', hexCoord: { row: 77, col: 37 } },
            { name: 'Thebes', territory: 'Thessaly', hexCoord: { row: 48, col: 48 } }
        ];

        const initialCommandants = initialCities.map(city => {
            // Placer le commandant à droite de la ville
            const commandantHexCoord = {
                row: city.hexCoord.row,
                col: city.hexCoord.col + 1
            };
            return new Commandant(commandantHexCoord, city.territory);
        });

        setTroops(initialCommandants);
    }, []);

    // Effet pour gérer les déplacements en attente
    useEffect(() => {
        if (pendingMoves.length > 0) {
            pendingMoves.forEach(({ id, target }) => {
                startMoving(id, target);
            });
            setPendingMoves([]);
        }
    }, [troops, pendingMoves]);

    // Effet pour gérer le mouvement des troupes
    useEffect(() => {
        if (!isMoving || !movingTroop || currentPathIndex >= path.length) return;

        const moveInterval = setInterval(() => {
            const troop = troops.find(t => t.id === movingTroop);
            if (!troop) {
                setIsMoving(false);
                setMovingTroop(null);
                setPath([]);
                clearInterval(moveInterval);
                return;
            }

            const nextPosition = path[currentPathIndex];
            const targetTroop = getTroopAtHex(nextPosition.row, nextPosition.col);

            if (targetTroop) {
                // Si la position cible est occupée, fusionner les troupes
                moveTroop(movingTroop, nextPosition);
                setIsMoving(false);
                setMovingTroop(null);
                setPath([]);
            } else {
                // Sinon, déplacer la troupe à la position suivante
                troop.moveTo(nextPosition);
                setTroops([...troops]);

                if (currentPathIndex === path.length - 1) {
                    // Fin du chemin
                    setIsMoving(false);
                    setMovingTroop(null);
                    setPath([]);
                } else {
                    // Continuer vers la prochaine position
                    setCurrentPathIndex(currentPathIndex + 1);
                }
            }
        }, 500); // Déplacement toutes les 500ms

        return () => clearInterval(moveInterval);
    }, [isMoving, movingTroop, currentPathIndex, path, troops]);

    // Détermine si une troupe/escouade contient un commandant
    const containsCommandant = (troop: Troop): boolean => {
        if (troop.type === 'Commandant') return true;
        if (troop.isSquad && troop.troops) {
            return troop.troops.some(t => t.type === 'Commandant');
        }
        return false;
    };

    // Détermine si une troupe/escouade est adjacente à un commandant
    const isAdjacentToCommandant = (troop: Troop): boolean => {
        const commandants = troops.filter(t => t.type === 'Commandant');
        return commandants.some(cmd => {
            const neighbors = getNeighbors(cmd.hexCoord);
            return neighbors.some(coord => coord.row === troop.hexCoord.row && coord.col === troop.hexCoord.col);
        });
    };

    // Détermine si une troupe/escouade est déplaçable
    const isTroopMovable = (troop: Troop): boolean => {
        if (troop.type === 'Commandant') return true;
        if (containsCommandant(troop)) return true;
        if (isAdjacentToCommandant(troop)) return true;
        return false;
    };

    // Restreindre la sélection
    const selectTroop = (id: string) => {
        const troop = troops.find(t => t.id === id);
        if (!troop || !isTroopMovable(troop)) {
            setSelectedTroop(null);
            return;
        }

        // Si c'est un messager avec un message, on vérifie si un commandant est adjacent
        if (troop.type === 'Messager' && typeof (troop as any).getMessage === 'function') {
            const message = (troop as any).getMessage();
            if (message) {
                // Vérifier si un commandant est adjacent
                const neighbors = getNeighbors(troop.hexCoord);
                const hasAdjacentCommandant = troops.some(t =>
                    t.type === 'Commandant' &&
                    neighbors.some(n => n.row === t.hexCoord.row && n.col === t.hexCoord.col)
                );

                if (hasAdjacentCommandant) {
                    window.dispatchEvent(new CustomEvent('show-message-read', {
                        detail: { message, messengerId: id }
                    }));
                } else {
                    console.log("Vous devez être un commandant adjacent pour lire le message");
                }
                return;
            }
        }

        if (selectedTroop === id) {
            setSelectedTroop(null);
        } else {
            setSelectedTroop(id);
        }
    };

    // Restreindre le déplacement
    const startMoving = (id: string, target: HexCoordinates) => {
        const troop = troops.find(t => t.id === id);
        if (!troop || !isTroopMovable(troop)) return;
        const newPath = findPath(troop.hexCoord, target);
        if (newPath.length === 0) return;
        setPath(newPath);
        setIsMoving(true);
        setMovingTroop(id);
        setCurrentPathIndex(0);
        setSelectedTroop(null);
    };

    const moveTroop = (id: string, newHexCoord: HexCoordinates) => {
        const newTroops = [...troops];
        const troopToMove = newTroops.find(t => t.id === id);
        const targetTroop = newTroops.find(t =>
            t.hexCoord.row === newHexCoord.row &&
            t.hexCoord.col === newHexCoord.col
        );

        if (troopToMove) {
            if (targetTroop) {
                let allTroops: Troop[] = [];

                if (troopToMove.isSquad) {
                    allTroops = [...(troopToMove as Squad).troops!];
                } else {
                    allTroops = [troopToMove];
                }

                if (targetTroop.isSquad) {
                    allTroops = [...allTroops, ...(targetTroop as Squad).troops!];
                } else {
                    allTroops = [...allTroops, targetTroop];
                }

                const newSquad = new Squad(newHexCoord, troopToMove.owner, allTroops);

                setTroops(troops.filter(t => t.id !== id && t.id !== targetTroop.id).concat(newSquad));
            } else {
                troopToMove.moveTo(newHexCoord);
                setTroops([...troops]);
            }
        }
        setSelectedTroop(null);
    };

    const splitMoveTroop = (sourceId: string, newHexCoord: HexCoordinates, splitCounts: { [type: string]: number }) => {
        const sourceTroop = troops.find(t => t.id === sourceId);
        if (!sourceTroop?.isSquad) return;

        const newTroops = troops.filter(t => t.id !== sourceId);
        const troopsToMove: Troop[] = [];
        const remainingTroops: Troop[] = [];

        Object.entries(splitCounts).forEach(([type, count]) => {
            const troopsOfType = (sourceTroop as Squad).troops!.filter(t => t.type === type);
            troopsToMove.push(...troopsOfType.slice(0, count));
            remainingTroops.push(...troopsOfType.slice(count));
        });

        if (troopsToMove.length > 0) {
            if (troopsToMove.length > 1) {
                const newSquad = new Squad(sourceTroop.hexCoord, sourceTroop.owner, troopsToMove);
                newTroops.push(newSquad);
                setPendingMoves(prev => [...prev, { id: newSquad.id, target: newHexCoord }]);
            } else {
                const troop = troopsToMove[0];
                troop.moveTo(sourceTroop.hexCoord);
                newTroops.push(troop);
                setPendingMoves(prev => [...prev, { id: troop.id, target: newHexCoord }]);
            }
        }

        if (remainingTroops.length > 0) {
            if (remainingTroops.length > 1) {
                const remainingSquad = new Squad(sourceTroop.hexCoord, sourceTroop.owner, remainingTroops);
                newTroops.push(remainingSquad);
            } else {
                const troop = remainingTroops[0];
                troop.moveTo(sourceTroop.hexCoord);
                newTroops.push(troop);
            }
        }

        setTroops(newTroops);
        setSelectedTroop(null);
    };

    const calculateDistance = (start: HexCoordinates, end: HexCoordinates): number => {
        const dx = Math.abs(end.col - start.col);
        const dy = Math.abs(end.row - start.row);
        return Math.max(dx, dy);
    };

    const getNeighbors = (hex: HexCoordinates): HexCoordinates[] => {
        const neighbors: HexCoordinates[] = [];
        const isEvenRow = hex.row % 2 === 0;

        let directions;
        if (isEvenRow) {
            directions = [
                { row: -1, col: -1 },
                { row: -1, col: 0 },
                { row: 0, col: -1 },
                { row: 0, col: 1 },
                { row: 1, col: -1 },
                { row: 1, col: 0 }
            ];
        } else {
            directions = [
                { row: -1, col: 0 },
                { row: -1, col: 1 },
                { row: 0, col: -1 },
                { row: 0, col: 1 },
                { row: 1, col: 0 },
                { row: 1, col: 1 }
            ];
        }

        directions.forEach(dir => {
            const newRow = hex.row + dir.row;
            const newCol = hex.col + dir.col;
            if (newRow >= 0 && newCol >= 0) {
                neighbors.push({ row: newRow, col: newCol });
            }
        });

        return neighbors;
    };

    const findPath = (start: HexCoordinates, end: HexCoordinates): HexCoordinates[] => {
        const openSet: PathNode[] = [{ ...start, f: 0, g: 0, h: 0 }];
        const closedSet = new Set<string>();
        const nodes = new Map<string, PathNode>();

        while (openSet.length > 0) {
            let current = openSet[0];
            let currentIndex = 0;

            for (let i = 1; i < openSet.length; i++) {
                if (openSet[i].f < current.f) {
                    current = openSet[i];
                    currentIndex = i;
                }
            }

            if (current.row === end.row && current.col === end.col) {
                const path: HexCoordinates[] = [];
                let temp = current;
                while (temp.parent) {
                    path.push({ row: temp.row, col: temp.col });
                    temp = temp.parent;
                }
                return path.reverse();
            }

            openSet.splice(currentIndex, 1);
            closedSet.add(`${current.row},${current.col}`);

            const neighbors = getNeighbors(current);
            for (const neighbor of neighbors) {
                const neighborKey = `${neighbor.row},${neighbor.col}`;
                if (closedSet.has(neighborKey)) continue;

                const gScore = current.g + 1;
                const hScore = calculateDistance(neighbor, end);
                const fScore = gScore + hScore;

                const existingNode = nodes.get(neighborKey);
                if (!existingNode || gScore < existingNode.g) {
                    const node: PathNode = {
                        ...neighbor,
                        f: fScore,
                        g: gScore,
                        h: hScore,
                        parent: current
                    };
                    nodes.set(neighborKey, node);

                    if (!openSet.some(n => n.row === neighbor.row && n.col === neighbor.col)) {
                        openSet.push(node);
                    }
                }
            }
        }

        return [];
    };

    useEffect(() => {
        const handleMoveMessenger = (event: CustomEvent<{ messengerId: string; target: HexCoordinates }>) => {
            startMoving(event.detail.messengerId, event.detail.target);
        };

        window.addEventListener('move-messenger', handleMoveMessenger as EventListener);

        // Ajout du listener pour l'enregistrement du message
        const handleMessengerMessage = (event: CustomEvent<{ messengerId: string; message: string }>) => {
            setTroops(prevTroops => {
                return prevTroops.map(troop => {
                    if (troop.id === event.detail.messengerId && troop.type === 'Messager' && typeof (troop as any).setMessage === 'function') {
                        (troop as any).setMessage(event.detail.message);
                    }
                    return troop;
                });
            });
        };
        window.addEventListener('messenger-message', handleMessengerMessage as EventListener);

        // Ajout du listener pour récupérer le message du messager
        const handleGetMessengerMessage = (event: CustomEvent<{ messengerId: string }>) => {
            const messenger = troops.find(t => t.id === event.detail.messengerId && t.type === 'Messager');
            if (messenger && typeof (messenger as any).getMessage === 'function') {
                console.log(`Message stocké dans le messager : ${(messenger as any).getMessage()}`);
            }
        };
        window.addEventListener('get-messenger-message', handleGetMessengerMessage as EventListener);

        // Ajout du listener pour effacer le message après lecture
        const handleMessageReadClose = (event: CustomEvent<{ messengerId: string }>) => {
            setTroops(prevTroops => {
                return prevTroops.map(troop => {
                    if (troop.id === event.detail.messengerId && troop.type === 'Messager' && typeof (troop as any).setMessage === 'function') {
                        (troop as any).setMessage('');
                    }
                    return troop;
                });
            });
        };
        window.addEventListener('message-read-close', handleMessageReadClose as EventListener);

        return () => {
            window.removeEventListener('move-messenger', handleMoveMessenger as EventListener);
            window.removeEventListener('messenger-message', handleMessengerMessage as EventListener);
            window.removeEventListener('get-messenger-message', handleGetMessengerMessage as EventListener);
            window.removeEventListener('message-read-close', handleMessageReadClose as EventListener);
        };
    }, [startMoving, troops]);

    const getAdjacentHexes = (hexCoord: HexCoordinates): HexCoordinates[] => {
        const isEvenRow = hexCoord.row % 2 === 0;
        const positions = isEvenRow ? [
            { row: hexCoord.row, col: hexCoord.col - 1 },     // 1
            { row: hexCoord.row - 1, col: hexCoord.col - 1 }, // 2
            { row: hexCoord.row - 1, col: hexCoord.col },     // 3
            { row: hexCoord.row, col: hexCoord.col + 1 },     // 4
            { row: hexCoord.row + 1, col: hexCoord.col },     // 5
            { row: hexCoord.row + 1, col: hexCoord.col - 1 }  // 6
        ] : [
            { row: hexCoord.row, col: hexCoord.col - 1 },     // 1
            { row: hexCoord.row - 1, col: hexCoord.col },     // 2
            { row: hexCoord.row - 1, col: hexCoord.col + 1 }, // 3
            { row: hexCoord.row, col: hexCoord.col + 1 },     // 4
            { row: hexCoord.row + 1, col: hexCoord.col + 1 }, // 5
            { row: hexCoord.row + 1, col: hexCoord.col }      // 6
        ];

        return positions.filter(pos => pos.row >= 0 && pos.col >= 0);
    };

    const getTroopCountAtHex = (hex: HexCoordinates): number => {
        const troop = getTroopAtHex(hex.row, hex.col);
        if (!troop) return 0;
        if (troop.isSquad) {
            return (troop as Squad).troops?.length || 0;
        }
        return 1;
    };

    const addTroop = (type: string, hexCoord: HexCoordinates) => {
        // Trouver la ville la plus proche pour déterminer le territoire
        const cities = [
            { name: 'Athens', territory: 'Attica', hexCoord: { row: 59, col: 62 } },
            { name: 'Sparta', territory: 'Pelopponesus', hexCoord: { row: 77, col: 37 } },
            { name: 'Thebes', territory: 'Thessaly', hexCoord: { row: 48, col: 48 } }
        ];

        const cityTerritory = cities.find(city =>
            city.hexCoord.row === hexCoord.row &&
            city.hexCoord.col === hexCoord.col
        )?.territory || 'Attica'; // Par défaut Attica si pas trouvé

        let newTroop: Troop;
        switch (type) {
            case 'hoplite':
                newTroop = new Hoplite(hexCoord, cityTerritory);
                break;
            case 'slinger':
                newTroop = new Frondeur(hexCoord, cityTerritory);
                break;
            case 'messenger':
                newTroop = new Messager(hexCoord, cityTerritory);
                break;
            case 'commandant':
                newTroop = new Commandant(hexCoord, cityTerritory);
                break;
            default:
                console.error(`Type de troupe inconnu : ${type}`);
                return;
        }

        // Obtenir les hexagones adjacents
        const adjacentHexes = getAdjacentHexes(hexCoord);

        // Trouver la position avec le moins de troupes
        let bestPosition = adjacentHexes[0];
        let minTroopCount = getTroopCountAtHex(bestPosition);

        for (const position of adjacentHexes) {
            const troopCount = getTroopCountAtHex(position);
            if (troopCount < minTroopCount) {
                minTroopCount = troopCount;
                bestPosition = position;
            }
        }

        // Placer la troupe à la meilleure position
        const existingTroop = getTroopAtHex(bestPosition.row, bestPosition.col);

        if (!existingTroop) {
            // Position libre, placer la nouvelle troupe ici
            newTroop.moveTo(bestPosition);
            setTroops(prevTroops => [...prevTroops, newTroop]);
        } else if (!existingTroop.isSquad) {
            // Position occupée par une troupe simple, former une escouade
            const newSquad = new Squad(bestPosition, existingTroop.owner, [existingTroop, newTroop]);
            setTroops(prevTroops => prevTroops.filter(t => t.id !== existingTroop.id).concat(newSquad));
        } else {
            // Position occupée par une escouade, ajouter la troupe à l'escouade
            const updatedSquad = new Squad(
                bestPosition,
                existingTroop.owner,
                [...(existingTroop as Squad).troops!, newTroop]
            );
            setTroops(prevTroops => prevTroops.filter(t => t.id !== existingTroop.id).concat(updatedSquad));
        }
    };

    const getTroopAtHex = (row: number, col: number): Troop | undefined => {
        return troops.find(t => t.hexCoord.row === row && t.hexCoord.col === col);
    };

    const value = {
        troops,
        selectedTroop,
        selectTroop,
        getTroopAtHex,
        splitMoveTroop,
        path,
        setPath,
        isMoving,
        startMoving,
        addTroop
    };

    return (
        <TroopManagerContext.Provider value={value}>
            {children}
        </TroopManagerContext.Provider>
    );
}; 