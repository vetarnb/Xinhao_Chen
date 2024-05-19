const WebSocket = require('ws');
const express = require('express');

const app = express();
const PORT = process.env.PORT || 8080;

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

console.log(`WebSocket server is running on ws://localhost:${PORT}`);
