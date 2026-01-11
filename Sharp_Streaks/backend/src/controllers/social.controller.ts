import { Request, Response } from 'express';
import { Pool } from 'pg';
import { SocialService } from '../services/social.service';
import { pool } from '../db';
const socialService = new SocialService(pool);

export const searchUsers = async (req: Request, res: Response) => {
    const { query, currentUserId } = req.query;
    try {
        const users = await socialService.searchUsers(query as string, currentUserId as string);
        res.status(200).json(users);
    } catch (error: any) {
        res.status(500).json({ error: error.message });
    }
};

export const sendFriendRequest = async (req: Request, res: Response) => {
    const { fromUid, toUid } = req.body;
    try {
        const result = await socialService.sendFriendRequest(fromUid, toUid);
        res.status(201).json(result);
    } catch (error: any) {
        res.status(400).json({ error: error.message });
    }
};

export const getFriends = async (req: Request, res: Response) => {
    const { userId } = req.params;
    try {
        const friends = await socialService.getFriends(userId);
        res.status(200).json(friends);
    } catch (error: any) {
        res.status(500).json({ error: error.message });
    }
};

export const linkStreak = async (req: Request, res: Response) => {
    const { userId, friendUid } = req.body;
    try {
        const result = await socialService.linkStreak(userId, friendUid);
        res.status(200).json(result);
    } catch (error: any) {
        res.status(400).json({ error: error.message });
    }
};

export const getSynergyStatus = async (req: Request, res: Response) => {
    const { userId } = req.params;
    try {
        const status = await socialService.getActiveSynergy(userId);
        res.status(200).json(status);
    } catch (error: any) {
        res.status(500).json({ error: error.message });
    }
};
