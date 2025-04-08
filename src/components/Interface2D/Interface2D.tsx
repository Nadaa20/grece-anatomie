import React, { useState, useEffect } from "react";
import { Parchemin } from "./Parchemin.tsx";
import { HexagonType } from "../Cities/BuildingTypes";
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

export const Interface2D: React.FC = () => {
    const [showParchemin, setShowParchemin] = useState(false);
    const [selectedHexagon, setSelectedHexagon] = useState<string | null>(null);
    const [hexagonType, setHexagonType] = useState<HexagonType>('city');
    const [parcheminsData, setParcheminsData] = useState<ParcheminsData | null>(null);

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