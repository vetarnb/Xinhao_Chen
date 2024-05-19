const express = require('express');
const path = require('path');
const WebSocket = require('ws');

const app = express();
const port = process.env.PORT || 6866;

// Serve static files from the "public" directory
app.use(express.static(path.join(__dirname, 'public')));

// Serve the main HTML file for the root URL
app.get('/', (req, res) => {
  res.sendFile(path.join(__dirname, 'public', 'index.html'));
});

const server = app.listen(port, () => {
  console.log(`Server is running on port ${port}`);
});

// Set up WebSocket server
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
        if (room.players.length === 0) {
          delete rooms[roomNumber];
        }
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