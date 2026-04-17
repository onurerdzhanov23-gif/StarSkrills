# 🎮 StarSkrills — Guía de despliegue completo

## ¿Qué incluye este servidor?

- ✅ Servidor de juego con WebSockets (tiempo real)
- ✅ Matchmaking automático (busca partida con otros jugadores)
- ✅ Salas de hasta 10 jugadores por partida
- ✅ Sistema de balas con física y colisiones
- ✅ Puntuaciones y eliminaciones
- ✅ Chat en partida
- ✅ API REST para estadísticas
- ✅ Panel de administración con consola, gestión de archivos, broadcast
- ✅ 24/7 en Railway (gratis)

---

## PASO 1 — Crear cuenta en GitHub (gratis)

1. Ve a https://github.com
2. Crea una cuenta gratuita
3. Crea un nuevo repositorio llamado "starskrills"
4. Sube esta carpeta completa al repositorio

**Desde terminal (si tienes Git instalado):**
```bash
cd starskrills
git init
git add .
git commit -m "StarSkrills server inicial"
git remote add origin https://github.com/TU_USUARIO/starskrills.git
git push -u origin main
```

---

## PASO 2 — Crear cuenta en Railway (gratis)

1. Ve a https://railway.app
2. Regístrate con tu cuenta de GitHub (más fácil)
3. Haz clic en "New Project"
4. Selecciona "Deploy from GitHub repo"
5. Busca y selecciona tu repositorio "starskrills"
6. Railway detectará automáticamente que es Node.js y lo configurará

---

## PASO 3 — Configurar variables de entorno

1. En tu proyecto de Railway, haz clic en tu servicio
2. Ve a la pestaña "Variables"
3. Agrega estas variables:

```
ADMIN_SECRET = pon_aqui_una_clave_secreta_fuerte
NODE_ENV = production
```

---

## PASO 4 — Obtener tu URL pública

1. En Railway, ve a tu servicio → pestaña "Settings"
2. Busca la sección "Networking" → "Generate Domain"
3. Haz clic para generar una URL pública gratuita
4. Te dará algo como: https://starskrills-production.up.railway.app
5. ¡Esa es la URL de tu servidor! Los jugadores se conectan ahí

---

## PASO 5 — Configurar el panel de admin

1. Abre el archivo `public/admin.html` en tu navegador
   (O accede desde: https://TU_URL/admin.html)
2. Ve a la pestaña "Configuración"
3. Escribe tu URL del servidor
4. Escribe tu ADMIN_SECRET
5. Haz clic en "Probar conexión"

---

## PASO 6 — Conectar jugadores desde el juego

En tu código de juego (cliente), conecta así:

```javascript
// Conectar al servidor
const ws = new WebSocket('wss://TU_URL_RAILWAY');

// Cuando conecte
ws.onopen = () => {
  // Establecer nombre del jugador
  ws.send(JSON.stringify({ type: 'set_name', name: 'MiNombre', skin: 0 }));
  
  // Buscar partida
  ws.send(JSON.stringify({ type: 'find_match' }));
};

// Recibir mensajes del servidor
ws.onmessage = (event) => {
  const msg = JSON.parse(event.data);
  
  switch(msg.type) {
    case 'connected':
      console.log('Conectado! ID:', msg.playerId);
      break;
    case 'queued':
      console.log('En cola, posición:', msg.position);
      break;
    case 'room_joined':
      console.log('Entraste a la sala:', msg.roomId);
      break;
    case 'game_start':
      console.log('¡La partida comenzó!');
      break;
    case 'tick':
      // Actualiza posiciones de todos los jugadores
      updateAllPositions(msg.positions, msg.bullets);
      break;
    case 'game_over':
      console.log('Ganador:', msg.winnerName);
      break;
  }
};

// Mover al jugador
function movePlayer(dx, dy) {
  ws.send(JSON.stringify({ type: 'move', dx, dy }));
}

// Disparar
function shoot(angle) {
  ws.send(JSON.stringify({ type: 'shoot', angle, power: 20 }));
}

// Chat
function sendChat(text) {
  ws.send(JSON.stringify({ type: 'chat', text }));
}
```

---

## Capacidad del servidor (plan gratuito)

| Plan       | Jugadores   | Partidas | Precio |
|------------|-------------|----------|--------|
| Railway Free | ~100-500  | ~50      | GRATIS |
| Railway Hobby | 500-2000 | ~200     | $5/mes |

El plan gratuito de Railway tiene:
- 500 horas de ejecución por mes (suficiente para 24/7 casi completo)
- 512 MB RAM
- Reinicio automático si el servidor cae

---

## Comandos del panel de administración

Desde la consola del panel puedes escribir:

| Comando | Descripción |
|---------|-------------|
| `help` | Ver todos los comandos |
| `status` | Estado del servidor |
| `rooms` | Listar salas activas |
| `players` | Ver jugadores conectados |
| `broadcast <mensaje>` | Enviar mensaje a todos |
| `ping` | Probar latencia |
| `restart` | Reiniciar servidor |
| `clear` | Limpiar consola |

---

## Actualizar el servidor

Cuando quieras actualizar el código:

```bash
git add .
git commit -m "Actualización"
git push
```

Railway lo detecta automáticamente y actualiza en ~30 segundos sin apagar el servidor.

---

## Soporte

Si algo no funciona:
1. Revisa los logs en Railway → tu servicio → "Deployments" → "View Logs"
2. Asegúrate de que PORT no está en las variables de entorno (Railway lo pone automático)
3. Verifica que ADMIN_SECRET esté configurado

¡Buena suerte con StarSkrills! 🚀
