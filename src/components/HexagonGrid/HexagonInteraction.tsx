import React from 'react';
import { useTroopManager } from '../Troops/TroopManager';

interface HexagonInteractionProps {
    position: [number, number, number];
    name: string;
}

export const HexagonInteraction: React.FC<HexagonInteractionProps> = ({ position, name }) => {
    const { selectedTroop, moveTroop } = useTroopManager();

    const handleHexagonClick = (e: any) => {
        e.stopPropagation(); // Empêche la propagation de l'événement
        if (selectedTroop) {
            moveTroop(selectedTroop, [
                position[0],
                position[1] + 1, // On ajoute 1 pour que la troupe soit au-dessus de l'hexagone
                position[2]
            ]);
        }
    };

    return (
        <mesh
            position={position}
            onClick={handleHexagonClick}
            visible={!!selectedTroop} // Ne devient visible que lorsqu'une troupe est sélectionnée
        >
            <boxGeometry args={[1, 0.1, 1]} />
            <meshStandardMaterial
                color="#ffff00"
                transparent
                opacity={0.3}
            />
        </mesh>
    );
}; 