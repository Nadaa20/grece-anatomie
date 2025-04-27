const gameManager = require('./gameManager');

function setupGameHandlers(io, socket, db) {
    socket.on('create_new_game', async () => {
        try {
            const gameId = await gameManager.createNewGame(socket.joueurId, db);
            socket.gameId = gameId;
            socket.emit('waiting_for_players', { gameId });
        } catch (error) {
            console.error('Erreur lors de la création d\'une nouvelle partie:', error);
            socket.emit('error', { message: 'Erreur lors de la création de la partie' });
        }
    });

    socket.on('join_existing_game', async (gameId) => {
        try {
            await gameManager.joinExistingGame(socket.joueurId, gameId, db);
            socket.gameId = gameId;
            socket.emit('waiting_for_players', { gameId });

            const isReady = await gameManager.checkGameReady(gameId, db);
            if (isReady) {
                io.emit('game_ready', { gameId });
            }
        } catch (error) {
            console.error('Erreur lors de la jonction d\'une partie existante:', error);
            socket.emit('error', { message: 'Erreur lors de la jonction de la partie' });
        }
    });
}

module.exports = setupGameHandlers; 