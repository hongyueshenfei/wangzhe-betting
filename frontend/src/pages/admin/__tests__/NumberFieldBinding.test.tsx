import { describe, it, expect } from 'vitest';
import { render, screen } from '@testing-library/react';
import TextField from '@mui/material/TextField';

describe('Number field value binding', () => {
  /**
   * 回归测试：`0 || ''` 会导致 0 显示为空
   * 修复前：value={round.pointsLoss || ''} → 0 变成空字符串
   * 修复后：value={round.pointsLoss ?? ''} → 0 正确显示
   */
  it('使用 || 时 0 显示为空（修复前的问题）', () => {
    render(<TextField label="测试" type="number" value={0 || ''} />);
    const input = screen.getByLabelText('测试') as HTMLInputElement;
    expect(input.value).toBe('');
  });

  it('使用 ?? 时 0 正常显示（修复后的行为）', () => {
    render(<TextField label="测试" type="number" value={0 ?? ''} />);
    const input = screen.getByLabelText('测试') as HTMLInputElement;
    expect(input.value).toBe('0');
  });

  it('undefined 时 ?? 返回空字符串', () => {
    render(<TextField label="测试" type="number" value={undefined ?? ''} />);
    const input = screen.getByLabelText('测试') as HTMLInputElement;
    expect(input.value).toBe('');
  });

  it('null 时 ?? 返回空字符串', () => {
    render(<TextField label="测试" type="number" value={null ?? ''} />);
    const input = screen.getByLabelText('测试') as HTMLInputElement;
    expect(input.value).toBe('');
  });

  it('正数时 ?? 正常工作', () => {
    render(<TextField label="测试" type="number" value={5 ?? ''} />);
    const input = screen.getByLabelText('测试') as HTMLInputElement;
    expect(input.value).toBe('5');
  });
});
