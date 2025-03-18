import React, { useState, useRef } from "react";
import { Vector3, Mesh } from "three";
import { useThree } from "@react-three/fiber";
import { DetailButton } from './DetailButton'
import { HexagonInteraction } from './HexagonInteraction'
import { TroopModel } from '../Troops/TroopModel';
import { useTroopManager } from '../Troops/TroopManager';
import { Billboard, Text } from '@react-three/drei';
import { TroopDisplay } from '../Troops/TroopDisplay';
import { MoveOptionsPanel } from '../Troops/MoveOptionsPanel';
import { SplitMovePanel } from '../Troops/SplitMovePanel';

interface HexagonBaseProps {
    position: [number, number, number];
    radius: number;
    height: number;
    color?: string;
    name?: string;
    row: number;
    col: number;
}

const HexagonBase: React.FC<HexagonBaseProps> = ({ position, radius, height, color, name, row, col }) => {
    const [isHovered, setIsHovered] = useState(false);
    const { raycaster } = useThree();
    const meshRef = useRef<Mesh>(null);
    const [showDetail, setShowDetail] = useState(false)
    const { selectedTroop, getTroopAtHex, moveTroop, troops, splitMoveTroop, path, isMoving, startMoving } = useTroopManager();
    const troop = getTroopAtHex(row, col);
    const [showMoveOptions, setShowMoveOptions] = useState(false);
    const [showSplitPanel, setShowSplitPanel] = useState(false);

    const isInPath = path.some(coord => coord.row === row && coord.col === col);
    const isPathStart = path.length > 0 && path[0].row === row && path[0].col === col;
    const isPathEnd = path.length > 0 && path[path.length - 1].row === row && path[path.length - 1].col === col;

    const checkHexagonInteraction = (e: any) => {
        e.stopPropagation();
        const intersects = raycaster.intersectObjects(e.object.parent.children);

        if (intersects.length === 0) return false;

        return intersects[0].object;
    };

    const handleClick = (e: any) => {
        e.stopPropagation();

        if (!selectedTroop) {
            window.dispatchEvent(new CustomEvent('hexagon-clicked'));
            setShowDetail(true);
            return;
        }

        if (selectedTroop && checkHexagonInteraction(e)) {
            window.dispatchEvent(new CustomEvent('hexagon-clicked'));
            const selectedTroopObj = troops.find(t => t.id === selectedTroop);

            if (selectedTroopObj?.isSquad) {
                setShowMoveOptions(true);
            } else {
                startMoving(selectedTroop, { row, col });
            }
            return;
        }

        window.dispatchEvent(new CustomEvent('hexagon-clicked'));
        setShowDetail(false);
        setShowMoveOptions(false);
    };

    const handlePointerOver = (e: any) => {
        const interaction = checkHexagonInteraction(e);
        setIsHovered(interaction !== false);
    };

    const handlePointerOut = () => {
        setIsHovered(false);
    };

    const handleDetailClick = () => {
        console.log(`Détail de l'hexagone ${name || "Unknown"}`);
    }

    const handleMoveAll = () => {
        if (selectedTroop) {
            moveTroop(selectedTroop, { row, col });
            setShowMoveOptions(false);
            window.dispatchEvent(new CustomEvent('hexagon-clicked'));
        }
    };

    const handleSplitMove = () => {
        setShowMoveOptions(false);
        setShowSplitPanel(true);
    };

    const handleSplitConfirm = (splits: { [type: string]: number }) => {
        if (selectedTroop) {
            splitMoveTroop(selectedTroop, { row, col }, splits);
            setShowSplitPanel(false);
            window.dispatchEvent(new CustomEvent('hexagon-clicked'));
        }
    };

    const handleSplitCancel = () => {
        setShowSplitPanel(false);
    };

    const getTroopTypes = () => {
        const selectedTroopObj = troops.find(t => t.id === selectedTroop);
        if (!selectedTroopObj) return [];

        if (selectedTroopObj.isSquad && selectedTroopObj.troops) {
            // Compter les types de troupes dans l'escouade
            const typeCounts = selectedTroopObj.troops.reduce((acc: { [key: string]: number }, troop) => {
                acc[troop.type] = (acc[troop.type] || 0) + 1;
                return acc;
            }, {});

            return Object.entries(typeCounts).map(([type, count]) => ({
                type,
                count
            }));
        }

        // Si c'est une troupe simple
        return [{ type: selectedTroopObj.type, count: 1 }];
    };

    React.useEffect(() => {
        const handleOtherHexagonClick = () => {
            setShowDetail(false);
            setShowMoveOptions(false);
        };

        window.addEventListener('hexagon-clicked', handleOtherHexagonClick);

        return () => {
            window.removeEventListener('hexagon-clicked', handleOtherHexagonClick);
        };
    }, []);

    const buttonPosition: [number, number, number] = [
        position[0],
        height + 1,
        position[2]
    ];

    const troopPosition: [number, number, number] = [
        position[0],
        position[1] + (height / 2),
        position[2]
    ];

    const optionsPanelPosition: [number, number, number] = [
        position[0],
        height + 1.5,
        position[2]
    ];

    return (
        <group>
            <mesh
                ref={meshRef}
                position={position}
                onClick={handleClick}
                onPointerOver={handlePointerOver}
                onPointerOut={handlePointerOut}
            >
                <cylinderGeometry args={[radius, radius, height, 6]} />
                <meshStandardMaterial
                    color={
                        isInPath ? "#ffffff" :
                            isHovered ? "#ffff00" : (color || "gray")
                    }
                    emissive={
                        isInPath ? "#ffffff" :
                            isHovered ? "#ffffff" : "#000000"
                    }
                    emissiveIntensity={
                        isInPath ? 0.8 :
                            isHovered ? 0.5 : 0
                    }
                />
            </mesh>

            {troop && (
                <TroopDisplay
                    troop={troop}
                    position={troopPosition}
                />
            )}

            {showDetail && (
                <DetailButton
                    position={buttonPosition}
                    onClick={handleDetailClick}
                />
            )}

            {showMoveOptions && selectedTroop && (
                <MoveOptionsPanel
                    position={optionsPanelPosition}
                    onMoveAll={handleMoveAll}
                    onSplitMove={handleSplitMove}
                    troopTypes={getTroopTypes()}
                />
            )}

            {showSplitPanel && selectedTroop && (
                <SplitMovePanel
                    position={optionsPanelPosition}
                    troopTypes={getTroopTypes()}
                    onConfirm={handleSplitConfirm}
                    onCancel={handleSplitCancel}
                />
            )}

            <HexagonInteraction position={position} name={name || ''} />
        </group>
    );
};

export default HexagonBase;
