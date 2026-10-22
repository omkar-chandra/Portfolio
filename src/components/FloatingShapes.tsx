import React, { FC } from 'react';
import { motion } from 'framer-motion';

const FloatingShapes: FC = () => (
  <div className="floating-shapes">
    <motion.div
      className="shape shape--1"
      animate={{ y: [0, -30, 0], rotate: [0, 180, 360], scale: [1, 1.1, 1] }}
      transition={{ duration: 20, repeat: Infinity, ease: 'linear' }}
    />
    <motion.div
      className="shape shape--2"
      animate={{ y: [0, 40, 0], rotate: [360, 180, 0] }}
      transition={{ duration: 25, repeat: Infinity, ease: 'linear' }}
    />
    <motion.div
      className="shape shape--3"
      animate={{ x: [0, 30, 0], y: [0, -20, 0] }}
      transition={{ duration: 15, repeat: Infinity, ease: 'linear' }}
    />
  </div>
);

export default FloatingShapes;
