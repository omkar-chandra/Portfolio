import React, { FC, ReactNode } from 'react';
import { motion, useMotionValue, useTransform } from 'framer-motion';

interface Props {
  children: ReactNode;
  className?: string;
  style?: React.CSSProperties;
}

const Hover3DCard: FC<Props> = ({ children, className, style }) => {
  const x = useMotionValue(0);
  const y = useMotionValue(0);
  const rotateX = useTransform(y, [-0.5, 0.5], [15, -15]);
  const rotateY = useTransform(x, [-0.5, 0.5], [-15, 15]);

  const handleMouseMove = (e: React.MouseEvent<HTMLDivElement>) => {
    const rect = e.currentTarget.getBoundingClientRect();
    x.set(((e.clientX - rect.left) / rect.width) - 0.5);
    y.set(((e.clientY - rect.top) / rect.height) - 0.5);
  };

  return (
    <motion.div
      className={className}
      onMouseMove={handleMouseMove}
      onMouseLeave={() => { x.set(0); y.set(0); }}
      style={{ ...style, rotateX, rotateY, transformStyle: 'preserve-3d' }}
      whileHover={{ scale: 1.02 }}
      transition={{ type: 'spring', stiffness: 300, damping: 20 }}
    >
      {children}
    </motion.div>
  );
};

export default Hover3DCard;
