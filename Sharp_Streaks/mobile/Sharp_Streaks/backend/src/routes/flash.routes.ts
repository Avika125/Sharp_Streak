import { Router } from 'express';
import * as flashController from '../controllers/flash.controller';

const router = Router();

router.get('/active', flashController.getActiveChallenge);
router.post('/submit', flashController.submitFlashAttempt);
router.get('/leaderboard/:sessionId', flashController.getFlashLeaderboard);
router.post('/trigger-test', flashController.triggerSharpHour);

export default router;
