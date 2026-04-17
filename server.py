import os
from flask import Flask, request
from flask_socketio import SocketIO, emit
from gevent import monkey
monkey.patch()

app = Flask(__name__)
socketio = SocketIO(app, cors_allowed_origins="*", async_mode='gevent')

# Diccionario de jugadores
players = {}

@app.route('/')
def index():
    return '🎮 Servidor Brawl Stars Multiplayer Activo'

@app.route('/stats')
def stats():
    return {'players': len(players), 'uptime': 'active'}

# === EVENTOS ===

@socketio.on('connect')
def handle_connect():
    print(f'✅ Jugador conectado: {request.sid}')
    emit('connected', {'id': request.sid})

@socketio.on('disconnect')
def handle_disconnect():
    print(f'❌ Jugador desconectado: {request.sid}')
    if request.sid in players:
        del players[request.sid]
        emit('player_left', {'id': request.sid}, broadcast=True)

@socketio.on('update_position')
def handle_position(data):
    players[request.sid] = {
        'id': request.sid,
        'x': data.get('x', 0),
        'y': data.get('y', 0),
        'z': data.get('z', 0),
        'rotation': data.get('rotation', 0),
        'animation': data.get('animation', 'idle'),
        'health': data.get('health', 100),
        'name': data.get('name', f'Jugador_{request.sid[:6]}')
    }
    emit('game_state', players, broadcast=True)

@socketio.on('player_attack')
def handle_attack(data):
    emit('player_attacked', {
        'attacker_id': request.sid,
        'target_id': data.get('target_id'),
        'damage': data.get('damage', 10),
        'x': data.get('x', 0),
        'y': data.get('y', 0),
        'z': data.get('z', 0)
    }, broadcast=True)

@socketio.on('player_hit')
def handle_hit(data):
    target_id = data.get('target_id')
    damage = data.get('damage', 10)
    
    if target_id in players:
        players[target_id]['health'] = max(0, players[target_id]['health'] - damage)
        
        if players[target_id]['health'] <= 0:
            emit('player_died', {
                'id': target_id,
                'killer_id': request.sid
            }, broadcast=True)
        else:
            emit('player_damaged', {
                'id': target_id,
                'health': players[target_id]['health']
            }, broadcast=True)

@socketio.on('respawn')
def handle_respawn():
    if request.sid in players:
        players[request.sid]['health'] = 100
        players[request.sid]['x'] = 0
        players[request.sid]['z'] = 0
        emit('player_respawned', {
            'id': request.sid,
            'health': 100,
            'x': 0,
            'z': 0
        }, broadcast=True)

@socketio.on('chat_message')
def handle_chat(data):
    if request.sid in players:
        player_name = players[request.sid].get('name', 'Jugador')
        emit('chat_message', {
            'player': player_name,
            'message': data.get('message', '')[:200]
        }, broadcast=True)

@socketio.on('voice_offer')
def handle_voice_offer(data):
    socketio.emit('voice_offer', {
        'from': request.sid,
        'offer': data.get('offer')
    }, to=data.get('to'))

@socketio.on('voice_answer')
def handle_voice_answer(data):
    socketio.emit('voice_answer', {
        'from': request.sid,
        'answer': data.get('answer')
    }, to=data.get('to'))

# === INICIO ===
if __name__ == '__main__':
    port = int(os.environ.get('PORT', 5000))
    print(f'🚀 Servidor Brawl Stars iniciado en puerto {port}')
    socketio.run(app, host='0.0.0.0', port=port)