import React, { memo, useMemo, useCallback, useEffect, useState } from 'react';
import { useTroopManager } from './TroopManager';
import { Troop } from '../../entities/Troop';
import { useGLTF } from '@react-three/drei';
import { Vector3 } from 'three';

interface TroopModelProps {
    position: [number, number, number];
    scale?: number;
    troop: Troop;
}

export const TroopModel = memo(({ position, scale = 0.5, troop }: TroopModelProps) => {
    const { selectedTroop, selectTroop, troops } = useTroopManager();
    const isSelected = selectedTroop === troop.id;
    const [model, setModel] = useState<any>(null);
    const [error, setError] = useState<string | null>(null);

    // Ajuster la position verticale pour placer le personnage sur l'hexagone
    const adjustedPosition = useMemo(() => {
        return [position[0], position[1] + 0.25, position[2]] as [number, number, number];
    }, [position]);

    useEffect(() => {
        const loadModel = async () => {
            // Ne pas charger de modèle pour les escouades
            if (troop.isSquad) {
                setModel(null);
                return;
            }

            try {
                console.log(`Chargement du modèle pour ${troop.type}...`);
                const loadedModel = await troop.loadModel();
                if (loadedModel) {
                    console.log(`Modèle chargé avec succès pour ${troop.type}`);
                    // Appliquer la couleur à tous les matériaux du modèle
                    loadedModel.traverse((child: any) => {
                        if (child.isMesh) {
                            child.material.color.set(troop.getColor());
                            child.material.emissive.set(isSelected ? troop.getColor() : "#000000");
                            child.material.emissiveIntensity = isSelected ? 0.5 : 0;
                        }
                    });
                    setModel(loadedModel);
                } else {
                    console.error(`Échec du chargement du modèle pour ${troop.type}`);
                    setError('Impossible de charger le modèle');
                }
            } catch (error) {
                console.error('Erreur lors du chargement du modèle:', error);
                setError('Erreur lors du chargement du modèle');
            }
        };
        loadModel();
    }, [troop, isSelected]);

    const handleClick = useCallback((e: any) => {
        e.stopPropagation();
        // Si la troupe fait partie d'une escouade, trouver l'escouade parente
        const parentSquad = troops.find(t =>
            t.isSquad && t.troops?.some(t => t.id === troop.id)
        );
        // Sélectionner l'escouade parente si elle existe, sinon la troupe elle-même
        selectTroop(parentSquad?.id || troop.id);
    }, [troop.id, selectTroop, troops]);

    const color = useMemo(() => {
        return isSelected ? troop.getSelectedColor() : troop.getColor();
    }, [troop, isSelected]);

    if (error) {
        console.error(`Erreur pour ${troop.type}:`, error);
    }

    // Ne pas afficher de modèle pour les escouades
    if (!model || troop.isSquad) {
        return null;
    }

    // Mettre à jour la couleur du modèle quand il est sélectionné/désélectionné
    model.traverse((child: any) => {
        if (child.isMesh) {
            child.material.color.set(color);
            child.material.emissive.set(isSelected ? color : "#000000");
            child.material.emissiveIntensity = isSelected ? 0.5 : 0;
        }
    });

    return (
        <group position={adjustedPosition} onClick={handleClick}>
            <primitive
                object={model}
                scale={scale}
                rotation={[0, Math.PI / 2, 0]}
            />
        </group>
    );
});