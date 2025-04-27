const gameManager = require('./gameManager');

function setupConnectionHandlers(io, socket) {
    socket.on('submit_username', async (username) => {
        try {
            // Pour le moment, on génère un ID aléatoire pour le joueur
            const joueurId = Math.floor(Math.random() * 1000000);
            socket.joueurId = joueurId;
            socket.username = username;
            
            // On émet un événement pour indiquer que le joueur est connecté
            socket.emit('connected', { 
                joueurId: joueurId,
                username: username,
                showTestButton: true // Pour afficher le bouton de test
            });
        } catch (error) {
            console.error('Erreur lors de la soumission du pseudonyme:', error);
            socket.emit('error', { message: 'Erreur lors de la connexion' });
        }
    });

    socket.on('test_game', () => {
        // Émettre un événement pour afficher la carte du jeu
        socket.emit('show_game_map', {
            status: 'active',
            players: [socket.joueurId],
            partie_id: Math.floor(Math.random() * 1000000)
        });
    });

    socket.on('disconnect', () => {
        if (socket.username) {
            console.log(`Joueur ${socket.username} déconnecté`);
        }
    });
}

module.exports = setupConnectionHandlers; 