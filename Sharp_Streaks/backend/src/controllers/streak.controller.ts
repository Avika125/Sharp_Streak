import { Request, Response } from 'express';
import { pool } from '../db';
import { StreakService } from '../services/streak.service';
import { WalletService } from '../services/wallet.service';

const streakService = new StreakService(pool);
const walletService = new WalletService(pool);

export const checkStreakStatus = async (req: Request, res: Response) => {
    const { userId } = req.body;
    if (!userId) return res.status(400).json({ error: 'Missing userId' });

    try {
        const user = await streakService.checkStreak(userId);
        const balance = await walletService.getBalance(userId);
        res.status(200).json({
            current_streak: user.current_streak,
            last_active: user.last_active_date,
            coins: balance
        });
    } catch (error: any) {
        console.error('❌ Error in checkStreakStatus:', error.message);
        res.status(500).json({ error: error.message });
    }
};

export const completeDailyTask = async (req: Request, res: Response) => {
    const { userId } = req.body;
    if (!userId) return res.status(400).json({ error: 'Missing userId' });

    try {
        const user = await streakService.completeTask(userId, walletService);
        const balance = await walletService.getBalance(userId);
        res.status(200).json({
            message: 'Task completed! Coins earned.',
            streak: user.current_streak,
            coins: balance
        });
    } catch (error: any) {
        console.error('❌ Error in completeDailyTask:', error.message);
        if (error.message.includes('already completed')) {
            res.status(400).json({ error: error.message });
        } else {
            res.status(500).json({ error: error.message });
        }
    }
};
