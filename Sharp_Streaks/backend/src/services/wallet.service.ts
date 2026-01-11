import { Pool } from 'pg';

export class WalletService {
    private pool: Pool;

    constructor(pool: Pool) {
        this.pool = pool;
    }

    // Add coins to user wallet and log transaction
    async addCoins(userId: string, amount: number, reason: string): Promise<any> {
        const client = await this.pool.connect();
        try {
            await client.query('BEGIN');

            // Get user's internal ID
            const userRes = await client.query(
                'SELECT id, total_coins FROM users WHERE firebase_uid = $1',
                [userId]
            );

            if (userRes.rows.length === 0) {
                throw new Error('User not found');
            }

            const user = userRes.rows[0];
            const newBalance = (user.total_coins || 0) + amount;

            // Update user's coin balance
            await client.query(
                'UPDATE users SET total_coins = $1, updated_at = NOW() WHERE id = $2',
                [newBalance, user.id]
            );

            // Log transaction
            await client.query(
                'INSERT INTO transactions (user_id, amount, reason) VALUES ($1, $2, $3)',
                [user.id, amount, reason]
            );

            await client.query('COMMIT');
            return { balance: newBalance, amount, reason };
        } catch (error) {
            await client.query('ROLLBACK');
            throw error;
        } finally {
            client.release();
        }
    }

    // Get current balance
    async getBalance(userId: string): Promise<number> {
        const res = await this.pool.query(
            'SELECT total_coins FROM users WHERE firebase_uid = $1',
            [userId]
        );

        if (res.rows.length === 0) throw new Error('User not found');
        return res.rows[0].total_coins || 0;
    }

    // Get transaction history
    async getTransactions(userId: string, limit: number = 10): Promise<any[]> {
        const res = await this.pool.query(
            `SELECT t.* FROM transactions t
       JOIN users u ON t.user_id = u.id
       WHERE u.firebase_uid = $1
       ORDER BY t.created_at DESC
       LIMIT $2`,
            [userId, limit]
        );
        return res.rows;
    }
}
