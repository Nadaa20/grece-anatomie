// MODULES
const express = require('express');
const http = require('http');
const socketIo = require('socket.io');
const cors = require('cors');
const app = express();
app.use(cors());
app.use(express.json());
const server = http.createServer(app);
const io = socketIo(server, {
    cors: {
        origin: "*",
        methods: ["GET", "POST"]
    }
});

// DEPENDANCES
const setupConnectionHandlers = require('./Script/connectionHandler');
const setupGameHandlers = require('./Script/gameHandler');
const setupTurnHandlers = require('./Script/turnHandler');

// Base de données simulée pour le moment
const db = {};

//SERVEUR
io.on('connection', (socket) => {
    console.log('Nouveau joueur connecté:', socket.id);

    // Configuration des gestionnaires d'événements
    setupConnectionHandlers(io, socket);
    setupGameHandlers(io, socket, db);
    setupTurnHandlers(io, socket, db);

    // Log pour vérifier que les gestionnaires sont bien configurés
    console.log('Événements socket configurés pour:', socket.id);
    console.log('Liste des événements écoutés:', socket.eventNames());

    socket.on('disconnect', () => {
        console.log('Joueur déconnecté:', socket.id);
    });
});

const PORT = process.env.PORT || 3000;
server.listen(PORT, () => {
    console.log(`Serveur démarré sur le port ${PORT}`);
}); 