import React from 'react';
import './WaitingRoom.css';

interface WaitingScreenProps {
    gameId: number | null;
    onBack?: () => void;
}

const WaitingScreen: React.FC<WaitingScreenProps> = ({ gameId, onBack }) => {
    return (
        <div className="waiting-screen">
            <h1>En attente des autres joueurs...</h1>
            <div className="loading-container">
                <div className="loading-spinner"></div>
                <p>Partie #{gameId}</p>
                <p>En attente que 3 joueurs se connectent</p>
            </div>
            {onBack && (
                <button onClick={onBack} className="back-btn">
                    Retour
                </button>
            )}
        </div>
    );
};

export default WaitingScreen; 