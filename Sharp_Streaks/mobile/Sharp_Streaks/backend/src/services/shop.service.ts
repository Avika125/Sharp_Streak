import { Pool } from 'pg';

export class ShopService {
    private pool: Pool;

    constructor(pool: Pool) {
        this.pool = pool;
    }

    // Get current active shop session
    async getActiveSession(): Promise<any> {
        const query = `
      SELECT * FROM shop_sessions 
      WHERE is_active = TRUE 
      AND NOW() BETWEEN start_time AND end_time
      LIMIT 1
    `;
        const res = await this.pool.query(query);
        return res.rows[0] || null;
    }

    // Get available items
    async getItems(): Promise<any[]> {
        const res = await this.pool.query('SELECT * FROM shop_items');
        return res.rows;
    }

    // Start a new Shadow Hour (15 minutes)
    async startShadowHour(): Promise<any> {
        await this.pool.query('UPDATE shop_sessions SET is_active = FALSE');

        const startTime = new Date();
        const endTime = new Date(startTime.getTime() + 15 * 60 * 1000); // 15 mins

        const res = await this.pool.query(
            'INSERT INTO shop_sessions (start_time, end_time) VALUES ($1, $2) RETURNING *',
            [startTime, endTime]
        );
        return res.rows[0];
    }

    // Purchase item
    async purchaseItem(userId: string, itemId: string, walletService: any): Promise<any> {
        // 1. Check if shop is active
        const session = await this.getActiveSession();
        if (!session) throw new Error('Shadow Shop is currently closed');

        // 2. Get item details
        const itemRes = await this.pool.query('SELECT * FROM shop_items WHERE id = $1', [itemId]);
        if (itemRes.rows.length === 0) throw new Error('Item not found');
        const item = itemRes.rows[0];

        // 3. Get user details
        const userRes = await this.pool.query('SELECT id, total_coins FROM users WHERE firebase_uid = $1', [userId]);
        if (userRes.rows.length === 0) throw new Error('User not found');
        const user = userRes.rows[0];

        // 4. Check balance
        if (user.total_coins < item.price) {
            throw new Error(`Insufficient coins. Need ${item.price}, have ${user.total_coins}`);
        }

        // 5. Deduct coins via wallet service
        await walletService.addCoins(userId, -item.price, `Purchased ${item.name} from Shadow Shop 👻`);

        // 6. Add to inventory
        const inventoryRes = await this.pool.query(
            `INSERT INTO user_inventory (user_id, item_id, quantity) 
       VALUES ($1, $2, 1) 
       ON CONFLICT (user_id, item_id) DO UPDATE SET quantity = user_inventory.quantity + 1
       RETURNING *`,
            [user.id, item.id]
        );

        return {
            success: true,
            item,
            inventory: inventoryRes.rows[0]
        };
    }

    // Get user inventory
    async getUserInventory(userId: string): Promise<any[]> {
        const query = `
      SELECT ui.*, i.name, i.type, i.icon, i.description 
      FROM user_inventory ui
      JOIN shop_items i ON ui.item_id = i.id
      JOIN users u ON ui.user_id = u.id
      WHERE u.firebase_uid = $1 AND ui.is_used = FALSE
    `;
        const res = await this.pool.query(query, [userId]);
        return res.rows;
    }
}
