const { Pool } = require('pg');
const path = require('path');
const dotenv = require('dotenv');

dotenv.config({ path: path.join(__dirname, '../../.env') });

const pool = new Pool({
    connectionString: process.env.DATABASE_URL
});

const challenges = [
    {
        question: "Which of the following is a key feature of Gen Z's digital behavior?",
        options: JSON.stringify(["Preference for long-form content", "Value for authenticity and transparency", "Slow adaptation to new technology", "Low engagement with social media"]),
        correct_index: 1,
        points: 50
    },
    {
        question: "In productivity psychology, what is the 'Pomodoro Technique' named after?",
        options: JSON.stringify(["A scientist", "A timer shaped like a tomato", "A city in Italy", "A famous book"]),
        correct_index: 1,
        points: 50
    },
    {
        question: "What is the primary benefit of maintaining a daily habit 'streak'?",
        options: JSON.stringify(["Earning more money", "Reducing brain size", "Building neural pathways through repetition", "Increasing social anxiety"]),
        correct_index: 2,
        points: 50
    }
];

async function seedFlashChallenges() {
    try {
        for (const c of challenges) {
            await pool.query(
                'INSERT INTO flash_challenges (question, options, correct_index, points) VALUES ($1, $2, $3, $4)',
                [c.question, c.options, c.correct_index, c.points]
            );
        }
        console.log('✅ Flash challenges seeded successfully');
    } catch (err) {
        console.error('❌ Error seeding flash challenges:', err);
    } finally {
        await pool.end();
    }
}

seedFlashChallenges();
