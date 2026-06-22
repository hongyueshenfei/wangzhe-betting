import { describe, it, expect } from 'vitest';
import { render, screen } from '@testing-library/react';
import PageHeader from '../PageHeader';

describe('PageHeader', () => {
  it('渲染标题和副标题', () => {
    render(<PageHeader title="排行榜" subtitle="查看投注高手" />);
    expect(screen.getByText('排行榜')).toBeInTheDocument();
    expect(screen.getByText('查看投注高手')).toBeInTheDocument();
  });

  it('不传 subtitle 时不渲染', () => {
    render(<PageHeader title="首页" />);
    expect(screen.getByText('首页')).toBeInTheDocument();
    expect(screen.queryByTestId('page-header-subtitle')).toBeNull();
  });

  it('渲染操作按钮', () => {
    render(<PageHeader title="管理" action={<button>新建</button>} />);
    expect(screen.getByText('新建')).toBeInTheDocument();
  });
});
