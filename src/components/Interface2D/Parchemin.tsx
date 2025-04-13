import React, { useState, useEffect, useRef } from 'react';
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
        population_actuelle: number;
        population_max: number;
    };
    Travailleurs?: {
        [key: string]: number;
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

    const canAssignWorker = () => {
        if (!data.Ressources) return false;
        const totalWorkers = Object.values(data.Travailleurs || {}).reduce((sum, workers) => sum + workers, 0);
        const availablePopulation = data.Ressources.population_actuelle - totalWorkers;
        return availablePopulation > 0;
    };

    const handleAssignWorker = (buildingId: string, increment: number) => {
        if (!data.Ressources) return;

        const totalWorkers = Object.values(data.Travailleurs || {}).reduce((sum, workers) => sum + workers, 0);
        const building = BUILDING_TYPES.find(b => b.id === buildingId);
        if (!building) return;

        const currentWorkers = data.Travailleurs?.[buildingId] || 0;
        const newWorkers = currentWorkers + increment;
        const availablePopulation = data.Ressources.population_actuelle - totalWorkers;

        if (increment > 0 && availablePopulation <= 0) return;
        if (newWorkers < 0) return;
        if (newWorkers > building.requiredWorkers * (data.Batiments[buildingId] || 0)) return;

        console.log('Dispatching assign-worker event:', {
            buildingId,
            increment,
            hexagonName: data.hexagonName
        });

        window.dispatchEvent(new CustomEvent('assign-worker', {
            detail: {
                buildingId,
                increment,
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
                            {data.Ressources?.population_actuelle !== undefined && data.Travailleurs && (
                                <div className="ressource-item">
                                    <span>👥 Population disponible:</span>
                                    <span>{data.Ressources.population_actuelle - Object.values(data.Travailleurs).reduce((sum, workers) => sum + workers, 0)}/{data.Ressources.population_max}</span>
                                </div>
                            )}
                            {Object.entries(data.Ressources || {}).map(([resource, amount]) => (
                                !['population_actuelle', 'population_max'].includes(resource) && (
                                    <div key={resource} className="ressource-item">
                                        <span>{resource === 'wood' ? '🪵' : resource === 'stone' ? '🪨' : resource === 'iron' ? '⚒️' : '🏛️'} {resource}:</span>
                                        <span>{amount}</span>
                                    </div>
                                )
                            ))}
                        </div>
                    </div>

                    <div className="batiments-list">
                        <h3>Bâtiments existants</h3>
                        {Object.entries(data.Batiments).map(([batiment, quantite]) => {
                            const buildingType = BUILDING_TYPES.find(b => b.id === batiment);
                            if (!buildingType) return null;
                            const currentWorkers = data.Travailleurs?.[batiment] || 0;
                            const requiredWorkers = buildingType.requiredWorkers * quantite;
                            return (
                                <div key={batiment} className="batiment-item">
                                    <span className="batiment-emoji">{buildingType.emoji}</span>
                                    <span className="batiment-nom">{buildingType.name}</span>
                                    <span className="batiment-quantite">x{quantite}</span>
                                    {buildingType.isActive && (
                                        <div className="workers-control">
                                            <span className="workers-info">
                                                {currentWorkers}/{requiredWorkers} travailleurs
                                            </span>
                                            <button
                                                className="assign-worker-button"
                                                onClick={() => handleAssignWorker(batiment, 1)}
                                                disabled={!canAssignWorker()}
                                            >
                                                +
                                            </button>
                                            <button
                                                className="remove-worker-button"
                                                onClick={() => handleAssignWorker(batiment, -1)}
                                                disabled={currentWorkers <= 0}
                                            >
                                                -
                                            </button>
                                        </div>
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
    const localDataRef = useRef<ParcheminsData | null>(data);

    useEffect(() => {
        setLocalData(data);
        localDataRef.current = data;
    }, [data]);

    useEffect(() => {
        const handleBuildingConstructed = (event: CustomEvent<{ cityName: string; buildingId: string }>) => {
            if (localDataRef.current?.hexagonName !== event.detail.cityName) return;

            setLocalData(prevData => {
                if (!prevData) return null;
                const building = BUILDING_TYPES.find(b => b.id === event.detail.buildingId);
                if (!building || !prevData.Ressources) return prevData;

                const newBatiments = {
                    ...prevData.Batiments,
                    [event.detail.buildingId]: (prevData.Batiments[event.detail.buildingId] || 0) + 1
                };

                const newData = {
                    ...prevData,
                    Batiments: newBatiments,
                    Ressources: {
                        ...prevData.Ressources,
                        wood: prevData.Ressources.wood - building.cost.wood,
                        stone: prevData.Ressources.stone - building.cost.stone,
                        iron: prevData.Ressources.iron - building.cost.iron,
                        marble: prevData.Ressources.marble - building.cost.marble,
                        population_max: 5 + (newBatiments['house'] || 0) * 3
                    },
                    Travailleurs: {
                        ...prevData.Travailleurs,
                        [event.detail.buildingId]: 0
                    }
                };
                localDataRef.current = newData;
                return newData;
            });
        };

        const handleAssignWorker = (event: CustomEvent<{ hexagonName: string; buildingId: string; increment: number }>) => {
            console.log('Received assign-worker event:', event.detail);
            console.log('Current localData:', localDataRef.current);

            if (localDataRef.current?.hexagonName !== event.detail.hexagonName) {
                console.log('Hexagon name mismatch:', localDataRef.current?.hexagonName, event.detail.hexagonName);
                return;
            }

            setLocalData(prevData => {
                if (!prevData || !prevData.Ressources || !prevData.Travailleurs) {
                    console.log('Missing required data');
                    return prevData;
                }

                const building = BUILDING_TYPES.find(b => b.id === event.detail.buildingId);
                if (!building) {
                    console.log('Building not found:', event.detail.buildingId);
                    return prevData;
                }

                const currentWorkers = prevData.Travailleurs[event.detail.buildingId] || 0;
                const newWorkers = Math.max(0, currentWorkers + event.detail.increment);
                const requiredWorkers = building.requiredWorkers * (prevData.Batiments[event.detail.buildingId] || 0);

                if (newWorkers > requiredWorkers) {
                    console.log('Too many workers:', newWorkers, requiredWorkers);
                    return prevData;
                }

                const newData = {
                    ...prevData,
                    Travailleurs: {
                        ...prevData.Travailleurs,
                        [event.detail.buildingId]: newWorkers
                    }
                };
                console.log('Updating workers:', newData.Travailleurs);
                localDataRef.current = newData;
                return newData;
            });
        };

        // Système de croissance de la population
        const populationGrowthInterval = setInterval(() => {
            setLocalData(prevData => {
                if (!prevData || !prevData.Ressources) return prevData;

                const currentPopulation = prevData.Ressources.population_actuelle;
                const maxPopulation = prevData.Ressources.population_max;

                if (currentPopulation < maxPopulation) {
                    const newData = {
                        ...prevData,
                        Ressources: {
                            ...prevData.Ressources,
                            population_actuelle: Math.min(currentPopulation + 1, maxPopulation)
                        }
                    };
                    localDataRef.current = newData;
                    return newData;
                }
                return prevData;
            });
        }, 5000); // La population augmente de 1 toutes les 5 secondes

        window.addEventListener('building-constructed', handleBuildingConstructed as EventListener);
        window.addEventListener('assign-worker', handleAssignWorker as EventListener);
        return () => {
            window.removeEventListener('building-constructed', handleBuildingConstructed as EventListener);
            window.removeEventListener('assign-worker', handleAssignWorker as EventListener);
            clearInterval(populationGrowthInterval);
        };
    }, []);

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