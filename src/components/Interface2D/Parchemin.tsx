import React, { useState, useEffect, useRef } from 'react';
import './Parchemin.css';
import { BUILDING_TYPES, BuildingType, HexagonType } from '../Cities/BuildingTypes';
import { TroopTrainingModal } from './TroopTrainingModal';
import { TROOP_TYPES } from './TroopTypes';
import { useTroopManager } from '../Troops/TroopManager';
import { useCityManager } from '../Cities/CityManager';

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

const getTotalPopulationUsed = (data: ParcheminsData): number => {
    const totalWorkers = Object.values(data.Travailleurs || {}).reduce((sum, workers) => sum + workers, 0);
    const totalTroops = Object.entries(data.Troupes).reduce((sum, [troopId, quantity]) => {
        const troopType = TROOP_TYPES.find(t => t.id === troopId);
        return sum + (quantity * (troopType?.cost.population || 0));
    }, 0);
    return totalWorkers + totalTroops;
};

const TabContent: React.FC<{ type: TabType; data: ParcheminsData; hexagonType: HexagonType }> = ({ type, data, hexagonType }) => {
    const [selectedTroops, setSelectedTroops] = useState<{ [key: string]: number }>({});
    const cityManager = useCityManager();
    const troopManager = useTroopManager();

    const handleTroopSelect = (troopId: string, increment: number) => {
        setSelectedTroops(prev => {
            const currentCount = prev[troopId] || 0;
            const availableCount = data.Troupes[troopId] || 0;
            const newCount = Math.max(0, Math.min(availableCount, currentCount + increment));

            if (newCount === 0) {
                const { [troopId]: _, ...rest } = prev;
                return rest;
            }
            return { ...prev, [troopId]: newCount };
        });
    };

    const getSquadText = () => {
        const troopEntries = Object.entries(selectedTroops);
        if (troopEntries.length === 0) {
            return "Pas d'escouade en cours de composition";
        }
        return `Escouade actuelle composée de : ${troopEntries.map(([troopId, count]) => {
            const troopType = TROOP_TYPES.find(t => t.id === troopId);
            return `${count} ${troopType?.name}`;
        }).join(', ')}`;
    };

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
        if (!building.isActive) return;

        const currentWorkers = data.Travailleurs?.[building.id] || 0;
        const requiredWorkers = building.requiredWorkers * (data.Batiments[building.id] || 0);

        // Vérifie si le bâtiment a tous ses travailleurs requis
        if (currentWorkers < requiredWorkers) return;

        window.dispatchEvent(new CustomEvent('use-building', {
            detail: {
                buildingId: building.id,
                hexagonName: data.hexagonName
            }
        }));
    };

    const canAssignWorker = () => {
        if (!data.Ressources) return false;
        const totalPopulationUsed = getTotalPopulationUsed(data);
        return data.Ressources.population_actuelle > totalPopulationUsed;
    };

    const handleAssignWorker = (buildingId: string, increment: number) => {
        if (!data.Ressources) return;

        const totalPopulationUsed = getTotalPopulationUsed(data);
        const building = BUILDING_TYPES.find(b => b.id === buildingId);
        if (!building) return;

        const currentWorkers = data.Travailleurs?.[buildingId] || 0;
        const newWorkers = currentWorkers + increment;

        if (increment > 0 && data.Ressources.population_actuelle <= totalPopulationUsed) return;
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
                            {data.Ressources?.population_actuelle !== undefined && (
                                <div className="ressource-item">
                                    <span>👥 Population disponible:</span>
                                    <span>{data.Ressources.population_actuelle - getTotalPopulationUsed(data)}/{data.Ressources.population_max}</span>
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
                                            {buildingType.id === 'barracks' && currentWorkers === requiredWorkers && (
                                                <button
                                                    className="use-building-button"
                                                    onClick={() => handleUseBuilding(buildingType)}
                                                >
                                                    Former des troupes
                                                </button>
                                            )}
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
            // Trouver la ville correspondante
            const city = cityManager.cities.find((c: { name: string }) => c.name === data.hexagonName);
            if (!city) return <p>Aucune ville trouvée</p>;

            // Récupérer les troupes dans un rayon de 1 autour de la ville
            const nearbyTroops = troopManager.troops.filter((troop: { hexCoord: { row: number; col: number } }) => {
                const distance = Math.max(
                    Math.abs(troop.hexCoord.row - city.hexCoord.row),
                    Math.abs(troop.hexCoord.col - city.hexCoord.col)
                );
                return distance <= 1;
            });

            // Debug: afficher la structure des troupes
            console.log('nearbyTroops', nearbyTroops);

            return nearbyTroops.length === 0 ? (
                <p>Aucune troupe présente autour de cette ville</p>
            ) : (
                <div className="troupes-container">
                    {nearbyTroops.map((troop: { id: string; type: string; isSquad?: boolean; troops?: { type: string }[] }) => {
                        const troopType = TROOP_TYPES.find(t => t.id === troop.type);
                        return (
                            <div key={troop.id} className="troupe-item">
                                <span className="troupe-emoji">{troopType?.emoji}</span>
                                <span className="troupe-nom">
                                    {troop.isSquad
                                        ? 'Escouade'
                                        : troopType?.name || troop.type || 'Type inconnu'}
                                    {troop.isSquad && troop.troops && (
                                        <div className="squad-content">
                                            {Object.entries(
                                                troop.troops.reduce((acc: { [key: string]: number }, t: { type: string }) => {
                                                    acc[t.type] = (acc[t.type] || 0) + 1;
                                                    return acc;
                                                }, {})
                                            ).map(([type, count]) => {
                                                const typeInfo = TROOP_TYPES.find(t => t.id === type);
                                                return (
                                                    <div key={type} className="squad-troop">
                                                        <span className="squad-troop-emoji">{typeInfo?.emoji}</span>
                                                        <span className="squad-troop-name">{typeInfo?.name || type || 'Type inconnu'}</span>
                                                        <span className="squad-troop-count">x{count}</span>
                                                    </div>
                                                );
                                            })}
                                        </div>
                                    )}
                                </span>
                                {!troop.isSquad && <span className="troupe-quantite">x1</span>}
                            </div>
                        );
                    })}
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
    const [showTroopTrainingModal, setShowTroopTrainingModal] = useState(false);
    const [localData, setLocalData] = useState<ParcheminsData | null>(data);
    const localDataRef = useRef<ParcheminsData | null>(data);
    const cityManager = useCityManager();
    const troopManager = useTroopManager();

    // Mettre à jour les données locales quand les props changent
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

                // Mettre à jour les travailleurs dans la ville
                const city = cityManager.cities.find(c => c.name === event.detail.hexagonName);
                if (city) {
                    if (!city.workers) {
                        city.workers = {};
                    }
                    city.workers[event.detail.buildingId] = newWorkers;
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

        const handleTrainTroop = (event: CustomEvent<{ hexagonName: string; troopId: string }>) => {
            if (localDataRef.current?.hexagonName !== event.detail.hexagonName) return;

            setLocalData(prevData => {
                if (!prevData || !prevData.Ressources) return prevData;

                const troopType = TROOP_TYPES.find(t => t.id === event.detail.troopId);
                if (!troopType) return prevData;

                // Vérifier si on a assez de ressources
                const hasEnoughResources = Object.entries(troopType.cost).every(([resource, cost]) => {
                    if (resource === 'population') {
                        const totalPopulationUsed = getTotalPopulationUsed(prevData);
                        return prevData.Ressources!.population_actuelle - totalPopulationUsed >= 1;
                    }
                    return (prevData.Ressources as any)[resource] >= (cost || 0);
                });

                if (!hasEnoughResources) return prevData;

                // Mettre à jour les ressources et ajouter la troupe
                const newData = {
                    ...prevData,
                    Ressources: {
                        ...prevData.Ressources,
                        wood: prevData.Ressources.wood - (troopType.cost.wood || 0),
                        stone: prevData.Ressources.stone - (troopType.cost.stone || 0),
                        iron: prevData.Ressources.iron - (troopType.cost.iron || 0),
                        marble: prevData.Ressources.marble - (troopType.cost.marble || 0)
                    },
                    Troupes: {
                        ...prevData.Troupes,
                        [event.detail.troopId]: (prevData.Troupes[event.detail.troopId] || 0) + 1
                    }
                };

                localDataRef.current = newData;
                return newData;
            });
        };

        const handleUseBuilding = (event: CustomEvent<{ hexagonName: string; buildingId: string }>) => {
            if (event.detail.buildingId === 'barracks') {
                setShowTroopTrainingModal(true);
            }
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
        window.addEventListener('train-troop', handleTrainTroop as EventListener);
        window.addEventListener('use-building', handleUseBuilding as EventListener);

        return () => {
            window.removeEventListener('building-constructed', handleBuildingConstructed as EventListener);
            window.removeEventListener('assign-worker', handleAssignWorker as EventListener);
            window.removeEventListener('train-troop', handleTrainTroop as EventListener);
            window.removeEventListener('use-building', handleUseBuilding as EventListener);
            clearInterval(populationGrowthInterval);
        };
    }, []);

    const handleTrainTroop = (troopId: string) => {
        // Trouver la ville correspondante
        const city = cityManager.cities.find(c => c.name === localData?.hexagonName);
        if (!city) return;

        // Vérifier si la ville a une caserne
        const hasBarracks = city.buildings.some(b => b.typeId === 'barracks');
        if (!hasBarracks) {
            alert("Vous devez construire une caserne pour former des troupes");
            return;
        }

        // Vérifier si on a assez de ressources
        const troopType = TROOP_TYPES.find(t => t.id === troopId);
        if (!troopType) return;

        const hasEnoughResources = Object.entries(troopType.cost).every(([resource, cost]) => {
            if (resource === 'population') {
                const totalPopulationUsed = getTotalPopulationUsed(localData!);
                return localData!.Ressources!.population_actuelle - totalPopulationUsed >= 1;
            }
            return (localData!.Ressources as any)[resource] >= (cost || 0);
        });

        if (!hasEnoughResources) {
            alert("Pas assez de ressources pour former cette troupe");
            return;
        }

        // Créer la troupe
        troopManager.addTroop(troopId, city.hexCoord);

        // Mettre à jour les troupes dans la ville
        if (!city.troops) {
            city.troops = {};
        }
        city.troops[troopId] = (city.troops[troopId] || 0) + 1;

        // Déduire les ressources
        window.dispatchEvent(new CustomEvent('train-troop', {
            detail: {
                troopId,
                hexagonName: localData?.hexagonName
            }
        }));
        setShowTroopTrainingModal(false);
    };

    if (!localData) return null;

    return (
        <>
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
            {showTroopTrainingModal && localData.Ressources && (
                <TroopTrainingModal
                    onClose={() => setShowTroopTrainingModal(false)}
                    onTrainTroop={handleTrainTroop}
                    resources={localData.Ressources}
                    currentWorkers={Object.values(localData.Travailleurs || {}).reduce((sum, workers) => sum + workers, 0)}
                    totalTroops={Object.entries(localData.Troupes).reduce((sum, [troopId, quantity]) => {
                        const troopType = TROOP_TYPES.find(t => t.id === troopId);
                        return sum + (quantity * (troopType?.cost.population || 0));
                    }, 0)}
                />
            )}
        </>
    );
};

export default Parchemin; 