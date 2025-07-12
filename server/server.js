// server.js - Main server file for Socket.io chat application

const express = require('express');
const http = require('http');
const { Server } = require('socket.io');
const cors = require('cors');
const dotenv = require('dotenv');
const path = require('path');
const fs = require('fs');

// Load environment variables
dotenv.config();

// Initialize Express app
const app = express();
const server = http.createServer(app);
const io = new Server(server, {
  cors: {
    origin: process.env.CLIENT_URL || 'http://localhost:5173',
    methods: ['GET', 'POST'],
    credentials: true,
  },
});

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
  console.log('Available directories:', fs.readdirSync(path.join(__dirname, '..')));
}

// Store connected users and messages
const users = {};
const messages = [];
const typingUsers = {};

// Socket.io connection handler
io.on('connection', (socket) => {
  console.log(`User connected: ${socket.id}`);

  // Handle user joining
  socket.on('user_join', (username) => {
    users[socket.id] = { username, id: socket.id };
    io.emit('user_list', Object.values(users));
    io.emit('user_joined', { username, id: socket.id });
    console.log(`${username} joined the chat`);
  });

  // Handle chat messages
  socket.on('send_message', (messageData) => {
    const message = {
      ...messageData,
      id: Date.now(),
      sender: users[socket.id]?.username || 'Anonymous',
      senderId: socket.id,
      timestamp: new Date().toISOString(),
    };
    
    messages.push(message);
    
    // Limit stored messages to prevent memory issues
    if (messages.length > 100) {
      messages.shift();
    }
    
    io.emit('receive_message', message);
  });

  // Handle typing indicator
  socket.on('typing', (isTyping) => {
    if (users[socket.id]) {
      const username = users[socket.id].username;
      
      if (isTyping) {
        typingUsers[socket.id] = username;
      } else {
        delete typingUsers[socket.id];
      }
      
      io.emit('typing_users', Object.values(typingUsers));
    }
  });

  // Handle private messages
  socket.on('private_message', ({ to, message }) => {
    const messageData = {
      id: Date.now(),
      sender: users[socket.id]?.username || 'Anonymous',
      senderId: socket.id,
      message,
      timestamp: new Date().toISOString(),
      isPrivate: true,
    };
    
    socket.to(to).emit('private_message', messageData);
    socket.emit('private_message', messageData);
  });

  // Handle disconnection
  socket.on('disconnect', () => {
    if (users[socket.id]) {
      const { username } = users[socket.id];
      io.emit('user_left', { username, id: socket.id });
      console.log(`${username} left the chat`);
    }
    
    delete users[socket.id];
    delete typingUsers[socket.id];
    
    io.emit('user_list', Object.values(users));
    io.emit('typing_users', Object.values(typingUsers));
  });
});

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
    // Try to build the client if it doesn't exist
    console.log('🔨 Client build not found, attempting to build...');
    try {
      const { execSync } = require('child_process');
      execSync('cd client && npm install && npx vite build --outDir dist', { 
        stdio: 'pipe',
        timeout: 60000 // 60 second timeout
      });
      console.log('✅ Client build created successfully!');
      res.sendFile(indexHtmlPath);
    } catch (error) {
      console.log('❌ Failed to build client:', error.message);
      res.json({ 
        message: 'Server is running but client build is not ready yet. Please wait a moment and refresh.',
        status: 'building',
        clientBuildPath: clientBuildPath,
        clientBuildExists: fs.existsSync(clientBuildPath),
        availableDirectories: fs.readdirSync(path.join(__dirname, '..'))
      });
    }
  }
});

// Start server with error handling
const PORT = process.env.PORT || 5000;
server.listen(PORT, '0.0.0.0', () => {
  console.log(`Server running on port ${PORT}`);
  console.log(`Environment: ${process.env.NODE_ENV || 'development'}`);
  console.log(`Client build exists: ${fs.existsSync(clientBuildPath)}`);
}).on('error', (err) => {
  console.error('Server error:', err);
  process.exit(1);
});

module.exports = { app, server, io }; 