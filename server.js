const WebSocket = require('ws');
const server = new WebSocket.Server({ port: 8080 });

const rooms = {};

server.on('connection', socket => {
  console.log('A player has connected');

  socket.on('message', message => {
    const data = JSON.parse(message);
    
    if (data.room) {
      const roomNumber = data.room;
      if (!rooms[roomNumber]) {
        rooms[roomNumber] = [];
      }
      rooms[roomNumber].push(socket);
      
      if (rooms[roomNumber].length === 2) {
        rooms[roomNumber].forEach(client => {
          client.send(JSON.stringify({ start: true }));
        });
      }
    } else if (data.player || data.enemy) {
      const roomNumber = data.roomNumber;
      if (rooms[roomNumber]) {
        rooms[roomNumber].forEach(client => {
          if (client !== socket) {
            client.send(message);
          }
        });
      }
    }
  });

  socket.on('close', () => {
    for (const room in rooms) {
      rooms[room] = rooms[room].filter(client => client !== socket);
      if (rooms[room].length === 0) {
        delete rooms[room];
      }
    }
  });
});

console.log('WebSocket server is running on ws://localhost:8080');
