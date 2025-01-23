import React from "react";
import HexagonBase from "./HexagonBase";

interface WaterProps {
    position: [number, number, number];
    radius: number;
    height: number;
    mode: "environment" | "territory";
    territory?: string | null;
    name: string;
}

const Water: React.FC<WaterProps> = ({ position, radius, height, name }) => {
    const color = "#0000FF";
    return <HexagonBase position={position} radius={radius} height={height} color={color} name={name} />;
};

export default Water;
