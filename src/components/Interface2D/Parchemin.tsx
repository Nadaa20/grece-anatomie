import React, { useState, useEffect } from 'react';
import './Parchemin.css';
import { BUILDING_TYPES, BuildingType, HexagonType } from '../Cities/BuildingTypes';

interface ParcheminsData {
    Batiments: { [key: string]: number };
    Troupes: { [key: string]: number };
    Quetes: { [key: string]: string };
    Ressources?: {
        wood: number;
        stone: number;
        iron: number;
        marble: number;
    };
    hexagonName: string;
}

interface ParcheminProps {
    onClose: () => void;
    data: ParcheminsData | null;
    hexagonType: HexagonType;
}

const tabs = ['Batiments', 'Troupes', 'Quetes'] as const;
type TabType = typeof tabs[number];

const TabContent: React.FC<{ type: TabType; data: ParcheminsData; hexagonType: HexagonType }> = ({ type, data, hexagonType }) => {
    const canAffordBuilding = (building: BuildingType): boolean => {
        if (!data.Ressources) return false;
        return Object.entries(building.cost).every(
            ([resource, cost]) => (data.Ressources as any)[resource] >= cost
        );
    };

    const handleBuild = (building: BuildingType) => {
        if (!data.Ressources || !canAffordBuilding(building)) return;

        window.dispatchEvent(new CustomEvent('build-building', {
            detail: {
                buildingId: building.id,
                cost: building.cost,
                hexagonName: data.hexagonName
            }
        }));
    };

    const handleUseBuilding = (building: BuildingType) => {
        window.dispatchEvent(new CustomEvent('use-building', {
            detail: {
                buildingId: building.id,
                hexagonName: data.hexagonName
            }
        }));
    };

    switch (type) {
        case 'Batiments':
            return (
                <div className="batiments-container">
                    <div className="ressources-display">
                        <h3>Ressources disponibles</h3>
                        <div className="ressources-grid">
                            {Object.entries(data.Ressources || {}).map(([resource, amount]) => (
                                <div key={resource} className="ressource-item">
                                    <span>{resource === 'wood' ? '🪵' : resource === 'stone' ? '🪨' : resource === 'iron' ? '⚒️' : '🏛️'} {resource}:</span>
                                    <span>{amount}</span>
                                </div>
                            ))}
                        </div>
                    </div>

                    <div className="batiments-list">
                        <h3>Bâtiments existants</h3>
                        {Object.entries(data.Batiments).map(([batiment, quantite]) => {
                            const buildingType = BUILDING_TYPES.find(b => b.id === batiment);
                            if (!buildingType) return null;
                            return (
                                <div key={batiment} className="batiment-item">
                                    <span className="batiment-emoji">{buildingType.emoji}</span>
                                    <span className="batiment-nom">{buildingType.name}</span>
                                    <span className="batiment-quantite">x{quantite}</span>
                                    {buildingType.isActive && (
                                        <button
                                            className="use-button"
                                            onClick={() => handleUseBuilding(buildingType)}
                                        >
                                            Utiliser
                                        </button>
                                    )}
                                </div>
                            );
                        })}
                    </div>

                    <div className="constructible-buildings">
                        <h3>Bâtiments constructibles</h3>
                        {BUILDING_TYPES
                            .filter(b => !b.isStarting && b.buildableOn.includes(hexagonType))
                            .map(building => {
                                const canAfford = canAffordBuilding(building);
                                return (
                                    <div key={building.id} className={`constructible-item ${canAfford ? 'can-afford' : 'cannot-afford'}`}>
                                        <div className="building-info">
                                            <span className="building-emoji">{building.emoji}</span>
                                            <span className="building-name">{building.name}</span>
                                            <span className="building-effect">{building.effect}</span>
                                        </div>
                                        <div className="building-cost">
                                            {Object.entries(building.cost)
                                                .filter(([_, cost]) => cost > 0)
                                                .map(([resource, cost]) => (
                                                    <span key={resource} className="cost-item">
                                                        {resource === 'wood' ? '🪵' : resource === 'stone' ? '🪨' : resource === 'iron' ? '⚒️' : '🏛️'} {cost}
                                                    </span>
                                                ))}
                                        </div>
                                        <button
                                            className="build-button"
                                            onClick={() => handleBuild(building)}
                                            disabled={!canAfford}
                                        >
                                            Construire
                                        </button>
                                    </div>
                                );
                            })}
                    </div>
                </div>
            );
        case 'Troupes':
            return Object.keys(data.Troupes).length === 0 ? (
                <p>Aucune troupe présente sur cette case</p>
            ) : (
                <div className="troupes-list">
                    {Object.entries(data.Troupes).map(([troupe, quantite]) => (
                        <div key={troupe} className="troupe-item">
                            <span className="troupe-nom">{troupe}</span>
                            <span className="troupe-quantite">x{quantite}</span>
                        </div>
                    ))}
                </div>
            );
        case 'Quetes':
            return Object.keys(data.Quetes).length === 0 ? (
                <p>Aucune quête disponible sur cette case</p>
            ) : (
                <div className="quetes-list">
                    {Object.entries(data.Quetes).map(([quete, description]) => (
                        <div key={quete} className="quete-item">
                            <h3 className="quete-titre">{quete}</h3>
                            <p className="quete-description">{description}</p>
                        </div>
                    ))}
                </div>
            );
    }
};

export const Parchemin: React.FC<ParcheminProps> = ({ onClose, data, hexagonType }) => {
    const [activeTab, setActiveTab] = useState<TabType>('Batiments');
    const [localData, setLocalData] = useState<ParcheminsData | null>(data);

    useEffect(() => {
        setLocalData(data);
    }, [data]);

    useEffect(() => {
        const handleBuildingConstructed = (event: CustomEvent<{ cityName: string; buildingId: string }>) => {
            if (localData?.hexagonName !== event.detail.cityName) return;

            setLocalData(prevData => {
                if (!prevData) return null;
                const building = BUILDING_TYPES.find(b => b.id === event.detail.buildingId);
                if (!building || !prevData.Ressources) return prevData;

                return {
                    ...prevData,
                    Batiments: {
                        ...prevData.Batiments,
                        [event.detail.buildingId]: (prevData.Batiments[event.detail.buildingId] || 0) + 1
                    },
                    Ressources: {
                        ...prevData.Ressources,
                        wood: prevData.Ressources.wood - building.cost.wood,
                        stone: prevData.Ressources.stone - building.cost.stone,
                        iron: prevData.Ressources.iron - building.cost.iron,
                        marble: prevData.Ressources.marble - building.cost.marble
                    }
                };
            });
        };

        window.addEventListener('building-constructed', handleBuildingConstructed as EventListener);
        return () => window.removeEventListener('building-constructed', handleBuildingConstructed as EventListener);
    }, [localData]);

    if (!localData) return null;

    return (
        <div className="parchemins-container">
            {tabs.map((tab) => (
                <div
                    key={tab}
                    className={`parchemin ${tab === activeTab ? 'active' : ''}`}
                    style={{
                        zIndex: tab === activeTab ? 30 : 20 - tabs.indexOf(tab),
                        transform: `translate(${tabs.indexOf(tab) * 20}px, ${-tabs.indexOf(tab) * 20}px)`,
                    }}
                >
                    <div
                        className={`marque-page marque-page-${tab.toLowerCase()}`}
                        onClick={() => setActiveTab(tab)}
                    >
                        {tab}
                    </div>
                    <button className="close-button" onClick={onClose}>×</button>
                    <div className="parchemin-content">
                        <h2>{tab}</h2>
                        <TabContent type={tab} data={localData} hexagonType={hexagonType} />
                    </div>
                </div>
            ))}
        </div>
    );
};

export default Parchemin; 