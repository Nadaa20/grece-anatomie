import React, { useState, useRef } from "react";
import { Vector3, Mesh } from "three";
import { useThree } from "@react-three/fiber";
import { DetailButton } from './DetailButton'

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
    const [showDetail, setShowDetail] = useState(false)

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
            // Désactive tous les autres boutons de détail en émettant un événement personnalisé
            window.dispatchEvent(new CustomEvent('hexagon-clicked'));

            // Active le bouton de détail pour cet hexagone
            setShowDetail(true);
            console.log(`Hexagon clicked: ${name || "Unknown"}`);
        }
    };

    const handlePointerOver = (e: any) => {
        setIsHovered(checkHexagonInteraction(e));
    };

    const handlePointerOut = () => {
        setIsHovered(false);
    };

    const handleDetailClick = () => {
        console.log(`Détail de l'hexagone ${name || "Unknown"}`);
    }

    // Écoute l'événement pour désactiver le bouton quand un autre hexagone est cliqué
    React.useEffect(() => {
        const handleOtherHexagonClick = () => {
            setShowDetail(false);
        };

        window.addEventListener('hexagon-clicked', handleOtherHexagonClick);

        return () => {
            window.removeEventListener('hexagon-clicked', handleOtherHexagonClick);
        };
    }, []);

    // Calculer la position du bouton au-dessus de l'hexagone
    const buttonPosition: [number, number, number] = [
        position[0],          // Même X que l'hexagone
        position[1] + height + 0.5,  // Y: position de l'hexagone + sa hauteur + un décalage
        position[2]           // Même Z que l'hexagone
    ];

    return (
        <group>
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

            {showDetail && (
                <DetailButton
                    position={buttonPosition}
                    onClick={handleDetailClick}
                />
            )}
        </group>
    );
};

export default HexagonBase;
