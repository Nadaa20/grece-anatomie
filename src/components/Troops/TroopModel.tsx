import React, { memo, useMemo, useCallback } from 'react';
import { useTroopManager } from './TroopManager';

interface TroopModelProps {
    position: [number, number, number];
    scale?: number;
    troopId: string;
    type: string;
}

export const TroopModel = memo(({ position, scale = 0.5, troopId, type }: TroopModelProps) => {
    const { selectedTroop, selectTroop } = useTroopManager();
    const isSelected = selectedTroop === troopId;

    const handleClick = useCallback((e: any) => {
        e.stopPropagation();
        selectTroop(troopId);
    }, [troopId, selectTroop]);

    const color = useMemo(() => {
        switch (type) {
            case 'hoplite': return isSelected ? "#ff6666" : "#800000";
            case 'frondeur': return isSelected ? "#66ff66" : "#008000";
            case 'messager': return isSelected ? "#6666ff" : "#000080";
            default: return isSelected ? "#ff6666" : "#0000ff";
        }
    }, [type, isSelected]);

    const geometry = useMemo(() => (
        <boxGeometry args={[1, 1, 1]} />
    ), []);

    const material = useMemo(() => (
        <meshStandardMaterial
            color={color}
            emissive={isSelected ? color : "#000000"}
            emissiveIntensity={isSelected ? 0.5 : 0}
        />
    ), [color, isSelected]);

    return (
        <group position={position} onClick={handleClick}>
            <mesh scale={scale}>
                {geometry}
                {material}
            </mesh>
        </group>
    );
}); 