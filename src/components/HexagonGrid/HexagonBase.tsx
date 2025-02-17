import React, { useState, useRef } from "react";
import { Vector3, Mesh } from "three";
import { useThree } from "@react-three/fiber";

interface HexagonBaseProps {
    position: [number, number, number];
    radius: number;
    height: number;
    color?: string;
    name?: string;
}

const HexagonBase: React.FC<HexagonBaseProps> = ({ position, radius, height, color, name }) => {
    const [isHovered, setIsHovered] = useState(false);
    const { raycaster } = useThree();
    const meshRef = useRef<Mesh>(null);

    // Vérifie si un point est à l'intérieur d'un hexagone régulier
    const isPointInHexagon = (point: Vector3, center: Vector3, size: number) => {
        const dx = Math.abs(point.x - center.x);
        const dz = Math.abs(point.z - center.z);

        const a = size * 0.5;
        const b = size * 0.866;

        return dz <= b && (2 * a * b - a * dz - b * dx >= 0);
    };

    const checkHexagonInteraction = (e: any) => {
        e.stopPropagation();
        const intersects = raycaster.intersectObjects(e.object.parent.children);

        if (intersects.length === 0) return false;

        const hitPoint = intersects[0].point;
        const hexCenter = new Vector3(...position);

        return intersects[0].object === e.object && isPointInHexagon(hitPoint, hexCenter, radius * 2);
    };

    const handleClick = (e: any) => {
        if (checkHexagonInteraction(e)) {
            console.log(`Hexagon clicked: ${name || "Unknown"}`);
        }
    };

    const handlePointerOver = (e: any) => {
        setIsHovered(checkHexagonInteraction(e));
    };

    const handlePointerOut = () => {
        setIsHovered(false);
    };

    return (
        <mesh
            ref={meshRef}
            position={position}
            onClick={handleClick}
            onPointerOver={handlePointerOver}
            onPointerOut={handlePointerOut}
        >
            <cylinderGeometry args={[radius, radius, height, 6]} />
            <meshStandardMaterial
                color={isHovered ? "#ffff00" : (color || "gray")}
                emissive={isHovered ? "#ffffff" : "#000000"}
                emissiveIntensity={isHovered ? 0.5 : 0}
            />
        </mesh>
    );
};

export default HexagonBase;
