import { Troop, HexCoordinates } from './Troop';
import { BoxGeometry, CylinderGeometry } from 'three';

export class Hoplite extends Troop {
    constructor(hexCoord: HexCoordinates, owner: string) {
        super(hexCoord, owner, 'Hoplite');
    }
}

export class Frondeur extends Troop {
    constructor(hexCoord: HexCoordinates, owner: string) {
        super(hexCoord, owner, 'Frondeur');
    }

    public getGeometry(): BoxGeometry {
        return new BoxGeometry(1, 1, 1);
    }
}

export class Messager extends Troop {
    constructor(hexCoord: HexCoordinates, owner: string) {
        super(hexCoord, owner, 'Messager');
    }

    public getGeometry(): BoxGeometry {
        return new BoxGeometry(1, 1, 1);
    }
}

export class Commandant extends Troop {
    constructor(hexCoord: HexCoordinates, owner: string) {
        super(hexCoord, owner, 'Commandant');
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

    public getGeometry(): CylinderGeometry {
        return new CylinderGeometry(0.5, 0.5, 1, 8);
    }
} 