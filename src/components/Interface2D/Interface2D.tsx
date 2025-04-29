import React, { useState, useEffect, useContext } from "react";
import { Parchemin } from "./Parchemin.tsx";
import { HexagonType } from "../Cities/BuildingTypes";
import { useTroopManager } from "../Troops/TroopManager";
import { useCityManager } from "../Cities/CityManager";
import { HEX_RADIUS, TILE_X, TILE_Z } from "../HexagonGrid/constants";
import { useHeightmap } from "../../hooks/useHeightmap";
import { SocketContext } from '../../contexts/SocketContext';

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
    territory: string;
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
    console.log('[CLIENT] Interface2D monté');
    const [showParchemin, setShowParchemin] = useState(false);
    const [selectedHexagon, setSelectedHexagon] = useState<string | null>(null);
    const [hexagonType, setHexagonType] = useState<HexagonType>('city');
    const [parcheminsData, setParcheminsData] = useState<ParcheminsData | null>(null);
    const { getHeight } = useHeightmap();
    const { troops } = useTroopManager();
    const { cities } = useCityManager();
    const { socket } = useContext(SocketContext);

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

    const handleEndTurn = async () => {
        if (!socket) {
            console.error('[CLIENT] Pas de connexion socket disponible');
            return;
        }

        // Récupérer uniquement les hexagones qui ont des données importantes
        const hexagonsData: HexagonData[] = [];
        let totalHexagons = 0;
        let hexagonesVides = 0;
        let hexagonesAvecTroupes = 0;
        let hexagonesAvecVilles = 0;

        console.log('[CLIENT] Début de la collecte des données des hexagones');

        for (let row = 0; row < 100; row++) {
            for (let col = 0; col < 100; col++) {
                totalHexagons++;
                const troop = troops.find(t => t.hexCoord.row === row && t.hexCoord.col === col);
                const city = cities.find(c => c.hexCoord.row === row && c.hexCoord.col === col);
                
                if (troop) hexagonesAvecTroupes++;
                if (city) hexagonesAvecVilles++;
                if (!troop && !city) {
                    hexagonesVides++;
                    // On inclut maintenant tous les hexagones
                    // continue;
                }

                const x = col * TILE_X + (row % 2 === 0 ? 0 : TILE_X / 2);
                const z = row * TILE_Z;
                const height = getHeight(row, col);
                
                const hexagonData: HexagonData = {
                    row,
                    col,
                    type: city ? 'city' : troop ? 'occupied' : 'grass',
                    territory: '',
                    height,
                    position: [x, height / 2, z],
                    name: `${row}-${col}`,
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

        console.log('[CLIENT] Statistiques des hexagones :');
        console.log(`- Total des hexagones : ${totalHexagons}`);
        console.log(`- Hexagones vides : ${hexagonesVides}`);
        console.log(`- Hexagones avec troupes : ${hexagonesAvecTroupes}`);
        console.log(`- Hexagones avec villes : ${hexagonesAvecVilles}`);
        console.log(`- Hexagones à envoyer : ${hexagonsData.length}`);

        const jsonData = {
            turn: new Date().toISOString(),
            hexagons: hexagonsData
        };

        console.log('[CLIENT] socket.id =', socket.id);

        // Envoyer les données en plusieurs parties si nécessaire
        const CHUNK_SIZE = 1000; // Augmenté à 1000 hexagones par chunk
        const chunks = [];
        
        for (let i = 0; i < hexagonsData.length; i += CHUNK_SIZE) {
            chunks.push(hexagonsData.slice(i, i + CHUNK_SIZE));
        }

        try {
            // Envoyer les chunks avec un délai entre chaque envoi
            for (let i = 0; i < chunks.length; i++) {
                const chunk = chunks[i];
                const chunkData = {
                    turn: jsonData.turn,
                    chunk_index: i,
                    total_chunks: chunks.length,
                    hexagons: chunk
                };
                
                socket.emit('end_turn_chunk', chunkData);
                console.log(`[CLIENT] Chunk ${i + 1}/${chunks.length} envoyé (${chunk.length} hexagones)`);
                
                // Attendre 100ms entre chaque chunk
                if (i < chunks.length - 1) {
                    await new Promise(resolve => setTimeout(resolve, 100));
                }
            }

            // Attendre un peu avant d'envoyer le message de fin
            await new Promise(resolve => setTimeout(resolve, 200));

            // Envoyer un message de fin
            socket.emit('end_turn_complete', {
                turn: jsonData.turn,
                total_hexagons: hexagonsData.length
            });

            console.log('[CLIENT] Données envoyées en', chunks.length, 'chunks');
        } catch (error) {
            console.error('[CLIENT] Erreur lors de l\'envoi des données:', error);
        }
    };

    return (
        <div>
            <button
                type="button"
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