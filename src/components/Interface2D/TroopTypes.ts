export interface TroopType {
    id: string;
    name: string;
    emoji: string;
    description: string;
    cost: {
        population: number;
        wood?: number;
        stone?: number;
        iron?: number;
        marble?: number;
    };
    stats: {
        attack: number;
        defense: number;
        speed: number;
    };
}

export const TROOP_TYPES: TroopType[] = [
    {
        id: 'hoplite',
        name: 'Hoplite',
        emoji: '🗡️',
        description: 'Soldat d\'infanterie lourdement armé, spécialisé dans le combat rapproché',
        cost: {
            population: 1,
            iron: 2,
            wood: 1
        },
        stats: {
            attack: 5,
            defense: 8,
            speed: 3
        }
    },
    {
        id: 'slinger',
        name: 'Frondeur',
        emoji: '🎯',
        description: 'Soldat léger équipé d\'une fronde, efficace à distance',
        cost: {
            population: 1,
            stone: 2
        },
        stats: {
            attack: 4,
            defense: 2,
            speed: 5
        }
    },
    {
        id: 'messenger',
        name: 'Messager',
        emoji: '🏃',
        description: 'Unité rapide pour la communication entre cités',
        cost: {
            population: 1
        },
        stats: {
            attack: 1,
            defense: 1,
            speed: 8
        }
    }
]; 