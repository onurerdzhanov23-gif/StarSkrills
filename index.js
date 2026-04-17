const express = require('express');
const http = require('http');
const { Server } = require('socket.io');
const path = require('path');

const app = express();
const server = http.createServer(app);
const io = new Server(server, {
    cors: {
        origin: "*",
        methods: ["GET", "POST"]
    }
});

const PORT = process.env.PORT || 3000;

// Objeto de jugadores
const players = {};

// Servir archivos estáticos (opcional)
app.use(express.static(path.join(__dirname, 'public')));

// Página principal
app.get('/', (req, res) => {
    res.send('🎮 Servidor Brawl Stars Multiplayer Activo');
});

// Stats
app.get('/stats', (req, res) => {
    res.json({
        players: Object.keys(players).length,
        online: true
    });
});

// === SOCKET.IO ===

io.on('connection', (socket) => {
    console.log('✅ Jugador conectado:', socket.id);

    // Asignar posición inicial aleatoria
    const startX = (Math.random() - 0.5) * 20;
    const startZ = (Math.random() - 0.5) * 20;
    const randomColor = Math.floor(Math.random() * 16777215);

    // Guardar jugador
    players[socket.id] = {
        id: socket.id,
        x: startX,
        y: 0,
        z: startZ,
        color: '#' + randomColor.toString(16).padStart(6, '0')
    };

    // Enviar datos al nuevo jugador
    socket.emit('currentPlayers', players);

    // Notificar a otros jugadores
    socket.broadcast.emit('newPlayer', players[socket.id]);

    // === EVENTO MOVE ===
    socket.on('move', (data) => {
        if (players[socket.id]) {
            players[socket.id].x = data.x || players[socket.id].x;
            players[socket.id].y = data.y || players[socket.id].y;
            players[socket.id].z = data.z || players[socket.id].z;
            players[socket.id].rotation = data.rotation || 0;
            
            // Reenviar posición a todos
            io.emit('playerMoved', {
                id: socket.id,
                x: players[socket.id].x,
                y: players[socket.id].y,
                z: players[socket.id].z,
                rotation: players[socket.id].rotation
            });
        }
    });

    // === EVENTO ATTACK ===
    socket.on('attack', (data) => {
        io.emit('playerAttacked', {
            attackerId: socket.id,
            targetId: data.targetId,
            x: data.x,
            y: data.y,
            z: data.z
        });
    });

    // === EVENTO CHAT ===
    socket.on('chat', (data) => {
        io.emit('chatMessage', {
            id: socket.id,
            player: players[socket.id]?.color || '❓',
            message: data.message?.substring(0, 100)
        });
    });

    // === DISCONNECT ===
    socket.on('disconnect', () => {
        console.log('❌ Jugador desconectado:', socket.id);
        delete players[socket.id];
        io.emit('playerDisconnected', socket.id);
    });
});

// Iniciar servidor
server.listen(PORT, '0.0.0.0', () => {
    console.log(`🚀 Servidor corriendo en puerto ${PORT}`);
    console.log(`🌐 URL: https://starskrills-1.onrender.com`);
});