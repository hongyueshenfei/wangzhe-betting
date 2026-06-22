import { Router } from 'express';
import { matchesController } from '../controllers/matches.controller';
import { authRequired, authOptional } from '../middleware/auth.middleware';
import { adminOnly } from '../middleware/admin.middleware';

const router = Router();

// Public routes
router.get('/', matchesController.getList);
router.get('/:id', authOptional, matchesController.getById);

// Admin routes
router.post('/generate', authRequired, adminOnly, matchesController.generateMatches);
router.post('/generate-knockout', authRequired, adminOnly, matchesController.generateKnockoutMatches);
router.put('/:id', authRequired, adminOnly, matchesController.updateResult);
router.patch('/:id/time', authRequired, adminOnly, matchesController.updateMatchTime);
router.put('/:id/forfeit', authRequired, adminOnly, matchesController.forfeitMatch);

export default router;
