// server.js - Main server file for Socket.io chat application

const express = require('express');
const http = require('http');
const { Server } = require('socket.io');
const cors = require('cors');

console.log('🚀 MINIMAL SERVER STARTING - NO FILE DEPENDENCIES');

const app = express();
const server = http.createServer(app);
const io = new Server(server, {
  cors: {
    origin: "*",
    methods: ['GET', 'POST'],
    credentials: true,
  },
});

app.use(cors());
app.use(express.json());

// Store connected users and messages
const users = {};
const messages = [];
const typingUsers = {};

// Socket.io connection handler
io.on('connection', (socket) => {
  console.log(`User connected: ${socket.id}`);

  socket.on('user_join', (username) => {
    users[socket.id] = { username, id: socket.id };
    io.emit('user_list', Object.values(users));
    io.emit('user_joined', { username, id: socket.id });
    console.log(`${username} joined the chat`);
  });

  socket.on('send_message', (messageData) => {
    const message = {
      ...messageData,
      id: Date.now(),
      sender: users[socket.id]?.username || 'Anonymous',
      senderId: socket.id,
      timestamp: new Date().toISOString(),
    };
    
    messages.push(message);
    if (messages.length > 100) messages.shift();
    
    io.emit('receive_message', message);
  });

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

app.get('/health', (req, res) => {
  res.json({ 
    status: 'OK', 
    timestamp: new Date().toISOString(),
    message: 'MINIMAL SERVER WORKING - NO FILE DEPENDENCIES'
  });
});

// Serve embedded HTML for ALL routes
app.get('*', (req, res) => {
  console.log('✅ Serving embedded HTML chat application');
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
          border: 1px solid #ddd; 
          padding: 20px; 
          margin-bottom: 20px; 
          border-radius: 6px;
          background: #f8f9fa;
        }
        .message { 
          margin-bottom: 10px; 
          padding: 10px; 
          background: white; 
          border-radius: 6px; 
          border-left: 4px solid #007bff;
        }
        .message-input { 
          display: flex; 
          gap: 10px;
        }
        .message-input input { 
          flex: 1; 
          padding: 12px; 
          border: 2px solid #ddd; 
          border-radius: 6px; 
          font-size: 16px;
        }
        .message-input button { 
          padding: 12px 24px; 
          background: #007bff; 
          color: white; 
          border: none; 
          border-radius: 6px; 
          cursor: pointer; 
          font-size: 16px;
          font-weight: bold;
        }
        .message-input button:hover { 
          background: #0056b3; 
        }
        .status { 
          text-align: center; 
          margin-bottom: 20px; 
          padding: 10px; 
          border-radius: 6px; 
          font-weight: bold;
        }
        .connected { 
          background: #d4edda; 
          color: #155724; 
        }
        .disconnected { 
          background: #f8d7da; 
          color: #721c24; 
        }
        .typing { 
          font-style: italic; 
          color: #6c757d; 
          margin-bottom: 10px;
        }
      </style>
    </head>
    <body>
      <div class="container">
        <h1>Socket.io Chat</h1>
        <div id="status" class="status disconnected">Disconnected</div>
        
        <div id="join-form" class="user-input">
          <input type="text" id="username" placeholder="Enter your username" />
          <button onclick="joinChat()">Join Chat</button>
        </div>
        
        <div id="chat" style="display: none;">
          <div id="messages"></div>
          <div id="typing" class="typing" style="display: none;"></div>
          <form class="message-input" onsubmit="sendMessage(event)">
            <input type="text" id="message" placeholder="Type a message..." />
            <button type="submit">Send</button>
          </form>
        </div>
      </div>
      
      <script>
        const socket = io();
        let username = '';
        
        socket.on('connect', () => {
          document.getElementById('status').textContent = 'Connected';
          document.getElementById('status').className = 'status connected';
        });
        
        socket.on('disconnect', () => {
          document.getElementById('status').textContent = 'Disconnected';
          document.getElementById('status').className = 'status disconnected';
        });
        
        socket.on('receive_message', (message) => {
          const messagesDiv = document.getElementById('messages');
          const messageDiv = document.createElement('div');
          messageDiv.className = 'message';
          messageDiv.innerHTML = \`
            <strong>\${message.sender}</strong>: \${message.message}
            <small style="color: #6c757d;">\${new Date(message.timestamp).toLocaleTimeString()}</small>
          \`;
          messagesDiv.appendChild(messageDiv);
          messagesDiv.scrollTop = messagesDiv.scrollHeight;
        });
        
        socket.on('user_joined', (user) => {
          const messagesDiv = document.getElementById('messages');
          const messageDiv = document.createElement('div');
          messageDiv.className = 'message';
          messageDiv.innerHTML = \`<em style="color: #28a745;">\${user.username} joined the chat</em>\`;
          messagesDiv.appendChild(messageDiv);
          messagesDiv.scrollTop = messagesDiv.scrollHeight;
        });
        
        socket.on('user_left', (user) => {
          const messagesDiv = document.getElementById('messages');
          const messageDiv = document.createElement('div');
          messageDiv.className = 'message';
          messageDiv.innerHTML = \`<em style="color: #dc3545;">\${user.username} left the chat</em>\`;
          messagesDiv.appendChild(messageDiv);
          messagesDiv.scrollTop = messagesDiv.scrollHeight;
        });
        
        socket.on('typing_users', (users) => {
          const typingDiv = document.getElementById('typing');
          if (users.length > 0) {
            typingDiv.textContent = \`\${users.join(', ')} \${users.length === 1 ? 'is' : 'are'} typing...\`;
            typingDiv.style.display = 'block';
          } else {
            typingDiv.style.display = 'none';
          }
        });
        
        function joinChat() {
          username = document.getElementById('username').value.trim();
          if (username) {
            socket.emit('user_join', username);
            document.getElementById('join-form').style.display = 'none';
            document.getElementById('chat').style.display = 'block';
          }
        }
        
        function sendMessage(event) {
          event.preventDefault();
          const messageInput = document.getElementById('message');
          const message = messageInput.value.trim();
          if (message) {
            socket.emit('send_message', { message });
            messageInput.value = '';
          }
        }
        
        let typingTimer;
        document.getElementById('message').addEventListener('input', () => {
          clearTimeout(typingTimer);
          socket.emit('typing', true);
          typingTimer = setTimeout(() => {
            socket.emit('typing', false);
          }, 1000);
        });
      </script>
    </body>
    </html>
  `);
});

const PORT = process.env.PORT || 5000;
server.listen(PORT, () => {
  console.log(`🚀 MINIMAL SERVER RUNNING ON PORT ${PORT}`);
  console.log('✅ NO FILE DEPENDENCIES - EMBEDDED HTML ONLY');
}); 