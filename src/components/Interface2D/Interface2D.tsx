import React, { useState, useEffect } from "react";
import { Parchemin } from "./Parchemin.tsx";
import { HexagonType } from "../Cities/BuildingTypes";
import { useTroopManager } from "../Troops/TroopManager";
import { useCityManager } from "../Cities/CityManager";
import { HEX_RADIUS, TILE_X, TILE_Z } from "../HexagonGrid/constants";
import { useHeightmap } from "../../hooks/useHeightmap";
//import { socket } from "../../socket"; // Faudra modifier ceci quand le serveur sera fais

interface ParcheminsData {
    Batiments: { [key: string]: number };
    Troupes: { [key: string]: number };
    Quetes: { [key: string]: string };
    Ressources?: {
        wood: number;
        stone: number;
        iron: number;
        marble: number;
    };
}

interface HexagonData {
    row: number;
    col: number;
    type: string;
    territory: string | null;
    height: number;
    position: [number, number, number];
    name: string;
    mode: "environment" | "territory";
    radius: number;
    city?: {
        id: string;
        name: string;
        population: number;
        buildings: {
            id: string;
            typeId: string;
            level: number;
            constructionProgress: number;
        }[];
        resources: {
            wood: number;
            stone: number;
            iron: number;
            marble: number;
        };
    };
    troop?: {
        id: string;
        type: string;
        owner: string;
        isSquad: boolean;
        troops?: {
            id: string;
            type: string;
            owner: string;
        }[];
    };
}

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

export const Interface2D: React.FC<{ mode: "environment" | "territory" }> = ({ mode }) => {
    const [showParchemin, setShowParchemin] = useState(false);
    const [selectedHexagon, setSelectedHexagon] = useState<string | null>(null);
    const [hexagonType, setHexagonType] = useState<HexagonType>('city');
    const [parcheminsData, setParcheminsData] = useState<ParcheminsData | null>(null);
    const { getHeight } = useHeightmap();
    const { troops } = useTroopManager();
    const { cities } = useCityManager();

    const handleEndTurn = () => {
        // Récupérer toutes les données des hexagones
        const hexagonsData: HexagonData[] = [];

        // Parcourir tous les hexagones de la grille
        for (let row = 0; row < 100; row++) { // Ajuster selon la taille de la grille
            for (let col = 0; col < 100; col++) {
                const hexagonName = `${row}-${col}`;
                const troop = troops.find(t => t.hexCoord.row === row && t.hexCoord.col === col);
                const city = cities.find(c => c.hexCoord.row === row && c.hexCoord.col === col);

                // Déterminer le type d'hexagone
                let type = 'grass';
                if (city) type = 'city';
                else if (troop) type = 'occupied';

                const x = col * TILE_X + (row % 2 === 0 ? 0 : TILE_X / 2);
                const z = row * TILE_Z;
                const height = getHeight(row, col);

                const hexagonData: HexagonData = {
                    row,
                    col,
                    type,
                    territory: null, // À implémenter selon la logique du jeu
                    height,
                    position: [x, height / 2, z],
                    name: hexagonName,
                    mode,
                    radius: HEX_RADIUS
                };

                if (city) {
                    hexagonData.city = {
                        id: city.id,
                        name: city.name,
                        population: city.population,
                        buildings: city.buildings,
                        resources: city.resources
                    };
                }

                if (troop) {
                    hexagonData.troop = {
                        id: troop.id,
                        type: troop.type,
                        owner: troop.owner,
                        isSquad: troop.isSquad || false,
                        troops: troop.troops
                    };
                }

                hexagonsData.push(hexagonData);
            }
        }

        // Créer le fichier JSON
        const jsonData = {
            turn: new Date().toISOString(),
            hexagons: hexagonsData
        };

        // Créer et télécharger le fichier
        const blob = new Blob([JSON.stringify(jsonData, null, 2)], { type: 'application/json' });
        const url = URL.createObjectURL(blob);
        const a = document.createElement('a');
        a.href = url;
        a.download = 'output.json';
        document.body.appendChild(a);
        a.click();
        document.body.removeChild(a);
        URL.revokeObjectURL(url);
    };

    useEffect(() => {
        const handleShowParchemin = (event: CustomEvent<{ hexagonName: string; hexagonType: HexagonType; data?: ParcheminsData }>) => {
            console.log("Received show-parchemin event:", event.detail);
            setSelectedHexagon(event.detail.hexagonName);
            setHexagonType(event.detail.hexagonType);
            if (event.detail.data) {
                console.log("Setting parchemin data:", event.detail.data);
                setParcheminsData(event.detail.data);
            } else {
                console.log("No data received in event");
            }
            setShowParchemin(true);
            //socket.emit("Parchemins", event.detail.hexagonName);
        };

        //socket.on("ParcheminsData", (data: ParcheminsData) => {
        //    setParcheminsData(data);
        //});

        window.addEventListener('show-parchemin', handleShowParchemin as EventListener);

        return () => {
            window.removeEventListener('show-parchemin', handleShowParchemin as EventListener);
            //socket.off("ParcheminsData");
        };
    }, []);

    return (
        <div>
            <button
                onClick={handleEndTurn}
                style={{
                    position: 'fixed',
                    top: '20px',
                    right: '20px',
                    padding: '10px 20px',
                    backgroundColor: '#4CAF50',
                    color: 'white',
                    border: 'none',
                    borderRadius: '5px',
                    cursor: 'pointer',
                    fontSize: '16px',
                    zIndex: 1000
                }}
            >
                Fin du tour
            </button>
            {showParchemin && selectedHexagon && (
                <Parchemin
                    onClose={() => {
                        setShowParchemin(false);
                        setParcheminsData(null);
                    }}
                    data={parcheminsData}
                    hexagonType={hexagonType}
                />
            )}
            {/* Si jamais on a d'autres éléments à faire afficher sur le plan 2D (donc pas sur la map) */}
        </div>
    );
}; 