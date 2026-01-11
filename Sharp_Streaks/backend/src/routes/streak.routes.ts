import { Router } from 'express';
import { checkStreakStatus, completeDailyTask } from '../controllers/streak.controller';

const router = Router();

router.post('/status', checkStreakStatus as any);
router.post('/complete', completeDailyTask as any);

export default router;
