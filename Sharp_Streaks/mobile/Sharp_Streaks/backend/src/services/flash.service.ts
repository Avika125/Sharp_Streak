import { Pool } from 'pg';

export class FlashChallengeService {
    private pool: Pool;

    constructor(pool: Pool) {
        this.pool = pool;
    }

    // Get current active session if it exists
    async getActiveSession(): Promise<any> {
        const query = `
      SELECT fs.*, fc.question, fc.options, fc.points 
      FROM flash_sessions fs
      JOIN flash_challenges fc ON fs.challenge_id = fc.id
      WHERE fs.is_active = TRUE 
      AND NOW() BETWEEN fs.start_time AND fs.end_time
      LIMIT 1
    `;
        const res = await this.pool.query(query);
        return res.rows[0] || null;
    }

    // Start a new Sharp Hour
    async startSharpHour(): Promise<any> {
        // 1. Deactivate old sessions
        await this.pool.query('UPDATE flash_sessions SET is_active = FALSE');

        // 2. Pick a random challenge
        const challengeRes = await this.pool.query(
            'SELECT id FROM flash_challenges ORDER BY RANDOM() LIMIT 1'
        );
        if (challengeRes.rows.length === 0) throw new Error('No challenges in pool');

        const challengeId = challengeRes.rows[0].id;
        const startTime = new Date();
        const endTime = new Date(startTime.getTime() + 60 * 60 * 1000); // 1 hour duration

        // 3. Create session
        const res = await this.pool.query(
            `INSERT INTO flash_sessions (challenge_id, start_time, end_time) 
       VALUES ($1, $2, $3) RETURNING *`,
            [challengeId, startTime, endTime]
        );

        return res.rows[0];
    }

    // Submit attempt
    async submitAttempt(userId: string, sessionId: string, chosenIndex: number, timeTakenMs: number, walletService: any): Promise<any> {
        // 1. Get session and challenge
        const sessionRes = await this.pool.query(
            `SELECT fs.*, fc.correct_index, fc.points 
       FROM flash_sessions fs
       JOIN flash_challenges fc ON fs.challenge_id = fc.id
       WHERE fs.id = $1 AND fs.is_active = TRUE`,
            [sessionId]
        );

        if (sessionRes.rows.length === 0) throw new Error('Invalid or expired session');
        const session = sessionRes.rows[0];

        // 2. Check if user already attempted
        const userRes = await this.pool.query(
            'SELECT id FROM users WHERE firebase_uid = $1',
            [userId]
        );
        if (userRes.rows.length === 0) throw new Error('User not found');
        const dbUserId = userRes.rows[0].id;

        const attemptCheck = await this.pool.query(
            'SELECT id FROM flash_attempts WHERE user_id = $1 AND session_id = $2',
            [dbUserId, sessionId]
        );
        if (attemptCheck.rows.length > 0) throw new Error('Already attempted this challenge');

        // 3. Validate correctness
        const isCorrect = chosenIndex === session.correct_index;

        // 4. Record attempt
        const res = await this.pool.query(
            `INSERT INTO flash_attempts (user_id, session_id, is_correct, time_taken_ms) 
       VALUES ($1, $2, $3, $4) RETURNING *`,
            [dbUserId, sessionId, isCorrect, timeTakenMs]
        );

        // 5. Award coins if correct
        if (isCorrect && walletService) {
            await walletService.addCoins(userId, session.points, 'Correct Flash Challenge answer! 🔥');
        }

        return {
            attempt: res.rows[0],
            isCorrect,
            points: isCorrect ? session.points : 0
        };
    }

    // Get session leaderboard
    async getLeaderboard(sessionId: string): Promise<any[]> {
        const query = `
      SELECT u.username, fa.time_taken_ms, fa.is_correct
      FROM flash_attempts fa
      JOIN users u ON fa.user_id = u.id
      WHERE fa.session_id = $1 AND fa.is_correct = TRUE
      ORDER BY fa.time_taken_ms ASC
      LIMIT 10
    `;
        const res = await this.pool.query(query, [sessionId]);
        return res.rows;
    }
}
