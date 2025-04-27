import React from "react";
import HexagonBase from "./HexagonBase";
import { TERRITORY_COLORS } from "./constants";

interface FieldProps {
    position: [number, number, number];
    radius: number;
    height: number;
    mode: "environment" | "territory";
    territory: string;
    name: string;
    row: number;
    col: number;
    warfogIntensity?: number;
    warfogColor?: string;
}

const Field: React.FC<FieldProps> = ({
    position,
    radius,
    height,
    mode,
    territory,
    name,
    row,
    col,
    warfogIntensity = 0,
    warfogColor = "#FFA500"
}) => {
    const color = mode === "territory" && territory ? TERRITORY_COLORS[territory] : "#8B4513";

    return <HexagonBase
        position={position}
        radius={radius}
        height={height}
        color={color}
        name={name}
        row={row}
        col={col}
        hexagonType="field"
        territory={territory}
        warfogIntensity={warfogIntensity}
        warfogColor={warfogColor}
    />;
};

export default Field;
