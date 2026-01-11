import { Pool } from 'pg';
import dotenv from 'dotenv';
import path from 'path';

dotenv.config({ path: path.join(__dirname, '../../.env') });

export const pool = new Pool({
    connectionString: process.env.DATABASE_URL,
    max: 20, // Limit connections to prevent exhaustion
    idleTimeoutMillis: 30000,
    connectionTimeoutMillis: 2000,
});

pool.on('error', (err) => {
    console.error('⚠️ Unexpected error on idle client', err);
});
