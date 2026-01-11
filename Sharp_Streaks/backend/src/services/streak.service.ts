import { Pool } from 'pg';
import { getStartOfDay, isSameDay } from '../utils/date.utils';

export class StreakService {
    private pool: Pool;

    constructor(pool: Pool) {
        this.pool = pool;
    }

    // Check and maintain user's streak state on login/app open
    async checkStreak(userId: string): Promise<any> {
        const res = await this.pool.query('SELECT * FROM users WHERE firebase_uid = $1', [userId]);
        if (res.rows.length === 0) throw new Error('User not found');

        const user = res.rows[0];
        const lastActive = new Date(user.last_active_date);
        const today = new Date();

        // Calculate days difference
        const startOfLastActive = getStartOfDay(lastActive);
        const startOfToday = getStartOfDay(today);

        const diffTime = Math.abs(startOfToday.getTime() - startOfLastActive.getTime());
        const diffDays = Math.ceil(diffTime / (1000 * 60 * 60 * 24));

        // If gap > 1 day, RESET streak or use STREAK FREEZE
        if (diffDays > 1) {
            // Check for Streak Freeze in inventory
            const freezeRes = await this.pool.query(
                `SELECT ui.id FROM user_inventory ui
                 JOIN shop_items i ON ui.item_id = i.id
                 WHERE ui.user_id = $1 AND i.name = 'Streak Freeze' AND ui.is_used = FALSE
                 LIMIT 1`,
                [user.id]
            );

            if (freezeRes.rows.length > 0) {
                console.log(`🧊 Streak Freeze activated for user ${userId}. Saved streak of ${user.current_streak}.`);
                // Consume the freeze
                await this.pool.query(
                    'UPDATE user_inventory SET is_used = TRUE WHERE id = $1',
                    [freezeRes.rows[0].id]
                );

                // Update last_active_date to "yesterday" so the streak remains valid for "today"
                const yesterday = new Date(today);
                yesterday.setDate(today.getDate() - 1);

                const updateRes = await this.pool.query(
                    'UPDATE users SET last_active_date = $1 WHERE firebase_uid = $2 RETURNING *',
                    [yesterday, userId]
                );
                return updateRes.rows[0];
            }

            console.log(`Streak broken for user ${userId}. Gap: ${diffDays} days.`);
            const updateRes = await this.pool.query(
                'UPDATE users SET current_streak = 0 WHERE firebase_uid = $1 RETURNING *',
                [userId]
            );
            return updateRes.rows[0];
        }

        return user;
    }

    // Called when user COMPLETES the daily challenge
    async completeTask(userId: string, walletService?: any): Promise<any> {
        const user = await this.checkStreak(userId);

        const lastActive = new Date(user.last_active_date);
        const today = new Date();

        if (isSameDay(lastActive, today) && user.current_streak > 0) {
            throw new Error('Task already completed for today');
        }

        // Increment streak
        const newStreak = (user.current_streak || 0) + 1;
        const newLongest = Math.max(newStreak, user.longest_streak || 0);

        const updateRes = await this.pool.query(
            `UPDATE users 
       SET current_streak = $1, 
           longest_streak = $2, 
           last_active_date = NOW(),
           updated_at = NOW() 
       WHERE firebase_uid = $3 
       RETURNING *`,
            [newStreak, newLongest, userId]
        );

        // Award coins (10 base + specific bonuses)
        if (walletService) {
            let bonus = 0;
            let reason = `Streak day ${newStreak}`;

            if (newStreak === 3) {
                bonus = 20;
                reason = "🔥 3-Day Streak Bonus!";
            } else if (newStreak === 7) {
                bonus = 50;
                reason = "🏁 7-Day Week Streak Bonus!";
            } else if (newStreak === 30) {
                bonus = 100;
                reason = "🏆 30-Day Monthly Streak Legend!";
            }

            await walletService.addCoins(userId, 10 + bonus, reason);

            // SYNERGY BONUS CHECK
            const synergyRes = await this.pool.query(
                `SELECT sl.*, u1.last_active_date as u1_last, u2.last_active_date as u2_last
                 FROM synergy_links sl
                 JOIN users u1 ON sl.user_id_1 = u1.id
                 JOIN users u2 ON sl.user_id_2 = u2.id
                 WHERE (sl.user_id_1 = $1 OR sl.user_id_2 = $1)
                 AND sl.link_date = CURRENT_DATE`,
                [user.id]
            );

            if (synergyRes.rows.length > 0) {
                const link = synergyRes.rows[0];
                const bothActiveToday = isSameDay(new Date(link.u1_last), today) &&
                    isSameDay(new Date(link.u2_last), today);

                if (bothActiveToday && !link.is_boosted) {
                    console.log(`🔥 SYNERGY BOOST activated for ${link.user_id_1} and ${link.user_id_2}`);
                    // Award bonus to BOTH
                    await walletService.addCoins(userId, 5, "🤝 Social Synergy Bonus!");

                    // Mark as boosted so it doesn't trigger twice
                    await this.pool.query('UPDATE synergy_links SET is_boosted = TRUE WHERE id = $1', [link.id]);

                    // Award to friend (Need a way to get friend's UID)
                    const friendId = link.user_id_1 === user.id ? link.user_id_2 : link.user_id_1;
                    const friendUidRes = await this.pool.query('SELECT firebase_uid FROM users WHERE id = $1', [friendId]);
                    if (friendUidRes.rows[0]) {
                        await walletService.addCoins(friendUidRes.rows[0].firebase_uid, 5, "🤝 Social Synergy Bonus!");
                    }
                }
            }
        }

        // --- Forge Integration ---
        try {
            const { ForgeService } = await import('./forge.service');
            const forgeService = new ForgeService(this.pool);
            await forgeService.stokeFire(userId);
        } catch (e) {
            console.log('Error stoking forge:', e);
        }

        return updateRes.rows[0];
    }
}
