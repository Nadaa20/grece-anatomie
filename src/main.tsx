import React, { useState } from 'react';
import ReactDOM from 'react-dom/client';
import App from './App';
import WaitingRoom from './WaitingRoom/WaitingRoom';
import { SocketProvider } from './contexts/SocketContext';
import { PlayerProvider } from './contexts/PlayerContext';

const RootComponent: React.FC = () => {
    const [currentGameId, setCurrentGameId] = useState<number | null>(null);

    const handleGameReady = (gameId: number) => {
        console.log('handleGameReady appelé avec gameId:', gameId);
        setCurrentGameId(gameId);
    };

    console.log('État actuel de currentGameId:', currentGameId);

    return (
        <SocketProvider>
            <PlayerProvider>
                {currentGameId ? (
                    <App currentGameId={currentGameId} onGameReady={handleGameReady} />
                ) : (
                    <WaitingRoom onGameReady={handleGameReady} />
                )}
            </PlayerProvider>
        </SocketProvider>
    );
};

ReactDOM.createRoot(document.getElementById('root')!).render(
    <React.StrictMode>
        <RootComponent />
    </React.StrictMode>,
);
