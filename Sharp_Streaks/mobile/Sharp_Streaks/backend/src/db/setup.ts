const { Pool } = require('pg');
const fs = require('fs');
const path = require('path');
const dotenv = require('dotenv');

dotenv.config({ path: path.join(__dirname, '../../.env') });

const pool = new Pool({
    connectionString: process.env.DATABASE_URL
});

async function setupDatabase() {
    try {
        const schemaSql = fs.readFileSync(path.join(__dirname, 'schema.sql'), 'utf8');
        await pool.query(schemaSql);
        console.log('✅ Database schema applied successfully');
    } catch (err) {
        console.error('❌ Error applying schema:', err);
    } finally {
        await pool.end();
    }
}

setupDatabase();
