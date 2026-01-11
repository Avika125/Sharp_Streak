import { Request, Response } from 'express';
import { Pool } from 'pg';
import { ShopService } from '../services/shop.service';
import { WalletService } from '../services/wallet.service';
import { pool } from '../db';
const shopService = new ShopService(pool);
const walletService = new WalletService(pool);

export const getShopStatus = async (req: Request, res: Response) => {
    try {
        const session = await shopService.getActiveSession();
        const items = await shopService.getItems();
        res.status(200).json({
            isOpen: !!session,
            session,
            items
        });
    } catch (error: any) {
        res.status(500).json({ error: error.message });
    }
};

export const buyItem = async (req: Request, res: Response) => {
    const { userId, itemId } = req.body;
    if (!userId || !itemId) return res.status(400).json({ error: 'Missing userId or itemId' });

    try {
        const result = await shopService.purchaseItem(userId, itemId, walletService);
        res.status(200).json(result);
    } catch (error: any) {
        res.status(400).json({ error: error.message });
    }
};

export const getInventory = async (req: Request, res: Response) => {
    const { userId } = req.params;
    try {
        const inventory = await shopService.getUserInventory(userId);
        res.status(200).json(inventory);
    } catch (error: any) {
        res.status(500).json({ error: error.message });
    }
};

export const triggerShopTest = async (req: Request, res: Response) => {
    try {
        const session = await shopService.startShadowHour();
        res.status(200).json({ message: 'Shadow Shop triggered!', session });
    } catch (error: any) {
        res.status(500).json({ error: error.message });
    }
};
