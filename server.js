const express = require('express');
const path = require('path');
const app = express();
const PORT = process.env.PORT || 8080;

// Serve static files from the 'public' directory
app.use(express.static(path.join(__dirname, 'public')));

app.get('/', (req, res) => {
  res.sendFile(path.join(__dirname, 'public', 'index.html'));
});

app.get('/restroom', (req, res) => {
  res.sendFile(path.join(__dirname, 'public', 'restroom.html'));
});

app.listen(PORT, () => {
  console.log(`Server is running on port ${PORT}`);
});
