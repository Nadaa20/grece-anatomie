import React from "react";
import HexagonBase from "./HexagonBase";

interface WaterProps {
    position: [number, number, number];
    radius: number;
    height: number;
    name: string;
    row: number;
    col: number;
}

const Water: React.FC<WaterProps> = ({ position, radius, height, name, row, col }) => {
    const color = "blue";

    return <HexagonBase position={position} radius={radius} height={height} color={color} name={name} row={row} col={col} />;
};

export default Water;
