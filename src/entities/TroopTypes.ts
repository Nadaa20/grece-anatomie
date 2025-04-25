import { Troop, HexCoordinates } from './Troop';
import { BoxGeometry, CylinderGeometry } from 'three';

export class Hoplite extends Troop {
    constructor(hexCoord: HexCoordinates, owner: string) {
        super(hexCoord, owner, 'Hoplite');
    }

    public getColor(): string {
        return "#800000";
    }

    public getSelectedColor(): string {
        return "#ff6666";
    }

    public getGeometry(): BoxGeometry {
        return new BoxGeometry(1, 1, 1);
    }
}

export class Frondeur extends Troop {
    constructor(hexCoord: HexCoordinates, owner: string) {
        super(hexCoord, owner, 'Frondeur');
    }

    public getColor(): string {
        return "#008000";
    }

    public getSelectedColor(): string {
        return "#66ff66";
    }

    public getGeometry(): BoxGeometry {
        return new BoxGeometry(1, 1, 1);
    }
}

export class Messager extends Troop {
    constructor(hexCoord: HexCoordinates, owner: string) {
        super(hexCoord, owner, 'Messager');
    }

    public getColor(): string {
        return "#000080";
    }

    public getSelectedColor(): string {
        return "#6666ff";
    }

    public getGeometry(): BoxGeometry {
        return new BoxGeometry(1, 1, 1);
    }
}

export class Commandant extends Troop {
    constructor(hexCoord: HexCoordinates, owner: string) {
        super(hexCoord, owner, 'Commandant');
    }

    public getColor(): string {
        return "#0000ff";
    }

    public getSelectedColor(): string {
        return "#ff6666";
    }

    public getGeometry(): BoxGeometry {
        return new BoxGeometry(1, 1, 1);
    }
}

export class Squad extends Troop {
    constructor(hexCoord: HexCoordinates, owner: string, troops: Troop[]) {
        super(hexCoord, owner, 'squad');
        this.troops = troops;
        this.isSquad = true;
    }

    public getColor(): string {
        return "#daa520";
    }

    public getSelectedColor(): string {
        return "#ffd700";
    }

    public getGeometry(): CylinderGeometry {
        return new CylinderGeometry(0.5, 0.5, 1, 8);
    }
} 