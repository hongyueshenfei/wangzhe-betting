import { Router } from 'express';
import { teamsController } from '../controllers/teams.controller';
import { authRequired } from '../middleware/auth';
import { adminOnly } from '../middleware/admin';

const router = Router();

// Public routes
router.get('/', teamsController.getList);
router.get('/:id', teamsController.getById);

// Admin routes
router.post('/', authRequired, adminOnly, teamsController.create);
router.put('/:id', authRequired, adminOnly, teamsController.update);
router.delete('/:id', authRequired, adminOnly, teamsController.delete);

export default router;
