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
    const selectedTroopRef = useRef<string | null>(null);

    const selectTroop = useCallback((id: string) => {
        setSelectedTroop(prev => {
            const newSelected = prev === id ? null : id;
            selectedTroopRef.current = newSelected;
            return newSelected;
        });
    }, []);

    const moveTroop = useCallback((id: string, newHexCoord: HexCoordinates) => {
        setTroops(prev => {
            const movingTroop = prev.find(t => t.id === id);
            const targetHexTroop = prev.find(t =>
                t.hexCoord.row === newHexCoord.row &&
                t.hexCoord.col === newHexCoord.col &&
                t.id !== id
            );

            if (targetHexTroop) {
                // Si une troupe existe déjà à la destination, créer une escouade
                const squad: Troop = {
                    id: uuidv4(),
                    hexCoord: newHexCoord,
                    type: 'squad',
                    owner: movingTroop?.owner || targetHexTroop.owner,
                    isSquad: true,
                    troops: [
                        { ...targetHexTroop, hexCoord: newHexCoord },
                        ...(movingTroop ? [{ ...movingTroop, hexCoord: newHexCoord }] : [])
                    ]
                };

                // Retourner le nouveau tableau sans les troupes fusionnées et avec la nouvelle escouade
                return prev
                    .filter(t => t.id !== id && t.id !== targetHexTroop.id)
                    .concat(squad);
            }

            // Comportement normal si pas de fusion
            return prev.map(troop =>
                troop.id === id ? { ...troop, hexCoord: newHexCoord } : troop
            );
        });
        setSelectedTroop(null);
        selectedTroopRef.current = null;
    }, []);

    const getTroopAtHex = useCallback((row: number, col: number) => {
        return troops.find(troop =>
            troop.hexCoord.row === row && troop.hexCoord.col === col
        );
    }, [troops]);

    const splitMoveTroop = useCallback((
        sourceId: string,
        newHexCoord: HexCoordinates,
        splitCounts: { [type: string]: number }
    ) => {
        setTroops(prev => {
            const sourceTroop = prev.find(t => t.id === sourceId);
            if (!sourceTroop) return prev;

            const newTroops: Troop[] = prev.filter(t => t.id !== sourceId);

            // Préparer les troupes à déplacer
            let troopsToMove: Troop[] = [];
            let remainingTroops: Troop[] = [];

            if (sourceTroop.isSquad && sourceTroop.troops) {
                // Pour chaque type, sélectionner le nombre demandé de troupes
                Object.entries(splitCounts).forEach(([type, count]) => {
                    const troopsOfType = sourceTroop.troops!.filter(t => t.type === type);
                    troopsToMove = troopsToMove.concat(troopsOfType.slice(0, count));
                    remainingTroops = remainingTroops.concat(troopsOfType.slice(count));
                });

                // Créer une nouvelle escouade avec les troupes déplacées si nécessaire
                if (troopsToMove.length > 1) {
                    const newSquad: Troop = {
                        id: uuidv4(),
                        hexCoord: newHexCoord,
                        type: 'squad',
                        owner: sourceTroop.owner,
                        isSquad: true,
                        troops: troopsToMove.map(t => ({ ...t, hexCoord: newHexCoord }))
                    };
                    newTroops.push(newSquad);
                } else if (troopsToMove.length === 1) {
                    // Si une seule troupe, la déplacer simplement
                    newTroops.push({
                        ...troopsToMove[0],
                        id: uuidv4(),
                        hexCoord: newHexCoord
                    });
                }

                // Gérer les troupes restantes
                if (remainingTroops.length > 1) {
                    // Garder l'escouade avec les troupes restantes
                    newTroops.push({
                        ...sourceTroop,
                        troops: remainingTroops.map(t => ({ ...t, hexCoord: sourceTroop.hexCoord }))
                    });
                } else if (remainingTroops.length === 1) {
                    // Si une seule troupe reste, la garder simple
                    newTroops.push({
                        ...remainingTroops[0],
                        id: uuidv4(),
                        hexCoord: sourceTroop.hexCoord // Garder la position de l'escouade
                    });
                }
            }

            return newTroops;
        });
        setSelectedTroop(null); // Désélectionner la troupe après le déplacement
    }, []);

    const value = useMemo(() => ({
        troops,
        selectedTroop,
        selectTroop,
        moveTroop,
        getTroopAtHex,
        splitMoveTroop
    }), [troops, selectedTroop, selectTroop, moveTroop, getTroopAtHex, splitMoveTroop]);

    return (
        <TroopManagerContext.Provider value={value}>
            {children}
        </TroopManagerContext.Provider>
    );
}; 