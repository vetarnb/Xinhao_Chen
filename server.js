const express = require('express');
const path = require('path');
const WebSocket = require('ws');

const PORT = process.env.PORT || 8080;
const app = express();

// Serve static files from the 'public' directory
app.use(express.static(path.join(__dirname, 'public')));

// Serve index.html on the root path
app.get('/', (req, res) => {
  res.sendFile(path.join(__dirname, 'public', 'index.html'));
});

// Serve snake.html for the game
app.get('/snake', (req, res) => {
  res.sendFile(path.join(__dirname, 'public', 'snake.html'));
});

const server = app.listen(PORT, () => {
  console.log(`Server is running on port ${PORT}`);
});

const wss = new WebSocket.Server({ server });

const rooms = {};

wss.on('connection', (ws) => {
  console.log('A player has connected');

  ws.on('message', (message) => {
    const data = JSON.parse(message);
    const roomNumber = data.room;

    if (!rooms[roomNumber]) {
      rooms[roomNumber] = { players: [], state: {} };
    }

    const room = rooms[roomNumber];

    if (room.players.length < 2) {
      room.players.push(ws);
      ws.send(JSON.stringify({ message: 'waiting', room: roomNumber }));

      if (room.players.length === 2) {
        room.players.forEach((player, index) => {
          player.send(JSON.stringify({ start: true, role: index === 0 ? 'player' : 'enemy' }));
        });
      }
    }

    ws.on('close', () => {
      const index = room.players.indexOf(ws);
      if (index !== -1) {
        room.players.splice(index, 1);
      }
    });

    ws.on('message', (message) => {
      const state = JSON.parse(message);
      room.state = state;

      room.players.forEach((player) => {
        if (player !== ws) {
          player.send(message);
        }
      });
    });
  });
});

console.log('WebSocket server is running');