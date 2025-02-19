import React, { useState, useEffect } from "react";
import { Parchemin } from "../HexagonGrid/Parchemin";

export const Interface2D: React.FC = () => {
    const [showParchemin, setShowParchemin] = useState(false);
    const [selectedHexagon, setSelectedHexagon] = useState<string | null>(null);

    useEffect(() => {
        const handleShowParchemin = (event: CustomEvent<{ hexagonName: string }>) => {
            setSelectedHexagon(event.detail.hexagonName);
            setShowParchemin(true);
        };

        window.addEventListener('show-parchemin', handleShowParchemin as EventListener);
        return () => {
            window.removeEventListener('show-parchemin', handleShowParchemin as EventListener);
        };
    }, []);

    return (
        <div>
            {showParchemin && selectedHexagon && (
                <Parchemin
                    hexagonName={selectedHexagon}
                    onClose={() => setShowParchemin(false)}
                />
            )}
            {/* Si jamais on a d'autres éléments à faire afficher sur le plan 2D (donc pas sur la map) */}
        </div>
    );
}; 