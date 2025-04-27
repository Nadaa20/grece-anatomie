import React from 'react';
import './WaitingRoom.css';

interface Game {
    tour_id: number;
    snapshot: string;
}

interface GameListProps {
    games: Game[];
    onJoinGame: (gameId: number) => void;
    onCreateNewGame: () => void;
}

const GameList: React.FC<GameListProps> = ({ games, onJoinGame, onCreateNewGame }) => {
    return (
        <div className="game-list">
            <h2>Parties sauvegardées</h2>
            <div className="games-container">
                {games.map((game) => (
                    <div key={game.tour_id} className="game-card">
                        <h3>Partie #{game.tour_id}</h3>
                        <button 
                            onClick={() => onJoinGame(game.tour_id)}
                            className="join-game-btn"
                        >
                            Rejoindre la partie
                        </button>
                    </div>
                ))}
            </div>
            <div className="new-game-option">
                <h3>Ou créer une nouvelle partie</h3>
                <button onClick={onCreateNewGame} className="create-game-btn">
                    Créer une nouvelle partie
                </button>
            </div>
        </div>
    );
};

export default GameList; 