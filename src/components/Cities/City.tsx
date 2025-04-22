import React, { useRef } from 'react';
import { Html } from '@react-three/drei';
import { useFrame } from '@react-three/fiber';
import { Mesh } from 'three';

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
}

interface CityObjectProps {
    city: City;
    position: [number, number, number];
    onClick?: () => void;
}

export const CityObject: React.FC<CityObjectProps> = ({ city, position, onClick }) => {
    const meshRef = useRef<Mesh>(null);

    // Animation simple de flottement
    useFrame((state) => {
        if (meshRef.current) {
            meshRef.current.position.y = position[1] + Math.sin(state.clock.elapsedTime) * 0.1;
        }
    });

    return (
        <group position={position}>
            <mesh ref={meshRef}>
                <boxGeometry args={[0.5, 0.5, 0.5]} />
                <meshStandardMaterial color="brown" />
            </mesh>
            <Html position={[0, 1, 0]} center>
                <div style={{
                    color: 'white',
                    fontSize: '12px',
                    textAlign: 'center',
                    background: 'rgba(0,0,0,0.5)',
                    padding: '2px 5px',
                    borderRadius: '3px',
                    userSelect: 'none',
                    pointerEvents: 'none'
                }}>
                    {city.name}
                </div>
            </Html>
        </group>
    );
}; 