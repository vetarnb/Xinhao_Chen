const express = require('express');
const http = require('http');
const WebSocket = require('ws');
const path = require('path');

const app = express();
const server = http.createServer(app);
const wss = new WebSocket.Server({ server });

const PORT = process.env.PORT || 8080;

app.use(express.static(path.join(__dirname, 'public')));

app.get('*', (req, res) => {
  res.sendFile(path.resolve(__dirname, 'public', 'index.html'));
});

let rooms = {};

wss.on('connection', (ws) => {
  ws.on('message', (message) => {
    const data = JSON.parse(message);

    if (data.room) {
      if (!rooms[data.room]) {
        rooms[data.room] = { players: [] };
      }

      rooms[data.room].players.push(ws);

      if (rooms[data.room].players.length === 2) {
        rooms[data.room].players.forEach((client, index) => {
          client.send(JSON.stringify({ start: true, role: index === 0 ? 'player' : 'enemy' }));
        });
      } else {
        ws.send(JSON.stringify({ message: 'waiting' }));
      }
    } else {
      const room = rooms[data.roomNumber];
      if (room) {
        room.players.forEach((client) => {
          if (client !== ws) {
            client.send(message);
          }
        });
      }
    }
  });

  ws.on('close', () => {
    for (const room in rooms) {
      rooms[room].players = rooms[room].players.filter((client) => client !== ws);

      if (rooms[room].players.length === 0) {
        delete rooms[room];
      }
    }
  });
});

server.listen(PORT, () => {
  console.log(`Server is running on port ${PORT}`);
});