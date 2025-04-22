import React, { useState, useContext, createContext, useRef, useCallback, useMemo, useEffect } from 'react';
import { TroopModel } from './TroopModel';
import { v4 as uuidv4 } from 'uuid';

interface HexCoordinates {
    row: number;
    col: number;
}

interface PathNode extends HexCoordinates {
    f: number;
    g: number;
    h: number;
    parent?: PathNode;
}

interface Troop {
    id: string;
    hexCoord: HexCoordinates; // Coordonnées de l'hexagone
    type: string;
    owner: string;
    troops?: Troop[]; // Liste des troupes dans l'escouade
    isSquad?: boolean; // Indique si c'est une escouade
}

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

    // Effet pour gérer les déplacements en attente
    useEffect(() => {
        if (pendingMoves.length > 0) {
            pendingMoves.forEach(({ id, target }) => {
                startMoving(id, target);
            });
            setPendingMoves([]);
        }
    }, [troops, pendingMoves]);

    // Fonction simple pour sélectionner/désélectionner une troupe
    const selectTroop = (id: string) => {
        if (selectedTroop === id) {
            setSelectedTroop(null);
        } else {
            setSelectedTroop(id);
        }
    };

    // Fonction simplifiée pour déplacer une troupe
    const moveTroop = (id: string, newHexCoord: HexCoordinates) => {
        const newTroops = [...troops];
        const troopToMove = newTroops.find(t => t.id === id);
        const targetTroop = newTroops.find(t =>
            t.hexCoord.row === newHexCoord.row &&
            t.hexCoord.col === newHexCoord.col
        );

        // Si on trouve la troupe à déplacer
        if (troopToMove) {
            // Si il y a déjà une troupe à la destination
            if (targetTroop) {
                // On crée une liste de toutes les troupes à fusionner
                let allTroops = [];

                // On ajoute les troupes de la source
                if (troopToMove.isSquad) {
                    allTroops = [...troopToMove.troops!];
                } else {
                    allTroops = [troopToMove];
                }

                // On ajoute les troupes de la cible
                if (targetTroop.isSquad) {
                    allTroops = [...allTroops, ...targetTroop.troops!];
                } else {
                    allTroops = [...allTroops, targetTroop];
                }

                // On crée une nouvelle escouade
                const newSquad = {
                    id: uuidv4(),
                    hexCoord: newHexCoord,
                    type: 'squad',
                    owner: troopToMove.owner,
                    isSquad: true,
                    troops: allTroops
                };

                // On supprime les anciennes troupes et on ajoute la nouvelle escouade
                setTroops(troops.filter(t => t.id !== id && t.id !== targetTroop.id).concat(newSquad));
            } else {
                // Sinon on déplace simplement la troupe
                setTroops(troops.map(troop =>
                    troop.id === id ? { ...troop, hexCoord: newHexCoord } : troop
                ));
            }
        }
        setSelectedTroop(null);
    };

    // Fonction simplifiée pour diviser et déplacer une troupe
    const splitMoveTroop = (sourceId: string, newHexCoord: HexCoordinates, splitCounts: { [type: string]: number }) => {
        const sourceTroop = troops.find(t => t.id === sourceId);
        if (!sourceTroop?.isSquad) return;

        const newTroops = troops.filter(t => t.id !== sourceId);
        const troopsToMove: Troop[] = [];
        const remainingTroops: Troop[] = [];

        // Pour chaque type de troupe
        Object.entries(splitCounts).forEach(([type, count]) => {
            const troopsOfType = sourceTroop.troops!.filter(t => t.type === type);
            // On prend le nombre demandé pour le déplacement
            troopsToMove.push(...troopsOfType.slice(0, count));
            // On garde le reste
            remainingTroops.push(...troopsOfType.slice(count));
        });

        // On crée les nouvelles troupes/escouades selon le nombre
        if (troopsToMove.length > 0) {
            if (troopsToMove.length > 1) {
                const newSquad = {
                    id: uuidv4(),
                    hexCoord: sourceTroop.hexCoord, // On commence à la position de la source
                    type: 'squad',
                    owner: sourceTroop.owner,
                    isSquad: true,
                    troops: troopsToMove
                };
                newTroops.push(newSquad);
                // On ajoute le déplacement en attente
                setPendingMoves(prev => [...prev, { id: newSquad.id, target: newHexCoord }]);
            } else {
                const newTroop = {
                    ...troopsToMove[0],
                    id: uuidv4(),
                    hexCoord: sourceTroop.hexCoord // On commence à la position de la source
                };
                newTroops.push(newTroop);
                // On ajoute le déplacement en attente
                setPendingMoves(prev => [...prev, { id: newTroop.id, target: newHexCoord }]);
            }
        }

        if (remainingTroops.length > 0) {
            if (remainingTroops.length > 1) {
                newTroops.push({
                    ...sourceTroop,
                    troops: remainingTroops
                });
            } else {
                newTroops.push({
                    ...remainingTroops[0],
                    id: uuidv4(),
                    hexCoord: sourceTroop.hexCoord
                });
            }
        }

        // On met à jour l'état des troupes
        setTroops(newTroops);
        setSelectedTroop(null);
    };

    // Fonction pour calculer la distance entre deux hexagones
    const calculateDistance = (start: HexCoordinates, end: HexCoordinates): number => {
        const dx = Math.abs(end.col - start.col);
        const dy = Math.abs(end.row - start.row);
        return Math.max(dx, dy);
    };

    // Fonction pour obtenir les voisins d'un hexagone
    const getNeighbors = (hex: HexCoordinates): HexCoordinates[] => {
        const neighbors: HexCoordinates[] = [];
        const isEvenRow = hex.row % 2 === 0;

        let directions;
        if (isEvenRow) {
            directions = [
                { row: -1, col: -1 },  // haut-gauche
                { row: -1, col: 0 },   // haut-droite
                { row: 0, col: -1 },   // gauche
                { row: 0, col: 1 },    // droite
                { row: 1, col: -1 },   // bas-gauche
                { row: 1, col: 0 }     // bas-droite
            ];
        } else {
            directions = [
                { row: -1, col: 0 },   // haut-gauche
                { row: -1, col: 1 },   // haut-droite
                { row: 0, col: -1 },   // gauche
                { row: 0, col: 1 },    // droite
                { row: 1, col: 0 },    // bas-gauche
                { row: 1, col: 1 }     // bas-droite
            ];
        }

        directions.forEach(dir => {
            const newRow = hex.row + dir.row;
            const newCol = hex.col + dir.col;
            // On vérifie que les coordonnées sont valides (optionnel, selon vos besoins)
            if (newRow >= 0 && newCol >= 0) {
                neighbors.push({ row: newRow, col: newCol });
            }
        });

        return neighbors;
    };

    // Algorithme A* pour trouver le chemin le plus court
    const findPath = (start: HexCoordinates, end: HexCoordinates): HexCoordinates[] => {
        const openSet: PathNode[] = [{ ...start, f: 0, g: 0, h: 0 }];
        const closedSet = new Set<string>();
        const nodes = new Map<string, PathNode>();

        while (openSet.length > 0) {
            const current = openSet.reduce((min, node) => node.f < min.f ? node : min);

            if (current.row === end.row && current.col === end.col) {
                const path: HexCoordinates[] = [];
                let node: PathNode | undefined = current;
                while (node) {
                    path.unshift({ row: node.row, col: node.col });
                    node = node.parent;
                }
                return path;
            }

            openSet.splice(openSet.indexOf(current), 1);
            closedSet.add(`${current.row},${current.col}`);

            const neighbors = getNeighbors(current);
            for (const neighbor of neighbors) {
                const key = `${neighbor.row},${neighbor.col}`;
                if (closedSet.has(key)) continue;

                const g = current.g + 1;
                const h = calculateDistance(neighbor, end);
                const f = g + h;

                const existingNode = nodes.get(key);
                if (existingNode && g >= existingNode.g) continue;

                const node: PathNode = { ...neighbor, f, g, h, parent: current };
                nodes.set(key, node);
                openSet.push(node);
            }
        }

        return [];
    };

    // Fonction pour démarrer le déplacement
    const startMoving = (id: string, target: HexCoordinates) => {
        const troop = troops.find(t => t.id === id);
        if (!troop) return;

        const targetTroop = troops.find(t =>
            t.hexCoord.row === target.row &&
            t.hexCoord.col === target.col
        );

        // On calcule toujours le chemin vers la destination
        const path = findPath(troop.hexCoord, target);
        if (path.length > 0) {
            setPath(path);
            setMovingTroop(id);
            setIsMoving(true);
            setCurrentPathIndex(0);
            // On stocke la troupe cible pour la fusion après le déplacement
            if (targetTroop) {
                setTargetTroopId(targetTroop.id);
            }
        }
    };

    // Effet pour gérer le déplacement case par case
    useEffect(() => {
        if (!isMoving || !movingTroop || path.length === 0) return;

        const interval = setInterval(() => {
            if (currentPathIndex < path.length) {
                const newTroops = troops.map(troop =>
                    troop.id === movingTroop
                        ? { ...troop, hexCoord: path[currentPathIndex] }
                        : troop
                );
                setTroops(newTroops);
                setCurrentPathIndex(prev => prev + 1);

                // Si c'est le dernier déplacement, on gère la fusion immédiatement
                if (currentPathIndex === path.length - 1) {
                    const targetTroop = newTroops.find(t =>
                        t.hexCoord.row === path[path.length - 1].row &&
                        t.hexCoord.col === path[path.length - 1].col &&
                        t.id !== movingTroop
                    );

                    if (targetTroop) {
                        const movingTroopObj = newTroops.find(t => t.id === movingTroop);
                        if (movingTroopObj) {
                            let allTroops = [];

                            // On ajoute les troupes de la source
                            if (movingTroopObj.isSquad) {
                                allTroops = [...movingTroopObj.troops!];
                            } else {
                                allTroops = [movingTroopObj];
                            }

                            // On ajoute les troupes de la cible
                            if (targetTroop.isSquad) {
                                allTroops = [...allTroops, ...targetTroop.troops!];
                            } else {
                                allTroops = [...allTroops, targetTroop];
                            }

                            // On crée une nouvelle escouade
                            const newSquad = {
                                id: uuidv4(),
                                hexCoord: path[path.length - 1],
                                type: 'squad',
                                owner: movingTroopObj.owner,
                                isSquad: true,
                                troops: allTroops
                            };

                            // On supprime les anciennes troupes et on ajoute la nouvelle escouade
                            setTroops(newTroops.filter(t => t.id !== movingTroop && t.id !== targetTroop.id).concat(newSquad));
                        }
                    }
                }
            } else {
                setIsMoving(false);
                setMovingTroop(null);
                setTargetTroopId(null);
                setPath([]);
                setCurrentPathIndex(0);
            }
        }, 500); // Déplacement toutes les 500ms

        return () => clearInterval(interval);
    }, [isMoving, movingTroop, targetTroopId, path, currentPathIndex, troops]);

    const value = {
        troops,
        selectedTroop,
        selectTroop,
        getTroopAtHex: (row: number, col: number) =>
            troops.find(t => t.hexCoord.row === row && t.hexCoord.col === col),
        splitMoveTroop,
        path,
        setPath,
        isMoving,
        startMoving,
        addTroop: (type: string, hexCoord: HexCoordinates) => {
            // Définir l'ordre d'apparition des troupes autour de la ville
            const directions = [
                { row: 0, col: -1 },    // 1 - Ouest
                { row: -1, col: 0 },    // 2 - Nord-Ouest
                { row: -1, col: 1 },    // 3 - Nord-Est
                { row: 0, col: 1 },     // 4 - Est
                { row: 1, col: 1 },     // 5 - Sud-Est
                { row: 1, col: 0 }      // 6 - Sud-Ouest
            ];

            // Trouver la première position disponible dans l'ordre spécifié
            let targetHex = null;
            let minTroopsCount = Infinity;
            let targetTroop = null;

            for (const dir of directions) {
                const newRow = hexCoord.row + dir.row;
                const newCol = hexCoord.col + dir.col;

                // Vérifier si la position est valide (pas négative)
                if (newRow >= 0 && newCol >= 0) {
                    // Vérifier si la position est déjà occupée
                    const troopAtPosition = troops.find(t =>
                        t.hexCoord.row === newRow &&
                        t.hexCoord.col === newCol
                    );

                    if (!troopAtPosition) {
                        targetHex = { row: newRow, col: newCol };
                        break;
                    } else {
                        // Compter le nombre de troupes sur cette position
                        let troopCount = 1;
                        if (troopAtPosition.isSquad) {
                            troopCount = troopAtPosition.troops!.length;
                        }

                        // Si c'est la case avec le moins de troupes jusqu'à présent
                        if (troopCount < minTroopsCount) {
                            minTroopsCount = troopCount;
                            targetTroop = troopAtPosition;
                        }
                    }
                }
            }

            // Si on a trouvé une position valide
            if (targetHex) {
                const newTroop: Troop = {
                    id: uuidv4(),
                    hexCoord: targetHex,
                    type,
                    owner: "player1"
                };
                console.log('Nouvelle troupe créée:', {
                    id: newTroop.id,
                    type: newTroop.type,
                    position: newTroop.hexCoord,
                    owner: newTroop.owner
                });
                setTroops(prev => [...prev, newTroop]);
            } else if (targetTroop) {
                // Si aucune position n'est disponible mais qu'on a trouvé une troupe existante
                // On crée une escouade avec la nouvelle troupe
                const newTroop = {
                    id: uuidv4(),
                    hexCoord: targetTroop.hexCoord,
                    type,
                    owner: "player1"
                };

                let allTroops = [];
                if (targetTroop.isSquad) {
                    allTroops = [...targetTroop.troops!];
                } else {
                    allTroops = [targetTroop];
                }
                allTroops.push(newTroop);

                const newSquad = {
                    id: uuidv4(),
                    hexCoord: targetTroop.hexCoord,
                    type: 'squad',
                    owner: "player1",
                    isSquad: true,
                    troops: allTroops
                };

                console.log('Nouvelle escouade créée:', {
                    id: newSquad.id,
                    position: newSquad.hexCoord,
                    owner: newSquad.owner,
                    troupes: newSquad.troops.map(t => ({
                        id: t.id,
                        type: t.type,
                        position: t.hexCoord
                    }))
                });

                setTroops(prev => prev.filter(t => t.id !== targetTroop.id).concat(newSquad));
            } else {
                // Si aucune position n'est disponible et aucune troupe n'est trouvée
                console.log("Aucune position disponible pour créer la troupe");
            }
        }
    };

    return (
        <TroopManagerContext.Provider value={value}>
            {children}
        </TroopManagerContext.Provider>
    );
}; 