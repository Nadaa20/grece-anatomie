import React from "react";
import HexagonBase from "./HexagonBase";
import { TERRITORY_COLORS } from "./constants";

interface FieldProps {
    position: [number, number, number];
    radius: number;
    height: number;
    mode: "environment" | "territory";
    territory?: string | null;
    name: string;
    row: number;
    col: number;
}

const Field: React.FC<FieldProps> = ({ position, radius, height, mode, territory, name, row, col }) => {
    const color = mode === "territory" && territory ? TERRITORY_COLORS[territory] : "#8B4513";

    return <HexagonBase position={position} radius={radius} height={height} color={color} name={name} row={row} col={col} />;
};

export default Field;
