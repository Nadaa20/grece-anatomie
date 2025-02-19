import React, { useState, useContext, createContext, useRef, useCallback, useMemo, useEffect } from 'react';
import TroopModel from './TroopModel';
import { v4 as uuidv4 } from 'uuid';

interface HexCoordinates {
    row: number;
    col: number;
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
    moveTroop: (id: string, newHexCoord: HexCoordinates) => void;
    getTroopAtHex: (row: number, col: number) => Troop | undefined;
    splitMoveTroop: (sourceId: string, newHexCoord: HexCoordinates, splitCounts: { [type: string]: number }) => void;
}

const TroopManagerContext = createContext<TroopManagerContextType | null>(null);

const INITIAL_TROOPS: Troop[] = [
    {
        id: uuidv4(),
        hexCoord: { row: 0, col: 0 },
        type: "hoplite",
        owner: "player1"
    },
    {
        id: uuidv4(),
        hexCoord: { row: 0, col: 1 },
        type: "frondeur",
        owner: "player1"
    },
    {
        id: uuidv4(),
        hexCoord: { row: 0, col: 2 },
        type: "messager",
        owner: "player1"
    },
    {
        id: uuidv4(),
        hexCoord: { row: 0, col: 3 },
        type: "hoplite",
        owner: "player1"
    }
];

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
        const troopsToMove = [];
        const remainingTroops = [];

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
                newTroops.push({
                    id: uuidv4(),
                    hexCoord: newHexCoord,
                    type: 'squad',
                    owner: sourceTroop.owner,
                    isSquad: true,
                    troops: troopsToMove
                });
            } else {
                newTroops.push({
                    ...troopsToMove[0],
                    id: uuidv4(),
                    hexCoord: newHexCoord
                });
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

        setTroops(newTroops);
        setSelectedTroop(null);
    };

    const value = {
        troops,
        selectedTroop,
        selectTroop,
        moveTroop,
        getTroopAtHex: (row: number, col: number) =>
            troops.find(t => t.hexCoord.row === row && t.hexCoord.col === col),
        splitMoveTroop
    };

    return (
        <TroopManagerContext.Provider value={value}>
            {children}
        </TroopManagerContext.Provider>
    );
}; 