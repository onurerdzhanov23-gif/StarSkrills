const express = require('express');
const http = require('http');
const { Server } = require('socket.io');
const cors = require('cors');
const path = require('path');
const app = express();

app.use(cors());
app.use(express.static(__dirname));

const server = http.createServer(app);
const io = new Server(server, { cors: { origin: "*", methods: ["GET", "POST"] }, pingTimeout: 60000, pingInterval: 25000 });

const players = new Map();
const rooms = new Map();
const MAX_PLAYERS_PER_ROOM = 10;

console.log('Servidor Brawl Clone 3D iniciado');

app.get('/', (req, res) => {
      res.sendFile(path.join(__dirname, 'index.html'));
});

app.get('/stats', (req, res) => {
      res.json({ players: players.size, rooms: rooms.size, uptime: process.uptime() });
});
io.on('connection', (socket) => {
      console.log('Jugador conectado: ' + socket.id);
      let currentRoom = null;
      let playerData = null;

          socket.on('join-room', (data) => {
                    const { roomId, playerName, characterColor, characterType } = data;
                    if (currentRoom) leaveRoom(socket, currentRoom);
                    if (!rooms.has(roomId)) {
                                  rooms.set(roomId, { id: roomId, players: new Map(), gameState: { started: false, countdown: false } });
                                  console.log('Sala creada: ' + roomId);
                    }
                    const room = rooms.get(roomId);
                    if (room.players.size >= MAX_PLAYERS_PER_ROOM) {
                                  socket.emit('room-full', { roomId });
                                  return;
                    }
                    playerData = { id: socket.id, name: playerName || ('Jugador ' + (players.size + 1)), color: characterColor || '#00FF88', type: characterType || 'normal', position: { x: 0, y: 0, z: 0 }, rotation: { x: 0, y: 0, z: 0 }, health: 100, alive: true, lastUpdate: Date.now() };
                    room.players.set(socket.id, playerData);
                    currentRoom = roomId;
                    socket.join(roomId);
                    socket.emit('joined-room', { roomId, playerId: socket.id, players: Array.from(room.players.values()) });
                    socket.to(roomId).emit('player-joined', playerData);
                    console.log(playerData.name + ' se unio a ' + roomId);
          });
          socket.on('player-move', (data) => {
                        if (!currentRoom || !playerData) return;
                        const room = rooms.get(currentRoom);
                        if (!room) return;
                        const player = room.players.get(socket.id);
                        if (player) {
                                          player.position = data.position || player.position;
                                          player.rotation = data.rotation || player.rotation;
                                          socket.to(currentRoom).emit('player-moved', { id: socket.id, position: player.position, rotation: player.rotation });
                        }
          });

              socket.on('player-attack', (data) => {
                            if (!currentRoom || !playerData) return;
                            socket.to(currentRoom).emit('player-attacked', { id: socket.id, attackData: data, position: playerData.position });
              });

              socket.on('chat-message', (data) => {
                            if (!currentRoom || !playerData) return;
                            io.to(currentRoom).emit('chat-message', { id: socket.id, name: playerData.name, message: data.message.substring(0, 200), time: Date.now() });
              });

              socket.on('disconnect', () => {
                            console.log('Jugador desconectado: ' + socket.id);
                            if (currentRoom) leaveRoom(socket, currentRoom);
              });

              function leaveRoom(socket, roomId) {
                            const room = rooms.get(roomId);
                            if (room) {
                                              room.players.delete(socket.id);
                                              socket.leave(roomId);
                                              socket.to(roomId).emit('player-left', { id: socket.id });
                                              if (room.players.size === 0) rooms.delete(roomId);
                            }
                            currentRoom = null;
                            playerData = null;
              }
});

    const PORT = process.env.PORT || 3000;
    server.listen(PORT, '0.0.0.0', () => {
              console.log('Servidor en puerto ' + PORT);
    });
