import React, { useEffect, useState } from "react";
import { HEX_RADIUS, TILE_Z, TILE_X, TILE_HEIGHT } from "./constants";
import Water from "./Water";
import Grass from "./Grass";
import Sand from "./Sand";
import Stone from "./Stone";
import Field from "./Field";

const loadImageData = async (path: string): Promise<ImageData | null> => {
    const img = new Image();
    img.src = path;
    await img.decode();

    const canvas = document.createElement("canvas");
    canvas.width = img.width;
    canvas.height = img.height;
    const ctx = canvas.getContext("2d")!;
    ctx.drawImage(img, 0, 0);
    return ctx.getImageData(0, 0, canvas.width, canvas.height);
};

const getTerritoryFromColor = (color: [number, number, number]): string | null => {
    const [r, g, b] = color;
    if (r === 255 && g === 0 && b === 0) return "Thessaly";
    if (r === 255 && g === 255 && b === 0) return "Pelopponesus";
    if (r === 0 && g === 255 && b === 0) return "Attica";
    return null;
};

const isAdjacentToWater = (row: number, col: number, mapWidth: number, mapHeight: number, heightmapData: Uint8ClampedArray): boolean => {
    const directions = [
        [0, 1], [-1, 1], [-1, 0], [-1, -1], [0, -1], [1, 0]
    ];

    for (const [dRow, dCol] of directions) {
        const newRow = row + dRow;
        const newCol = col + dCol;
        if (newRow >= 0 && newRow < mapHeight && newCol >= 0 && newCol < mapWidth) {
            const index = (newRow * mapWidth + newCol) * 4;
            const adjacentHeight = heightmapData[index];
            if (adjacentHeight === 255) { // C'est en fonction de la heighMap, 255 c'est le blanc, et plus c'est blanc plus c'est bas (niveau de la mer)
                return true;
            }
        }
    }
    return false;
};

const HexagonGrid: React.FC<{ heightmapPath: string; colormapPath: string; mode: "environment" | "territory" }> = ({
    heightmapPath,
    colormapPath,
    mode,
}) => {
    const [heightmapData, setHeightmapData] = useState<Uint8ClampedArray | null>(null);
    const [colormapData, setColormapData] = useState<Uint8ClampedArray | null>(null);
    const [mapWidth, setMapWidth] = useState(0);
    const [mapHeight, setMapHeight] = useState(0);
    const [fieldIndices, setFieldIndices] = useState<Set<string>>(new Set());

    useEffect(() => {
        const loadMaps = async () => {
            const [heightmap, colormap] = await Promise.all([
                loadImageData(heightmapPath),
                loadImageData(colormapPath),
            ]);
            if (heightmap && colormap) {
                setHeightmapData(heightmap.data);
                setColormapData(colormap.data);
                setMapWidth(heightmap.width);
                setMapHeight(heightmap.height);
                generateRandomFields(heightmap.width, heightmap.height);
            }
        };
        loadMaps();
    }, [heightmapPath, colormapPath]);

    const generateRandomFields = (width: number, height: number) => {
        const numberOfFields = Math.floor(width * height * 0.01);
        const indices = new Set<string>();
        while (indices.size < numberOfFields) {
            indices.add(`${Math.floor(Math.random() * height)}-${Math.floor(Math.random() * width)}`);
        }
        setFieldIndices(indices);
    };

    if (!heightmapData || !colormapData) return null;

    const hexagons = [];
    for (let row = 0; row < mapHeight; row++) {
        for (let col = 0; col < mapWidth; col++) {
            const index = (row * mapWidth + col) * 4;
            const brightness = heightmapData[index];
            const height = (1 - brightness / 255) * TILE_HEIGHT;

            const x = col * TILE_X + (row % 2 === 0 ? 0 : TILE_X / 2);
            const z = row * TILE_Z;
            const y = height / 2;

            const rgb: [number, number, number] = [
                colormapData[index],
                colormapData[index + 1],
                colormapData[index + 2],
            ];
            const territory = getTerritoryFromColor(rgb);

            const baseName = `${row}-${col}`;
            let hexName = "";

            if (height > 4) {
                hexName = `Stone-${territory || "Neutral"}-(${baseName})`;
                hexagons.push(
                    <Stone
                        key={hexName}
                        radius={HEX_RADIUS}
                        height={height}
                        position={[x, y, z]}
                        mode={mode as "environment" | "territory"}
                        territory={territory}
                        name={hexName}
                        row={row}
                        col={col}
                    />
                );
            } else if (height > 1) {
                const isField = fieldIndices.has(`${row}-${col}`);
                if (isField) {
                    hexName = `Field-${territory || "Neutral"}-(${baseName})`;
                    hexagons.push(
                        <Field
                            key={hexName}
                            radius={HEX_RADIUS}
                            height={height}
                            position={[x, y, z]}
                            mode={mode}
                            territory={territory}
                            name={hexName}
                            row={row}
                            col={col}
                        />
                    );
                } else if (isAdjacentToWater(row, col, mapWidth, mapHeight, heightmapData)) {
                    hexName = `Sand-${territory || "Neutral"}-(${baseName})`;
                    hexagons.push(
                        <Sand
                            key={hexName}
                            radius={HEX_RADIUS}
                            height={height}
                            position={[x, y, z]}
                            mode={mode}
                            territory={territory}
                            name={hexName}
                            row={row}
                            col={col}
                        />
                    );
                } else {
                    hexName = `Grass-${territory || "Neutral"}-(${baseName})`;
                    hexagons.push(
                        <Grass
                            key={hexName}
                            radius={HEX_RADIUS}
                            height={height}
                            position={[x, y, z]}
                            mode={mode}
                            territory={territory}
                            name={hexName}
                            row={row}
                            col={col}
                        />
                    );
                }
            } else {
                hexName = `Water-${territory || "Neutral"}-(${baseName})`;
                hexagons.push(
                    <Water
                        key={hexName}
                        radius={HEX_RADIUS}
                        height={height}
                        position={[x, y, z]}
                        mode={mode}
                        territory={territory}
                        name={hexName}
                        row={row}
                        col={col}
                    />
                );
            }
        }
    }

    return <group>{hexagons}</group>;
};

export default HexagonGrid;