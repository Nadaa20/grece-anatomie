import React, { createContext, useContext, useState, useEffect } from 'react';

interface PlayerContextType {
    currentPlayer: string;
    currentTerritory: string;
    setCurrentPlayer: (player: string) => void;
    setCurrentTerritory: (territory: string) => void;
}

const PlayerContext = createContext<PlayerContextType>({
    currentPlayer: 'Player 1',
    currentTerritory: '',
    setCurrentPlayer: () => { },
    setCurrentTerritory: () => { }
});

const defaultContext: PlayerContextType = {
    currentPlayer: 'Player 1',
    currentTerritory: '',
    setCurrentPlayer: () => { },
    setCurrentTerritory: () => { }
};

export const PlayerProvider: React.FC<{ children: React.ReactNode }> = ({ children }) => {
    const [currentPlayer, setCurrentPlayer] = useState('Player 1');
    const [currentTerritory, setCurrentTerritory] = useState(() => {
        const savedTerritory = localStorage.getItem('currentTerritory');
        return savedTerritory || '';
    });

    useEffect(() => {
        console.log(`Territoire actuel dans PlayerContext : ${currentTerritory}`);
        localStorage.setItem('currentTerritory', currentTerritory);
    }, [currentTerritory]);

    return (
        <PlayerContext.Provider value={{ currentPlayer, currentTerritory, setCurrentPlayer, setCurrentTerritory }}>
            {children}
        </PlayerContext.Provider>
    );
};

export const usePlayer = () => useContext(PlayerContext); 