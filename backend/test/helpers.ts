import { prisma } from '../src/utils/prisma';
import { hashPassword } from '../src/utils/password';
import { INITIAL_COINS } from '../src/utils/constants';

/**
 * Create a test user with default coins.
 */
export async function createTestUser(overrides: {
  id?: number;
  username?: string;
  password?: string;
  coins?: number;
  isBanned?: boolean;
}) {
  const passwordHash = await hashPassword(overrides.password || '123456');
  return prisma.user.create({
    data: {
      username: overrides.username || `test_user_${Date.now()}`,
      passwordHash,
      coins: overrides.coins ?? INITIAL_COINS,
      isBanned: overrides.isBanned ?? false,
    },
  });
}

/**
 * Create a test season.
 */
export async function createTestSeason(overrides?: {
  name?: string;
  status?: 'UPCOMING' | 'ACTIVE' | 'COMPLETED';
}) {
  return prisma.season.create({
    data: {
      name: overrides?.name || `season_${Date.now()}`,
      status: overrides?.status || 'ACTIVE',
      startDate: new Date(),
      endDate: new Date(Date.now() + 86400000 * 30),
      tournamentConfig: JSON.stringify({
        format: 'group_knockout',
        groups: { A: [], B: [] },
      }),
    },
  });
}

/**
 * Create a test team in a given season.
 */
export async function createTestTeam(
  seasonId: number,
  overrides?: { name?: string; abbr?: string },
) {
  const name = overrides?.name || `战队_${Date.now()}`;
  return prisma.team.create({
    data: {
      seasonId,
      name,
      abbr: overrides?.abbr || name.slice(0, 4),
      color: '#FF0000',
      wins: 0,
      losses: 0,
      forfeits: 0,
    },
  });
}

/**
 * Create a test match between two teams in a season.
 */
export async function createTestMatch(
  seasonId: number,
  teamAId: number,
  teamBId: number,
  overrides?: {
    status?: 'UPCOMING' | 'LIVE' | 'COMPLETED' | 'FORFEITED';
    oddsA?: number;
    oddsB?: number;
    betTotalA?: number;
    betTotalB?: number;
    betCountA?: number;
    betCountB?: number;
  },
) {
  return prisma.match.create({
    data: {
      seasonId,
      stage: 'GROUP',
      groupName: 'A',
      round: '1',
      matchOrder: 1,
      teamAId,
      teamBId,
      teamAScore: null,
      teamBScore: null,
      matchTime: new Date(Date.now() + 3600000),
      status: overrides?.status || 'UPCOMING',
      oddsA: overrides?.oddsA ?? 2.0,
      oddsB: overrides?.oddsB ?? 2.0,
      betTotalA: overrides?.betTotalA ?? 0,
      betTotalB: overrides?.betTotalB ?? 0,
      betCountA: overrides?.betCountA ?? 0,
      betCountB: overrides?.betCountB ?? 0,
    },
  });
}

/**
 * Create a test bet.
 */
export async function createTestBet(
  userId: number,
  matchId: number,
  teamId: number,
  overrides?: {
    amount?: number;
    oddsAtBet?: number;
    status?: 'PENDING' | 'WON' | 'LOST' | 'REFUNDED';
  },
) {
  return prisma.bet.create({
    data: {
      userId,
      matchId,
      pickedTeamId: teamId,
      amount: overrides?.amount ?? 10,
      oddsAtBet: overrides?.oddsAtBet ?? 2.0,
      status: overrides?.status || 'PENDING',
    },
  });
}

/**
 * Clean all test data (respecting foreign key order).
 */
export async function cleanDatabase() {
  await prisma.coinTransaction.deleteMany();
  await prisma.championBet.deleteMany();
  await prisma.bet.deleteMany();
  await prisma.match.deleteMany();
  await prisma.team.deleteMany();
  await prisma.season.deleteMany();
  await prisma.user.deleteMany();
}
