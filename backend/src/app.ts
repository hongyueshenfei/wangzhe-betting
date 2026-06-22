import express from 'express';
import cors from 'cors';
import path from 'path';
import fs from 'fs';
import { errorHandler } from './middleware/errorHandler';
import { registerRoutes } from './routes/index';
import config from './config/index';

const app = express();

// ─── Core Middleware ──────────────────────────────────
app.use(cors({ origin: true, credentials: true }));
app.use(express.json());

// ─── Static Files (uploads) ──────────────────────────
app.use('/uploads', express.static(config.UPLOAD_DIR));

// ─── Static Files (frontend build) ───────────────────
const frontendDist = path.join(__dirname, '..', '..', 'frontend', 'dist');

// ─── Routes ──────────────────────────────────────────
registerRoutes(app);

// ─── Serve Frontend Build (SPA fallback — must be after routes) ──
if (fs.existsSync(frontendDist)) {
  app.use(express.static(frontendDist));
  app.get('*', (_req, res) => {
    res.sendFile(path.join(frontendDist, 'index.html'));
  });
}

// ─── Global Error Handler (must be last) ─────────────
app.use(errorHandler);

export default app;
