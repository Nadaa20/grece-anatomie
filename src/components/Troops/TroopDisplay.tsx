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

    // Calculer la hauteur du panneau en fonction de la taille de la troupe
    const troopScale = 0.5; // Taille fixe pour toutes les troupes
    const troopHeight = 1 * troopScale; // Hauteur de base du modèle (1) * échelle
    const billboardOffset = troopHeight + 1.5; // Hauteur de la troupe + offset fixe

    const billboardPosition = [
        position[0],
        position[1] + billboardOffset,
        position[2]
    ] as [number, number, number];

    // Si c'est une escouade, afficher jusqu'à 3 troupes en cercle
    const squadTroops = troop.isSquad && troop.troops ? troop.troops.slice(0, 3) : [];
    const radius = 0.5; // Rayon du cercle pour positionner les troupes

    return (
        <>
            {/* Afficher la troupe principale (escouade) au centre */}
            <TroopModel
                position={position}
                troop={troop}
                scale={troopScale}
            />

            {/* Afficher les troupes de l'escouade en cercle */}
            {squadTroops.map((squadTroop, index) => {
                const angle = (index * 2 * Math.PI) / squadTroops.length;
                const x = position[0] + radius * Math.cos(angle);
                const z = position[2] + radius * Math.sin(angle);

                return (
                    <TroopModel
                        key={squadTroop.id}
                        position={[x, position[1], z]}
                        troop={squadTroop}
                        scale={troopScale} // Même échelle que les autres troupes
                    />
                );
            })}

            <Billboard
                position={billboardPosition}
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