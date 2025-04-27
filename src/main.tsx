import React, { useState } from 'react';
import ReactDOM from 'react-dom/client';
import App from './App';
import WaitingRoom from './WaitingRoom/WaitingRoom';
import { SocketProvider } from './contexts/SocketContext';

const RootComponent: React.FC = () => {
    const [currentGameId, setCurrentGameId] = useState<number | null>(null);

    const handleGameReady = (gameId: number) => {
        setCurrentGameId(gameId);
    };

    return (
        <SocketProvider>
            {currentGameId ? <App /> : <WaitingRoom onGameReady={handleGameReady} />}
        </SocketProvider>
    );
};

ReactDOM.createRoot(document.getElementById('root')!).render(
    <React.StrictMode>
        <RootComponent />
    </React.StrictMode>,
);
