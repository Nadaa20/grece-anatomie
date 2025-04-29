import React from "react";
import { Canvas } from "@react-three/fiber";
import Camera from "../Camera/Camera";
import HexagonGrid from "../HexagonGrid/HexagonGrid";
import { Interface2D } from "../Interface2D/Interface2D";
import { TroopManagerProvider } from "../Troops/TroopManager";
import { CityManagerProvider } from "../Cities/CityManager";

interface GameProps {
    mode: "environment" | "territory";
    warfogEnabled: boolean;
}

const Game: React.FC<GameProps> = ({ mode, warfogEnabled }) => {
    console.log('[CLIENT] Game monté');
    return (
        <>
            <CityManagerProvider>
                <TroopManagerProvider>
                    <Interface2D mode={mode} />
                    <Canvas>
                        <Camera />

                        <ambientLight intensity={0.7} />
                        <directionalLight position={[10, 10, 10]} />

                        <HexagonGrid
                            heightmapPath="/assets/maps/heightmap.png"
                            colormapPath="/assets/maps/colormap.png"
                            mode={mode}
                            warfogEnabled={warfogEnabled}
                        />
                    </Canvas>
                </TroopManagerProvider>
            </CityManagerProvider>
        </>
    );
};

export default Game;
