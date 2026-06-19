import { Application } from 'express';
import authRoutes from './auth.routes';
import checkinRoutes from './checkin.routes';
import usersRoutes from './users.routes';
import seasonsRoutes from './seasons.routes';
import teamsRoutes from './teams.routes';
import matchesRoutes from './matches.routes';
import betsRoutes from './bets.routes';
import oddsRoutes from './odds.routes';
import leaderboardRoutes from './leaderboard.routes';
import adminRoutes from './admin.routes';
import uploadRoutes from './upload.routes';
import transactionsRoutes from './transactions.routes';

/**
 * Register all API routes on the Express app.
 */
export function registerRoutes(app: Application): void {
  app.use('/api/auth', authRoutes);
  app.use('/api/checkin', checkinRoutes);
  app.use('/api/users', usersRoutes);
  app.use('/api/seasons', seasonsRoutes);
  app.use('/api/teams', teamsRoutes);
  app.use('/api/matches', matchesRoutes);
  app.use('/api/bets', betsRoutes);
  app.use('/api/odds', oddsRoutes);
  app.use('/api/leaderboard', leaderboardRoutes);
  app.use('/api/admin', adminRoutes);
  app.use('/api', uploadRoutes);
  app.use('/api/transactions', transactionsRoutes);
}
