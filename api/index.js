// Vercel API route for Socket.IO chat application
const express = require('express');
const cors = require('cors');
const path = require('path');
const fs = require('fs');

const app = express();

// Middleware
app.use(cors());
app.use(express.json());

// Check if client build exists
const clientBuildPath = path.join(__dirname, '../client/dist');
const indexHtmlPath = path.join(clientBuildPath, 'index.html');

console.log('Checking for client build...');
console.log('Client build path:', clientBuildPath);
console.log('Index HTML path:', indexHtmlPath);
console.log('Client build exists:', fs.existsSync(clientBuildPath));
console.log('Index HTML exists:', fs.existsSync(indexHtmlPath));

// Serve static files from the React app if build exists
if (fs.existsSync(clientBuildPath)) {
  app.use(express.static(clientBuildPath));
  console.log('✅ Serving client build from:', clientBuildPath);
} else {
  console.log('❌ Client build not found, serving API only');
}

// Store connected users and messages
const users = {};
const messages = [];
const typingUsers = {};

// API routes
app.get('/api/messages', (req, res) => {
  res.json(messages);
});

app.get('/api/users', (req, res) => {
  res.json(Object.values(users));
});

// Health check endpoint
app.get('/health', (req, res) => {
  res.json({ 
    status: 'OK', 
    timestamp: new Date().toISOString(),
    clientBuildExists: fs.existsSync(clientBuildPath),
    clientBuildPath: clientBuildPath
  });
});

// Serve React app for all other routes if build exists
app.get('*', (req, res) => {
  if (fs.existsSync(indexHtmlPath)) {
    res.sendFile(indexHtmlPath);
  } else {
    res.json({ 
      message: 'Server is running but client build is not ready yet. Please wait a moment and refresh.',
      status: 'building',
      clientBuildPath: clientBuildPath,
      clientBuildExists: fs.existsSync(clientBuildPath)
    });
  }
});

module.exports = app; 