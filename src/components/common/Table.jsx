// src/components/common/Table.jsx
import React from 'react';
import { motion } from 'framer-motion';
import Loader from './Loader';
import { cn } from '../../utils/helpers';

const Table = ({
  columns = [],
  data = [],
  loading = false,
  emptyMessage = 'No data found',
  emptyIcon: EmptyIcon,
  onRowClick,
  className = '',
}) => {
  // Loading state
  if (loading) {
    return (
      <div className="flex justify-center items-center py-16">
        <Loader size="lg" />
      </div>
    );
  }

  // Empty state
  if (!Array.isArray(data) || data.length === 0) {
    return (
      <motion.div 
        initial={{ opacity: 0, y: 10 }}
        animate={{ opacity: 1, y: 0 }}
        className="py-16 flex flex-col items-center justify-center text-center"
      >
        {EmptyIcon && (
          <div className="relative mb-4">
            <div className="mx-auto w-16 h-16 rounded-2xl bg-gradient-to-br from-primary-500 to-accent-500 flex items-center justify-center shadow-glow">
              <EmptyIcon className="w-8 h-8 text-white" />
            </div>
            <div className="absolute -inset-1 rounded-3xl bg-primary-500/20 blur-xl -z-10" />
          </div>
        )}
        <p className="text-sm font-semibold text-dark-700">{emptyMessage}</p>
        <p className="mt-1 text-xs text-dark-400 max-w-sm">
          Try adjusting your filters or adding a new record.
        </p>
      </motion.div>
    );
  }

  return (
    <div
      className={cn(
        'w-full overflow-x-auto rounded-2xl border border-dark-100 bg-white shadow-soft-lg scrollbar-thin',
        className
      )}
    >
      <table className="min-w-full border-collapse">
        {/* Header */}
        <thead className="bg-gradient-to-r from-dark-50 to-dark-100">
          <tr>
            {columns.map((column, index) => (
              <th
                key={index}
                className={cn(
                  'px-6 py-3 text-left text-xs font-semibold uppercase tracking-wider text-dark-500',
                  column.className
                )}
              >
                <div className="flex items-center gap-1.5">
                  {column.icon && (
                    <span className="text-dark-400">
                      <column.icon className="w-4 h-4" />
                    </span>
                  )}
                  <span>{column.header}</span>
                </div>
              </th>
            ))}
          </tr>
        </thead>

        {/* Body */}
        <tbody className="bg-white divide-y divide-dark-100">
          {data.map((row, rowIndex) => (
            <motion.tr
              key={row._id || rowIndex}
              initial={{ opacity: 0, y: 4 }}
              animate={{ opacity: 1, y: 0 }}
              transition={{ delay: rowIndex * 0.02 }}
              onClick={() => onRowClick?.(row)}
              className={cn(
                'transition-all duration-200',
                'hover:bg-primary-50/60 hover:shadow-inner-soft',
                onRowClick && 'cursor-pointer'
              )}
            >
              {columns.map((column, colIndex) => (
                <td
                  key={colIndex}
                  className={cn(
                    'px-6 py-4 text-sm text-dark-700 align-middle',
                    column.cellClassName
                  )}
                >
                  {typeof column.render === 'function'
                    ? column.render(row[column.accessor], row, rowIndex)
                    : row[column.accessor]}
                </td>
              ))}
            </motion.tr>
          ))}
        </tbody>
      </table>
    </div>
  );
};

export default Table;