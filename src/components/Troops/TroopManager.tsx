import React, { useState, useContext, createContext } from 'react';
import { TroopModel } from './TroopModel';
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
}

interface TroopManagerContextType {
    troops: Troop[];
    selectedTroop: string | null;
    selectTroop: (id: string) => void;
    moveTroop: (id: string, newHexCoord: HexCoordinates) => void;
    getTroopAtHex: (row: number, col: number) => Troop | undefined;
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
        type: "archer",
        owner: "player1"
    },
    {
        id: uuidv4(),
        hexCoord: { row: 0, col: 2 },
        type: "cavalry",
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

    const selectTroop = (id: string) => {
        setSelectedTroop(id === selectedTroop ? null : id);
    };

    const moveTroop = (id: string, newHexCoord: HexCoordinates) => {
        setTroops(troops.map(troop =>
            troop.id === id ? { ...troop, hexCoord: newHexCoord } : troop
        ));
        setSelectedTroop(null);
    };

    const getTroopAtHex = (row: number, col: number) => {
        return troops.find(troop =>
            troop.hexCoord.row === row && troop.hexCoord.col === col
        );
    };

    return (
        <TroopManagerContext.Provider value={{
            troops,
            selectedTroop,
            selectTroop,
            moveTroop,
            getTroopAtHex
        }}>
            {children}
        </TroopManagerContext.Provider>
    );
}; 