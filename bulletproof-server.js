const express = require('express');
const http = require('http');
const { Server } = require('socket.io');
const cors = require('cors');
const path = require('path');
const fs = require('fs');

console.log('🚀 Starting bulletproof Socket.io chat server...');

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
    server: 'bulletproof-socket-io-chat',
    connectedUsers: Object.keys(users).length
  });
});

// Serve beautiful HTML chat interface for all routes
app.get('*', (req, res) => {
  console.log('✅ Serving bulletproof HTML chat interface');
  res.send(`
    <!DOCTYPE html>
    <html lang="en">
    <head>
        <meta charset="UTF-8">
        <meta name="viewport" content="width=device-width, initial-scale=1.0">
        <title>Socket.io Chat - Real-time Communication</title>
        <script src="/socket.io/socket.io.js"></script>
        <style>
            * {
                margin: 0;
                padding: 0;
                box-sizing: border-box;
            }
            
            body {
                font-family: 'Segoe UI', Tahoma, Geneva, Verdana, sans-serif;
                background: linear-gradient(135deg, #667eea 0%, #764ba2 100%);
                min-height: 100vh;
                display: flex;
                align-items: center;
                justify-content: center;
                padding: 20px;
            }
            
            .chat-container {
                background: white;
                border-radius: 20px;
                box-shadow: 0 20px 40px rgba(0,0,0,0.1);
                width: 100%;
                max-width: 800px;
                height: 80vh;
                display: flex;
                flex-direction: column;
                overflow: hidden;
            }
            
            .header {
                background: linear-gradient(135deg, #667eea 0%, #764ba2 100%);
                color: white;
                padding: 20px;
                text-align: center;
                font-size: 24px;
                font-weight: bold;
            }
            
            .join-section {
                padding: 30px;
                text-align: center;
                background: #f8f9fa;
                border-bottom: 1px solid #e9ecef;
            }
            
            .join-section input {
                padding: 12px 20px;
                border: 2px solid #ddd;
                border-radius: 25px;
                font-size: 16px;
                margin-right: 10px;
                width: 250px;
                outline: none;
                transition: border-color 0.3s;
            }
            
            .join-section input:focus {
                border-color: #667eea;
            }
            
            .join-section button {
                padding: 12px 30px;
                background: linear-gradient(135deg, #667eea 0%, #764ba2 100%);
                color: white;
                border: none;
                border-radius: 25px;
                font-size: 16px;
                font-weight: bold;
                cursor: pointer;
                transition: transform 0.2s;
            }
            
            .join-section button:hover {
                transform: translateY(-2px);
            }
            
            .chat-section {
                display: none;
                flex: 1;
                display: flex;
                flex-direction: column;
            }
            
            .messages-container {
                flex: 1;
                padding: 20px;
                overflow-y: auto;
                background: #f8f9fa;
            }
            
            .message {
                margin-bottom: 15px;
                padding: 12px 16px;
                border-radius: 15px;
                max-width: 70%;
                word-wrap: break-word;
            }
            
            .message.own {
                background: linear-gradient(135deg, #667eea 0%, #764ba2 100%);
                color: white;
                margin-left: auto;
                border-bottom-right-radius: 5px;
            }
            
            .message.other {
                background: white;
                color: #333;
                border: 1px solid #e9ecef;
                border-bottom-left-radius: 5px;
            }
            
            .message.system {
                background: #fff3cd;
                color: #856404;
                border: 1px solid #ffeaa7;
                text-align: center;
                font-style: italic;
                margin: 10px auto;
                max-width: 90%;
            }
            
            .message .sender {
                font-weight: bold;
                font-size: 12px;
                margin-bottom: 5px;
                opacity: 0.8;
            }
            
            .message .time {
                font-size: 10px;
                opacity: 0.6;
                margin-top: 5px;
            }
            
            .input-section {
                padding: 20px;
                background: white;
                border-top: 1px solid #e9ecef;
                display: flex;
                gap: 10px;
                align-items: center;
            }
            
            .input-section input {
                flex: 1;
                padding: 12px 20px;
                border: 2px solid #e9ecef;
                border-radius: 25px;
                font-size: 16px;
                outline: none;
                transition: border-color 0.3s;
            }
            
            .input-section input:focus {
                border-color: #667eea;
            }
            
            .input-section button {
                padding: 12px 25px;
                background: linear-gradient(135deg, #667eea 0%, #764ba2 100%);
                color: white;
                border: none;
                border-radius: 25px;
                font-size: 16px;
                font-weight: bold;
                cursor: pointer;
                transition: transform 0.2s;
            }
            
            .input-section button:hover {
                transform: translateY(-2px);
            }
            
            .typing-indicator {
                padding: 10px 20px;
                color: #666;
                font-style: italic;
                font-size: 14px;
            }
            
            .status {
                text-align: center;
                padding: 10px;
                color: #28a745;
                font-weight: bold;
                background: #d4edda;
                border: 1px solid #c3e6cb;
                border-radius: 5px;
                margin: 10px 20px;
            }
            
            @media (max-width: 768px) {
                .chat-container {
                    height: 90vh;
                    margin: 10px;
                }
                
                .join-section input {
                    width: 100%;
                    margin-bottom: 10px;
                    margin-right: 0;
                }
                
                .message {
                    max-width: 85%;
                }
            }
        </style>
    </head>
    <body>
        <div class="chat-container">
            <div class="header">
                💬 Real-time Chat
            </div>
            
            <div class="join-section" id="joinSection">
                <h3>Welcome to the Chat!</h3>
                <p style="margin: 15px 0; color: #666;">Enter your username to start chatting</p>
                <input type="text" id="usernameInput" placeholder="Enter your username..." />
                <button onclick="joinChat()">Join Chat</button>
            </div>
            
            <div class="chat-section" id="chatSection">
                <div class="status" id="status">
                    ✅ Connected to server - Ready to chat!
                </div>
                
                <div class="messages-container" id="messagesContainer">
                    <!-- Messages will appear here -->
                </div>
                
                <div class="typing-indicator" id="typingIndicator" style="display: none;">
                    Someone is typing...
                </div>
                
                <div class="input-section">
                    <input type="text" id="messageInput" placeholder="Type your message..." disabled />
                    <button onclick="sendMessage()" id="sendButton" disabled>Send</button>
                </div>
            </div>
        </div>

        <script>
            const socket = io();
            let username = '';
            let isJoined = false;
            
            // Connect to server
            socket.on('connect', () => {
                console.log('Connected to server');
                updateStatus('✅ Connected to server - Ready to chat!', 'success');
            });
            
            socket.on('disconnect', () => {
                updateStatus('❌ Disconnected from server', 'error');
            });
            
            function joinChat() {
                username = document.getElementById('usernameInput').value.trim();
                if (username) {
                    socket.emit('user_join', username);
                    document.getElementById('joinSection').style.display = 'none';
                    document.getElementById('chatSection').style.display = 'flex';
                    document.getElementById('messageInput').disabled = false;
                    document.getElementById('sendButton').disabled = false;
                    isJoined = true;
                    addMessage('System', 'You joined the chat!', 'system');
                    updateStatus('✅ Joined chat as ' + username, 'success');
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
            
            function addMessage(sender, message, type = 'other') {
                const messagesContainer = document.getElementById('messagesContainer');
                const messageElement = document.createElement('div');
                messageElement.className = 'message ' + type;
                
                const time = new Date().toLocaleTimeString();
                
                if (type === 'system') {
                    messageElement.innerHTML = message;
                } else {
                    messageElement.innerHTML = \`
                        <div class="sender">\${sender}</div>
                        <div class="content">\${message}</div>
                        <div class="time">\${time}</div>
                    \`;
                }
                
                messagesContainer.appendChild(messageElement);
                messagesContainer.scrollTop = messagesContainer.scrollHeight;
            }
            
            function updateStatus(message, type) {
                const statusElement = document.getElementById('status');
                statusElement.textContent = message;
                statusElement.className = 'status ' + type;
            }
            
            // Socket event handlers
            socket.on('receive_message', (data) => {
                const messageType = data.sender === username ? 'own' : 'other';
                addMessage(data.sender, data.message, messageType);
            });
            
            socket.on('user_joined', (data) => {
                if (data.username !== username) {
                    addMessage('System', data.username + ' joined the chat', 'system');
                }
            });
            
            socket.on('user_left', (data) => {
                addMessage('System', data.username + ' left the chat', 'system');
            });
            
            socket.on('typing_users', (users) => {
                const typingIndicator = document.getElementById('typingIndicator');
                if (users.length > 0) {
                    const typingUsers = users.filter(u => u !== username).join(', ');
                    if (typingUsers) {
                        typingIndicator.textContent = typingUsers + ' is typing...';
                        typingIndicator.style.display = 'block';
                    }
                } else {
                    typingIndicator.style.display = 'none';
                }
            });
            
            // Event listeners
            document.getElementById('messageInput').addEventListener('keypress', function(e) {
                if (e.key === 'Enter') {
                    sendMessage();
                }
            });
            
            document.getElementById('usernameInput').addEventListener('keypress', function(e) {
                if (e.key === 'Enter') {
                    joinChat();
                }
            });
            
            // Auto-focus on username input
            document.getElementById('usernameInput').focus();
        </script>
    </body>
    </html>
  `);
});

// Start server
const PORT = process.env.PORT || 5000;
server.listen(PORT, '0.0.0.0', () => {
  console.log(`🚀 Bulletproof server running on port ${PORT}`);
  console.log(`🌍 Environment: ${process.env.NODE_ENV || 'development'}`);
  console.log(`📡 Socket.io server ready for connections`);
}).on('error', (err) => {
  console.error('❌ Server error:', err);
  process.exit(1);
});

module.exports = { app, server, io }; 