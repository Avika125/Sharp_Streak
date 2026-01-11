import { Router } from 'express';
import * as forgeController from '../controllers/forge.controller';

const router = Router();

router.get('/status/:userId', forgeController.getStatus);
router.post('/start', forgeController.startForge);
router.post('/claim', forgeController.claimCrystal);

export default router;
