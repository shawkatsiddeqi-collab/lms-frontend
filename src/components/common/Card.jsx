import React from 'react';
import { motion } from 'framer-motion';

const Card = ({
  children,
  title,
  subtitle,
  headerAction,
  footer,
  className = '',
  padding = true,
  hover = true,
  variant = 'default',
}) => {
  const variants = {
    default: 'card',
    glass: 'card-glass',
    gradient: 'card-gradient',
  };

  return (
    <motion.div
      initial={{ opacity: 0, y: 20 }}
      animate={{ opacity: 1, y: 0 }}
      transition={{ duration: 0.3 }}
      whileHover={hover ? { y: -4, transition: { duration: 0.2 } } : {}}
      className={`${variants[variant]} ${className}`}
    >
      {(title || headerAction) && (
        <div className="flex items-center justify-between px-6 py-4 border-b border-gray-100/80">
          <div>
            {title && (
              <h3 className="text-lg font-bold text-gray-900">{title}</h3>
            )}
            {subtitle && (
              <p className="text-sm text-gray-500 mt-1">{subtitle}</p>
            )}
          </div>
          {headerAction && <div>{headerAction}</div>}
        </div>
      )}
      <div className={padding ? 'p-6' : ''}>{children}</div>
      {footer && (
        <div className="px-6 py-4 border-t border-gray-100/80 bg-gray-50/50 rounded-b-2xl">
          {footer}
        </div>
      )}
    </motion.div>
  );
};

export default Card;