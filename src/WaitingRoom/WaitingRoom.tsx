import React, { useState, useEffect, useContext } from 'react';
import { SocketContext } from '../contexts/SocketContext';
import UsernameForm from './UsernameForm';
import GameList from './GameList';
import WaitingScreen from './WaitingScreen';
import './WaitingRoom.css';

interface Game {
    tour_id: number;
    snapshot: string;
}

interface WaitingRoomProps {
    onGameReady: (gameId: number) => void;
}

const WaitingRoom: React.FC<WaitingRoomProps> = ({ onGameReady }) => {
    const { socket } = useContext(SocketContext);
    const [username, setUsername] = useState<string>('');
    const [savedGames, setSavedGames] = useState<Game[]>([]);
    const [currentGameId, setCurrentGameId] = useState<number | null>(null);
    const [error, setError] = useState<string>('');
    const [isWaiting, setIsWaiting] = useState<boolean>(false);

    useEffect(() => {

        socket.on('saved_games', (data: { games: Game[] }) => {
            setSavedGames(data.games);
        });

        socket.on('no_saved_games', () => {
            setSavedGames([]);
        });

        socket.on('waiting_for_players', (data: { gameId: number }) => {
            setCurrentGameId(data.gameId);
            setIsWaiting(true);
        });

        socket.on('game_ready', (data: { gameId: number }) => {
            if (data.gameId === currentGameId) {
                console.log('La partie est prête à démarrer');
                onGameReady(data.gameId);
            }
        });

        socket.on('show_game_map', (data: { status: string, players: number[], partie_id: number }) => {
            console.log('Événement show_game_map reçu:', data);
            onGameReady(data.partie_id);
        });

        socket.on('error', (data: { message: string }) => {
            setError(data.message);
        });

        return () => {
            socket.off('saved_games');
            socket.off('no_saved_games');
            socket.off('waiting_for_players');
            socket.off('game_ready');
            socket.off('show_game_map');
            socket.off('error');
        };
    }, [currentGameId, socket, onGameReady]);

    const handleUsernameSubmit = (username: string) => {
        console.log('Soumission du nom d\'utilisateur:', username);
        socket.emit('submit_username', username);
        setUsername(username);
    };

    const handleTestGame = () => {
        console.log('Clic sur le bouton de test');
        socket.emit('test_game');
    };

    const handleCreateNewGame = () => {
        socket.emit('create_new_game');
    };

    const handleJoinGame = (gameId: number) => {
        socket.emit('join_existing_game', gameId);
    };

    if (!username) {
        return <UsernameForm 
        onSubmit={handleUsernameSubmit} 
        error={error} 
        />;
    }

    if (isWaiting) {
        return <WaitingScreen gameId={currentGameId} onBack={() => setIsWaiting(false)} />;
    }

    return (
        <div className="waiting-room">
            <h1>Bienvenue, {username}!</h1>
            {error && <div className="error">{error}</div>}

            {savedGames.length > 0 ? (
                <GameList
                    games={savedGames}
                    onJoinGame={handleJoinGame}
                    onCreateNewGame={handleCreateNewGame}
                />
            ) : (
                <div className="new-game-options">
                    <h2>Aucune partie sauvegardée</h2>
                    <button onClick={handleCreateNewGame} className="create-game-btn">
                        Créer une nouvelle partie
                    </button>
                </div>
            )}
        </div>
    );
};

export default WaitingRoom; 