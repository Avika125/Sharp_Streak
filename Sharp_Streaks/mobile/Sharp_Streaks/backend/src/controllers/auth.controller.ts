import { Request, Response } from 'express';
import { pool } from '../db';

export const syncUser = async (req: Request, res: Response) => {
    const { firebase_uid, email, username } = req.body;

    if (!firebase_uid || !email) {
        return res.status(400).json({ error: 'Missing firebase_uid or email' });
    }

    try {
        const query = `
      INSERT INTO users (firebase_uid, email, username)
      VALUES ($1, $2, $3)
      ON CONFLICT (firebase_uid) 
      DO UPDATE SET email = EXCLUDED.email, updated_at = NOW()
      RETURNING *;
    `;
        const values = [firebase_uid, email, username || null];
        const result = await pool.query(query, values);

        res.status(200).json({ message: 'User synced successfully', user: result.rows[0] });
    } catch (error) {
        console.error('Error syncing user:', error);
        res.status(500).json({ error: 'Internal server error' });
    }
};

export const updateFcmToken = async (req: Request, res: Response) => {
    const { userId, fcmToken } = req.body;

    if (!userId || !fcmToken) {
        return res.status(400).json({ error: 'Missing userId or fcmToken' });
    }

    try {
        await pool.query(
            'UPDATE users SET fcm_token = $1, updated_at = NOW() WHERE firebase_uid = $2',
            [fcmToken, userId]
        );
        res.status(200).json({ message: 'FCM token updated successfully' });
    } catch (error) {
        console.error('Error updating FCM token:', error);
        res.status(500).json({ error: 'Internal server error' });
    }
};
