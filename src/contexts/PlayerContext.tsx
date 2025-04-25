import React, { createContext, useContext, useState } from 'react';

interface PlayerContextType {
    currentPlayer: string;
    currentTerritory: string;
    setCurrentPlayer: (player: string) => void;
    setCurrentTerritory: (territory: string) => void;
}

const PlayerContext = createContext<PlayerContextType>({
    currentPlayer: 'Player 1',
    currentTerritory: 'Attica',
    setCurrentPlayer: () => { },
    setCurrentTerritory: () => { }
});

const defaultContext: PlayerContextType = {
    currentPlayer: 'Player 1',
    currentTerritory: 'Attica',
    setCurrentPlayer: () => { },
    setCurrentTerritory: () => { }
};

export const PlayerProvider: React.FC<{ children: React.ReactNode }> = ({ children }) => {
    const [currentPlayer, setCurrentPlayer] = useState('Player 1');
    const [currentTerritory, setCurrentTerritory] = useState('Attica');

    return (
        <PlayerContext.Provider value={{ currentPlayer, currentTerritory, setCurrentPlayer, setCurrentTerritory }}>
            {children}
        </PlayerContext.Provider>
    );
};

export const usePlayer = () => useContext(PlayerContext); 