import React from 'react';
import { motion } from 'framer-motion';
import { pageVariants } from '../../utils/constants';

const PageWrapper = ({ children, className = '' }) => {
  return (
    <motion.div
      initial="initial"
      animate="animate"
      exit="exit"
      variants={pageVariants}
      className={`page-container ${className}`}
    >
      {children}
    </motion.div>
  );
};

export default PageWrapper;