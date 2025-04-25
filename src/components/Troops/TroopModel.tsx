import React, { memo, useMemo, useCallback } from 'react';
import { useTroopManager } from './TroopManager';
import { Troop } from '../../entities/Troop';

interface TroopModelProps {
    position: [number, number, number];
    scale?: number;
    troop: Troop;
}

export const TroopModel = memo(({ position, scale = 0.5, troop }: TroopModelProps) => {
    const { selectedTroop, selectTroop } = useTroopManager();
    const isSelected = selectedTroop === troop.id;

    const handleClick = useCallback((e: any) => {
        e.stopPropagation();
        selectTroop(troop.id);
    }, [troop.id, selectTroop]);

    const color = useMemo(() => {
        return isSelected ? troop.getSelectedColor() : troop.getColor();
    }, [troop, isSelected]);

    const material = useMemo(() => (
        <meshStandardMaterial
            color={color}
            emissive={isSelected ? color : "#000000"}
            emissiveIntensity={isSelected ? 0.5 : 0}
        />
    ), [color, isSelected]);

    return (
        <group position={position} onClick={handleClick}>
            <mesh scale={scale} geometry={troop.getGeometry()}>
                {material}
            </mesh>
        </group>
    );
});