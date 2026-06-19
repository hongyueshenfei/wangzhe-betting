import { Router } from 'express';
import { transactionsController } from '../controllers/transactions.controller';
import { authRequired } from '../middleware/auth';

const router = Router();

// All routes require auth
router.use(authRequired);

// GET /api/transactions/my
router.get('/my', (req, res) => transactionsController.getMyTransactions(req, res));

export default router;
