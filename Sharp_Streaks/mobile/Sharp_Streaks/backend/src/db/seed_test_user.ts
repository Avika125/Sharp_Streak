import { Pool } from 'pg';
import dotenv from 'dotenv';
import path from 'path';

dotenv.config({ path: path.join(__dirname, '../../.env') });

const pool = new Pool({ connectionString: process.env.DATABASE_URL });

async function seed() {
    try {
        await pool.query(`
      INSERT INTO users (id, firebase_uid, email, username, current_streak) 
      VALUES (gen_random_uuid(), 'test_uid_tripti', 'tripti@example.com', 'Tripti', 5) 
      ON CONFLICT DO NOTHING;
    `);
        console.log('✅ Test user "Tripti" added to DB!');
        process.exit(0);
    } catch (err) {
        console.error('❌ Error seeding user:', err);
        process.exit(1);
    }
}

seed();
