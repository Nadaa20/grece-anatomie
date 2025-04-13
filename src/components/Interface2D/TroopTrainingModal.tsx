import React from 'react';
import { TROOP_TYPES, TroopType } from './TroopTypes';
import './TroopTrainingModal.css';

interface TroopTrainingModalProps {
    onClose: () => void;
    onTrainTroop: (troopId: string) => void;
    resources: {
        wood: number;
        stone: number;
        iron: number;
        marble: number;
        population_actuelle: number;
        population_max: number;
    };
    currentWorkers: number;
    totalTroops: number;
}

export const TroopTrainingModal: React.FC<TroopTrainingModalProps> = ({
    onClose,
    onTrainTroop,
    resources,
    currentWorkers,
    totalTroops
}) => {
    const canTrainTroop = (troop: TroopType): boolean => {
        const totalPopulationUsed = currentWorkers + totalTroops;
        if (resources.population_actuelle - totalPopulationUsed < troop.cost.population) return false;

        return Object.entries(troop.cost).every(([resource, cost]) => {
            if (resource === 'population') return true;
            return (resources as any)[resource] >= (cost || 0);
        });
    };

    return (
        <div className="troop-training-modal-overlay">
            <div className="troop-training-modal">
                <button className="close-modal-button" onClick={onClose}>×</button>
                <h2>Former des troupes</h2>
                <div className="available-resources">
                    <h3>Ressources disponibles</h3>
                    <div className="resources-grid">
                        <div className="resource-item">
                            <span>👥 Population disponible:</span>
                            <span>{resources.population_actuelle - currentWorkers - totalTroops}</span>
                        </div>
                        <div className="resource-item">
                            <span>🪵 Bois:</span>
                            <span>{resources.wood}</span>
                        </div>
                        <div className="resource-item">
                            <span>🪨 Pierre:</span>
                            <span>{resources.stone}</span>
                        </div>
                        <div className="resource-item">
                            <span>⚒️ Fer:</span>
                            <span>{resources.iron}</span>
                        </div>
                    </div>
                </div>
                <div className="troop-list">
                    {TROOP_TYPES.map(troop => {
                        const canTrain = canTrainTroop(troop);
                        return (
                            <div key={troop.id} className={`troop-item ${canTrain ? 'can-train' : 'cannot-train'}`}>
                                <div className="troop-info">
                                    <span className="troop-emoji">{troop.emoji}</span>
                                    <div className="troop-details">
                                        <h4>{troop.name}</h4>
                                        <p>{troop.description}</p>
                                        <div className="troop-stats">
                                            <span>⚔️ {troop.stats.attack}</span>
                                            <span>🛡️ {troop.stats.defense}</span>
                                            <span>⚡ {troop.stats.speed}</span>
                                        </div>
                                    </div>
                                </div>
                                <div className="troop-cost">
                                    <div className="cost-items">
                                        <span>👥 {troop.cost.population}</span>
                                        {troop.cost.wood && <span>🪵 {troop.cost.wood}</span>}
                                        {troop.cost.stone && <span>🪨 {troop.cost.stone}</span>}
                                        {troop.cost.iron && <span>⚒️ {troop.cost.iron}</span>}
                                        {troop.cost.marble && <span>🏛️ {troop.cost.marble}</span>}
                                    </div>
                                    <button
                                        className="train-button"
                                        onClick={() => onTrainTroop(troop.id)}
                                        disabled={!canTrain}
                                    >
                                        Former
                                    </button>
                                </div>
                            </div>
                        );
                    })}
                </div>
            </div>
        </div>
    );
}; 