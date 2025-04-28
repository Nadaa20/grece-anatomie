import { BoxGeometry, CylinderGeometry, Group } from 'three';
import { v4 as uuidv4 } from 'uuid';
import { GLTFLoader } from 'three/examples/jsm/loaders/GLTFLoader';
import { TERRITORY_COLORS } from '../components/HexagonGrid/constants';

export interface HexCoordinates {
    row: number;
    col: number;
}

export interface PathNode extends HexCoordinates {
    f: number;
    g: number;
    h: number;
    parent?: PathNode;
}

export class Troop {
    public id: string;
    public hexCoord: HexCoordinates;
    public owner: string;
    public type: string;
    public isSquad: boolean;
    public troops?: Troop[];
    private model: Group | null = null;

    constructor(hexCoord: HexCoordinates, owner: string, type: string) {
        this.id = uuidv4();
        this.hexCoord = hexCoord;
        this.owner = owner;
        this.type = type;
        this.isSquad = false;
    }

    public moveTo(newHexCoord: HexCoordinates): void {
        this.hexCoord = newHexCoord;
    }

    public getColor(): string {
        return TERRITORY_COLORS[this.owner] || "#ffffff";
    }

    public getSelectedColor(): string {
        return "#ffff00";
    }

    public async loadModel(): Promise<Group | null> {
        if (this.model) return this.model;

        const loader = new GLTFLoader();
        const modelPath = `/models/${this.type}/${this.type}.gltf`;
        
        try {
            const gltf = await loader.loadAsync(modelPath);
            this.model = gltf.scene;
            return this.model;
        } catch (error) {
            console.error(`Erreur lors du chargement du modèle pour ${this.type}:`, error);
            return null;
        }
    }
} 