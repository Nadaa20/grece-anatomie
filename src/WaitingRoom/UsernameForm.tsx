import React, { useState } from 'react';
import './WaitingRoom.css';

interface UsernameFormProps {
    onSubmit: (username: string) => void;
    error: string;
    onTestGame: () => void;
}

const UsernameForm: React.FC<UsernameFormProps> = ({ onSubmit, error, onTestGame }) => {
    const [username, setUsername] = useState('');
    const [localError, setLocalError] = useState('');

    const handleSubmit = (e: React.FormEvent) => {
        e.preventDefault();
        const trimmedUsername = username.trim();
        
        if (!trimmedUsername) {
            setLocalError('Le nom d\'utilisateur ne peut pas être vide');
            return;
        }
        
        if (trimmedUsername.length < 2) {
            setLocalError('Le nom d\'utilisateur doit contenir au moins 2 caractères');
            return;
        }

        setLocalError('');
        onSubmit(trimmedUsername);
    };

    return (
        <div className="username-form">
            <h1>Bienvenue dans Grèce Anatomy</h1>
            <form onSubmit={handleSubmit}>
                <div className="form-group">
                    <label htmlFor="username">Choisissez votre pseudonyme :</label>
                    <input
                        type="text"
                        id="username"
                        value={username}
                        onChange={(e) => setUsername(e.target.value)}
                        placeholder="Entrez votre pseudonyme"
                        required
                    />
                </div>
                {(error || localError) && (
                    <div className="error">{error || localError}</div>
                )}
                <div className="button-group">
                    <button type="submit" className="submit-btn">
                        Continuer
                    </button>
                    <button 
                        type="button" 
                        className="test-btn"
                        onClick={onTestGame}
                    >
                        Tester le jeu
                    </button>
                </div>
            </form>
        </div>
    );
};

export default UsernameForm; 