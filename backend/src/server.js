import express from 'express';
import { createServer } from 'http';
import { Server } from 'socket.io';
import cors from 'cors';

const app = express();
const server = createServer(app);

const CLIENT_URL = process.env.CLIENT_URL || 'http://localhost:5173';

app.use(cors({
  origin: CLIENT_URL,
  methods: ['GET', 'POST']
}));

const io = new Server(server, {
  cors: {
    origin: CLIENT_URL,
    methods: ['GET', 'POST']
  }
});

const PORT = process.env.PORT || 5000;

app.get('/api/health', (req, res) => {
  res.json({ status: 'ok', message: 'Server is running' });
});

io.use((socket, next) => {
  const username = socket.handshake.auth?.username;
  if (!username || typeof username !== 'string') {
    return next(new Error('Invalid username'));
  }
  
  const trimmed = username.trim();
  if (trimmed.length === 0 || trimmed.length > 20) {
    return next(new Error('Username length must be between 1 and 20 characters'));
  }
  
  socket.username = trimmed;
  next();
});

const ALLOWED_ROOMS = ['General', 'Tech Support'];
const activeTypingUsers = new Set();

io.on('connection', (socket) => {
  console.log(`Client connected: ${socket.id} (User: ${socket.username})`);

  socket.on('room:join', (room, callback) => {
    if (!ALLOWED_ROOMS.includes(room)) {
      if (typeof callback === 'function') callback({ error: 'Invalid room' });
      return;
    }

    if (socket.currentRoom) {
      if (socket.currentRoom === room) {
        if (typeof callback === 'function') callback({ success: true, room });
        return;
      }
      socket.leave(socket.currentRoom);
      const typingKey = `${socket.username}:${socket.currentRoom}`;
      if (activeTypingUsers.has(typingKey)) {
        activeTypingUsers.delete(typingKey);
        socket.to(socket.currentRoom).emit('typing:stop', { username: socket.username });
      }
    }

    socket.join(room);
    socket.currentRoom = room;
    if (typeof callback === 'function') callback({ success: true, room });
  });

  socket.on('message:send', (payload) => {
    if (!socket.currentRoom) return;

    if (!payload || typeof payload !== 'string') {
      return;
    }
    
    const text = payload.trim();
    if (text.length === 0 || text.length > 1000) {
      return;
    }

    const messagePayload = {
      username: socket.username,
      text: text,
      timestamp: new Date().toISOString(),
      room: socket.currentRoom
    };
    
    io.to(socket.currentRoom).emit('message:new', messagePayload);
  });

  socket.on('typing:start', () => {
    if (!socket.currentRoom) return;
    const typingKey = `${socket.username}:${socket.currentRoom}`;
    activeTypingUsers.add(typingKey);
    socket.to(socket.currentRoom).emit('typing:start', { username: socket.username });
  });

  socket.on('typing:stop', () => {
    if (!socket.currentRoom) return;
    const typingKey = `${socket.username}:${socket.currentRoom}`;
    activeTypingUsers.delete(typingKey);
    socket.to(socket.currentRoom).emit('typing:stop', { username: socket.username });
  });

  socket.on('disconnect', () => {
    console.log(`Client disconnected: ${socket.id} (User: ${socket.username})`);
    if (socket.currentRoom) {
      const typingKey = `${socket.username}:${socket.currentRoom}`;
      if (activeTypingUsers.has(typingKey)) {
        activeTypingUsers.delete(typingKey);
        socket.to(socket.currentRoom).emit('typing:stop', { username: socket.username });
      }
    }
  });
});

server.on('error', (err) => {
  console.error('Server failed to start:', err);
});

server.listen(PORT, () => {
  console.log(`Backend server is running on http://localhost:${PORT}`);
});
