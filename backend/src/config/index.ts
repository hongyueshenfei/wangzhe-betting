import path from 'path';

/** Centralized configuration — all values come from environment with defaults. */
const config = {
  // Server
  PORT: parseInt(process.env.PORT || '3001', 10),

  // JWT
  JWT_SECRET: process.env.JWT_SECRET || 'wangzhe_betting_dev_secret_key_2025',
  JWT_EXPIRES_IN: process.env.JWT_EXPIRES_IN || '7d',

  // Database
  DATABASE_URL: process.env.DATABASE_URL || 'file:./dev.db',

  // Upload
  UPLOAD_DIR: process.env.UPLOAD_DIR || path.join(__dirname, '..', '..', 'uploads'),

  // CORS
  CORS_ORIGIN: process.env.CORS_ORIGIN || 'http://localhost:5173',
} as const;

export default config;
