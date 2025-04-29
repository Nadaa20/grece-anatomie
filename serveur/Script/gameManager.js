class GameManager {
    constructor() {
        this.waitingPlayers = new Map(); // Map<username, socket>
        this.activeGames = new Map(); // Map<gameId, {players: Set<username>, state: gameState}>
    }

    async registerPlayer(username) {
        // Pour le moment, on génère un ID aléatoire pour le joueur
        const joueurId = Math.floor(Math.random() * 1000000);
        return { joueurId };
    }

    async getPlayerSavedGames(joueurId) {
        // Pour le moment, on retourne un tableau vide
        return [];
    }

    async createNewGame(joueurId) {
        const gameId = Math.floor(Math.random() * 1000000);
        const partieId = Math.floor(Math.random() * 1000000);
        
        this.activeGames.set(gameId, {
            players: new Set([joueurId]),
            state: {
                status: 'waiting',
                players: [joueurId],
                partie_id: partieId
            }
        });

        return gameId;
    }

    async joinExistingGame(joueurId, gameId) {
        const game = this.activeGames.get(gameId);
        if (!game) {
            throw new Error('Partie non trouvée');
        }

        game.players.add(joueurId);
        game.state.players.push(joueurId);

        return gameId;
    }

    async checkGameReady(gameId) {
        const game = this.activeGames.get(gameId);
        if (!game) {
            return false;
        }

        return game.players.size >= 1; // On accepte maintenant un seul joueur pour le test
    }

    async processTurnData(gameId, turnData, db) {
        try {
            console.log('[GameManager] Traitement des données du tour pour la partie', gameId);
            const game = this.activeGames.get(gameId);
            
            if (!game) {
                throw new Error('Partie non trouvée');
            }

            // Mise à jour de l'état du jeu avec les nouvelles données
            game.state.lastTurn = turnData.turn;
            game.state.lastUpdate = new Date();

            // Pour le moment, on stocke simplement les données dans la base de données
            if (db.saveTurnData) {
                await db.saveTurnData(gameId, turnData);
            }

            console.log('[GameManager] Données du tour traitées avec succès');
            return true;
        } catch (error) {
            console.error('[GameManager] Erreur lors du traitement des données du tour:', error);
            throw error;
        }
    }
}

module.exports = new GameManager(); 