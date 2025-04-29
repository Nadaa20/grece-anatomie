const gameManager = require('./gameManager');

function setupGameHandlers(io, socket, db) {
    socket.on('create_new_game', async (data) => {
        try {
            const gameId = await gameManager.createNewGame(socket.joueurId, db);
            socket.gameId = gameId;
            socket.territory = data.territory;
            socket.emit('waiting_for_players', { gameId });
        } catch (error) {
            console.error('Erreur lors de la création d\'une nouvelle partie:', error);
            socket.emit('error', { message: 'Erreur lors de la création de la partie' });
        }
    });

    socket.on('join_existing_game', async (data) => {
        try {
            await gameManager.joinExistingGame(socket.joueurId, data.gameId, db);
            socket.gameId = data.gameId;
            socket.territory = data.territory;
            socket.emit('waiting_for_players', { gameId: data.gameId });

            const isReady = await gameManager.checkGameReady(data.gameId, db);
            if (isReady) {
                io.emit('game_ready', { gameId: data.gameId });
            }
        } catch (error) {
            console.error('Erreur lors de la jonction d\'une partie existante:', error);
            socket.emit('error', { message: 'Erreur lors de la jonction de la partie' });
        }
    });
}

module.exports = setupGameHandlers; 