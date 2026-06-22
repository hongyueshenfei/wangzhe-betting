import { Router } from 'express';
import { seasonsController } from '../controllers/seasons.controller';
import { authRequired } from '../middleware/auth.middleware';
import { adminOnly } from '../middleware/admin.middleware';

const router = Router();

// Public routes
router.get('/', seasonsController.getList);
router.get('/:id', seasonsController.getById);

// Admin routes
router.post('/', authRequired, adminOnly, seasonsController.create);
router.put('/:id', authRequired, adminOnly, seasonsController.update);
router.put('/:id/champion', authRequired, adminOnly, seasonsController.setChampion);

export default router;
