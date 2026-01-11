import { Router } from 'express';
import { syncUser, updateFcmToken } from '../controllers/auth.controller';

const router = Router();

router.post('/sync', syncUser as any);
router.post('/update-fcm-token', updateFcmToken as any);

export default router;
