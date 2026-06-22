import { Router } from 'express';
import { uploadController } from '../controllers/upload.controller';
import { authRequired } from '../middleware/auth.middleware';
import { adminOnly } from '../middleware/admin.middleware';

const router = Router();

// Admin-only file upload (team logos)
router.post('/upload', authRequired, adminOnly, uploadController.upload);

export default router;
