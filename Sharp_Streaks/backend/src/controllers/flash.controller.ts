import { Request, Response } from 'express';
import { pool } from '../db';
import { FlashChallengeService } from '../services/flash.service';
import { WalletService } from '../services/wallet.service';

const flashService = new FlashChallengeService(pool);
const walletService = new WalletService(pool);

export const getActiveChallenge = async (req: Request, res: Response) => {
    try {
        const session = await flashService.getActiveSession();
        if (!session) {
            return res.status(200).json({ active: false });
        }
        res.status(200).json({ active: true, session });
    } catch (error: any) {
        console.error('Error getting active challenge:', error);
        res.status(500).json({ error: error.message });
    }
};

export const submitFlashAttempt = async (req: Request, res: Response) => {
    const { userId, sessionId, chosenIndex, timeTakenMs } = req.body;
    if (!userId || !sessionId || chosenIndex === undefined || !timeTakenMs) {
        return res.status(400).json({ error: 'Missing required fields' });
    }

    try {
        const result = await flashService.submitAttempt(userId, sessionId, chosenIndex, timeTakenMs, walletService);
        res.status(200).json(result);
    } catch (error: any) {
        console.error('Error submitting flash attempt:', error);
        res.status(500).json({ error: error.message });
    }
};

export const getFlashLeaderboard = async (req: Request, res: Response) => {
    const { sessionId } = req.params;
    if (!sessionId) return res.status(400).json({ error: 'Missing sessionId' });

    try {
        const leaderboard = await flashService.getLeaderboard(sessionId);
        res.status(200).json(leaderboard);
    } catch (error: any) {
        console.error('Error getting flash leaderboard:', error);
        res.status(500).json({ error: error.message });
    }
};

// Manual trigger for testing
export const triggerSharpHour = async (req: Request, res: Response) => {
    try {
        const session = await flashService.startSharpHour();
        res.status(200).json({ message: 'Sharp Hour triggered!', session });
    } catch (error: any) {
        res.status(500).json({ error: error.message });
    }
};
