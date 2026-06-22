import { Router } from 'express';
import { authController } from '../controllers/auth.controller';
import { authRequired } from '../middleware/auth.middleware';

const router = Router();

// Public routes
router.post('/register', authController.register);
router.post('/login', authController.login);

// Protected routes
router.get('/me', authRequired, authController.getMe);

export default router;
