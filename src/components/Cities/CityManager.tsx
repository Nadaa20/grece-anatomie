import React, { useState, useContext, createContext, useEffect } from 'react';
import { v4 as uuidv4 } from 'uuid';

interface HexCoordinates {
    row: number;
    col: number;
}

interface Building {
    type: string;
    level: number;
}

interface City {
    id: string;
    name: string;
    population: number;
    buildings: Building[];
    troops: Record<string, number>;
    hexCoord: HexCoordinates;
}

interface CityManagerContextType {
    cities: City[];
    addCity: (city: Omit<City, 'id'>) => void;
    getCityAtHex: (row: number, col: number) => City | undefined;
}

const CityManagerContext = createContext<CityManagerContextType | null>(null);

export const useCityManager = () => {
    const context = useContext(CityManagerContext);
    if (!context) {
        throw new Error('useCityManager must be used within a CityManagerProvider');
    }
    return context;
};

interface CityManagerProviderProps {
    children: React.ReactNode;
}

const INITIAL_CITIES: Omit<City, 'id'>[] = [
    {
        name: "Athènes",
        population: 1000,
        buildings: [
            { type: "maison", level: 1 },
            { type: "temple", level: 1 }
        ],
        troops: {
            "hoplite": 10,
            "frondeur": 5
        },
        hexCoord: { row: 5, col: 5 }
    }
];

export const CityManagerProvider: React.FC<CityManagerProviderProps> = ({ children }) => {
    const [cities, setCities] = useState<City[]>([]);

    useEffect(() => {
        // Ajouter les villes initiales
        const initialCities = INITIAL_CITIES.map(city => ({
            ...city,
            id: uuidv4()
        }));
        setCities(initialCities);
    }, []);

    const addCity = (city: Omit<City, 'id'>) => {
        const newCity = {
            ...city,
            id: uuidv4()
        };
        setCities(prev => [...prev, newCity]);
    };

    const getCityAtHex = (row: number, col: number) => {
        return cities.find(city => city.hexCoord.row === row && city.hexCoord.col === col);
    };

    const value = {
        cities,
        addCity,
        getCityAtHex
    };

    return (
        <CityManagerContext.Provider value={value}>
            {children}
        </CityManagerContext.Provider>
    );
}; 