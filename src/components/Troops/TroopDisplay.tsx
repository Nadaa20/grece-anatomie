import React from 'react';
import { Billboard, Text } from '@react-three/drei';
import { TroopModel } from './TroopModel';
import { Troop } from './TroopManager';

interface TroopDisplayProps {
    troop: Troop;
    position: [number, number, number];
}

export const TroopDisplay: React.FC<TroopDisplayProps> = ({ troop, position }) => {
    return (
        <>
            <TroopModel
                position={position}
                troopId={troop.id}
                type={troop.type}
                scale={troop.isSquad ? 0.7 : 0.5}
            />
            <Billboard
                position={[
                    position[0],
                    position[1] + 0.8,
                    position[2]
                ]}
                follow={true}
                lockX={false}
                lockY={false}
                lockZ={false}
            >
                <mesh>
                    <planeGeometry args={[1.6, 0.8]} />
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
                    {troop.isSquad
                        ? `Escouade (${troop.troops?.length || 0})`
                        : `${troop.type}`
                    }
                </Text>
            </Billboard>
        </>
    );
}; 