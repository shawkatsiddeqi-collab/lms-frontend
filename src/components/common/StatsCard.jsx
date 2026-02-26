import React from 'react';
import { motion } from 'framer-motion';
import { cn, getRandomGradient } from '../../utils/helpers';

const StatsCard = ({
  title,
  value,
  subtitle,
  icon: Icon,
  trend,
  trendValue,
  color = 'primary',
  index = 0,
}) => {
  const colors = {
    primary: 'from-primary-500 to-primary-600',
    secondary: 'from-secondary-500 to-secondary-600',
    accent: 'from-accent-500 to-accent-600',
    success: 'from-green-500 to-green-600',
    danger: 'from-red-500 to-red-600',
    warning: 'from-amber-500 to-amber-600',
    info: 'from-blue-500 to-blue-600',
  };

  const bgColors = {
    primary: 'bg-primary-500',
    secondary: 'bg-secondary-500',
    accent: 'bg-accent-500',
    success: 'bg-green-500',
    danger: 'bg-red-500',
    warning: 'bg-amber-500',
    info: 'bg-blue-500',
  };

  return (
    <motion.div
      initial={{ opacity: 0, y: 20 }}
      animate={{ opacity: 1, y: 0 }}
      transition={{ delay: index * 0.1 }}
      whileHover={{ y: -5 }}
      className="stats-card group"
    >
      {/* Background Decoration */}
      <div className={cn(
        'absolute top-0 right-0 w-32 h-32 rounded-full opacity-10 -translate-y-8 translate-x-8 group-hover:scale-110 transition-transform duration-500',
        bgColors[color]
      )} />

      <div className="relative flex items-start justify-between">
        <div>
          <p className="text-sm font-medium text-dark-500">{title}</p>
          <motion.h3 
            className="text-3xl font-bold text-dark-900 mt-2"
            initial={{ scale: 0.5 }}
            animate={{ scale: 1 }}
            transition={{ delay: index * 0.1 + 0.2, type: 'spring' }}
          >
            {value}
          </motion.h3>
          {subtitle && (
            <p className="text-sm text-dark-400 mt-1">{subtitle}</p>
          )}
          {trend && (
            <div className={cn(
              'flex items-center gap-1 mt-3 text-sm font-medium',
              trend === 'up' ? 'text-green-600' : 'text-red-600'
            )}>
              <span>{trend === 'up' ? '↑' : '↓'}</span>
              <span>{trendValue}</span>
              <span className="text-dark-400 font-normal">vs last month</span>
            </div>
          )}
        </div>
        
        {Icon && (
          <div className={cn(
            'p-4 rounded-2xl bg-gradient-to-br text-white shadow-lg',
            colors[color]
          )}>
            <Icon className="h-7 w-7" />
          </div>
        )}
      </div>
    </motion.div>
  );
};

export default StatsCard;