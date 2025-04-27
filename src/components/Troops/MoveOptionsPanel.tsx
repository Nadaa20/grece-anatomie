import React from 'react';
import { Billboard, Text } from '@react-three/drei';
import { Vector3 } from 'three';

interface MoveOptionsPanelProps {
    position: [number, number, number];
    onMoveAll: () => void;
    onSplitMove: () => void;
    troopTypes: { type: string; count: number }[];
}

export const MoveOptionsPanel: React.FC<MoveOptionsPanelProps> = ({
    position,
    onMoveAll,
    onSplitMove,
    troopTypes
}) => {
    const panelHeight = 1.8;
    const panelWidth = 4;

    const handleBackgroundClick = (e: any) => {
        e.stopPropagation();
    };

    return (
        <Billboard
            position={position}
            follow={true}
        >
            <group position={[0, 0, 0]} onClick={handleBackgroundClick}>
                {/* Fond du panneau */}
                <mesh position={[0, 0, -0.01]}>
                    <planeGeometry args={[panelWidth, panelHeight]} />
                    <meshBasicMaterial color="#2a2a2a" transparent opacity={0.9} />
                </mesh>

                {/* Titre */}
                <Text
                    position={[0, panelHeight / 2 - 0.2, 0]}
                    color="white"
                    fontSize={0.18}
                    font="/fonts/Inter-Bold.woff"
                >
                    Options de déplacement
                </Text>

                {/* Option 1: Déplacer tout */}
                <group
                    position={[-panelWidth / 4, 0.15, 0]}
                    onClick={onMoveAll}
                >
                    <mesh>
                        <planeGeometry args={[1.6, 0.5]} />
                        <meshBasicMaterial color="#444444" transparent opacity={0.8} />
                    </mesh>
                    <Text
                        position={[0, 0, 0.01]}
                        color="white"
                        fontSize={0.15}
                        textAlign="center"
                    >
                        Déplacer tout
                    </Text>
                </group>

                {/* Option 2: Types de troupes */}
                <group position={[panelWidth / 4, 0.15, 0]} onClick={onSplitMove}>
                    <mesh>
                        <planeGeometry args={[1.6, 0.5]} />
                        <meshBasicMaterial color="#444444" transparent opacity={0.8} />
                    </mesh>
                    <Text
                        position={[0, 0, 0.01]}
                        color="white"
                        fontSize={0.15}
                        textAlign="center"
                    >
                        Séparer
                    </Text>
                </group>

                {/* Liste des types de troupes */}
                <group position={[0, -0.5, 0]}>
                    {troopTypes.map((type, index) => (
                        <Text
                            key={type.type}
                            position={[0, -index * 0.2, 0]}
                            color="white"
                            fontSize={0.13}
                            textAlign="center"
                        >
                            {`${type.type}: ${type.count}`}
                        </Text>
                    ))}
                </group>
            </group>
        </Billboard>
    );
};