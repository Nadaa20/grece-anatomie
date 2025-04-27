import React from 'react';
import { Billboard, Text } from '@react-three/drei';
import { TroopModel } from './TroopModel';
import { Troop } from '../../entities/Troop';

interface TroopDisplayProps {
    troop: Troop | undefined;
    position: [number, number, number];
    warfogIntensity?: number;
}

export const TroopDisplay: React.FC<TroopDisplayProps> = ({ troop, position, warfogIntensity = 0 }) => {
    if (!troop || warfogIntensity > 0) return null;

    return (
        <>
            <TroopModel
                position={position}
                troop={troop}
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
                    <planeGeometry args={[1.6, 1.2]} />
                    <meshBasicMaterial
                        color="black"
                        transparent={true}
                        opacity={0.5}
                    />
                </mesh>
                <Text
                    position={[0, 0.2, 0.01]}
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
                <Text
                    position={[0, -0.2, 0.01]}
                    fontSize={0.25}
                    color="#cccccc"
                    anchorX="center"
                    anchorY="middle"
                >
                    {`<${troop.owner.charAt(0).toUpperCase() + troop.owner.slice(1)}>`}
                </Text>
            </Billboard>
        </>
    );
}; 