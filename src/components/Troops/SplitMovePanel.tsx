import React, { useState } from 'react';
import { Billboard, Text } from '@react-three/drei';

interface SplitMovePanelProps {
    position: [number, number, number];
    troopTypes: { type: string; count: number }[];
    onConfirm: (splits: { [type: string]: number }) => void;
    onCancel: () => void;
}

export const SplitMovePanel: React.FC<SplitMovePanelProps> = ({
    position,
    troopTypes,
    onConfirm,
    onCancel
}) => {
    const [splits, setSplits] = useState<{ [type: string]: number }>(() =>
        troopTypes.reduce((acc, { type }) => ({ ...acc, [type]: 0 }), {})
    );

    const panelHeight = 1.2 + (troopTypes.length * 0.2);
    const panelWidth = 3;

    const handleBackgroundClick = (e: any) => {
        e.stopPropagation();
    };

    const adjustCount = (type: string, increment: boolean) => {
        setSplits(prev => {
            const currentCount = prev[type] || 0;
            const maxCount = troopTypes.find(t => t.type === type)?.count || 0;
            const newCount = increment
                ? Math.min(currentCount + 1, maxCount)
                : Math.max(currentCount - 1, 0);
            return { ...prev, [type]: newCount };
        });
    };

    return (
        <Billboard position={position} follow={true}>
            <group position={[0, 0, 0]} onClick={handleBackgroundClick}>
                {/* Fond */}
                <mesh position={[0, 0, -0.01]}>
                    <planeGeometry args={[panelWidth, panelHeight]} />
                    <meshBasicMaterial color="#2a2a2a" transparent opacity={0.9} />
                </mesh>

                {/* Titre */}
                <Text
                    position={[0, panelHeight / 2 - 0.15, 0]}
                    color="white"
                    fontSize={0.12}
                    font="/fonts/Inter-Bold.woff"
                >
                    Séparer les troupes
                </Text>

                {/* Contrôles pour chaque type */}
                {troopTypes.map((type, index) => (
                    <group key={type.type} position={[0, 0.2 - (index * 0.3), 0]}>
                        <Text
                            position={[-0.8, 0, 0]}
                            color="white"
                            fontSize={0.08}
                            textAlign="right"
                        >
                            {type.type}
                        </Text>

                        {/* Bouton - */}
                        <group position={[-0.2, 0, 0]} onClick={() => adjustCount(type.type, false)}>
                            <mesh>
                                <planeGeometry args={[0.2, 0.2]} />
                                <meshBasicMaterial color="#444444" />
                            </mesh>
                            <Text position={[0, 0, 0.01]} color="white" fontSize={0.1}>-</Text>
                        </group>

                        {/* Compteur */}
                        <Text
                            position={[0, 0, 0]}
                            color="white"
                            fontSize={0.1}
                        >
                            {`${splits[type.type] || 0}/${type.count}`}
                        </Text>

                        {/* Bouton + */}
                        <group position={[0.2, 0, 0]} onClick={() => adjustCount(type.type, true)}>
                            <mesh>
                                <planeGeometry args={[0.2, 0.2]} />
                                <meshBasicMaterial color="#444444" />
                            </mesh>
                            <Text position={[0, 0, 0.01]} color="white" fontSize={0.1}>+</Text>
                        </group>
                    </group>
                ))}

                {/* Boutons Confirmer/Annuler */}
                <group position={[-0.6, -panelHeight / 2 + 0.2, 0]} onClick={() => onConfirm(splits)}>
                    <mesh>
                        <planeGeometry args={[1, 0.3]} />
                        <meshBasicMaterial color="#006400" />
                    </mesh>
                    <Text position={[0, 0, 0.01]} color="white" fontSize={0.1}>Confirmer</Text>
                </group>

                <group position={[0.6, -panelHeight / 2 + 0.2, 0]} onClick={onCancel}>
                    <mesh>
                        <planeGeometry args={[1, 0.3]} />
                        <meshBasicMaterial color="#640000" />
                    </mesh>
                    <Text position={[0, 0, 0.01]} color="white" fontSize={0.1}>Annuler</Text>
                </group>
            </group>
        </Billboard>
    );
}; 