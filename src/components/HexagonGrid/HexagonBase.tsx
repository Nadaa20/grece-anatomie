import React from "react";

interface HexagonBaseProps {
    position: [number, number, number];
    radius: number;
    height: number;
    color?: string;
    name?: string;
}

const HexagonBase: React.FC<HexagonBaseProps> = ({ position, radius, height, color, name }) => {
    const handleClick = () => {
        console.log(`Hexagon clicked: ${name || "Unknown"}`);
    };

    return (
        <mesh position={position} onClick={handleClick}>
            <cylinderGeometry args={[radius, radius, height, 6]} />
            <meshStandardMaterial color={color || "gray"} />
        </mesh>
    );
};

export default HexagonBase;
