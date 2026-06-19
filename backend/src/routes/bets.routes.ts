import { Router } from 'express';
import { betsController } from '../controllers/bets.controller';
import { authRequired } from '../middleware/auth';

const router = Router();

// All bet routes require authentication
router.post('/', authRequired, betsController.placeBet);
router.get('/mine', authRequired, betsController.getMyBets);
router.post('/champion', authRequired, betsController.placeChampionBet);
router.get('/champion/mine', authRequired, betsController.getMyChampionBets);
router.get('/champion/pool/:seasonId', betsController.getChampionPoolStats);

export default router;
