const express = require('express');
const http = require('http');
const WebSocket = require('ws');

const app = express();
const server = http.createServer(app);
const wss = new WebSocket.Server({ server });

let rooms = {};

wss.on('connection', (ws) => {
  ws.id = generateUniqueId();

  ws.on('message', (message) => {
    const data = JSON.parse(message);

    switch (data.type) {
      case 'joinRoom':
        if (!rooms[data.room]) {
          rooms[data.room] = [];
        }

        if (!rooms[data.room].some(client => client.id === ws.id)) {
          rooms[data.room].push(ws);

          if (rooms[data.room].length === 2) {
            rooms[data.room].forEach(client => {
              client.send(JSON.stringify({ type: 'startGame' }));
            });
          }
        } else {
          ws.send(JSON.stringify({ type: 'error', message: 'You are already in this room' }));
        }
        break;

      case 'playerMove':
      case 'playerAttack':
        const room = rooms[data.room];
        if (room) {
          room.forEach(client => {
            if (client !== ws && client.readyState === WebSocket.OPEN) {
              client.send(message);
            }
          });
        }
        break;

      default:
        break;
    }
  });

  ws.on('close', () => {
    for (let room in rooms) {
      rooms[room] = rooms[room].filter(client => client !== ws);
      if (rooms[room].length === 0) {
        delete rooms[room];
      }
    }
  });
});

app.use(express.static('public'));

server.listen(process.env.PORT || 8080, () => {
  console.log('Server is running on port', server.address().port);
});

function generateUniqueId() {
  return '_' + Math.random().toString(36).substr(2, 9);
}
