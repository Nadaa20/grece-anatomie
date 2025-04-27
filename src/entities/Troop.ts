import { BoxGeometry, CylinderGeometry } from 'three';
import { v4 as uuidv4 } from 'uuid';

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
        return "#808080"; // Couleur par défaut grise
    }

    public getSelectedColor(): string {
        return "#ff0000"; // Couleur par défaut rouge quand sélectionné
    }

    public getGeometry(): BoxGeometry | CylinderGeometry {
        return new BoxGeometry(1, 1, 1); // Géométrie par défaut : cube
    }
} 