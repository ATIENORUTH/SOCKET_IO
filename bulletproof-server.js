const express = require('express');
const http = require('http');
const { Server } = require('socket.io');
const cors = require('cors');

// Initialize Express app
const app = express();
const server = http.createServer(app);
const io = new Server(server, {
  cors: {
    origin: "*",
    methods: ['GET', 'POST'],
    credentials: true,
  },
});

// Middleware
app.use(cors());
app.use(express.json());

// Store connected users and messages
const users = {};
const messages = [];

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

  // Handle disconnection
  socket.on('disconnect', () => {
    if (users[socket.id]) {
      const { username } = users[socket.id];
      io.emit('user_left', { username, id: socket.id });
      console.log(`${username} left the chat`);
    }
    
    delete users[socket.id];
    io.emit('user_list', Object.values(users));
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
    connectedUsers: Object.keys(users).length
  });
});

// Serve the chat application
app.get('*', (req, res) => {
  res.send(`
    <!DOCTYPE html>
    <html>
    <head>
      <title>Socket.io Chat</title>
      <script src="/socket.io/socket.io.js"></script>
      <style>
        body { 
          font-family: Arial, sans-serif; 
          margin: 0; 
          padding: 20px; 
          background: linear-gradient(135deg, #667eea 0%, #764ba2 100%);
          min-height: 100vh;
        }
        .container { 
          max-width: 800px; 
          margin: 0 auto; 
          background: white; 
          padding: 30px; 
          border-radius: 12px; 
          box-shadow: 0 8px 32px rgba(0,0,0,0.1);
        }
        h1 { 
          text-align: center; 
          color: #333; 
          margin-bottom: 30px;
          font-size: 2.5em;
        }
        .user-input { 
          margin-bottom: 20px; 
          text-align: center;
        }
        .user-input input { 
          padding: 12px; 
          border: 2px solid #ddd; 
          border-radius: 6px; 
          margin-right: 10px; 
          font-size: 16px;
          width: 200px;
        }
        .user-input button { 
          padding: 12px 24px; 
          background: #28a745; 
          color: white; 
          border: none; 
          border-radius: 6px; 
          cursor: pointer; 
          font-size: 16px;
          font-weight: bold;
        }
        .user-input button:hover { 
          background: #1e7e34; 
        }
        #messages { 
          height: 400px; 
          overflow-y: scroll; 
          border: 2px solid #ddd; 
          padding: 15px; 
          margin: 20px 0; 
          background: #f8f9fa; 
          border-radius: 8px;
          font-size: 14px;
        }
        #messageInput { 
          width: 70%; 
          padding: 12px; 
          border: 2px solid #ddd; 
          border-radius: 6px; 
          font-size: 16px;
        }
        #sendButton { 
          padding: 12px 24px; 
          background: #007bff; 
          color: white; 
          border: none; 
          border-radius: 6px; 
          cursor: pointer; 
          font-size: 16px;
          font-weight: bold;
        }
        #sendButton:hover { 
          background: #0056b3; 
        }
        .message { 
          margin: 8px 0; 
          padding: 8px; 
          border-radius: 4px;
        }
        .user-message { 
          background: #e3f2fd; 
          border-left: 4px solid #2196f3;
        }
        .system-message { 
          background: #fff3e0; 
          border-left: 4px solid #ff9800;
          font-style: italic;
        }
        .status { 
          color: #666; 
          font-style: italic; 
          text-align: center;
          margin-top: 20px;
        }
        .input-group {
          display: flex;
          gap: 10px;
          align-items: center;
        }
      </style>
    </head>
    <body>
      <div class="container">
        <h1>💬 Socket.io Chat</h1>
        <div class="user-input">
          <input type="text" id="username" placeholder="Enter your username" />
          <button onclick="joinChat()">Join Chat</button>
        </div>
        <div id="messages"></div>
        <div class="input-group">
          <input type="text" id="messageInput" placeholder="Type your message..." />
          <button id="sendButton" onclick="sendMessage()">Send</button>
        </div>
        <p class="status">✅ Server is running. Real-time chat is ready!</p>
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
            addMessage('System', 'You joined the chat', 'system-message');
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
        
        function addMessage(sender, message, className = 'user-message') {
          const messagesDiv = document.getElementById('messages');
          const messageElement = document.createElement('div');
          messageElement.className = 'message ' + className;
          messageElement.innerHTML = '<strong>' + sender + ':</strong> ' + message;
          messagesDiv.appendChild(messageElement);
          messagesDiv.scrollTop = messagesDiv.scrollHeight;
        }
        
        socket.on('receive_message', (data) => {
          addMessage(data.sender, data.message);
        });
        
        socket.on('user_joined', (data) => {
          if (data.username !== username) {
            addMessage('System', data.username + ' joined the chat', 'system-message');
          }
        });
        
        socket.on('user_left', (data) => {
          addMessage('System', data.username + ' left the chat', 'system-message');
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
});

// Start server
const PORT = process.env.PORT || 5000;
server.listen(PORT, '0.0.0.0', () => {
  console.log(`🚀 Server running on port ${PORT}`);
  console.log(`🌍 Environment: ${process.env.NODE_ENV || 'development'}`);
  console.log(`✅ Chat application is ready!`);
}); 