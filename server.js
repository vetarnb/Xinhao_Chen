// server.js

const express = require('express');
const http = require('http');
const WebSocket = require('ws');
const path = require('path');

const app = express();
const server = http.createServer(app);
const wss = new WebSocket.Server({ server });

wss.on('connection', (ws) => {
    console.log('New WebSocket connection');

    ws.on('message', (message) => {
        const data = JSON.parse(message);
        console.log('Received:', data);

        if (data.type === 'test') {
            ws.send(JSON.stringify({ type: 'response', message: 'WebSocket server is working!' }));
        }
    });

    ws.on('close', () => {
        console.log('WebSocket connection closed');
    });
});

app.use(express.static(path.join(__dirname, 'public')));

const port = process.env.PORT || 6866;
server.listen(port, () => {
    console.log(`Server is running on port ${port}`);
});
