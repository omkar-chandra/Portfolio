import React, { FC, ReactNode } from 'react';
import { motion } from 'framer-motion';

/**
 * Clean, smooth page transition.
 * Exit: content fades out with gentle lift.
 * Enter: content fades in with subtle rise — no scale distortion or heavy blur.
 */
const pageVariants = {
  initial: {
    opacity: 0,
    y: 12,
  },
  animate: {
    opacity: 1,
    y: 0,
    transition: {
      duration: 0.42,
      ease: [0.16, 1, 0.3, 1] as [number, number, number, number],
    },
  },
  exit: {
    opacity: 0,
    y: -8,
    transition: {
      duration: 0.28,
      ease: [0.4, 0, 1, 1] as [number, number, number, number],
    },
  },
};

const PageTransition: FC<{ children: ReactNode }> = ({ children }) => (
  <motion.div
    variants={pageVariants}
    initial="initial"
    animate="animate"
    exit="exit"
    style={{ willChange: 'opacity, transform' }}
  >
    {children}
  </motion.div>
);

export default PageTransition;
