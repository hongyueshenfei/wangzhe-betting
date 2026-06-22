import { Router } from 'express';
import { teamsController } from '../controllers/teams.controller';
import { authRequired } from '../middleware/auth.middleware';
import { adminOnly } from '../middleware/admin.middleware';

const router = Router();

// Public routes
router.get('/', teamsController.getList);
router.get('/:id', teamsController.getById);

// Admin routes
router.post('/', authRequired, adminOnly, teamsController.create);
router.put('/:id', authRequired, adminOnly, teamsController.update);
router.delete('/:id', authRequired, adminOnly, teamsController.delete);

export default router;
