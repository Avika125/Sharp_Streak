const { Pool } = require('pg');
const path = require('path');
const dotenv = require('dotenv');

dotenv.config({ path: path.join(__dirname, '../../.env') });

const pool = new Pool({
    connectionString: process.env.DATABASE_URL
});

const items = [
    {
        name: "Streak Freeze",
        type: "utility",
        price: 150,
        description: "Saves your streak if you miss a day. Auto-activates on reset.",
        icon: "snow"
    },
    {
        name: "Golden Username",
        type: "cosmetic",
        price: 300,
        description: "Makes your name shine gold on the future leaderboards.",
        icon: "star"
    },
    {
        name: "Double XP Hour",
        type: "utility",
        price: 100,
        description: "Earn 2x coins for every task completed in the next hour.",
        icon: "flash"
    }
];

async function seedShopItems() {
    try {
        for (const item of items) {
            await pool.query(
                'INSERT INTO shop_items (name, type, price, description, icon) VALUES ($1, $2, $3, $4, $5)',
                [item.name, item.type, item.price, item.description, item.icon]
            );
        }
        console.log('✅ Shadow Shop items seeded successfully');
    } catch (err) {
        console.error('❌ Error seeding shop items:', err);
    } finally {
        await pool.end();
    }
}

seedShopItems();
