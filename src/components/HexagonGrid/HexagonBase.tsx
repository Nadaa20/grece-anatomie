import React from "react";
import { Vector3 } from "three";
import { useThree } from "@react-three/fiber";

interface HexagonBaseProps {
    position: [number, number, number];
    radius: number;
    height: number;
    color?: string;
    name?: string;
}

const HexagonBase: React.FC<HexagonBaseProps> = ({ position, radius, height, color, name }) => {
    const { raycaster } = useThree();

    // Fonction utilitaire pour calculer la distance horizontale entre deux points
    const getHorizontalDistance = (point: Vector3, center: Vector3) => {
        const flatPoint = new Vector3(point.x, center.y, point.z);
        const flatCenter = new Vector3(center.x, center.y, center.z);
        return flatPoint.distanceTo(flatCenter);
    };

    const handleClick = (e: any) => {
        e.stopPropagation();
        const intersects = raycaster.intersectObjects(e.object.parent.children);

        if (intersects.length === 0) return;

        const hitPoint = intersects[0].point;
        const hexCenter = new Vector3(...position);
        const horizontalDistance = getHorizontalDistance(hitPoint, hexCenter);

        // Vérifie si le clic est bien à l'intérieur de l'hexagone
        // On utilise 0.99 * radius pour avoir une petite marge de tolérance
        if (intersects[0].object === e.object && horizontalDistance <= radius * 0.99) {
            console.log(`Hexagon clicked: ${name || "Unknown"}`);
        }
    };

    return (
        <mesh position={position} onClick={handleClick}>
            <cylinderGeometry args={[radius, radius, height, 6]} />
            <meshStandardMaterial color={color || "gray"} />
        </mesh>
    );
};

export default HexagonBase;
