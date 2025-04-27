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

//SERVEUR
io.on('connection', (socket) => {
    console.log('Nouveau joueur connecté:', socket.id);
    setupConnectionHandlers(io, socket);
    setupGameHandlers(io, socket);
});

const port = 3000;
server.listen(port, () => {
    console.log(`Serveur démarré sur le port ` + port);
}); 