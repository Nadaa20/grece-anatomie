import React from 'react';
import './Parchemin.css';

interface ParcheminProps {
    hexagonName: string;
    onClose: () => void;
}

export const Parchemin: React.FC<ParcheminProps> = ({ hexagonName, onClose }) => {
    return (
        <div className="parchemin">
            <div className="parchemin-content">
                <h2>Troupes de {hexagonName}</h2>
                <div className="troupe-info">
                    <h3>Nom troupe 1</h3>
                    <p>Vie troupe 1</p>
                    <p>Dégats troupe 1</p>
                    <div className="buffs">
                        <h4>Buffs troupe 1 :</h4>
                        <ul>
                            <li>Buff 1 : ...</li>
                            <li>Buff n : ...</li>
                        </ul>
                    </div>
                </div>

                <div className="troupe-info">
                    <h3>Nom troupe 2</h3>
                    <p>Vie troupe 2</p>
                    <p>Dégats troupe 2</p>
                    <div className="buffs">
                        <h4>Buffs troupe 2 :</h4>
                        <ul>
                            <li>Buff 1 : ...</li>
                            <li>Buff n : ...</li>
                        </ul>
                    </div>
                </div>

                <button className="donner-ordre" onClick={onClose}>Donner un ordre</button>
            </div>
        </div>
    );
}; 