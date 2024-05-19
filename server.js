const express = require('express');
const http = require('http');
const WebSocket = require('ws');
const path = require('path');

const app = express();
const server = http.createServer(app);
const wss = new WebSocket.Server({ server });

const rooms = {};

wss.on('connection', (ws) => {
  console.log('New WebSocket connection');

  ws.on('message', (message) => {
    const data = JSON.parse(message);

    switch (data.type) {
      case 'joinRoom':
        if (!rooms[data.room]) {
          rooms[data.room] = [ws];
          ws.send(JSON.stringify({ message: 'waiting' }));
        } else {
          rooms[data.room].push(ws);
          rooms[data.room].forEach((client, index) => {
            if (client !== ws && client.readyState === WebSocket.OPEN) {
              client.send(JSON.stringify({ start: true, role: 'player' }));
              ws.send(JSON.stringify({ start: true, role: 'enemy' }));
            }
          });
        }
        break;

      case 'update':
        const roomClients = rooms[data.room];
        if (roomClients) {
          roomClients.forEach((client) => {
            if (client !== ws && client.readyState === WebSocket.OPEN) {
              client.send(message);
            }
          });
        }
        break;
    }
  });

  ws.on('close', () => {
    for (const room in rooms) {
      rooms[room] = rooms[room].filter(client => client !== ws);
      if (rooms[room].length === 0) {
        delete rooms[room];
      }
    }
  });
});

app.use(express.static(path.join(__dirname, 'public')));

const PORT = process.env.PORT || 3000;
server.listen(PORT, () => console.log(`Server is running on port ${PORT}`));
