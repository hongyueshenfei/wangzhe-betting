import { PrismaClient, MatchStage, MatchStatus } from '@prisma/client';
import { AppError } from './auth.service';
import { DEFAULT_PAGE, DEFAULT_LIMIT } from '../utils/constants';
import type { GenerateMatchesDTO, UpdateMatchResultDTO } from '../types/index';

const prisma = new PrismaClient();

/**
 * Generate round-robin pairings using the circle method.
 * For odd team count, a "bye" is added — matches against bye are excluded.
 * Each team plays at most once per round, evenly distributed.
 */
function generateRoundRobinSchedule(teams: Array<{ id: number }>): Array<[typeof teams[0], typeof teams[0]]> {
  const n = teams.length;
  const hasBye = n % 2 !== 0;
  const list = hasBye
    ? [...teams, { id: -1 } as any]
    : teams.slice();
  const N = list.length; // even number
  const rounds = N - 1;
  const mid = N / 2;
  const schedule: Array<[typeof teams[0], typeof teams[0]]> = [];

  // arr[0] stays fixed, arr[1..N-1] rotate clockwise each round
  const arr = list.slice();

  for (let round = 0; round < rounds; round++) {
    // Pair opposite ends: (0,N-1), (1,N-2), ..., (mid-1, mid)
    for (let i = 0; i < mid; i++) {
      const a = arr[i];
      const b = arr[N - 1 - i];
      if (a.id === -1 || b.id === -1) continue;
      schedule.push([a, b]);
    }

    // Rotate arr[1..N-1] clockwise: move last to position 1
    const last = arr[N - 1];
    for (let i = N - 1; i > 1; i--) {
      arr[i] = arr[i - 1];
    }
    arr[1] = last;
  }

  return schedule;
}

export class MatchesService {
  /**
   * Get paginated match list with filters.
   */
  async getMatchList(params: {
    seasonId?: number;
    stage?: string;
    status?: string;
    groupName?: string;
    page?: number;
    limit?: number;
  }) {
    const page = params.page || DEFAULT_PAGE;
    const limit = params.limit || DEFAULT_LIMIT;
    const skip = (page - 1) * limit;

    const where: Record<string, unknown> = {};
    if (params.seasonId) where.seasonId = params.seasonId;
    if (params.stage) where.stage = params.stage;
    if (params.status) where.status = params.status;
    if (params.groupName) where.groupName = params.groupName;

    const [list, total] = await Promise.all([
      prisma.match.findMany({
        where,
        skip,
        take: limit,
        orderBy: { matchTime: 'asc' },
        include: {
          teamA: { select: { id: true, name: true, logoUrl: true } },
          teamB: { select: { id: true, name: true, logoUrl: true } },
          winnerTeam: { select: { id: true, name: true } },
          season: { select: { id: true, name: true } },
        },
      }),
      prisma.match.count({ where }),
    ]);

    return { list, total, page, limit };
  }

  /**
   * Get match detail by ID.
   */
  async getMatchById(id: number, userId?: number) {
    const match = await prisma.match.findUnique({
      where: { id },
      include: {
        teamA: { select: { id: true, name: true, logoUrl: true, wins: true, losses: true, members: true } },
        teamB: { select: { id: true, name: true, logoUrl: true, wins: true, losses: true, members: true } },
        winnerTeam: { select: { id: true, name: true } },
        forfeitTeam: { select: { id: true, name: true } },
        season: { select: { id: true, name: true, status: true } },
        _count: { select: { bets: true } },
      },
    });
    if (!match) {
      throw new AppError('比赛不存在', 404);
    }

    // If user is logged in, check if they have a bet on this match
    let userBet: { amount: number; pickedTeamId: number; oddsAtBet: number } | null = null;
    if (userId) {
      const bet = await prisma.bet.findUnique({
        where: { userId_matchId: { userId, matchId: id } },
        select: { amount: true, pickedTeamId: true, oddsAtBet: true },
      });
      if (bet) userBet = bet;
    }

    return { ...match, userBet };
  }

  /**
   * Generate group stage matches for a season based on tournamentConfig.
   * If config exists, uses the first round_robin round's parameters.
   * Otherwise falls back to the DTO's groups parameter.
   */
  async generateMatches(dto: GenerateMatchesDTO) {
    const season = await prisma.season.findUnique({ where: { id: dto.seasonId } });
    if (!season) {
      throw new AppError('赛季不存在', 404);
    }

    // Try to load tournament config
    let groups: string[];
    let teamsPerGroup: number;

    if (season.tournamentConfig) {
      const config = JSON.parse(season.tournamentConfig);
      const roundRobinRound = config.rounds?.find((r: any) => r.type === 'round_robin');
      if (roundRobinRound) {
        groups = Array.from({ length: roundRobinRound.groups || 2 }, (_, i) => `${String.fromCharCode(65 + i)}组`);
        teamsPerGroup = roundRobinRound.teamsPerGroup || 4;
      } else {
        // No round_robin configured, use DTO fallback
        groups = dto.groups || ['A组', 'B组'];
        teamsPerGroup = Math.ceil((await prisma.team.count({ where: { seasonId: dto.seasonId } })) / groups.length) || 4;
      }
    } else {
      groups = dto.groups || ['A组', 'B组'];
      teamsPerGroup = Math.ceil((await prisma.team.count({ where: { seasonId: dto.seasonId } })) / groups.length) || 4;
    }

    // Get all teams in this season
    let allTeams = await prisma.team.findMany({
      where: { seasonId: dto.seasonId },
      orderBy: { id: 'asc' },
    });

    // Fallback: if no teams assigned to season, auto-assign all available teams
    if (allTeams.length === 0) {
      const unassignedTeams = await prisma.team.findMany({
        where: { seasonId: null },
        orderBy: { id: 'asc' },
      });
      if (unassignedTeams.length > 0) {
        // Auto-assign all unassigned teams to this season
        await prisma.team.updateMany({
          where: { seasonId: null },
          data: { seasonId: dto.seasonId },
        });
        // Recalculate teamsPerGroup based on tournament config if available
        if (season.tournamentConfig) {
          const config = JSON.parse(season.tournamentConfig);
          const roundRobinRound = config.rounds?.find((r: any) => r.type === 'round_robin');
          if (roundRobinRound) {
            groups = Array.from({ length: roundRobinRound.groups || 1 }, (_, i) => `${String.fromCharCode(65 + i)}组`);
            teamsPerGroup = roundRobinRound.teamsPerGroup || unassignedTeams.length;
          }
        }
        allTeams = unassignedTeams;
        console.log(`Auto-assigned ${unassignedTeams.length} teams to season ${season.name}`);
      }
    }

    if (allTeams.length < 2) {
      throw new AppError('至少需要 2 支战队才能生成比赛', 400);
    }

    const groupCount = groups.length;
    if (teamsPerGroup < 2) {
      throw new AppError('每个小组至少需要 2 支战队', 400);
    }

    const matches: Array<{
      seasonId: number;
      stage: MatchStage;
      groupName: string;
      teamAId: number;
      teamBId: number;
      matchTime: Date;
    }> = [];

    const startDate = dto.startDate ? new Date(dto.startDate) : new Date();
    startDate.setHours(19, 0, 0, 0);
    const matchesPerDay = dto.matchesPerDay || 2;

    for (let g = 0; g < groupCount; g++) {
      const groupTeams = allTeams.slice(g * teamsPerGroup, (g + 1) * teamsPerGroup);
      const groupName = groups[g];

      // Use circle method for round-robin scheduling
      const schedule = generateRoundRobinSchedule(groupTeams);

      // Assign match times evenly distributed
      schedule.forEach((pair, idx) => {
        const dayOffset = Math.floor(idx / matchesPerDay);
        const slotInDay = idx % matchesPerDay;

        const matchTime = new Date(startDate);
        matchTime.setDate(matchTime.getDate() + dayOffset);
        // Distribute times: 18:00, 20:00, 22:00 depending on matchesPerDay
        const hour = 18 + slotInDay * 2;
        matchTime.setHours(hour, 0, 0, 0);

        matches.push({
          seasonId: dto.seasonId,
          stage: MatchStage.GROUP,
          groupName,
          teamAId: pair[0].id,
          teamBId: pair[1].id,
          matchTime,
        });
      });
    }

    const created = await prisma.$transaction(
      matches.map((m) => prisma.match.create({ data: m })),
    );

    return { created: created.length, matches: created, config: season.tournamentConfig ? JSON.parse(season.tournamentConfig) : null };
  }

  /**
   * Generate knockout matches based on group stage standings and tournamentConfig.
   * If config has multiple knockout rounds, generates all of them.
   */
  async generateKnockoutMatches(seasonId: number) {
    const season = await prisma.season.findUnique({ where: { id: seasonId } });
    if (!season) {
      throw new AppError('赛季不存在', 404);
    }

    // Load tournament config
    const config = season.tournamentConfig ? JSON.parse(season.tournamentConfig) : null;
    const knockoutRounds = config?.rounds?.filter((r: any) => r.type === 'knockout') || [];

    // Get all group stage matches for this season
    const groupMatches = await prisma.match.findMany({
      where: { seasonId, stage: MatchStage.GROUP, status: MatchStatus.COMPLETED },
      include: { teamA: true, teamB: true },
    });

    if (groupMatches.length === 0) {
      throw new AppError('没有已完成的小组赛，无法生成淘汰赛', 400);
    }

    // Calculate group standings
    const groupStandings = this.calculateGroupStandings(groupMatches);
    const groupNames = Array.from(groupStandings.keys()).sort();

    // Proceed with only 1 group if enough teams promote (e.g. promotionCount >= 2)
    let currentRoundTeams: Array<{ teamId: number; teamName: string; wins: number; losses: number; points: number }> = [];

    // Build initial pool from group standings based on promotion count
    const roundRobinConfig = config?.rounds?.find((r: any) => r.type === 'round_robin');
    const promotionCount = roundRobinConfig?.promotionCount || 2;

    for (const groupName of groupNames) {
      const group = groupStandings.get(groupName)!;
      const sorted = Array.from(group.values()).sort((a, b) => b.points - a.points || b.wins - a.wins);
      currentRoundTeams.push(...sorted.slice(0, promotionCount));
    }

    const createdMatches: any[] = [];

    // ── Generate all knockout rounds in one pass ────────────────────
    // We track how many matches per round, then derive subsequent rounds
    // For TBD slots (waiting for previous round results), teamAId/teamBId = null

    let matchDayOffset = 8;

    for (let ri = 0; ri < knockoutRounds.length; ri++) {
      const round = knockoutRounds[ri];
      const roundName = round.name || `第${ri + 1}轮淘汰赛`;

      if (ri === 0 && currentRoundTeams.length >= 2) {
        // ── First knockout round: determined teams ──
        let matchPairs: Array<{ teamAId: number | null; teamBId: number | null }> = [];

        if (round.seedingRule === 'cross_group' && groupNames.length >= 2 && currentRoundTeams.length >= 4) {
          // Cross-group seeding: A1 vs B2, B1 vs A2
          const groupA = [...currentRoundTeams].slice(0, promotionCount).sort((a, b) => b.points - a.points);
          const groupB = [...currentRoundTeams].slice(promotionCount).sort((a, b) => b.points - a.points);
          matchPairs = [
            { teamAId: groupA[0].teamId, teamBId: groupB[1]?.teamId ?? null },
            { teamAId: groupB[0].teamId, teamBId: groupA[1]?.teamId ?? null },
          ];
        } else {
          // General pairing: rank by points, pair 1v2, 3v4, etc.
          const sorted = [...currentRoundTeams].sort((a, b) => b.points - a.points || b.wins - a.wins);
          for (let i = 0; i < sorted.length; i += 2) {
            matchPairs.push({
              teamAId: sorted[i]?.teamId ?? null,
              teamBId: sorted[i + 1]?.teamId ?? null,
            });
          }
        }

        // Create this round's matches
        const newMatches = await prisma.$transaction(
          matchPairs.map((p, i) =>
            prisma.match.create({
              data: {
                seasonId, stage: MatchStage.KNOCKOUT, round: roundName,
                matchOrder: i, teamAId: p.teamAId, teamBId: p.teamBId,
                matchTime: new Date(Date.now() + matchDayOffset * 24 * 60 * 60 * 1000),
              },
            }),
          ),
        );
        createdMatches.push(...newMatches);

        // ── Subsequent rounds: generate placeholders ──
        // Auto-derive all remaining rounds until the final (1 match)
        matchDayOffset += 2;
        let advancingTeams = matchPairs.length;
        let sri = ri + 1;
        while (advancingTeams > 1) {
          const subRoundName = sri < knockoutRounds.length
            ? (knockoutRounds[sri].name || `第${sri + 1}轮淘汰赛`)
            : `第${sri + 1}轮`;
          const nextMatchCount = Math.floor(advancingTeams / 2);
          if (nextMatchCount < 1) break;

          const placeholderMatches = Array.from({ length: nextMatchCount }).map((_, i) =>
            prisma.match.create({
              data: {
                seasonId, stage: MatchStage.KNOCKOUT, round: subRoundName,
                matchOrder: i, teamAId: null, teamBId: null,
                matchTime: new Date(Date.now() + matchDayOffset * 24 * 60 * 60 * 1000),
              },
            }),
          );

          const subMatches = await prisma.$transaction(placeholderMatches);
          createdMatches.push(...subMatches);
          matchDayOffset += 2;
          advancingTeams = nextMatchCount;
          sri++;
        }
        break; // All rounds generated — exit the outer loop
      }
    }

    if (createdMatches.length === 0) {
      throw new AppError('无法生成淘汰赛对阵，请检查小组赛结果和赛制配置', 400);
    }

    // Update knockoutRounds to reflect actual rounds created (for return value)
    const actualRoundNames = [...new Set(createdMatches.map((m: any) => m.round))];
    const actualRounds = knockoutRounds.filter((r: any) => actualRoundNames.includes(r.name));

    return { created: createdMatches.length, matches: createdMatches, rounds: actualRounds };
  }

  /**
   * Calculate group standings from completed group stage matches.
   * Returns Map<groupName, [{teamId, teamName, wins, losses, points}]>
   */
  private calculateGroupStandings(groupMatches: Array<{
    groupName: string | null;
    teamAId: number;
    teamBId: number;
    teamAScore: number | null;
    teamBScore: number | null;
    teamA: { id: number; name: string };
    teamB: { id: number; name: string };
  }>) {
    const standings = new Map<string, Map<number, { teamId: number; teamName: string; wins: number; losses: number; points: number }>>();

    for (const match of groupMatches) {
      const groupName = match.groupName || '默认组';
      if (!standings.has(groupName)) {
        standings.set(groupName, new Map());
      }
      const group = standings.get(groupName)!;

      // Initialize team records
      for (const team of [match.teamA, match.teamB]) {
        if (!group.has(team.id)) {
          group.set(team.id, { teamId: team.id, teamName: team.name, wins: 0, losses: 0, points: 0 });
        }
      }

      // Update based on result
      if (match.teamAScore !== null && match.teamBScore !== null) {
        const aRecord = group.get(match.teamAId)!;
        const bRecord = group.get(match.teamBId)!;

        if (match.teamAScore > match.teamBScore) {
          aRecord.wins++;
          bRecord.losses++;
          aRecord.points += 3;
        } else if (match.teamBScore > match.teamAScore) {
          bRecord.wins++;
          aRecord.losses++;
          bRecord.points += 3;
        }
        // No ties handled (per business rules)
      }
    }

    // Convert to sorted arrays
    const result = new Map<string, Array<{ teamId: number; teamName: string; wins: number; losses: number; points: number }>>();
    for (const [name, group] of standings) {
      result.set(
        name,
        Array.from(group.values()).sort((a, b) => b.points - a.points || b.wins - a.wins),
      );
    }
    return result;
  }

  /**
   * Update match result (admin). Triggers settlement.
   */
  async updateMatchResult(matchId: number, dto: UpdateMatchResultDTO) {
    const match = await prisma.match.findUnique({ where: { id: matchId } });
    if (!match) {
      throw new AppError('比赛不存在', 404);
    }

    if (match.status === MatchStatus.COMPLETED) {
      throw new AppError('比赛已结算，无法修改结果', 400);
    }

    // Determine winner
    let winnerTeamId: number | null = null;
    if (dto.teamAScore > dto.teamBScore) {
      winnerTeamId = match.teamAId;
    } else if (dto.teamBScore > dto.teamAScore) {
      winnerTeamId = match.teamBId;
    }

    // Update match
    const updated = await prisma.match.update({
      where: { id: matchId },
      data: {
        teamAScore: dto.teamAScore,
        teamBScore: dto.teamBScore,
        winnerTeamId,
        status: MatchStatus.COMPLETED,
      },
    });

    // Settle bets on this match
    const { settlementService } = await import('./settlement.service');
    const settleResult = await settlementService.settleMatch(matchId, dto.teamAScore, dto.teamBScore);

    // Update team win/loss records
    if (winnerTeamId) {
      await prisma.team.update({
        where: { id: winnerTeamId },
        data: { wins: { increment: 1 } },
      });
      const loserId = winnerTeamId === match.teamAId ? match.teamBId : match.teamAId;
      await prisma.team.update({
        where: { id: loserId },
        data: { losses: { increment: 1 } },
      });
    }

    return { match: updated, settlement: settleResult };
  }

  /**
   * Mark a match as forfeited (admin). Triggers full refund.
   */
  async forfeitMatch(matchId: number, forfeitTeamId: number) {
    const match = await prisma.match.findUnique({ where: { id: matchId } });
    if (!match) {
      throw new AppError('比赛不存在', 404);
    }

    if (match.status === MatchStatus.COMPLETED || match.status === MatchStatus.FORFEITED) {
      throw new AppError('比赛已结束，无法标记弃赛', 400);
    }

    if (forfeitTeamId !== match.teamAId && forfeitTeamId !== match.teamBId) {
      throw new AppError('弃赛战队不在此比赛中', 400);
    }

    const winnerTeamId = forfeitTeamId === match.teamAId ? match.teamBId : match.teamAId;

    const updated = await prisma.match.update({
      where: { id: matchId },
      data: {
        forfeitTeamId,
        winnerTeamId,
        status: MatchStatus.FORFEITED,
      },
    });

    // Refund all bets
    const { settlementService } = await import('./settlement.service');
    const refundResult = await settlementService.refundMatchBets(matchId);

    // Update team stats
    await prisma.team.update({
      where: { id: forfeitTeamId },
      data: { losses: { increment: 1 } },
    });
    await prisma.team.update({
      where: { id: winnerTeamId },
      data: { forfeits: { increment: 1 } },
    });

    return { match: updated, refund: refundResult };
  }

  /**
   * Update a single match's scheduled time.
   */
  async updateMatchTime(matchId: number, matchTime: Date) {
    const match = await prisma.match.findUnique({ where: { id: matchId } });
    if (!match) {
      throw new AppError('比赛不存在', 404);
    }

    if (match.status !== 'UPCOMING') {
      throw new AppError('只能修改未开始比赛的时间', 400);
    }

    return prisma.match.update({
      where: { id: matchId },
      data: { matchTime },
    });
  }
}

export const matchesService = new MatchesService();
