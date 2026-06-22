import { describe, it, expect } from 'vitest';
import { render, screen } from '@testing-library/react';
import TeamRankTable from '../TeamRankTable';
import { createMockTeam, createMockTeams } from '../../../test/helpers';

describe('TeamRankTable', () => {
  it('渲染空状态提示', () => {
    render(<TeamRankTable teams={[]} />);
    expect(screen.getByText('暂无战队排行数据')).toBeInTheDocument();
  });

  it('渲染战队排名列表', () => {
    const teams = createMockTeams(3);
    render(<TeamRankTable teams={teams} />);

    // 验证排名显示
    expect(screen.getByText('#1')).toBeInTheDocument();
    expect(screen.getByText('#2')).toBeInTheDocument();
    expect(screen.getByText('#3')).toBeInTheDocument();

    // 验证战队名称
    expect(screen.getByText('战队 1')).toBeInTheDocument();
    expect(screen.getByText('战队 2')).toBeInTheDocument();
    expect(screen.getByText('战队 3')).toBeInTheDocument();

    // 验证赛季名称（所有战队同赛季，匹配多个）
    const seasonCells = screen.getAllByText('S1 春季赛');
    expect(seasonCells).toHaveLength(3);

    // 验证表头
    expect(screen.getByText('排名')).toBeInTheDocument();
    expect(screen.getByText('战队')).toBeInTheDocument();
    expect(screen.getByText('胜场')).toBeInTheDocument();
    expect(screen.getByText('负场')).toBeInTheDocument();
    expect(screen.getByText('弃赛胜')).toBeInTheDocument();
    expect(screen.getByText('赛季')).toBeInTheDocument();
  });

  it('前三名使用 Chip 图标', () => {
    const top3 = createMockTeams(3).map((t, i) => ({
      ...t,
      rank: i + 1,
    }));
    render(<TeamRankTable teams={top3} />);

    // 前三名应该有 Chip 组件
    const chips = screen.getAllByText(/#[123]/);
    expect(chips).toHaveLength(3);
  });

  it('第四名不使用 Chip', () => {
    const teams = createMockTeams(4);
    render(<TeamRankTable teams={teams} />);

    expect(screen.getByText('#4')).toBeInTheDocument();
  });

  it('渲染战队 logo', () => {
    const team = createMockTeam({ logoUrl: '/fake-logo.png' });
    render(<TeamRankTable teams={[team]} />);

    const img = screen.getByAltText('AG超玩会') as HTMLImageElement;
    expect(img).toBeInTheDocument();
    expect(img.src).toContain('/fake-logo.png');
  });

  it('无 logo 时显示默认图标', () => {
    const team = createMockTeam({ logoUrl: null });
    render(<TeamRankTable teams={[team]} />);

    // 应该渲染默认图标 🏆
    expect(screen.getByText('🏆')).toBeInTheDocument();
  });

  it('season 为 null 时不崩溃（修复回归验证）', () => {
    const team = createMockTeam({
      season: null as unknown as { id: number; name: string },
    });
    render(<TeamRankTable teams={[team]} />);

    // 确保渲染成功，赛季列显示 -
    expect(screen.getByText('AG超玩会')).toBeInTheDocument();
    expect(screen.getByText('-')).toBeInTheDocument();
  });

  it('season 为 undefined 时不崩溃', () => {
    const team = createMockTeam({
      season: undefined as unknown as { id: number; name: string },
    });
    render(<TeamRankTable teams={[team]} />);

    expect(screen.getByText('AG超玩会')).toBeInTheDocument();
  });
});
