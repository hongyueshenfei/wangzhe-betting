import { Fade } from '@mui/material';
import { useLocation } from 'react-router-dom';
import type { ReactNode } from 'react';

/** 用 Fade 动画包装页面内容，切换路由时有渐入效果 */
export default function FadeIn({ children }: { children: ReactNode }) {
  const location = useLocation();
  return (
    <Fade key={location.pathname} in={true} timeout={300}>
      <div>{children}</div>
    </Fade>
  );
}
