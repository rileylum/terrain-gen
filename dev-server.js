const express = require('express');
const path = require('path');

const app = express();
const port = 8000;

// Serve public folder as root
app.use(express.static('public'));

// Serve dist folder files directly at root for development
app.use(express.static('dist'));

app.listen(port, () => {
  console.log(`Dev server running at http://localhost:${port}`);
});