import { Router } from 'express';
import { leaderboardController } from '../controllers/leaderboard.controller';

const router = Router();

// Public routes
router.get('/users', leaderboardController.getUserLeaderboard);
router.get('/teams', leaderboardController.getTeamLeaderboard);

export default router;
