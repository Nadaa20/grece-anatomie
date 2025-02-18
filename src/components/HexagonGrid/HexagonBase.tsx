import React, { useState, useRef, useCallback, memo } from "react";
import { Vector3, Mesh } from "three";
import { useThree } from "@react-three/fiber";
import { DetailButton } from './DetailButton'
import { HexagonInteraction } from './HexagonInteraction'
import { TroopModel } from '../Troops/TroopModel';
import { useTroopManager } from '../Troops/TroopManager';

interface HexagonBaseProps {
    position: [number, number, number];
    radius: number;
    height: number;
    color?: string;
    name?: string;
    row: number;
    col: number;
}

const HexagonBase = memo(({ position, radius, height, color, name, row, col }: HexagonBaseProps) => {
    const [isHovered, setIsHovered] = useState(false);
    const { raycaster } = useThree();
    const meshRef = useRef<Mesh>(null);
    const [showDetail, setShowDetail] = useState(false);
    const { selectedTroop, getTroopAtHex, moveTroop } = useTroopManager();

    // Mémoisation des positions pour éviter les recalculs inutiles
    const troopPosition = useRef<[number, number, number]>([
        position[0],
        position[1] + height / 2,
        position[2]
    ]);

    const buttonPosition = useRef<[number, number, number]>([
        position[0],
        height + 1,
        position[2]
    ]);

    // Mémoisation des callbacks
    const handleClick = useCallback((e: any) => {
        e.stopPropagation();
        if (selectedTroop) {
            moveTroop(selectedTroop, { row, col });
            return;
        }
        window.dispatchEvent(new CustomEvent('hexagon-clicked'));
        setShowDetail(true);
    }, [selectedTroop, row, col, moveTroop]);

    const handlePointerOver = useCallback((e: any) => {
        e.stopPropagation();
        const intersects = raycaster.intersectObjects(e.object.parent.children);
        if (intersects.length > 0) {
            const hitPoint = intersects[0].point;
            const hexCenter = new Vector3(...position);
            if (intersects[0].object === e.object) {
                setIsHovered(true);
            }
        }
    }, [position, raycaster]);

    const handlePointerOut = useCallback(() => {
        setIsHovered(false);
    }, []);

    // Optimisation du rendu avec useMemo pour la géométrie
    const geometry = React.useMemo(() => (
        <cylinderGeometry args={[radius, radius, height, 6]} />
    ), [radius, height]);

    // Optimisation du rendu avec useMemo pour le matériau
    const material = React.useMemo(() => (
        <meshStandardMaterial
            color={isHovered ? "#ffff00" : (color || "gray")}
            emissive={isHovered ? "#ffffff" : "#000000"}
            emissiveIntensity={isHovered ? 0.5 : 0}
        />
    ), [isHovered, color]);

    // Récupération de la troupe de manière optimisée
    const troop = getTroopAtHex(row, col);

    return (
        <group>
            <mesh
                ref={meshRef}
                position={position}
                onClick={handleClick}
                onPointerOver={handlePointerOver}
                onPointerOut={handlePointerOut}
            >
                {geometry}
                {material}
            </mesh>

            {troop && (
                <TroopModel
                    position={troopPosition.current}
                    troopId={troop.id}
                    type={troop.type}
                    scale={0.3}
                />
            )}

            {showDetail && (
                <DetailButton
                    position={buttonPosition.current}
                    onClick={() => setShowDetail(false)}
                />
            )}

            <HexagonInteraction
                position={position}
                name={name || ''}
            />
        </group>
    );
});

export default HexagonBase;
