import { Router } from 'express';
import { checkinController } from '../controllers/checkin.controller';
import { authRequired } from '../middleware/auth.middleware';

const router = Router();

router.post('/', authRequired, checkinController.checkin);

export default router;
