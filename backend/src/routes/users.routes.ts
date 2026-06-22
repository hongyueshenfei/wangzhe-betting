import { Router } from 'express';
import { usersController } from '../controllers/users.controller';
import { authRequired } from '../middleware/auth.middleware';

const router = Router();

router.get('/me', authRequired, usersController.getMe);
router.put('/me', authRequired, usersController.updateMe);
router.get('/:id', authRequired, usersController.getUserById);

export default router;
