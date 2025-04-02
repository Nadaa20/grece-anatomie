import React from 'react';
import { Html } from '@react-three/drei';

interface Building {
    type: string;
    level: number;
}

interface City {
    name: string;
    population: number;
    buildings: Building[];
    troops: Record<string, number>;
}

interface CityObjectProps {
    city: City;
    position: [number, number, number];
}

export const CityObject: React.FC<CityObjectProps> = ({ city, position }) => {
    const handleClick = () => {
        console.log("City clicked:", city);
        const buildingsData = city.buildings.reduce((acc, building) => ({
            ...acc,
            [building.type]: building.level
        }), {});
        console.log("Prepared buildings data:", buildingsData);

        const eventData = {
            detail: {
                hexagonName: city.name,
                data: {
                    Batiments: buildingsData,
                    Troupes: city.troops,
                    Quetes: {}
                }
            }
        };
        console.log("Dispatching event with data:", eventData);
        window.dispatchEvent(new CustomEvent('show-parchemin', eventData));
    };

    return (
        <group position={position} onClick={handleClick}>
            <mesh>
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
                    borderRadius: '3px'
                }}>
                    {city.name}
                </div>
            </Html>
        </group>
    );
}; 