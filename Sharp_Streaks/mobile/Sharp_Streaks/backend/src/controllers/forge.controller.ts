import { Request, Response } from 'express';
import { pool } from '../db';
import { ForgeService } from '../services/forge.service';
import { WalletService } from '../services/wallet.service';

const forgeService = new ForgeService(pool);
const walletService = new WalletService(pool);

export const getStatus = async (req: Request, res: Response) => {
    const { userId } = req.params;
    try {
        const crystal = await forgeService.getCrystalStatus(userId);
        res.status(200).json(crystal || { message: 'No active crystal' });
    } catch (error: any) {
        res.status(500).json({ error: error.message });
    }
};

export const startForge = async (req: Request, res: Response) => {
    const { userId, amount } = req.body;
    try {
        const crystal = await forgeService.startForge(userId, amount, walletService);
        res.status(201).json(crystal);
    } catch (error: any) {
        res.status(400).json({ error: error.message });
    }
};

export const claimCrystal = async (req: Request, res: Response) => {
    const { userId } = req.body;
    try {
        const result = await forgeService.claimMatured(userId, walletService);
        res.status(200).json(result);
    } catch (error: any) {
        res.status(400).json({ error: error.message });
    }
};
