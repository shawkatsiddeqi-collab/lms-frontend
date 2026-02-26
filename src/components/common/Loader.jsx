import React from 'react';
import { motion } from 'framer-motion';
import { cn } from '../../utils/helpers';

const Loader = ({ size = 'md', className = '', text = '' }) => {
  const sizes = {
    sm: 'h-5 w-5 border-2',
    md: 'h-8 w-8 border-3',
    lg: 'h-12 w-12 border-4',
    xl: 'h-16 w-16 border-4',
  };

  return (
    <div className={cn('flex flex-col items-center justify-center gap-3', className)}>
      <motion.div
        animate={{ rotate: 360 }}
        transition={{ duration: 1, repeat: Infinity, ease: 'linear' }}
        className={cn(
          'rounded-full border-primary-200 border-t-primary-600',
          sizes[size]
        )}
      />
      {text && (
        <motion.p 
          initial={{ opacity: 0 }}
          animate={{ opacity: 1 }}
          className="text-sm text-dark-500 font-medium"
        >
          {text}
        </motion.p>
      )}
    </div>
  );
};

// Full page loader component - EXPORTED
export const PageLoader = ({ text = 'Loading...' }) => (
  <div className="fixed inset-0 z-50 flex items-center justify-center bg-white/80 backdrop-blur-sm">
    <div className="text-center">
      <Loader size="xl" />
      <motion.p 
        initial={{ opacity: 0, y: 10 }}
        animate={{ opacity: 1, y: 0 }}
        transition={{ delay: 0.2 }}
        className="mt-4 text-dark-600 font-medium"
      >
        {text}
      </motion.p>
    </div>
  </div>
);

// Inline loader for buttons, etc.
export const InlineLoader = ({ size = 'sm', className = '' }) => (
  <motion.div
    animate={{ rotate: 360 }}
    transition={{ duration: 1, repeat: Infinity, ease: 'linear' }}
    className={cn(
      'rounded-full border-2 border-current border-t-transparent',
      size === 'sm' && 'h-4 w-4',
      size === 'md' && 'h-5 w-5',
      size === 'lg' && 'h-6 w-6',
      className
    )}
  />
);

// Skeleton loader for content placeholders
export const Skeleton = ({ className = '', variant = 'text' }) => {
  const variants = {
    text: 'h-4 w-full',
    title: 'h-6 w-3/4',
    avatar: 'h-12 w-12 rounded-full',
    thumbnail: 'h-32 w-full rounded-xl',
    card: 'h-48 w-full rounded-xl',
    button: 'h-10 w-24 rounded-lg',
  };

  return (
    <div 
      className={cn(
        'animate-pulse bg-dark-200 rounded',
        variants[variant],
        className
      )} 
    />
  );
};

// Card skeleton loader
export const CardSkeleton = () => (
  <div className="card p-6 space-y-4">
    <div className="flex items-center gap-4">
      <Skeleton variant="avatar" />
      <div className="flex-1 space-y-2">
        <Skeleton variant="title" />
        <Skeleton variant="text" className="w-1/2" />
      </div>
    </div>
    <Skeleton variant="text" />
    <Skeleton variant="text" />
    <Skeleton variant="text" className="w-2/3" />
  </div>
);

// Table skeleton loader
export const TableSkeleton = ({ rows = 5 }) => (
  <div className="space-y-3">
    {Array.from({ length: rows }).map((_, index) => (
      <div key={index} className="flex items-center gap-4 p-4 bg-white rounded-lg">
        <Skeleton variant="avatar" className="h-10 w-10" />
        <div className="flex-1 space-y-2">
          <Skeleton variant="text" className="w-1/3" />
          <Skeleton variant="text" className="w-1/2" />
        </div>
        <Skeleton variant="button" />
      </div>
    ))}
  </div>
);

export default Loader;