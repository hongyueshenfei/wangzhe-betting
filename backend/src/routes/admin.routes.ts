import { Router } from 'express';
import { adminController } from '../controllers/admin.controller';
import { authRequired } from '../middleware/auth';
import { adminOnly } from '../middleware/admin';

const router = Router();

// All admin routes require auth + admin role
router.get('/dashboard', authRequired, adminOnly, adminController.getDashboard);
router.get('/users', authRequired, adminOnly, adminController.getUsers);
router.put('/users/:id/ban', authRequired, adminOnly, adminController.banUser);
router.put('/users/:id/unban', authRequired, adminOnly, adminController.unbanUser);
router.put('/users/:id/coins', authRequired, adminOnly, adminController.adjustCoins);
router.post('/users/:id/reset-password', authRequired, adminOnly, adminController.resetPassword);
router.post('/users/batch', authRequired, adminOnly, adminController.batchCreateUsers);

export default router;
