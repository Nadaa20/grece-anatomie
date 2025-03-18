import React from "react";
import { Canvas } from "@react-three/fiber";
import Camera from "../Camera/Camera";
import HexagonGrid from "../HexagonGrid/HexagonGrid";
import { Interface2D } from "../Interface2D/Interface2D";
import { TroopManagerProvider } from "../Troops/TroopManager";

interface GameProps {
    mode: "environment" | "territory";
}

const Game: React.FC<GameProps> = ({ mode }) => {
    return (
        <>
            <Interface2D />
            <Canvas>
                <Camera />

                <ambientLight intensity={0.7} />
                <directionalLight position={[10, 10, 10]} />

                <TroopManagerProvider>
                    <HexagonGrid
                        heightmapPath="/assets/maps/heightmap.png"
                        colormapPath="/assets/maps/colormap.png"
                        mode={mode}
                    />
                </TroopManagerProvider>
            </Canvas>
        </>
    );
};

export default Game;
