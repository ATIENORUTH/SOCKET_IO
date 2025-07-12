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

// Check if client build exists - try public first, then client/dist
const publicPath = path.join(__dirname, '../public');
const clientDistPath = path.join(__dirname, '../client/dist');
const indexHtmlPath = fs.existsSync(publicPath) ? path.join(publicPath, 'index.html') : path.join(clientDistPath, 'index.html');

console.log('Checking for client build...');
console.log('Public path:', publicPath);
console.log('Client dist path:', clientDistPath);
console.log('Index HTML path:', indexHtmlPath);
console.log('Public directory exists:', fs.existsSync(publicPath));
console.log('Client dist exists:', fs.existsSync(clientDistPath));
console.log('Index HTML exists:', fs.existsSync(indexHtmlPath));

// Debug: List all directories in the project root
try {
  const projectRoot = path.join(__dirname, '..');
  console.log('Project root:', projectRoot);
  console.log('Available directories in project root:', fs.readdirSync(projectRoot));
  
  if (fs.existsSync(publicPath)) {
    console.log('Public directory contents:', fs.readdirSync(publicPath));
  }
  
  if (fs.existsSync(clientDistPath)) {
    console.log('Client dist directory contents:', fs.readdirSync(clientDistPath));
  }
} catch (error) {
  console.error('Error listing directories:', error.message);
}

// Serve static files from the public folder if it exists, otherwise from client/dist
if (fs.existsSync(publicPath)) {
  app.use(express.static(publicPath));
  console.log('✅ Serving static files from:', publicPath);
} else if (fs.existsSync(clientDistPath)) {
  app.use(express.static(clientDistPath));
  console.log('✅ Serving static files from:', clientDistPath);
} else {
  console.log('❌ Neither public nor client/dist directory found, serving fallback HTML');
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
    clientBuildExists: fs.existsSync(publicPath),
    clientBuildPath: publicPath
  });
});

// Serve React app for all other routes if build exists
app.get('*', (req, res) => {
  if (fs.existsSync(indexHtmlPath)) {
    res.sendFile(indexHtmlPath);
  } else {
    console.log('❌ Client build not found!');
    console.log('Available directories:', fs.readdirSync(path.join(__dirname, '..')));
    
    // Serve a basic HTML page with Socket.io chat functionality
    res.send(`
      <!DOCTYPE html>
      <html>
      <head>
        <title>Socket.io Chat</title>
        <script src="/socket.io/socket.io.js"></script>
        <style>
          body { font-family: Arial, sans-serif; margin: 20px; background: #f5f5f5; }
          .container { max-width: 800px; margin: 0 auto; background: white; padding: 20px; border-radius: 8px; box-shadow: 0 2px 10px rgba(0,0,0,0.1); }
          #messages { height: 400px; overflow-y: scroll; border: 1px solid #ddd; padding: 10px; margin: 10px 0; background: #fafafa; border-radius: 4px; }
          #messageInput { width: 70%; padding: 8px; border: 1px solid #ddd; border-radius: 4px; }
          #sendButton { padding: 8px 16px; background: #007bff; color: white; border: none; border-radius: 4px; cursor: pointer; }
          #sendButton:hover { background: #0056b3; }
          .user-input { margin-bottom: 15px; }
          .user-input input { padding: 8px; border: 1px solid #ddd; border-radius: 4px; margin-right: 10px; }
          .user-input button { padding: 8px 16px; background: #28a745; color: white; border: none; border-radius: 4px; cursor: pointer; }
          .user-input button:hover { background: #1e7e34; }
          .status { color: #666; font-style: italic; }
        </style>
      </head>
      <body>
        <div class="container">
          <h1>Socket.io Chat</h1>
          <div class="user-input">
            <input type="text" id="username" placeholder="Enter your username" />
            <button onclick="joinChat()">Join Chat</button>
          </div>
          <div id="messages"></div>
          <div>
            <input type="text" id="messageInput" placeholder="Type your message..." />
            <button id="sendButton" onclick="sendMessage()">Send</button>
          </div>
          <p class="status">Server is running. Client build will be available soon.</p>
        </div>
        <script>
          const socket = io();
          let username = '';
          let isJoined = false;
          
          function joinChat() {
            username = document.getElementById('username').value.trim();
            if (username) {
              socket.emit('user_join', username);
              document.getElementById('username').disabled = true;
              document.querySelector('.user-input button').disabled = true;
              isJoined = true;
              addMessage('System', 'You joined the chat');
            }
          }
          
          function sendMessage() {
            const messageInput = document.getElementById('messageInput');
            const message = messageInput.value.trim();
            if (message && isJoined) {
              socket.emit('send_message', { message });
              messageInput.value = '';
            }
          }
          
          function addMessage(sender, message) {
            const messagesDiv = document.getElementById('messages');
            const messageElement = document.createElement('p');
            messageElement.innerHTML = '<strong>' + sender + ':</strong> ' + message;
            messagesDiv.appendChild(messageElement);
            messagesDiv.scrollTop = messagesDiv.scrollHeight;
          }
          
          socket.on('receive_message', (data) => {
            addMessage(data.sender, data.message);
          });
          
          socket.on('user_joined', (data) => {
            if (data.username !== username) {
              addMessage('System', data.username + ' joined the chat');
            }
          });
          
          socket.on('user_left', (data) => {
            addMessage('System', data.username + ' left the chat');
          });
          
          document.getElementById('messageInput').addEventListener('keypress', function(e) {
            if (e.key === 'Enter') {
              sendMessage();
            }
          });
          
          document.getElementById('username').addEventListener('keypress', function(e) {
            if (e.key === 'Enter') {
              joinChat();
            }
          });
        </script>
      </body>
      </html>
    `);
  }
});

// Start server with error handling
const PORT = process.env.PORT || 5000;
server.listen(PORT, '0.0.0.0', () => {
  console.log(`Server running on port ${PORT}`);
  console.log(`Environment: ${process.env.NODE_ENV || 'development'}`);
  console.log(`Client build exists: ${fs.existsSync(publicPath)}`);
}).on('error', (err) => {
  console.error('Server error:', err);
  process.exit(1);
});

module.exports = { app, server, io }; 