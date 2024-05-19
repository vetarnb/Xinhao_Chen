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
    try {
      const data = JSON.parse(message);

      switch (data.type) {
        case 'joinRoom':
          handleJoinRoom(ws, data.room);
          break;

        case 'playerMove':
        case 'playerAttack':
          handlePlayerAction(ws, data);
          break;

        default:
          console.log('Unknown message type:', data.type);
          break;
      }
    } catch (error) {
      console.error('Error processing message:', error);
      ws.send(JSON.stringify({ type: 'error', message: 'Invalid message format' }));
    }
  });

  ws.on('close', () => {
    handleDisconnect(ws);
  });

  ws.on('error', (error) => {
    console.error('WebSocket error:', error);
  });
});

app.use(express.static('public'));

server.listen(process.env.PORT || 8080, () => {
  console.log('Server is running on port', server.address().port);
});

function generateUniqueId() {
  return '_' + Math.random().toString(36).substr(2, 9);
}

function handleJoinRoom(ws, roomName) {
  if (!rooms[roomName]) {
    rooms[roomName] = [];
  }

  if (!rooms[roomName].some(client => client.id === ws.id)) {
    rooms[roomName].push(ws);

    if (rooms[roomName].length === 2) {
      rooms[roomName].forEach(client => {
        client.send(JSON.stringify({ type: 'startGame' }));
      });
    }
  } else {
    ws.send(JSON.stringify({ type: 'error', message: 'You are already in this room' }));
  }
}

function handlePlayerAction(ws, data) {
  const room = rooms[data.room];
  if (room) {
    room.forEach(client => {
      if (client.readyState === WebSocket.OPEN) {
        client.send(JSON.stringify(data)); // Broadcast the action to all clients in the room
      }
    });
  }
}

function handleDisconnect(ws) {
  for (let room in rooms) {
    rooms[room] = rooms[room].filter(client => client !== ws);
    if (rooms[room].length === 0) {
      delete rooms[room];
    }
  }
}
