import { Pool } from 'pg';

export class SocialService {
    private pool: Pool;

    constructor(pool: Pool) {
        this.pool = pool;
    }

    // Find users by username or email
    async searchUsers(query: string, currentUserId: string): Promise<any[]> {
        const res = await this.pool.query(
            `SELECT id, firebase_uid, username, email FROM users 
       WHERE (username ILIKE $1 OR email ILIKE $1) 
       AND firebase_uid != $2 
       LIMIT 10`,
            [`%${query}%`, currentUserId]
        );
        return res.rows;
    }

    // Send friend request
    async sendFriendRequest(fromUid: string, toUid: string): Promise<any> {
        const fromUser = await this.pool.query('SELECT id FROM users WHERE firebase_uid = $1', [fromUid]);
        const toUser = await this.pool.query('SELECT id FROM users WHERE firebase_uid = $1', [toUid]);

        if (!fromUser.rows[0] || !toUser.rows[0]) throw new Error('User not found');

        const u1 = fromUser.rows[0].id;
        const u2 = toUser.rows[0].id;
        const [id1, id2] = u1 < u2 ? [u1, u2] : [u2, u1];

        const res = await this.pool.query(
            `INSERT INTO friendships (user_id_1, user_id_2, status) 
       VALUES ($1, $2, 'pending') 
       ON CONFLICT (user_id_1, user_id_2) DO NOTHING 
       RETURNING *`,
            [id1, id2]
        );
        return res.rows[0] || { message: 'Request already exists' };
    }

    // Get friends list
    async getFriends(userId: string): Promise<any[]> {
        const user = await this.pool.query('SELECT id FROM users WHERE firebase_uid = $1', [userId]);
        if (!user.rows[0]) throw new Error('User not found');

        const uid = user.rows[0].id;
        const res = await this.pool.query(
            `SELECT f.id as friendship_id, f.status, 
              u.username, u.email, u.firebase_uid, u.current_streak
       FROM friendships f
       JOIN users u ON (f.user_id_1 = u.id OR f.user_id_2 = u.id)
       WHERE (f.user_id_1 = $1 OR f.user_id_2 = $1)
       AND u.id != $1`,
            [uid]
        );
        return res.rows;
    }

    // Link streak with a friend for today
    async linkStreak(userId: string, friendUid: string): Promise<any> {
        const user = await this.pool.query('SELECT id FROM users WHERE firebase_uid = $1', [userId]);
        const friend = await this.pool.query('SELECT id FROM users WHERE firebase_uid = $1', [friendUid]);

        if (!user.rows[0] || !friend.rows[0]) throw new Error('User not found');

        const u1 = user.rows[0].id;
        const u2 = friend.rows[0].id;
        const [id1, id2] = u1 < u2 ? [u1, u2] : [u2, u1];

        const res = await this.pool.query(
            `INSERT INTO synergy_links (user_id_1, user_id_2, link_date) 
       VALUES ($1, $2, CURRENT_DATE) 
       ON CONFLICT DO NOTHING 
       RETURNING *`,
            [id1, id2]
        );
        return res.rows[0] || { message: 'Already linked for today' };
    }

    // Get active synergy link for today
    async getActiveSynergy(userId: string): Promise<any> {
        const user = await this.pool.query('SELECT id FROM users WHERE firebase_uid = $1', [userId]);
        if (!user.rows[0]) return null;

        const uid = user.rows[0].id;
        const res = await this.pool.query(
            `SELECT sl.*, u.username as friend_name 
       FROM synergy_links sl
       JOIN users u ON (sl.user_id_1 = u.id OR sl.user_id_2 = u.id)
       WHERE (sl.user_id_1 = $1 OR sl.user_id_2 = $1)
       AND sl.link_date = CURRENT_DATE
       AND u.id != $1`,
            [uid]
        );
        return res.rows[0] || null;
    }
}
