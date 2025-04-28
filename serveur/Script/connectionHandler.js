const gameManager = require('./gameManager');

function setupConnectionHandlers(io, socket) {
    console.log('Nouveau gestionnaire de connexion configuré pour:', socket.id);

    socket.on('submit_username', async (username) => {
        try {
            console.log('Soumission de nom d\'utilisateur reçue:', username);
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
            console.log('Événement connected émis pour:', username);
        } catch (error) {
            console.error('Erreur lors de la soumission du pseudonyme:', error);
            socket.emit('error', { message: 'Erreur lors de la connexion' });
        }
    });

    socket.on('test_game', () => {
        console.log('Événement test_game reçu de:', socket.username);
        // Émettre un événement pour afficher la carte du jeu
        const gameData = {
            status: 'active',
            players: [socket.joueurId],
            partie_id: Math.floor(Math.random() * 1000000)
        };
        console.log('Émission de show_game_map avec:', gameData);
        socket.emit('show_game_map', gameData);
    });

    socket.on('disconnect', () => {
        if (socket.username) {
            console.log(`Joueur ${socket.username} déconnecté`);
        }
    });
}

module.exports = setupConnectionHandlers; 