import React, { useState } from 'react';
import './MessageInputModal.css';

interface MessageInputModalProps {
    onConfirm: (message: string) => void;
    onClose: () => void;
    initialMessage?: string;
    readOnly?: boolean;
}

export const MessageInputModal: React.FC<MessageInputModalProps> = ({
    onConfirm,
    onClose,
    initialMessage = '',
    readOnly = false
}) => {
    const [message, setMessage] = useState(initialMessage);

    const handleSubmit = (e: React.FormEvent) => {
        e.preventDefault();
        if (!readOnly) {
            onConfirm(message);
        } else {
            onClose();
        }
    };

    return (
        <div className="message-input-modal">
            <div className="message-input-content">
                <h2>{readOnly ? 'Message du messager' : 'Écrire un message'}</h2>
                <form onSubmit={handleSubmit}>
                    <textarea
                        value={message}
                        onChange={(e) => setMessage(e.target.value)}
                        placeholder="Écrivez votre message ici..."
                        rows={4}
                        readOnly={readOnly}
                    />
                    <div className="message-input-buttons">
                        {readOnly ? (
                            <button type="button" className="confirm-button" onClick={onClose}>
                                Fermer
                            </button>
                        ) : (
                            <>
                                <button type="submit" className="confirm-button">
                                    Envoyer
                                </button>
                                <button type="button" className="cancel-button" onClick={onClose}>
                                    Annuler
                                </button>
                            </>
                        )}
                    </div>
                </form>
            </div>
        </div>
    );
}; 