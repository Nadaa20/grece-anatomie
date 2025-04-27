type Resource = 'wood' | 'stone' | 'iron' | 'marble';

export type HexagonType = 'city' | 'mine' | 'field' | 'forest' | 'mountain' | 'water';

export interface BuildingType {
    id: string;
    name: string;
    emoji: string;
    description: string;
    effect: string;
    cost: {
        wood: number;
        stone: number;
        iron: number;
        marble: number;
    };
    isStarting: boolean;
    buildableOn: HexagonType[];
    isActive: boolean;
    requiredWorkers: number;
}

export const BUILDING_TYPES: BuildingType[] = [
    {
        id: 'well',
        name: 'Puits',
        emoji: '💧',
        description: 'Accès à l\'eau pour les citoyens',
        effect: 'Accès à l\'eau pour les citoyens (hygiène, santé)',
        cost: { wood: 0, stone: 0, iron: 0, marble: 0 },
        isStarting: true,
        buildableOn: ['city'],
        isActive: false,
        requiredWorkers: 1
    },
    {
        id: 'house',
        name: 'Maison',
        emoji: '🏠',
        description: 'Loge les citoyens',
        effect: 'Augmente la capacité de population',
        cost: { wood: 10, stone: 5, iron: 0, marble: 0 },
        isStarting: false,
        buildableOn: ['city'],
        isActive: false,
        requiredWorkers: 0
    },
    {
        id: 'lumbermill',
        name: 'Scierie',
        emoji: '🪓',
        description: 'Production de bois',
        effect: '+5 bois par tour',
        cost: { wood: 50, stone: 20, iron: 10, marble: 0 },
        isStarting: false,
        buildableOn: ['forest'],
        isActive: true,
        requiredWorkers: 2
    },
    {
        id: 'quarry',
        name: 'Carrière',
        emoji: '⛏️',
        description: 'Production de pierre',
        effect: '+5 pierre par tour',
        cost: { wood: 30, stone: 40, iron: 15, marble: 0 },
        isStarting: false,
        buildableOn: ['mine', 'mountain'],
        isActive: true,
        requiredWorkers: 2
    },
    {
        id: 'ironmine',
        name: 'Mine de fer',
        emoji: '⛰️',
        description: 'Production de fer',
        effect: '+5 fer par tour',
        cost: { wood: 40, stone: 30, iron: 20, marble: 0 },
        isStarting: false,
        buildableOn: ['mine', 'mountain'],
        isActive: true,
        requiredWorkers: 2
    },
    {
        id: 'marblequarry',
        name: 'Carrière de marbre',
        emoji: '🗿',
        description: 'Production de marbre',
        effect: '+2 marbre par tour',
        cost: { wood: 60, stone: 50, iron: 30, marble: 0 },
        isStarting: false,
        buildableOn: ['mine', 'mountain'],
        isActive: true,
        requiredWorkers: 2
    },
    {
        id: 'barracks',
        name: 'Caserne',
        emoji: '⚔️',
        description: 'Centre d\'entraînement militaire',
        effect: 'Permet de former des troupes',
        cost: { wood: 100, stone: 80, iron: 50, marble: 20 },
        isStarting: false,
        buildableOn: ['city'],
        isActive: true,
        requiredWorkers: 3
    },
    {
        id: 'temple',
        name: 'Temple',
        emoji: '🏛️',
        description: 'Centre religieux',
        effect: '+10% de production',
        cost: { wood: 80, stone: 120, iron: 40, marble: 50 },
        isStarting: false,
        buildableOn: ['city'],
        isActive: true,
        requiredWorkers: 2
    },
    {
        id: 'market',
        name: 'Marché',
        emoji: '🏪',
        description: 'Centre commercial',
        effect: 'Permet d\'échanger des ressources',
        cost: { wood: 70, stone: 60, iron: 30, marble: 20 },
        isStarting: false,
        buildableOn: ['city'],
        isActive: true,
        requiredWorkers: 2
    },
    {
        id: 'port',
        name: 'Port',
        emoji: '⚓',
        description: 'Port maritime',
        effect: 'Permet de construire des navires',
        cost: { wood: 150, stone: 100, iron: 60, marble: 30 },
        isStarting: false,
        buildableOn: ['city', 'water'],
        isActive: true,
        requiredWorkers: 3
    }
]; 