import cron from 'node-cron';
import { Pool } from 'pg';
import { NotificationService } from './notification.service';

export class SchedulerService {
    private pool: Pool;
    private notificationService: NotificationService;

    constructor(pool: Pool) {
        this.pool = pool;
        this.notificationService = new NotificationService(pool);
    }

    // Start all scheduled jobs
    start() {
        console.log('📅 Starting scheduler service...');

        // Daily reminder at 8 PM (20:00)
        cron.schedule('0 20 * * *', async () => {
            console.log('⏰ Running daily reminder job (8 PM)');
            await this.notificationService.sendDailyReminders();
        });

        // Streak warning at 10 PM (22:00) - 2 hours before midnight
        cron.schedule('0 22 * * *', async () => {
            console.log('⚠️ Running streak warning job (10 PM)');
            await this.sendStreakWarnings();
        });

        console.log('✅ Scheduler service started');
    }

    private async sendStreakWarnings() {
        try {
            // Find users with active streaks who haven't completed today
            const result = await this.pool.query(
                `SELECT firebase_uid FROM users 
         WHERE current_streak > 0 
         AND fcm_token IS NOT NULL 
         AND DATE(last_active_date) < CURRENT_DATE`
            );

            console.log(`Found ${result.rows.length} users at risk of losing their streak`);

            for (const user of result.rows) {
                await this.notificationService.sendToUser(
                    user.firebase_uid,
                    '⚠️ Streak Warning!',
                    'You have 2 hours left to complete today\'s challenge. Don\'t lose your streak!'
                );
            }
        } catch (error) {
            console.error('Error sending streak warnings:', error);
        }
    }
}
