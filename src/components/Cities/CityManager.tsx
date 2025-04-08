import React, { createContext, useContext, useEffect } from 'react';
import { City, CityObject } from './City';
import { BUILDING_TYPES } from './BuildingTypes';

const cities: City[] = [{
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
}];

const cityManager = {
    cities,
    addCity: (city: City) => cities.push(city),
    removeCity: (cityId: string) => {
        const index = cities.findIndex(c => c.id === cityId);
        if (index > -1) cities.splice(index, 1);
    },
    buildBuilding: (cityName: string, buildingId: string, cost: { wood: number; stone: number; iron: number; marble: number }) => {
        const city = cities.find(c => c.name === cityName);
        if (!city) return false;

        // Vérifier si on a assez de ressources
        if (city.resources.wood < cost.wood ||
            city.resources.stone < cost.stone ||
            city.resources.iron < cost.iron ||
            city.resources.marble < cost.marble) {
            return false;
        }

        // Déduire les ressources
        city.resources.wood -= cost.wood;
        city.resources.stone -= cost.stone;
        city.resources.iron -= cost.iron;
        city.resources.marble -= cost.marble;

        // Ajouter le bâtiment
        const newBuildingId = `${city.id}-${buildingId}-${city.buildings.length + 1}`;
        city.buildings.push({
            id: newBuildingId,
            typeId: buildingId,
            level: 1,
            constructionProgress: 100
        });

        // Déclencher un événement pour mettre à jour l'interface
        window.dispatchEvent(new CustomEvent('building-constructed', {
            detail: {
                cityName: city.name,
                buildingId: buildingId
            }
        }));

        return true;
    },
    getAvailableResources: () => ({ wood: 1000, stone: 800, iron: 500, marble: 200 }),
    getCityAtHex: (row: number, col: number) => cities.find(city =>
        city.position.x === col && city.position.y === row
    )
};

const CityContext = createContext(cityManager);

// Composant pour le rendu des villes
export const CitiesRenderer: React.FC<{ onCityClick?: (city: City) => void }> = ({ onCityClick }) => {
    const { cities } = useContext(CityContext);

    return (
        <>
            {cities.map(city => (
                <CityObject
                    key={city.id}
                    city={city}
                    position={[city.position.x * 2, 0, city.position.y * 2]}
                    onClick={onCityClick ? () => onCityClick(city) : undefined}
                />
            ))}
        </>
    );
};

export const CityManagerProvider: React.FC<{ children: React.ReactNode }> = ({ children }) => {
    useEffect(() => {
        const handleBuildBuilding = (event: CustomEvent<{ buildingId: string; cost: any; hexagonName: string }>) => {
            const { buildingId, cost, hexagonName } = event.detail;
            cityManager.buildBuilding(hexagonName, buildingId, cost);
        };

        window.addEventListener('build-building', handleBuildBuilding as EventListener);

        return () => {
            window.removeEventListener('build-building', handleBuildBuilding as EventListener);
        };
    }, []);

    return (
        <CityContext.Provider value={cityManager}>
            {children}
        </CityContext.Provider>
    );
};

export const useCityManager = () => useContext(CityContext); 