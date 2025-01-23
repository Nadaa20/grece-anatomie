import React from "react";
import { Canvas } from "@react-three/fiber";
import Camera from "../Camera/Camera";
import HexagonGrid from "../HexagonGrid/HexagonGrid";
import Troop from "../Troop/Troop";

interface GameProps {
    mode: "environment" | "territory";
}

const Game: React.FC<GameProps> = ({ mode }) => {
    return (
        <Canvas>
            <Camera />

            <ambientLight intensity={0.7} />
            <directionalLight position={[10, 10, 10]} />

            <HexagonGrid
                heightmapPath="/assets/maps/heightmap.png"
                colormapPath="/assets/maps/colormap.png"
                mode={mode}
            />
        </Canvas>
    );
};

export default Game;
