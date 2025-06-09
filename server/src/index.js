// server.js
import express from 'express';
import http from 'http';
import { Server } from 'socket.io';
import cors from 'cors';

const rooms = new Map();
const videoChats = new Map();

const app = express();
const server = http.createServer(app);
const io = new Server(server, {
    cors: {
        origin: 'http://localhost:3000',
        credentials: true,
    },
});

app.use(express.json());
app.use(express.urlencoded({ extended: true }));
app.use((req, res, next) => {
    res.header('Access-Control-Allow-Origin', 'http://localhost:3000');
    res.header('Access-Control-Allow-Headers', 'Origin, X-Requested-With, Content-Type, Accept');
    next();
});

app.use(cors());

app.get('/api/rooms', (req, res) => {
    console.log('Fetching all active rooms');
    const activeRooms = [];

    rooms.forEach((room, roomId) => {
        if (room.participants.length > 0) {
            activeRooms.push({
                id: roomId,
                name: room.name || roomId,
                participants: room.participants.length
            });
        }
    });

    res.status(200).json(activeRooms);
});

app.get('/api/:roomId/participants', (req, res) => {
    console.log(`Fetching participants for room: ${req.params.roomId}`);
    const { roomId } = req.params;
    console.log(`Rooms: ${rooms}`);
    const room = rooms.get(roomId);
    if (room) {
        res.status(200).json(room.participants);
    } else {
        res.status(404).json({ message: 'Room not found' });
    }
});

io.on('connection', (socket) => {
    console.log(`⚡ New client connected: ${socket.id}`);

    socket.on('send_message', (data) => {
        console.log('Received message:', data);
        if (data.roomId) {
            io.to(data.roomId).emit('receive_message', data);
        } else {
            io.emit('receive_message', data);
        }
    });

    socket.on('create_room', (roomId, roomName, user) => {
        console.log(`Room created: ${roomName} with ID: ${roomId} by user: ${user.creator} (ID: ${user.id})`);
        socket.join(roomId);
        rooms.set(roomId, { name: roomName, participants: [{ ...user, socketId: socket.id }] });
    });

    socket.on('join_room', (roomId, user) => {
        console.log(`User with ID: ${user.peerId} and name: ${user.name} joined room: ${roomId}`);
        socket.join(roomId);
        const room = rooms.get(roomId);
        if (room) {
            // Check if user is already in the room to avoid duplicates
            const existingUser = room.participants.find(p => p.peerId === user.peerId);
            if (!existingUser) {
                room.participants.push({ ...user, socketId: socket.id });
            }
        } else {
            rooms.set(roomId, { name: roomId, participants: [{ ...user, socketId: socket.id }] });
        }
    });

    socket.on('leave_room', (roomId) => {
        console.log(`User left room: ${roomId}`);
        socket.leave(roomId);
        const room = rooms.get(roomId);
        if (room) {
            // Filter by socketId instead of user id for proper cleanup
            room.participants = room.participants.filter((p) => p.socketId !== socket.id);
            if (room.participants.length === 0) {
                rooms.delete(roomId);
                console.log(`Room ${roomId} deleted as it has no participants left.`);
            }
        }
    });

    socket.on('join_video_chat', (videoChatId, user) => {
        console.log(`User with ID: ${user.peerId} and name: ${user.name} joined video chat: ${videoChatId}`);
        socket.join(videoChatId);

        // Initialize video chat room if it doesn't exist
        if (!videoChats.has(videoChatId)) {
            videoChats.set(videoChatId, new Set());
        }

        // Add user to video chat participants
        const participants = videoChats.get(videoChatId);
        participants.add(JSON.stringify({ ...user, socketId: socket.id }));

        // Notify others in the room that a new user joined
        socket.to(videoChatId).emit('user_joined_video_chat', { user });
        console.log(`User ${user.name} joined video chat ${videoChatId}. Total participants: ${participants.size}`);
    });

    socket.on('leave_video_chat', (videoChatId, user) => {
        console.log(`User with ID: ${user.peerId} and name: ${user.name} left video chat: ${videoChatId}`);
        socket.leave(videoChatId);

        // Remove user from video chat participants
        const participants = videoChats.get(videoChatId);
        if (participants) {
            // Find and remove the user
            for (const participant of participants) {
                const parsedParticipant = JSON.parse(participant);
                if (parsedParticipant.socketId === socket.id) {
                    participants.delete(participant);
                    break;
                }
            }

            // Clean up empty video chat rooms
            if (participants.size === 0) {
                videoChats.delete(videoChatId);
                console.log(`Video chat ${videoChatId} deleted as it has no participants left.`);
            }
        }

        // Notify others in the room that user left
        socket.to(videoChatId).emit('user_left_video_chat', { user });
        console.log(`User ${user.name} left video chat ${videoChatId}`);
    });

    socket.on('typing_start', (data) => {
        const { roomId, user } = data;
        if (roomId) {
            socket.to(roomId).emit('user_typing', { user, roomId });
        }
    });

    socket.on('typing_stop', (data) => {
        const { roomId, user } = data;
        if (roomId) {
            socket.to(roomId).emit('user_stopped_typing', { user, roomId });
        }
    });

    socket.on('disconnect', () => {
        console.log('🚫 Client disconnected:', socket.id);

        // Clean up user from all rooms when they disconnect
        rooms.forEach((room, roomId) => {
            const originalLength = room.participants.length;
            room.participants = room.participants.filter((p) => p.socketId !== socket.id);

            // If participants were removed and room is now empty, delete the room
            if (originalLength > room.participants.length && room.participants.length === 0) {
                rooms.delete(roomId);
                console.log(`Room ${roomId} deleted due to disconnect - no participants left.`);
            }
        });

        // Clean up user from all video chats when they disconnect
        videoChats.forEach((participants, videoChatId) => {
            const originalSize = participants.size;
            let userToRemove = null;

            // Find the participant with matching socketId
            for (const participant of participants) {
                const parsedParticipant = JSON.parse(participant);
                if (parsedParticipant.socketId === socket.id) {
                    userToRemove = participant;
                    // Notify others in the video chat that user disconnected
                    socket.to(videoChatId).emit('user_left_video_chat', { user: parsedParticipant });
                    break;
                }
            }

            if (userToRemove) {
                participants.delete(userToRemove);
                console.log(`User disconnected from video chat ${videoChatId}`);

                // Clean up empty video chat rooms
                if (participants.size === 0) {
                    videoChats.delete(videoChatId);
                    console.log(`Video chat ${videoChatId} deleted due to disconnect - no participants left.`);
                }
            }
        });
    });
});

server.listen(5000, () => {
    console.log('Server is running on port 5000');
});