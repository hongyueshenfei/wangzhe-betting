import { Router } from 'express';
import { oddsController } from '../controllers/odds.controller';
import { authRequired } from '../middleware/auth';
import { adminOnly } from '../middleware/admin';

const router = Router();

// Public route
router.get('/:matchId', oddsController.getOdds);

// Admin route
router.put('/:matchId', authRequired, adminOnly, oddsController.updateOdds);

export default router;
