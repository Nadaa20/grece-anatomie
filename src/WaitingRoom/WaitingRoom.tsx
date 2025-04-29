import React, { useState, useEffect, useContext } from 'react';
import { SocketContext } from '../contexts/SocketContext';
import UsernameForm from './UsernameForm';
import GameList from './GameList';
import WaitingScreen from './WaitingScreen';
import { usePlayer } from '../contexts/PlayerContext';
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
    const { currentTerritory, setCurrentTerritory } = usePlayer();
    const [username, setUsername] = useState<string>('');
    const [savedGames, setSavedGames] = useState<Game[]>([]);
    const [currentGameId, setCurrentGameId] = useState<number | null>(null);
    const [error, setError] = useState<string>('');
    const [isWaiting, setIsWaiting] = useState<boolean>(false);
    const [showTerritorySelection, setShowTerritorySelection] = useState<boolean>(false);
    const [selectedGameId, setSelectedGameId] = useState<number | null>(null);
    const [showJoinCodeInput, setShowJoinCodeInput] = useState<boolean>(false);
    const [joinCode, setJoinCode] = useState<string>('');

    const territories = ["Attica", "Thessaly", "Pelopponesus"];

    useEffect(() => {
        if (!socket) {
            console.log('[CLIENT] En attente de la connexion socket...');
            return;
        }

        console.log('[CLIENT] Configuration des événements socket');


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
            if (socket) {
                console.log('[CLIENT] Nettoyage des événements socket');
                socket.off('saved_games');
                socket.off('no_saved_games');
                socket.off('waiting_for_players');
                socket.off('game_ready');
                socket.off('show_game_map');
                socket.off('error');
            }
        };
    }, [currentGameId, socket, onGameReady]);

    const handleUsernameSubmit = (username: string) => {
        if (!socket) {
            setError('La connexion au serveur n\'est pas établie');
            return;
        }
        console.log('Soumission du nom d\'utilisateur:', username);
        socket.emit('submit_username', username);
        setUsername(username);
    };

    const handleTestGame = () => {
        if (!socket) {
            setError('La connexion au serveur n\'est pas établie');
            return;
        }
        console.log('Clic sur le bouton de test');
        setCurrentTerritory("Attica");
        window.dispatchEvent(new CustomEvent('test-mode', {
            detail: { isTest: true }
        }));
        socket.emit('test_game');
    };

    const handleCreateNewGame = () => {
        if (!socket) {
            setError('La connexion au serveur n\'est pas établie');
            return;
        }
        setShowTerritorySelection(true);
        setSelectedGameId(null);
    };

    const handleJoinGame = (gameId: number) => {
        if (!socket) {
            setError('La connexion au serveur n\'est pas établie');
            return;
        }
        setShowTerritorySelection(true);
        setSelectedGameId(gameId);
    };

    const handleTerritorySelect = (territory: string) => {
        setCurrentTerritory(territory);
        setShowTerritorySelection(false);

        if (!socket) {
            setError('La connexion au serveur n\'est pas établie');
            return;
        }

        if (selectedGameId) {
            socket.emit('join_existing_game', { gameId: selectedGameId, territory });
        } else {
            socket.emit('create_new_game', { territory });
        }
    };

    const handleJoinWithCode = () => {
        setShowJoinCodeInput(true);
    };

    const handleJoinCodeSubmit = (code: string) => {
        const gameId = parseInt(code);
        if (isNaN(gameId)) {
            setError('Code de partie invalide');
            return;
        }
        setShowJoinCodeInput(false);
        setShowTerritorySelection(true);
        setSelectedGameId(gameId);
    };

    if (!socket) {
        return (
            <div className="waiting-room">
                <h1>Connexion au serveur...</h1>
                <div className="loading-container">
                    <div className="loading-spinner"></div>
                </div>
            </div>
        );
    }

    if (!username) {
        return <UsernameForm
            onSubmit={handleUsernameSubmit}
            error={error}
            onTestGame={handleTestGame}
        />;
    }

    if (isWaiting) {
        return <WaitingScreen gameId={currentGameId} onBack={() => setIsWaiting(false)} />;
    }

    if (showJoinCodeInput) {
        return (
            <div className="join-code-input">
                <h2>Rejoindre une partie</h2>
                <input
                    type="text"
                    placeholder="Entrez le code de la partie"
                    value={joinCode}
                    onChange={(e) => setJoinCode(e.target.value)}
                />
                <button onClick={() => handleJoinCodeSubmit(joinCode)}>Rejoindre</button>
                <button onClick={() => setShowJoinCodeInput(false)}>Annuler</button>
            </div>
        );
    }

    if (showTerritorySelection) {
        return (
            <div className="territory-selection">
                <h2>Choisissez votre territoire</h2>
                <div className="territory-buttons">
                    {territories.map((territory) => (
                        <button
                            key={territory}
                            onClick={() => handleTerritorySelect(territory)}
                            className={currentTerritory === territory ? "active" : ""}
                        >
                            {territory}
                        </button>
                    ))}
                </div>
            </div>
        );
    }

    return (
        <div className="waiting-room">
            <h1>Bienvenue, {username}!</h1>
            {error && <div className="error">{error}</div>}

            <div className="join-options">
                <button onClick={handleJoinWithCode} className="join-code-btn">
                    Rejoindre avec un code
                </button>
            </div>

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