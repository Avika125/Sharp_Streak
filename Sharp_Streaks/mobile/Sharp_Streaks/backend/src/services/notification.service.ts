import { messaging } from '../config/firebase-admin.config';
import { Pool } from 'pg';

export class NotificationService {
    private pool: Pool;

    constructor(pool: Pool) {
        this.pool = pool;
    }

    // Send notification to a specific user
    async sendToUser(userId: string, title: string, body: string): Promise<boolean> {
        if (!messaging) {
            console.log('Push notifications disabled (messaging not initialized)');
            return false;
        }

        try {
            // Get user's FCM token
            const result = await this.pool.query(
                'SELECT fcm_token FROM users WHERE firebase_uid = $1',
                [userId]
            );

            if (result.rows.length === 0 || !result.rows[0].fcm_token) {
                console.log(`No FCM token found for user ${userId}`);
                return false;
            }

            const fcmToken = result.rows[0].fcm_token;

            // Send notification
            await messaging.send({
                token: fcmToken,
                notification: {
                    title,
                    body
                },
                data: {
                    type: 'streak_reminder',
                    timestamp: new Date().toISOString()
                }
            });

            console.log(`✅ Notification sent to user ${userId}`);
            return true;
        } catch (error) {
            console.error(`❌ Failed to send notification to user ${userId}:`, error);
            return false;
        }
    }

    // Send batch notifications
    async sendBatch(userIds: string[], title: string, body: string): Promise<void> {
        const promises = userIds.map(userId => this.sendToUser(userId, title, body));
        await Promise.allSettled(promises);
    }

    // Send reminder to users who haven't completed today's challenge
    async sendDailyReminders(): Promise<void> {
        try {
            // Find users who haven't completed today's challenge
            const result = await this.pool.query(
                `SELECT firebase_uid, fcm_token FROM users 
         WHERE fcm_token IS NOT NULL 
         AND DATE(last_active_date) < CURRENT_DATE`
            );

            console.log(`Found ${result.rows.length} users to remind`);

            for (const user of result.rows) {
                if (user.fcm_token) {
                    await this.sendToUser(
                        user.firebase_uid,
                        '🔥 Don\'t Break Your Streak!',
                        'Complete today\'s challenge to keep your streak alive!'
                    );
                }
            }
        } catch (error) {
            console.error('Error sending daily reminders:', error);
        }
    }
}
