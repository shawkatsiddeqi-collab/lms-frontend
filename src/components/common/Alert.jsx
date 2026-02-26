import React from 'react';
import { motion, AnimatePresence } from 'framer-motion';
import { 
  HiCheckCircle, 
  HiExclamationCircle, 
  HiInformationCircle, 
  HiXCircle,
  HiX 
} from 'react-icons/hi';
import { cn } from '../../utils/helpers';

const Alert = ({
  type = 'info',
  title,
  message,
  onClose,
  className = '',
  show = true,
}) => {
  const types = {
    success: {
      bg: 'bg-green-50 border-green-200',
      text: 'text-green-800',
      icon: HiCheckCircle,
      iconColor: 'text-green-500',
    },
    error: {
      bg: 'bg-red-50 border-red-200',
      text: 'text-red-800',
      icon: HiXCircle,
      iconColor: 'text-red-500',
    },
    warning: {
      bg: 'bg-amber-50 border-amber-200',
      text: 'text-amber-800',
      icon: HiExclamationCircle,
      iconColor: 'text-amber-500',
    },
    info: {
      bg: 'bg-blue-50 border-blue-200',
      text: 'text-blue-800',
      icon: HiInformationCircle,
      iconColor: 'text-blue-500',
    },
  };

  const config = types[type];
  const Icon = config.icon;

  return (
    <AnimatePresence>
      {show && (
        <motion.div
          initial={{ opacity: 0, y: -10 }}
          animate={{ opacity: 1, y: 0 }}
          exit={{ opacity: 0, y: -10 }}
          className={cn(
            'rounded-xl border p-4',
            config.bg,
            className
          )}
        >
          <div className="flex gap-3">
            <Icon className={cn('h-5 w-5 flex-shrink-0 mt-0.5', config.iconColor)} />
            <div className="flex-1">
              {title && (
                <h4 className={cn('font-semibold', config.text)}>{title}</h4>
              )}
              {message && (
                <p className={cn('text-sm', config.text, title && 'mt-1')}>
                  {message}
                </p>
              )}
            </div>
            {onClose && (
              <button
                onClick={onClose}
                className={cn('flex-shrink-0', config.iconColor, 'hover:opacity-70 transition-opacity')}
              >
                <HiX className="h-5 w-5" />
              </button>
            )}
          </div>
        </motion.div>
      )}
    </AnimatePresence>
  );
};

export default Alert;