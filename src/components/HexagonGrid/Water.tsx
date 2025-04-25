import React from "react";
import HexagonBase from "./HexagonBase";
import { TERRITORY_COLORS } from "./constants";

interface WaterProps {
    position: [number, number, number];
    radius: number;
    height: number;
    territory: string;
    name: string;
    row: number;
    col: number;
    mode: "environment" | "territory";
    warfogIntensity?: number;
    warfogColor?: string;
}

const Water: React.FC<WaterProps> = ({
    position,
    radius,
    height,
    territory,
    name,
    row,
    col,
    mode,
    warfogIntensity = 0,
    warfogColor = "#FFA500"
}) => {
    const color = mode === "territory" && territory ? TERRITORY_COLORS[territory] : "#1E90FF";

    return <HexagonBase
        position={position}
        radius={radius}
        height={height}
        color={color}
        name={name}
        row={row}
        col={col}
        hexagonType="water"
        territory={territory}
        warfogIntensity={warfogIntensity}
        warfogColor={warfogColor}
    />;
};

export default Water;
