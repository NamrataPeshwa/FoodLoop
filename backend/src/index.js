import express from 'express';
import cors from 'cors';
import dotenv from 'dotenv';
import http from 'http';
// import { Server } from 'socket.io';
import connectDB from './utils/db.connect.js'; 
import './jobs/matchListingsJob.js';


// Importing Routes
import authRoutes from './routes/auth.routes.js';
import donationRoutes from './routes/donations.routes.js';
import ngoRoutes from './routes/ngo.routes.js';
import joyRoutes from './routes/joy.route.js';
import transactionRoutes from './routes/transactions.routes.js';
import impactRoutes from './routes/impact.routes.js';

dotenv.config();
const app = express();
const server = http.createServer(app);
// const io = new Server(server, { cors: { origin: '*' } });

// Middleware
app.use(cors());
app.use(express.json());

// API Routes
app.use('/api/auth', authRoutes);
app.use('/api/donations', donationRoutes);
app.use('/api/ngo', ngoRoutes);
app.use('/api/joy', joyRoutes);
app.use('/api/transaction', transactionRoutes);
app.use('/api/impact', impactRoutes );

// Real-time Donation Tracking
// io.on('connection', (socket) => {
//     console.log('A user connected');

//     socket.on('newDonation', (donation) => {
//         io.emit('updateDonations', donation);
//     });

//     socket.on('disconnect', () => {
//         console.log('User disconnected');
//     });
// });

// **Connect to MongoDB using connectDB function**
connectDB();

// Server Listener
const PORT = process.env.PORT || 5000;
server.listen(PORT, () => console.log(`🚀 Server running on port ${PORT}`));
