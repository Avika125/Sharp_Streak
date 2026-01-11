import { Router } from 'express';
import * as socialController from '../controllers/social.controller';

const router = Router();

router.get('/search', socialController.searchUsers);
router.post('/friend-request', socialController.sendFriendRequest);
router.get('/friends/:userId', socialController.getFriends);
router.post('/link-streak', socialController.linkStreak);
router.get('/synergy/:userId', socialController.getSynergyStatus);

export default router;
