import { useState, useEffect } from 'react';
import { TILE_HEIGHT } from '../components/HexagonGrid/constants';

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

export const useHeightmap = (path: string = "/assets/maps/heightmap.png") => {
    const [heightmapData, setHeightmapData] = useState<Uint8ClampedArray | null>(null);
    const [mapWidth, setMapWidth] = useState(0);
    const [mapHeight, setMapHeight] = useState(0);

    useEffect(() => {
        const loadHeightmap = async () => {
            const heightmap = await loadImageData(path);
            if (heightmap) {
                setHeightmapData(heightmap.data);
                setMapWidth(heightmap.width);
                setMapHeight(heightmap.height);
            }
        };
        loadHeightmap();
    }, [path]);

    const getHeight = (row: number, col: number): number => {
        if (!heightmapData) return 0;
        const index = (row * mapWidth + col) * 4;
        const brightness = heightmapData[index];
        return (1 - brightness / 255) * TILE_HEIGHT;
    };

    return {
        heightmapData,
        mapWidth,
        mapHeight,
        getHeight
    };
}; 