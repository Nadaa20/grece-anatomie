import { Troop, HexCoordinates } from './Troop';
import { BoxGeometry, CylinderGeometry } from 'three';

export class Hoplite extends Troop {
    constructor(hexCoord: HexCoordinates, owner: string, originCity: string) {
        super(hexCoord, owner, 'Hoplite', originCity);
    }
}

export class Frondeur extends Troop {
    constructor(hexCoord: HexCoordinates, owner: string, originCity: string) {
        super(hexCoord, owner, 'Slinger', originCity);
    }

    public getGeometry(): BoxGeometry {
        return new BoxGeometry(1, 1, 1);
    }
}

export class Messager extends Troop {
    private message: string = "";

    constructor(hexCoord: HexCoordinates, owner: string, originCity: string) {
        super(hexCoord, owner, 'Messenger', originCity);
    }

    public getGeometry(): BoxGeometry {
        return new BoxGeometry(1, 1, 1);
    }

    public getMessage(): string {
        return this.message;
    }

    public setMessage(message: string): void {
        this.message = message;
    }
}

export class Commandant extends Troop {
    constructor(hexCoord: HexCoordinates, owner: string, originCity: string) {
        super(hexCoord, owner, 'Commandant', originCity);
    }

    public getGeometry(): BoxGeometry {
        return new BoxGeometry(1, 1, 1);
    }
}

export class Squad extends Troop {
    constructor(hexCoord: HexCoordinates, owner: string, troops: Troop[]) {
        super(hexCoord, owner, 'squad', troops[0].originCity);
        this.troops = troops;
        this.isSquad = true;
    }

    public getGeometry(): CylinderGeometry {
        return new CylinderGeometry(0.5, 0.5, 1, 8);
    }
} 