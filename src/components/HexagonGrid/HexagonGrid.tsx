import React, { useEffect, useState } from "react";
import { HEX_RADIUS, TILE_Z, TILE_X, TILE_HEIGHT } from "./constants";
import Water from "./Water";
import Grass from "./Grass";
import Sand from "./Sand";
import Stone from "./Stone";
import Field from "./Field";
import { useTroopManager } from '../Troops/TroopManager';
import { useCityManager } from '../Cities/CityManager';
import { CityObject } from '../Cities/City';
import { useHeightmap } from '../../hooks/useHeightmap';
import { usePlayer } from '../../contexts/PlayerContext';
import { Troop } from '../../entities/Troop';

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

const calculateDistance = (row1: number, col1: number, row2: number, col2: number): number => {
    const dx = Math.abs(col2 - col1);
    const dy = Math.abs(row2 - row1);
    return Math.max(dx, dy);
};

const getWarfogIntensity = (row: number, col: number, commanders: Troop[], currentTerritory: string): number => {
    if (commanders.length === 0) return 1;

    const playerCommanders = commanders.filter(commander => commander.owner === currentTerritory);
    if (playerCommanders.length === 0) return 1;

    const minDistance = Math.min(...playerCommanders.map(commander => {
        // Utiliser la position de la troupe elle-même car c'est elle qui contient les autres troupes
        return calculateDistance(row, col, commander.hexCoord.row, commander.hexCoord.col);
    }));

    if (minDistance <= 1) return 0;
    return 1;
};

interface HexagonGridProps {
    heightmapPath: string;
    colormapPath: string;
    mode: "environment" | "territory";
    warfogEnabled: boolean;
}

const HexagonGrid: React.FC<HexagonGridProps> = ({
    heightmapPath,
    colormapPath,
    mode,
    warfogEnabled,
}) => {
    const [colormapData, setColormapData] = useState<Uint8ClampedArray | null>(null);
    const [fieldIndices, setFieldIndices] = useState<Set<string>>(new Set());
    const { cities } = useCityManager();
    const { troops } = useTroopManager();
    const { currentTerritory } = usePlayer();
    const commanders = troops.filter((troop: Troop) => troop.type === 'Commandant');
    const { heightmapData, mapWidth, mapHeight, getHeight } = useHeightmap(heightmapPath);

    useEffect(() => {
        const loadColormap = async () => {
            const colormap = await loadImageData(colormapPath);
            if (colormap) {
                setColormapData(colormap.data);
                generateRandomFields(colormap.width, colormap.height);
            }
        };
        loadColormap();
    }, [colormapPath]);

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
            const height = getHeight(row, col);

            const x = col * TILE_X + (row % 2 === 0 ? 0 : TILE_X / 2);
            const z = row * TILE_Z;
            const y = height / 2;

            const colorIndex = (row * mapWidth + col) * 4;
            const rgb: [number, number, number] = [
                colormapData[colorIndex],
                colormapData[colorIndex + 1],
                colormapData[colorIndex + 2],
            ];
            const territory = getTerritoryFromColor(rgb);

            const baseName = `${row}-${col}`;
            let hexName = "";

            const warfogIntensity = warfogEnabled ? getWarfogIntensity(row, col, commanders, currentTerritory) : 0;

            if (height > 4) {
                hexName = `Stone-${territory || "Neutral"}-(${baseName})`;
                hexagons.push(
                    <Stone
                        key={hexName}
                        radius={HEX_RADIUS}
                        height={height}
                        position={[x, y, z]}
                        mode={mode}
                        territory={territory || "Neutral"}
                        name={hexName}
                        row={row}
                        col={col}
                        warfogIntensity={warfogIntensity}
                    />
                );
            } else if (height === 0) {
                hexName = `Water-${territory || "Neutral"}-(${baseName})`;
                hexagons.push(
                    <Water
                        key={hexName}
                        radius={HEX_RADIUS}
                        height={height}
                        position={[x, y, z]}
                        mode={mode}
                        territory={territory || "Neutral"}
                        name={hexName}
                        row={row}
                        col={col}
                        warfogIntensity={warfogIntensity}
                    />
                );
            } else {
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
                            territory={territory || "Neutral"}
                            name={hexName}
                            row={row}
                            col={col}
                            warfogIntensity={warfogIntensity}
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
                            territory={territory || "Neutral"}
                            name={hexName}
                            row={row}
                            col={col}
                            warfogIntensity={warfogIntensity}
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
                            territory={territory || "Neutral"}
                            name={hexName}
                            row={row}
                            col={col}
                            warfogIntensity={warfogIntensity}
                        />
                    );
                }
            }
        }
    }

    return (
        <group>
            {hexagons}
            {cities.map(city => {
                const x = city.hexCoord.col * TILE_X + (city.hexCoord.row % 2 === 0 ? 0 : TILE_X / 2);
                const z = city.hexCoord.row * TILE_Z;
                const height = getHeight(city.hexCoord.row, city.hexCoord.col);
                const y = height / 2;

                const cityWarfogIntensity = warfogEnabled ? getWarfogIntensity(city.hexCoord.row, city.hexCoord.col, commanders, currentTerritory) : 0;

                if (cityWarfogIntensity > 0) return null;

                return (
                    <CityObject
                        key={city.id}
                        city={city}
                        position={[x, y, z]}
                    />
                );
            })}
        </group>
    );
};

export default HexagonGrid;