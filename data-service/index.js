require('dotenv').config();
const express = require('express');
const mongoose = require('mongoose');
const jwt = require('jsonwebtoken');
const http = require('http');
const { Server } = require("socket.io");
const { createAdapter } = require("@socket.io/redis-adapter");
const { createClient } = require("redis");
const os = require('os');

const app = express();
app.use(express.json());

// MongoDB Connection
mongoose.connect(process.env.MONGO_URI, { useNewUrlParser: true, useUnifiedTopology: true })
    .then(() => console.log('Data Service: MongoDB Connected'))
    .catch(err => console.error(err));

// Data Model
const DataSchema = new mongoose.Schema({
    userId: { type: String, required: true },
    content: { type: String, required: true },
    status: { type: String, default: 'offline' },
    createdAt: { type: Date, default: Date.now },
});
const Data = mongoose.model('Data', DataSchema);

// Auth Middleware
const auth = (req, res, next) => {
    try {
        const token = req.headers.authorization.split(" ")[1];
        const decoded = jwt.verify(token, process.env.JWT_SECRET);
        req.userData = decoded;
        next();
    } catch (error) {
        return res.status(401).json({ message: 'Auth failed' });
    }
};

// Routes
app.get('/health', (req, res) => {
    res.status(200).json({ status: 'UP', hostname: os.hostname() });
});

app.post('/data', auth, async (req, res) => {
    console.log(`[${os.hostname()}] Creating data for user ${req.userData.id}`);
    const { content } = req.body;
    const existingUser = await Data.findOne({ userId: req.userData.id });
    if (existingUser) {
        return res.status(400).json({ message: 'User\'s data already exists' });
    }
    const newData = new Data({ userId: req.userData.id, content });
    try {
        await newData.save();
        io.emit('newData', { ...newData.toObject(), hostname: os.hostname() });
        res.status(201).json(newData);
    } catch (error) {
        res.status(500).json({ message: 'Something went wrong' });
    }
});

app.get('/data', auth, async (req, res) => {
    console.log(`[${os.hostname()}] Fetching data for user ${req.userData.id}`);
    try {
        const data = await Data.find({ userId: req.userData.id });
        res.status(200).json(data);
    } catch (error) {
        res.status(500).json({ message: 'Something went wrong' });
    }
});

app.put('/updatestatus', auth, async (req, res) => {
  const { status } = req.body;
  try {
    const userStatus = await Data.findOneAndUpdate(
      { userId: req.userData.id },
      { status },
      { upsert: true, new: true }
    );
    io.emit('statusUpdate', { userId: req.userData.id, status }); // Broadcast status change
    res.json(userStatus);
  } catch (error) {
    res.status(500).json({ error: 'Server error' });
  }
});


// Server and Socket.IO Setup
const server = http.createServer(app);
const io = new Server(server, {
    cors: {
        origin: "*",
        methods: ["GET", "POST"]
    }
});

// Redis Adapter for Socket.IO
const pubClient = createClient({ url: `redis://${process.env.REDIS_HOST}:${process.env.REDIS_PORT}` });
const subClient = pubClient.duplicate();

Promise.all([pubClient.connect(), subClient.connect()]).then(() => {
    io.adapter(createAdapter(pubClient, subClient));
    console.log(`Socket.IO on ${os.hostname()} connected to Redis adapter.`);
});


// Socket.IO Connection
io.on('connection', (socket) => {
    console.log(`[${os.hostname()}] A user connected via WebSocket: ${socket.id}`);
    socket.on('join', (userId) => {
        socket.join(userId);
        console.log(`Socket ${socket.id} joined room for user ${userId}`);
    });

    socket.on('disconnect', () => {
        console.log(`[${os.hostname()}] User disconnected: ${socket.id}`);
    });

    socket.on('statusUpdate', (data) => {
        console.log(`[${os.hostname()}] Received status update:`, data);
        socket.broadcast.emit('userStatusChanged', { ...data, hostname: os.hostname() });
    });
});

const PORT = process.env.PORT || 3002;
server.listen(PORT, () => console.log(`Data Service on ${os.hostname()} running on port ${PORT}`));
