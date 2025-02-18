import React from "react";
import HexagonBase from "./HexagonBase";
import { TERRITORY_COLORS } from "./constants";

interface GrassProps {
    position: [number, number, number];
    radius: number;
    height: number;
    mode: "environment" | "territory";
    territory?: string | null;
    name: string;
    row: number;
    col: number;
}

const Grass: React.FC<GrassProps> = ({ position, radius, height, mode, territory, name, row, col }) => {
    const color = mode === "territory" && territory ? TERRITORY_COLORS[territory] : "green";

    return <HexagonBase position={position} radius={radius} height={height} color={color} name={name} row={row} col={col} />;
};

export default Grass;
