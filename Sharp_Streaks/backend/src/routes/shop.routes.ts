import { Router } from 'express';
import * as shopController from '../controllers/shop.controller';

const router = Router();

router.get('/status', shopController.getShopStatus);
router.post('/buy', shopController.buyItem);
router.get('/inventory/:userId', shopController.getInventory);
router.post('/trigger-test', shopController.triggerShopTest);

export default router;
