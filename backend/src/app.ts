import express from 'express';
import cors from 'cors';
import path from 'path';
import { errorHandler } from './middleware/errorHandler';
import { registerRoutes } from './routes/index';
import config from './config/index';

const app = express();

// ─── Core Middleware ──────────────────────────────────
app.use(cors({ origin: config.CORS_ORIGIN, credentials: true }));
app.use(express.json());

// ─── Static Files (uploads) ──────────────────────────
app.use('/uploads', express.static(config.UPLOAD_DIR));

// ─── Routes ──────────────────────────────────────────
registerRoutes(app);

// ─── Global Error Handler (must be last) ─────────────
app.use(errorHandler);

export default app;
