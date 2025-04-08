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

export const Parchemin: React.FC<ParcheminProps> = ({ onClose, data, hexagonType }) => {
    const [activeTab, setActiveTab] = useState<TabType>('Batiments');
    const [localData, setLocalData] = useState<ParcheminsData | null>(data);

    useEffect(() => {
        setLocalData(data);
    }, [data]);

    useEffect(() => {
        const handleBuildingConstructed = (event: CustomEvent<{ cityName: string; buildingId: string }>) => {
            if (localData && event.detail.cityName === localData.hexagonName) {
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
            }
        };

        window.addEventListener('building-constructed', handleBuildingConstructed as EventListener);

        return () => {
            window.removeEventListener('building-constructed', handleBuildingConstructed as EventListener);
        };
    }, [localData]);

    const canAffordBuilding = (building: BuildingType): boolean => {
        if (!localData?.Ressources) return false;
        return (
            localData.Ressources.wood >= building.cost.wood &&
            localData.Ressources.stone >= building.cost.stone &&
            localData.Ressources.iron >= building.cost.iron &&
            localData.Ressources.marble >= building.cost.marble
        );
    };

    const handleBuild = (building: BuildingType) => {
        if (!localData?.Ressources) return;

        // Vérifier si on a assez de ressources
        if (!canAffordBuilding(building)) return;

        // Déclencher l'événement de construction
        window.dispatchEvent(new CustomEvent('build-building', {
            detail: {
                buildingId: building.id,
                cost: building.cost,
                hexagonName: localData.hexagonName
            }
        }));
    };

    const renderBatiments = () => {
        if (!localData) {
            return <p>Chargement des données...</p>;
        }

        // Si aucun bâtiment n'est présent, c'est qu'on n'a pas cliqué sur une ville
        const hasBuildings = Object.keys(localData.Batiments).length > 0;
        if (!hasBuildings) {
            return <p>Aucun bâtiment sur cette case</p>;
        }

        return (
            <div className="batiments-container">
                <div className="ressources-display">
                    <h3>Ressources disponibles</h3>
                    <div className="ressources-grid">
                        <div className="ressource-item">
                            <span>🪵 Bois:</span>
                            <span>{localData.Ressources?.wood || 0}</span>
                        </div>
                        <div className="ressource-item">
                            <span>🪨 Pierre:</span>
                            <span>{localData.Ressources?.stone || 0}</span>
                        </div>
                        <div className="ressource-item">
                            <span>⚒️ Fer:</span>
                            <span>{localData.Ressources?.iron || 0}</span>
                        </div>
                        <div className="ressource-item">
                            <span>🏛️ Marbre:</span>
                            <span>{localData.Ressources?.marble || 0}</span>
                        </div>
                    </div>
                </div>

                <div className="batiments-list">
                    <h3>Bâtiments existants</h3>
                    {Object.entries(localData.Batiments).map(([batiment, quantite]) => {
                        const buildingType = BUILDING_TYPES.find(b => b.id === batiment);
                        if (!buildingType) return null;
                        return (
                            <div key={batiment} className="batiment-item">
                                <span className="batiment-emoji">{buildingType.emoji}</span>
                                <span className="batiment-nom">{buildingType.name}</span>
                                <span className="batiment-quantite">x{quantite}</span>
                            </div>
                        );
                    })}
                </div>

                {/* N'afficher les bâtiments constructibles que si on a cliqué sur une ville */}
                {hasBuildings && (
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
                                            {building.cost.wood > 0 && (
                                                <span className="cost-item">🪵 {building.cost.wood}</span>
                                            )}
                                            {building.cost.stone > 0 && (
                                                <span className="cost-item">🪨 {building.cost.stone}</span>
                                            )}
                                            {building.cost.iron > 0 && (
                                                <span className="cost-item">⚒️ {building.cost.iron}</span>
                                            )}
                                            {building.cost.marble > 0 && (
                                                <span className="cost-item">🏛️ {building.cost.marble}</span>
                                            )}
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
                )}
            </div>
        );
    };

    const renderTroupes = () => {
        if (!localData?.Troupes || Object.keys(localData.Troupes).length === 0) {
            return <p>Aucune troupe présente sur cette case</p>;
        }

        return (
            <div className="troupes-list">
                {Object.entries(localData.Troupes).map(([troupe, quantite]) => (
                    <div key={troupe} className="troupe-item">
                        <span className="troupe-nom">{troupe}</span>
                        <span className="troupe-quantite">x{quantite}</span>
                    </div>
                ))}
            </div>
        );
    };

    const renderQuetes = () => {
        if (!localData?.Quetes || Object.keys(localData.Quetes).length === 0) {
            return <p>Aucune quête disponible sur cette case</p>;
        }

        return (
            <div className="quetes-list">
                {Object.entries(localData.Quetes).map(([quete, description]) => (
                    <div key={quete} className="quete-item">
                        <h3 className="quete-titre">{quete}</h3>
                        <p className="quete-description">{description}</p>
                    </div>
                ))}
            </div>
        );
    };

    const getTabContent = (tab: TabType): JSX.Element => {
        if (!localData) {
            return <p>Chargement des données...</p>;
        }

        switch (tab) {
            case 'Batiments':
                return renderBatiments();
            case 'Troupes':
                return renderTroupes();
            case 'Quetes':
                return renderQuetes();
        }
    };

    const getTabPosition = (tab: TabType): number => {
        const activeIndex = tabs.indexOf(activeTab);
        const currentIndex = tabs.indexOf(tab);

        if (tab === activeTab) return 0;
        if (activeIndex === 2 && currentIndex === 0) { return 1; }
        if (activeIndex === 0 && currentIndex === 2) { return 2; }
        if (currentIndex < activeIndex) { return currentIndex + 1; }
        return currentIndex;
    };

    return (
        <div className="parchemins-container">
            {tabs.map((tab) => {
                const position = getTabPosition(tab);
                return (
                    <div
                        key={tab}
                        className={`parchemin ${tab === activeTab ? 'active' : ''}`}
                        style={{
                            zIndex: tab === activeTab ? 30 : 20 - position,
                            transform: `translate(${position * 20}px, ${-position * 20}px)`,
                        }}
                    >
                        <div className={`marque-page marque-page-${tab.toLowerCase()}`} onClick={() => setActiveTab(tab)}>
                            {tab}
                        </div>
                        <button className="close-button" onClick={onClose}>×</button>
                        <div className="parchemin-content">
                            <h2>{tab}</h2>
                            {getTabContent(tab)}
                        </div>
                    </div>
                );
            })}
        </div>
    );
};

export default Parchemin; 