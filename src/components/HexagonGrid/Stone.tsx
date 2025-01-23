import React from "react";
import HexagonBase from "./HexagonBase";
import { TERRITORY_COLORS } from "./constants";

interface StoneProps {
    position: [number, number, number];
    radius: number;
    height: number;
    mode: "environment" | "territory";
    territory?: string | null;
    name: string;
}

const Stone: React.FC<StoneProps> = ({ position, radius, height, mode, territory, name }) => {
    const color = mode === "territory" && territory ? TERRITORY_COLORS[territory] : "gray";

    return <HexagonBase position={position} radius={radius} height={height} color={color} name={name} />;
};

export default Stone;
