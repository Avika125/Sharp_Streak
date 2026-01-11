import { Pool } from 'pg';
import { WalletService } from './wallet.service';

export class ForgeService {
    constructor(private pool: Pool) { }

    async getCrystalStatus(userId: string) {
        const query = `
      SELECT * FROM user_crystals 
      WHERE user_id = (SELECT id FROM users WHERE firebase_uid = $1)
      AND status = 'active'
      LIMIT 1;
    `;
        const result = await this.pool.query(query, [userId]);
        return result.rows[0];
    }

    async startForge(userId: string, amount: number, walletService: WalletService) {
        // 1. Check if user has enough coins
        const balance = await walletService.getBalance(userId);
        if (balance < amount) {
            throw new Error('Insufficient coins to start Forge');
        }

        // 2. Check if active crystal exists
        const existing = await this.getCrystalStatus(userId);
        if (existing) {
            throw new Error('You already have an active crystal in the Forge!');
        }

        // 3. Deduct coins
        await walletService.addCoins(userId, -amount, 'Staked in Crystal Forge 💎');

        // 4. Create crystal
        const query = `
      INSERT INTO user_crystals (user_id, staked_amount, rarity, stage)
      VALUES ((SELECT id FROM users WHERE firebase_uid = $1), $2, $3, 1)
      RETURNING *;
    `;

        let rarity = 'common';
        if (amount >= 500) rarity = 'legendary';
        else if (amount >= 250) rarity = 'epic';
        else if (amount >= 100) rarity = 'rare';

        const result = await this.pool.query(query, [userId, amount, rarity]);
        return result.rows[0];
    }

    async stokeFire(userId: string) {
        const crystal = await this.getCrystalStatus(userId);
        if (!crystal) return null;

        // Logic: If task done within 4 hours of day start (approx 8AM - 12PM), grow faster
        // For now, let's just grow it if they complete their task
        const now = new Date();
        const lastStoked = crystal.last_stoked_at ? new Date(crystal.last_stoked_at) : null;

        if (lastStoked && lastStoked.toDateString() === now.toDateString()) {
            return crystal; // Already stoked today
        }

        const newProgress = crystal.evolution_progress + 20; // 5 tasks to mature
        let newStage = crystal.stage;
        let status = 'active';

        if (newProgress >= 100) {
            status = 'matured';
            newStage = Math.min(crystal.stage + 1, 5);
            // Payout in controller/service
        }

        const query = `
      UPDATE user_crystals 
      SET evolution_progress = $1, stage = $2, status = $3, last_stoked_at = NOW(), updated_at = NOW()
      WHERE id = $4
      RETURNING *;
    `;
        const result = await this.pool.query(query, [newProgress >= 100 ? 0 : newProgress, newStage, status, crystal.id]);
        return result.rows[0];
    }

    async claimMatured(userId: string, walletService: WalletService) {
        const query = `
      SELECT * FROM user_crystals 
      WHERE user_id = (SELECT id FROM users WHERE firebase_uid = $1)
      AND status = 'matured'
      LIMIT 1;
    `;
        const result = await this.pool.query(query, [userId]);
        const crystal = result.rows[0];

        if (!crystal) throw new Error('No matured crystal to claim');

        const bonusMultiplier = 1.2 + (crystal.stage * 0.1); // stage 1 = 1.3x, stage 5 = 1.7x
        const payout = Math.floor(crystal.staked_amount * bonusMultiplier);

        await walletService.addCoins(userId, payout, `Claimed Matured ${crystal.rarity} Crystal! 💎`);

        const updateQuery = `UPDATE user_crystals SET status = 'claimed' WHERE id = $1`;
        await this.pool.query(updateQuery, [crystal.id]);

        return { payout, crystal };
    }
}
