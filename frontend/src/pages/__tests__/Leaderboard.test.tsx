import { describe, it, expect, vi } from 'vitest';
import { render, screen, waitFor } from '@testing-library/react';
import { MemoryRouter } from 'react-router-dom';
import Leaderboard from '../Leaderboard';

// Mock API
vi.mock('../../api/leaderboard', () => ({
  getUserLeaderboard: vi.fn().mockResolvedValue({ list: [], limit: 50 }),
  getTeamLeaderboard: vi.fn().mockResolvedValue({ list: [], limit: 50 }),
}));

// Mock useAuth
vi.mock('../../hooks/useAuth', () => ({
  useAuth: vi.fn(() => ({ user: { id: 1, username: 'player1' } })),
}));

function renderWithRouter(ui: React.ReactElement) {
  return render(<MemoryRouter>{ui}</MemoryRouter>);
}

describe('Leaderboard', () => {
  it('渲染标题和选项卡', async () => {
    renderWithRouter(<Leaderboard />);
    await waitFor(() => {
      expect(screen.getByText('排行榜')).toBeInTheDocument();
    });
    expect(screen.getByText('投注英雄榜')).toBeInTheDocument();
    expect(screen.getByText('战队排行榜')).toBeInTheDocument();
  });

  it('默认选中投注英雄榜', async () => {
    renderWithRouter(<Leaderboard />);
    await waitFor(() => {
      const tabs = screen.getAllByRole('tab');
      expect(tabs[0]).toHaveAttribute('aria-selected', 'true');
      expect(tabs[1]).toHaveAttribute('aria-selected', 'false');
    });
  });
});
