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
        health: number;
        speed: number;
    };
}

export const TROOP_TYPES: TroopType[] = [
    {
        id: 'Hoplite',
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
            health: 30,
            speed: 3
        }
    },
    {
        id: 'Slinger',
        name: 'Frondeur',
        emoji: '🎯',
        description: 'Soldat léger équipé d\'une fronde, efficace à distance',
        cost: {
            population: 1,
            stone: 2
        },
        stats: {
            attack: 4,
            health: 15,
            speed: 5
        }
    },
    {
        id: 'Messenger',
        name: 'Messager',
        emoji: '🏃',
        description: 'Unité rapide pour la communication entre cités',
        cost: {
            population: 1
        },
        stats: {
            attack: 1,
            health: 15,
            speed: 8
        }
    },
    {
        id: 'Commandant',
        name: 'Commandant',
        emoji: '👑',
        description: 'Leader charismatique qui inspire ses troupes',
        cost: {
            population: 1,
            iron: 3,
            wood: 2
        },
        stats: {
            attack: 3,
            health: 45,
            speed: 4
        }
    }
]; 