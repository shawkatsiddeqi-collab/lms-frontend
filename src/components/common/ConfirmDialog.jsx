import React from 'react';
import { motion, AnimatePresence } from 'framer-motion';
import { HiExclamation, HiX } from 'react-icons/hi';
import Button from './Button';

const ConfirmDialog = ({
  isOpen,
  onClose,
  onConfirm,
  title = 'Confirm Action',
  message = 'Are you sure you want to proceed?',
  confirmText = 'Confirm',
  cancelText = 'Cancel',
  variant = 'danger',
  loading = false,
  icon: Icon = HiExclamation,
}) => {
  const iconColors = {
    danger: 'bg-red-100 text-red-600',
    warning: 'bg-amber-100 text-amber-600',
    success: 'bg-green-100 text-green-600',
    info: 'bg-blue-100 text-blue-600',
  };

  return (
    <AnimatePresence>
      {isOpen && (
        <>
          {/* Backdrop */}
          <motion.div
            initial={{ opacity: 0 }}
            animate={{ opacity: 1 }}
            exit={{ opacity: 0 }}
            className="modal-backdrop"
            onClick={onClose}
          />

          {/* Dialog */}
          <div className="fixed inset-0 z-50 flex items-center justify-center p-4">
            <motion.div
              initial={{ opacity: 0, scale: 0.9, y: 20 }}
              animate={{ opacity: 1, scale: 1, y: 0 }}
              exit={{ opacity: 0, scale: 0.9, y: 20 }}
              className="relative w-full max-w-md bg-white rounded-2xl shadow-soft-xl overflow-hidden"
            >
              {/* Close Button */}
              <button
                onClick={onClose}
                className="absolute top-4 right-4 p-2 rounded-full text-dark-400 hover:text-dark-600 hover:bg-dark-100 transition-colors"
              >
                <HiX className="w-5 h-5" />
              </button>

              <div className="p-6 text-center">
                {/* Icon */}
                <motion.div
                  initial={{ scale: 0 }}
                  animate={{ scale: 1 }}
                  transition={{ type: 'spring', delay: 0.1 }}
                  className={`mx-auto w-16 h-16 rounded-full flex items-center justify-center ${iconColors[variant]}`}
                >
                  <Icon className="w-8 h-8" />
                </motion.div>

                {/* Content */}
                <h3 className="mt-4 text-xl font-bold text-dark-900">{title}</h3>
                <p className="mt-2 text-dark-500">{message}</p>

                {/* Actions */}
                <div className="mt-6 flex gap-3 justify-center">
                  <Button
                    variant="ghost"
                    onClick={onClose}
                    disabled={loading}
                    className="min-w-[100px]"
                  >
                    {cancelText}
                  </Button>
                  <Button
                    variant={variant}
                    onClick={onConfirm}
                    loading={loading}
                    className="min-w-[100px]"
                  >
                    {confirmText}
                  </Button>
                </div>
              </div>
            </motion.div>
          </div>
        </>
      )}
    </AnimatePresence>
  );
};

export default ConfirmDialog;