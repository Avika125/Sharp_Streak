import express from 'express';
import cors from 'cors';
import dotenv from 'dotenv';
import { Pool } from 'pg';

dotenv.config();

const app = express();
const port = process.env.PORT || 3000;

import authRoutes from './routes/auth.routes';
import streakRoutes from './routes/streak.routes';
import flashRoutes from './routes/flash.routes';
import shopRoutes from './routes/shop.routes';
import socialRoutes from './routes/social.routes';
import forgeRoutes from './routes/forge.routes';

// Middleware
app.use(cors());
app.use(express.json());

// Routes
app.use('/api/auth', authRoutes);
app.use('/api/streak', streakRoutes);
app.use('/api/flash', flashRoutes);
app.use('/api/shop', shopRoutes);
app.use('/api/social', socialRoutes);
app.use('/api/forge', forgeRoutes);

import { pool } from './db';
import { SchedulerService } from './services/scheduler.service';

pool.connect()
    .then(() => {
        const dbType = process.env.DATABASE_URL?.includes('localhost') ? 'Local' : 'NeonDB';
        console.log(`✅ Connected to ${dbType} PostgreSQL`);

        // Start scheduler
        const scheduler = new SchedulerService(pool);
        scheduler.start();
    })
    .catch(err => console.error('❌ Database connection error:', err));

// Basic Route
app.get('/', (req, res) => {
    res.json({ message: 'Sharp Streaks API is running 🚀' });
});

app.listen(port, () => {
    console.log(`⚡ Server running on port ${port}`);
});

// Global Error Handlers
process.on('uncaughtException', (err) => {
    console.error('🔥 UNCAUGHT EXCEPTION:', err);
});

process.on('unhandledRejection', (reason, promise) => {
    console.error('🔥 UNHANDLED REJECTION:', reason);
});
