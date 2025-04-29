import { Group, BoxGeometry, CylinderGeometry } from 'three';
import { v4 as uuidv4 } from 'uuid';
import { GLTFLoader } from 'three/examples/jsm/loaders/GLTFLoader';
import { TERRITORY_COLORS } from '../components/HexagonGrid/constants';
import { TROOP_TYPES, TroopType } from '../components/Interface2D/TroopTypes';

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
    public health: number;
    public maxHealth: number;
    public damage: number;
    public originCity: string;

    constructor(hexCoord: HexCoordinates, owner: string, type: string, originCity: string) {
        this.id = uuidv4();
        this.hexCoord = hexCoord;
        this.owner = owner;
        this.type = type;
        this.isSquad = false;
        this.originCity = originCity;
        
        // Initialiser les statistiques de combat
        const troopType = TROOP_TYPES.find((t: TroopType) => t.id === type);
        if (troopType) {
            this.maxHealth = troopType.stats.health;
            this.health = this.maxHealth;
            this.damage = troopType.stats.attack;
        } else {
            this.maxHealth = 10;
            this.health = this.maxHealth;
            this.damage = 5;
        }
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
        const capitalizedType = this.type.charAt(0).toUpperCase() + this.type.slice(1);
        const modelPath = `/models/${capitalizedType}/${capitalizedType}.gltf`;
        
        try {
            const gltf = await loader.loadAsync(modelPath);
            this.model = gltf.scene;
            return this.model;
        } catch (error) {
            console.error(`Erreur lors du chargement du modèle pour ${this.type}:`, error);
            return null;
        }
    }

    public takeDamage(amount: number): void {
        this.health = Math.max(0, this.health - amount);
    }

    public isAlive(): boolean {
        return this.health > 0;
    }

    public getTotalDamage(): number {
        if (this.isSquad && this.troops) {
            return this.troops.reduce((total, troop) => total + troop.damage, 0);
        }
        return this.damage;
    }

    public getTotalHealth(): number {
        if (this.isSquad && this.troops) {
            return this.troops.reduce((total, troop) => total + troop.health, 0);
        }
        return this.health;
    }

    public getTotalMaxHealth(): number {
        if (this.isSquad && this.troops) {
            return this.troops.reduce((total, troop) => total + troop.maxHealth, 0);
        }
        return this.maxHealth;
    }
} 