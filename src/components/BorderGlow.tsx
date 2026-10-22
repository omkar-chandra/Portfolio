import React, { FC, ReactNode, useRef, useCallback } from 'react';

interface Props {
  children: ReactNode;
  className?: string;
  glowColor?: string;
  radius?: number;
}

const BorderGlow: FC<Props> = ({ children, className = '', glowColor, radius = 300 }) => {
  const ref = useRef<HTMLDivElement>(null);

  const onMove = useCallback((e: React.MouseEvent) => {
    if (!ref.current) return;
    const r = ref.current.getBoundingClientRect();
    ref.current.style.setProperty('--gx', `${e.clientX - r.left}px`);
    ref.current.style.setProperty('--gy', `${e.clientY - r.top}px`);
  }, []);

  const style: React.CSSProperties & Record<string, string> = {
    '--glow-r': `${radius}px`,
  };

  if (glowColor) {
    style['--glow-c1'] = glowColor;
  }

  return (
    <div
      ref={ref}
      className={`glow-border ${className}`}
      onMouseMove={onMove}
      style={style}
    >
      <div className="glow-border__inner">{children}</div>
    </div>
  );
};

export default BorderGlow;
