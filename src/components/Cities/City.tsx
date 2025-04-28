import React from 'react';
import { Billboard, Text } from '@react-three/drei';

export interface Building {
    id: string;
    typeId: string;
    level: number;
    constructionProgress: number;
}

export interface City {
    id: string;
    name: string;
    population: number;
    buildings: Building[];
    resources: {
        wood: number;
        stone: number;
        iron: number;
        marble: number;
    };
    position: {
        x: number;
        y: number;
    };
    hexCoord: {
        row: number;
        col: number;
    };
    workers?: {
        [buildingId: string]: number;
    };
    troops?: {
        [troopId: string]: number;
    };
}

interface CityProps {
    city: {
        id: string;
        name: string;
        hexCoord: {
            row: number;
            col: number;
        };
    };
    position: [number, number, number];
}

export const CityObject: React.FC<CityProps> = ({ city, position }) => {
    return (
        <group position={position}>
            <mesh>
                <boxGeometry args={[0.5, 0.5, 0.5]} />
                <meshStandardMaterial color="brown" />
            </mesh>
            <Billboard
                position={[0, 0.8, 0]}
                follow={true}
                lockX={false}
                lockY={false}
                lockZ={false}
            >
                <mesh>
                    <planeGeometry args={[1.6, 1.2]} />
                    <meshBasicMaterial
                        color="black"
                        transparent={true}
                        opacity={0.5}
                    />
                </mesh>
                <Text
                    position={[0, 0, 0.01]}
                    fontSize={0.3}
                    color="#ffffff"
                    anchorX="center"
                    anchorY="middle"
                >
                    {city.name}
                </Text>
            </Billboard>
        </group>
    );
}; 