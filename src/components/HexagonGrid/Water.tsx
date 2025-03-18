import React from "react";
import HexagonBase from "./HexagonBase";

interface WaterProps {
    position: [number, number, number];
    radius: number;
    height: number;
    mode: string;
    territory?: string | null;
    name: string;
    row: number;
    col: number;
}

const Water: React.FC<WaterProps> = ({ position, radius, height, mode, territory, name, row, col }) => {
    const color = mode === "territory" && territory ? TERRITORY_COLORS[territory] : "blue";

    return <HexagonBase position={position} radius={radius} height={height} color={color} name={name} row={row} col={col} />;
};

export default Water;
