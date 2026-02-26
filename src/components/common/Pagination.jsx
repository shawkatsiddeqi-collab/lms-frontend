import React from 'react';
import { motion } from 'framer-motion';
import { HiChevronLeft, HiChevronRight } from 'react-icons/hi';
import { cn } from '../../utils/helpers';

const Pagination = ({
  currentPage,
  totalPages,
  onPageChange,
  className = '',
}) => {
  const pages = [];
  const maxVisiblePages = 5;

  let startPage = Math.max(1, currentPage - Math.floor(maxVisiblePages / 2));
  let endPage = Math.min(totalPages, startPage + maxVisiblePages - 1);

  if (endPage - startPage + 1 < maxVisiblePages) {
    startPage = Math.max(1, endPage - maxVisiblePages + 1);
  }

  for (let i = startPage; i <= endPage; i++) {
    pages.push(i);
  }

  if (totalPages <= 1) return null;

  const PageButton = ({ page, isActive, disabled, children, onClick }) => (
    <motion.button
      whileHover={{ scale: disabled ? 1 : 1.05 }}
      whileTap={{ scale: disabled ? 1 : 0.95 }}
      onClick={onClick}
      disabled={disabled}
      className={cn(
        'flex items-center justify-center w-10 h-10 rounded-xl font-medium transition-all duration-200',
        isActive
          ? 'bg-primary-600 text-white shadow-lg shadow-primary-500/30'
          : 'bg-white text-dark-600 hover:bg-dark-50 border border-dark-200',
        disabled && 'opacity-50 cursor-not-allowed'
      )}
    >
      {children}
    </motion.button>
  );

  return (
    <div className={cn('flex items-center justify-center gap-2', className)}>
      <PageButton
        disabled={currentPage === 1}
        onClick={() => onPageChange(currentPage - 1)}
      >
        <HiChevronLeft className="h-5 w-5" />
      </PageButton>

      {startPage > 1 && (
        <>
          <PageButton page={1} onClick={() => onPageChange(1)}>
            1
          </PageButton>
          {startPage > 2 && (
            <span className="px-2 text-dark-400">...</span>
          )}
        </>
      )}

      {pages.map((page) => (
        <PageButton
          key={page}
          page={page}
          isActive={currentPage === page}
          onClick={() => onPageChange(page)}
        >
          {page}
        </PageButton>
      ))}

      {endPage < totalPages && (
        <>
          {endPage < totalPages - 1 && (
            <span className="px-2 text-dark-400">...</span>
          )}
          <PageButton page={totalPages} onClick={() => onPageChange(totalPages)}>
            {totalPages}
          </PageButton>
        </>
      )}

      <PageButton
        disabled={currentPage === totalPages}
        onClick={() => onPageChange(currentPage + 1)}
      >
        <HiChevronRight className="h-5 w-5" />
      </PageButton>
    </div>
  );
};

export default Pagination;