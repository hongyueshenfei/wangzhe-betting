import type { TeamRank } from '../../types';

/** 完整的 TeamRank 模拟数据 */
export function createMockTeam(overrides: Partial<TeamRank> = {}): TeamRank {
  return {
    rank: 1,
    id: 1,
    name: 'AG超玩会',
    logoUrl: null,
    wins: 5,
    losses: 2,
    forfeits: 0,
    season: { id: 1, name: 'S1 春季赛' },
    ...overrides,
  };
}

/** 批量创建 TeamRank 数据 */
export function createMockTeams(count: number): TeamRank[] {
  return Array.from({ length: count }, (_, i) =>
    createMockTeam({
      rank: i + 1,
      id: i + 1,
      name: `战队 ${i + 1}`,
      wins: count - i,
      losses: i,
    }),
  );
}
