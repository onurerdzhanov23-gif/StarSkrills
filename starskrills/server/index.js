const express = require('express');
const http = require('http');
const { WebSocketServer } = require('ws');
const { v4: uuidv4 } = require('uuid');
const path = require('path');

const app = express();
const server = http.createServer(app);
const wss = new WebSocketServer({ server });

app.use(express.json());
app.use(express.static(path.join(__dirname, '../public')));

// ─── ESTADO DEL SERVIDOR ─────────────────────────────────────────────────────
const state = {
  players: new Map(),    // socketId → player
  rooms: new Map(),      // roomId → room
  queue: [],             // jugadores esperando matchmaking
  stats: {
    totalConnections: 0,
    peakPlayers: 0,
    gamesPlayed: 0,
    startTime: Date.now()
  }
};

// ─── CONSTANTES DEL JUEGO ────────────────────────────────────────────────────
const GAME = {
  MAP_WIDTH: 2400,
  MAP_HEIGHT: 1800,
  PLAYER_SPEED: 5,
  BULLET_SPEED: 12,
  PLAYER_HP: 100,
  TICK_RATE: 20,           // ms entre ticks (50 FPS lógico)
  ROOM_SIZE: 10,           // jugadores por sala
  MATCHMAKING_TIMEOUT: 8000
};

// ─── HELPERS ─────────────────────────────────────────────────────────────────
function broadcast(room, msg, excludeId = null) {
  const data = JSON.stringify(msg);
  for (const pid of room.players) {
    const p = state.players.get(pid);
    if (p && p.ws.readyState === 1 && pid !== excludeId) {
      p.ws.send(data);
    }
  }
}

function broadcastAll(msg) {
  const data = JSON.stringify(msg);
  for (const [, p] of state.players) {
    if (p.ws.readyState === 1) p.ws.send(data);
  }
}

function send(ws, msg) {
  if (ws.readyState === 1) ws.send(JSON.stringify(msg));
}

function spawnPosition(roomId) {
  const spawns = [
    { x: 200, y: 200 }, { x: 2200, y: 200 },
    { x: 200, y: 1600 }, { x: 2200, y: 1600 },
    { x: 1200, y: 900 }, { x: 600, y: 900 },
    { x: 1800, y: 900 }, { x: 1200, y: 400 },
    { x: 1200, y: 1400 }, { x: 800, y: 600 }
  ];
  const room = state.rooms.get(roomId);
  return spawns[room ? room.players.size % spawns.length : 0];
}

// ─── MATCHMAKING ─────────────────────────────────────────────────────────────
function tryMatchmaking() {
  // Limpiar cola de desconectados
  state.queue = state.queue.filter(id => {
    const p = state.players.get(id);
    return p && p.ws.readyState === 1 && !p.roomId;
  });

  if (state.queue.length < 2) return;

  // Buscar sala con espacio
  let targetRoom = null;
  for (const [rid, room] of state.rooms) {
    if (room.status === 'waiting' && room.players.size < GAME.ROOM_SIZE) {
      targetRoom = rid;
      break;
    }
  }

  if (!targetRoom) {
    // Crear nueva sala
    const roomId = 'room_' + uuidv4().slice(0, 8);
    state.rooms.set(roomId, {
      id: roomId,
      players: new Set(),
      bullets: new Map(),
      status: 'waiting',
      scores: {},
      createdAt: Date.now(),
      ticker: null
    });
    targetRoom = roomId;
  }

  // Meter jugador en la sala
  const playerId = state.queue.shift();
  const player = state.players.get(playerId);
  const room = state.rooms.get(targetRoom);

  if (!player || !room) return;

  const spawn = spawnPosition(targetRoom);
  player.roomId = targetRoom;
  player.x = spawn.x;
  player.y = spawn.y;
  player.hp = GAME.PLAYER_HP;
  player.score = 0;
  player.alive = true;

  room.players.add(playerId);
  room.scores[playerId] = 0;

  send(player.ws, {
    type: 'room_joined',
    roomId: targetRoom,
    playerId,
    spawn,
    players: getPlayersSnapshot(room)
  });

  broadcast(room, {
    type: 'player_joined',
    player: getPlayerPublic(player)
  }, playerId);

  console.log(`[MATCH] ${player.name} → sala ${targetRoom} (${room.players.size}/${GAME.ROOM_SIZE})`);

  // Iniciar partida cuando haya al menos 2 jugadores
  if (room.players.size >= 2 && room.status === 'waiting') {
    startGame(targetRoom);
  }
}

function getPlayerPublic(p) {
  return { id: p.id, name: p.name, x: p.x, y: p.y, hp: p.hp, score: p.score, alive: p.alive, skin: p.skin };
}

function getPlayersSnapshot(room) {
  const snap = {};
  for (const pid of room.players) {
    const p = state.players.get(pid);
    if (p) snap[pid] = getPlayerPublic(p);
  }
  return snap;
}

// ─── GAME LOOP ────────────────────────────────────────────────────────────────
function startGame(roomId) {
  const room = state.rooms.get(roomId);
  if (!room) return;
  room.status = 'playing';

  broadcast(room, { type: 'game_start', roomId });
  console.log(`[GAME] Partida iniciada en sala ${roomId}`);
  state.stats.gamesPlayed++;

  room.ticker = setInterval(() => {
    if (!state.rooms.has(roomId)) return clearInterval(room.ticker);
    tickRoom(roomId);
  }, GAME.TICK_RATE);
}

function tickRoom(roomId) {
  const room = state.rooms.get(roomId);
  if (!room) return;

  const bulletsToRemove = [];
  const hits = [];

  // Mover balas
  for (const [bid, bullet] of room.bullets) {
    bullet.x += bullet.vx;
    bullet.y += bullet.vy;
    bullet.ttl -= GAME.TICK_RATE;

    // Colisión con paredes
    if (bullet.x < 0 || bullet.x > GAME.MAP_WIDTH || bullet.y < 0 || bullet.y > GAME.MAP_HEIGHT || bullet.ttl <= 0) {
      bulletsToRemove.push(bid);
      continue;
    }

    // Colisión con jugadores
    for (const pid of room.players) {
      if (pid === bullet.ownerId) continue;
      const target = state.players.get(pid);
      if (!target || !target.alive) continue;

      const dx = target.x - bullet.x;
      const dy = target.y - bullet.y;
      if (Math.sqrt(dx * dx + dy * dy) < 24) {
        target.hp -= bullet.damage;
        bulletsToRemove.push(bid);
        hits.push({ targetId: pid, shooterId: bullet.ownerId, damage: bullet.damage, hp: target.hp });

        if (target.hp <= 0) {
          target.alive = false;
          target.hp = 0;
          const shooter = state.players.get(bullet.ownerId);
          if (shooter) {
            shooter.score += 10;
            room.scores[bullet.ownerId] = (room.scores[bullet.ownerId] || 0) + 10;
          }
          broadcast(room, {
            type: 'player_eliminated',
            eliminatedId: pid,
            eliminatedBy: bullet.ownerId,
            scores: room.scores
          });
          console.log(`[KILL] ${shooter?.name || '?'} eliminó a ${target.name}`);
        }
        break;
      }
    }
  }

  for (const bid of bulletsToRemove) room.bullets.delete(bid);

  if (hits.length > 0) {
    broadcast(room, { type: 'hits', hits });
  }

  // Enviar estado compacto del juego
  const positions = {};
  for (const pid of room.players) {
    const p = state.players.get(pid);
    if (p) positions[pid] = { x: Math.round(p.x), y: Math.round(p.y), hp: p.hp, alive: p.alive };
  }

  const bulletSnap = {};
  for (const [bid, b] of room.bullets) {
    bulletSnap[bid] = { x: Math.round(b.x), y: Math.round(b.y) };
  }

  broadcast(room, { type: 'tick', positions, bullets: bulletSnap });

  // Verificar fin de partida
  const alive = [...room.players].filter(pid => {
    const p = state.players.get(pid);
    return p && p.alive;
  });

  if (alive.length <= 1 && room.players.size >= 2) {
    endGame(roomId, alive[0] || null);
  }
}

function endGame(roomId, winnerId) {
  const room = state.rooms.get(roomId);
  if (!room) return;

  clearInterval(room.ticker);
  room.status = 'ended';

  const winner = winnerId ? state.players.get(winnerId) : null;
  broadcast(room, {
    type: 'game_over',
    winnerId,
    winnerName: winner?.name || 'Nadie',
    scores: room.scores
  });

  console.log(`[GAME] Partida ${roomId} terminada. Ganador: ${winner?.name || 'nadie'}`);

  // Limpiar sala después de 5s
  setTimeout(() => {
    if (room) {
      for (const pid of room.players) {
        const p = state.players.get(pid);
        if (p) {
          p.roomId = null;
          p.alive = true;
          p.hp = GAME.PLAYER_HP;
        }
      }
      state.rooms.delete(roomId);
    }
  }, 5000);
}

// ─── WEBSOCKET HANDLER ────────────────────────────────────────────────────────
wss.on('connection', (ws) => {
  const playerId = uuidv4();
  state.stats.totalConnections++;

  const player = {
    id: playerId,
    ws,
    name: 'Player_' + playerId.slice(0, 4),
    skin: 0,
    roomId: null,
    x: 0, y: 0,
    hp: GAME.PLAYER_HP,
    score: 0,
    alive: true,
    connectedAt: Date.now()
  };

  state.players.set(playerId, player);
  state.stats.peakPlayers = Math.max(state.stats.peakPlayers, state.players.size);

  send(ws, { type: 'connected', playerId, serverVersion: '1.0.0' });
  console.log(`[+] Jugador conectado: ${playerId} (total: ${state.players.size})`);

  ws.on('message', (raw) => {
    let msg;
    try { msg = JSON.parse(raw); } catch { return; }

    switch (msg.type) {

      case 'set_name':
        player.name = String(msg.name).slice(0, 20).replace(/[<>]/g, '') || player.name;
        player.skin = msg.skin || 0;
        send(ws, { type: 'name_set', name: player.name });
        break;

      case 'find_match':
        if (!player.roomId) {
          state.queue.push(playerId);
          send(ws, { type: 'queued', position: state.queue.length });
          tryMatchmaking();
        }
        break;

      case 'move':
        if (!player.roomId || !player.alive) break;
        const dx = Math.max(-1, Math.min(1, msg.dx || 0));
        const dy = Math.max(-1, Math.min(1, msg.dy || 0));
        player.x = Math.max(0, Math.min(GAME.MAP_WIDTH, player.x + dx * GAME.PLAYER_SPEED));
        player.y = Math.max(0, Math.min(GAME.MAP_HEIGHT, player.y + dy * GAME.PLAYER_SPEED));
        break;

      case 'shoot':
        if (!player.roomId || !player.alive) break;
        const room = state.rooms.get(player.roomId);
        if (!room || room.status !== 'playing') break;
        const angle = msg.angle || 0;
        const bulletId = uuidv4().slice(0, 8);
        room.bullets.set(bulletId, {
          id: bulletId,
          ownerId: playerId,
          x: player.x,
          y: player.y,
          vx: Math.cos(angle) * GAME.BULLET_SPEED,
          vy: Math.sin(angle) * GAME.BULLET_SPEED,
          damage: msg.power || 20,
          ttl: 2000
        });
        broadcast(room, {
          type: 'bullet_fired',
          bulletId, ownerId: playerId,
          x: player.x, y: player.y, angle
        });
        break;

      case 'chat':
        if (!player.roomId) break;
        const chatRoom = state.rooms.get(player.roomId);
        if (chatRoom) {
          broadcast(chatRoom, {
            type: 'chat',
            from: player.name,
            msg: String(msg.text).slice(0, 100)
          });
        }
        break;

      case 'ping':
        send(ws, { type: 'pong', t: msg.t });
        break;
    }
  });

  ws.on('close', () => {
    console.log(`[-] Jugador desconectado: ${player.name}`);
    if (player.roomId) {
      const room = state.rooms.get(player.roomId);
      if (room) {
        room.players.delete(playerId);
        delete room.scores[playerId];
        broadcast(room, { type: 'player_left', playerId });
        if (room.players.size === 0) {
          clearInterval(room.ticker);
          state.rooms.delete(player.roomId);
        }
      }
    }
    state.queue = state.queue.filter(id => id !== playerId);
    state.players.delete(playerId);
  });
});

// ─── API REST ─────────────────────────────────────────────────────────────────
app.get('/api/status', (_, res) => {
  res.json({
    status: 'online',
    players: state.players.size,
    rooms: state.rooms.size,
    queue: state.queue.length,
    uptime: Math.floor((Date.now() - state.stats.startTime) / 1000),
    ...state.stats
  });
});

app.get('/api/rooms', (_, res) => {
  const rooms = [];
  for (const [id, room] of state.rooms) {
    rooms.push({
      id, status: room.status,
      players: room.players.size,
      scores: room.scores
    });
  }
  res.json(rooms);
});

app.post('/api/admin/broadcast', express.json(), (req, res) => {
  const { secret, message } = req.body;
  if (secret !== process.env.ADMIN_SECRET) return res.status(401).json({ error: 'No autorizado' });
  broadcastAll({ type: 'server_msg', message });
  res.json({ ok: true, sent: state.players.size });
});

app.post('/api/admin/kick', express.json(), (req, res) => {
  const { secret, playerId } = req.body;
  if (secret !== process.env.ADMIN_SECRET) return res.status(401).json({ error: 'No autorizado' });
  const p = state.players.get(playerId);
  if (p) { p.ws.close(); res.json({ ok: true }); }
  else res.status(404).json({ error: 'Jugador no encontrado' });
});

// ─── ARRANCAR ─────────────────────────────────────────────────────────────────
const PORT = process.env.PORT || 3000;
server.listen(PORT, () => {
  console.log(`\n🎮 StarSkrills Server v1.0`);
  console.log(`🚀 Puerto: ${PORT}`);
  console.log(`✅ Servidor listo — esperando jugadores\n`);
});

// Matchmaking periódico
setInterval(tryMatchmaking, 2000);

module.exports = { app, server };
