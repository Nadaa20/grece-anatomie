import React, { createContext, useContext, useEffect } from 'react';
import { City, CityObject } from './City';
import { BUILDING_TYPES } from './BuildingTypes';

const initialCity: City = {
    id: 'athens',
    name: 'Athènes',
    population: 1000,
    position: { x: 0, y: 1 },
    hexCoord: { row: 1, col: 0 },
    buildings: [
        { id: 'athens-house-1', typeId: 'house', level: 1, constructionProgress: 100 },
        { id: 'athens-house-2', typeId: 'house', level: 1, constructionProgress: 100 },
        { id: 'athens-wall', typeId: 'wall', level: 1, constructionProgress: 100 },
        { id: 'athens-well', typeId: 'well', level: 1, constructionProgress: 100 }
    ],
    resources: { wood: 1000, stone: 800, iron: 500, marble: 200 }
};

const cityManager = {
    cities: [initialCity],
    addCity: (city: City) => cityManager.cities.push(city),
    removeCity: (cityId: string) => {
        const index = cityManager.cities.findIndex(c => c.id === cityId);
        if (index > -1) cityManager.cities.splice(index, 1);
    },
    buildBuilding: (cityName: string, buildingId: string, cost: { wood: number; stone: number; iron: number; marble: number }) => {
        const city = cityManager.cities.find(c => c.name === cityName);
        if (!city || !hasEnoughResources(city.resources, cost)) return false;

        deductResources(city.resources, cost);
        addBuilding(city, buildingId);
        notifyBuildingConstructed(city.name, buildingId);
        return true;
    },
    getCityAtHex: (row: number, col: number) => cityManager.cities.find(city =>
        city.position.x === col && city.position.y === row
    )
};

// Fonctions utilitaires
const hasEnoughResources = (resources: City['resources'], cost: typeof resources) => (
    resources.wood >= cost.wood &&
    resources.stone >= cost.stone &&
    resources.iron >= cost.iron &&
    resources.marble >= cost.marble
);

const deductResources = (resources: City['resources'], cost: typeof resources) => {
    resources.wood -= cost.wood;
    resources.stone -= cost.stone;
    resources.iron -= cost.iron;
    resources.marble -= cost.marble;
};

const addBuilding = (city: City, buildingId: string) => {
    city.buildings.push({
        id: `${city.id}-${buildingId}-${city.buildings.length + 1}`,
        typeId: buildingId,
        level: 1,
        constructionProgress: 100
    });
};

const notifyBuildingConstructed = (cityName: string, buildingId: string) => {
    window.dispatchEvent(new CustomEvent('building-constructed', {
        detail: { cityName, buildingId }
    }));
};

const CityContext = createContext(cityManager);

export const CitiesRenderer: React.FC<{ onCityClick?: (city: City) => void }> = ({ onCityClick }) => (
    <>
        {cityManager.cities.map(city => (
            <CityObject
                key={city.id}
                city={city}
                position={[city.position.x * 2, 0, city.position.y * 2]}
                onClick={onCityClick ? () => onCityClick(city) : undefined}
            />
        ))}
    </>
);

export const CityManagerProvider: React.FC<{ children: React.ReactNode }> = ({ children }) => {
    useEffect(() => {
        const handleBuildBuilding = (event: CustomEvent<{ buildingId: string; cost: any; hexagonName: string }>) => {
            const { buildingId, cost, hexagonName } = event.detail;
            cityManager.buildBuilding(hexagonName, buildingId, cost);
        };

        window.addEventListener('build-building', handleBuildBuilding as EventListener);
        return () => window.removeEventListener('build-building', handleBuildBuilding as EventListener);
    }, []);

    return <CityContext.Provider value={cityManager}>{children}</CityContext.Provider>;
};

export const useCityManager = () => useContext(CityContext); 