import React from 'react';
import './Parchemin.css';

interface ParcheminProps {
    hexagonName: string;
    onClose: () => void;
}

export const Parchemin: React.FC<ParcheminProps> = ({ hexagonName, onClose }) => {
    return (
        <div className="parchemin">
            <button className="close-button" onClick={onClose}>×</button>
            <div className="parchemin-content">
                <h3>{hexagonName}</h3>
                <h2>Liste des Troupes :</h2>
                
                {/* On mettra plus tard ici tout ce qu'on veut faire afficher dans le parchemin */}
            </div>
        </div>
    );
};

export default Parchemin; 