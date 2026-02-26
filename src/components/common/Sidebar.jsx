// src/components/layout/Sidebar.jsx
import React, { useEffect, useState } from 'react';
import { NavLink, useLocation } from 'react-router-dom';
import { motion, AnimatePresence } from 'framer-motion';
import {
  HiHome,
  HiUsers,
  HiAcademicCap,
  HiClipboardList,
  HiDocumentText,
  HiSpeakerphone,
  HiChartBar,
  HiBookOpen,
  HiX,
  HiChevronRight,
} from 'react-icons/hi';
import { cn } from '../../utils/helpers';

const iconMap = {
  dashboard: HiHome,
  students: HiUsers,
  teachers: HiUsers,
  courses: HiAcademicCap,
  assignments: HiClipboardList,
  submissions: HiDocumentText,
  attendance: HiChartBar,
  announcements: HiSpeakerphone,
};

const Sidebar = ({ items = [], isOpen, onClose }) => {
  const location = useLocation();

  // Desktop always visible. Mobile controlled by isOpen.
  const [isDesktop, setIsDesktop] = useState(() =>
    typeof window !== 'undefined' ? window.innerWidth >= 1024 : true
  );

  useEffect(() => {
    const onResize = () => setIsDesktop(window.innerWidth >= 1024);
    window.addEventListener('resize', onResize);
    return () => window.removeEventListener('resize', onResize);
  }, []);

  const visible = isDesktop || isOpen;

  // ✅ Active for nested routes too
  const isPathActive = (path) => {
    if (!path) return false;
    const current = location.pathname;
    return current === path || current.startsWith(path + '/');
  };

  return (
    <>
      {/* Mobile overlay */}
      <AnimatePresence>
        {!isDesktop && isOpen && (
          <motion.div
            initial={{ opacity: 0 }}
            animate={{ opacity: 1 }}
            exit={{ opacity: 0 }}
            className="fixed inset-0 bg-black/40 backdrop-blur-[2px] z-30 lg:hidden"
            onClick={onClose}
          />
        )}
      </AnimatePresence>

      {/* Sidebar */}
      <motion.aside
        initial={false}
        animate={visible ? { x: 0 } : { x: -320 }}
        transition={{ type: 'spring', stiffness: 260, damping: 26 }}
        className={cn(
          'fixed top-0 left-0 z-40 h-screen w-[18.5rem] lg:w-[19rem]',
          'pt-20 lg:pt-24',
          'bg-white',
          'border-r border-slate-200',
          'shadow-[0_25px_60px_-35px_rgba(15,23,42,0.45)]'
        )}
      >
        {/* Close (mobile only) */}
        {!isDesktop && (
          <button
            onClick={onClose}
            className={cn(
              'absolute top-[5.35rem] right-4 p-2 rounded-xl',
              'text-slate-500 hover:text-slate-900',
              'hover:bg-slate-100',
              'shadow-[0_12px_25px_-18px_rgba(15,23,42,0.25)]',
              'transition-all'
            )}
          >
            <HiX className="w-5 h-5" />
          </button>
        )}

        <div className="h-full px-4 pb-6 overflow-y-auto">
          {/* Menu label */}
          <div className="px-2 mb-3">
            <div className="px-3 py-2 rounded-2xl bg-slate-50 border border-slate-200 shadow-[0_12px_25px_-20px_rgba(15,23,42,0.18)]">
              <p className="text-xs font-semibold text-slate-500 uppercase tracking-wide">
                Menu
              </p>
            </div>
          </div>

          {/* Nav */}
          <nav className="space-y-2">
            {items.map((item, index) => {
              const Icon = iconMap[item.icon] || HiBookOpen;
              const active = isPathActive(item.path);

              return (
                <motion.div
                  key={item.path}
                  initial={{ opacity: 0, x: -12 }}
                  animate={{ opacity: 1, x: 0 }}
                  transition={{ delay: index * 0.03 }}
                >
                  <NavLink
                    to={item.path}
                    onClick={() => {
                      if (!isDesktop) onClose?.();
                    }}
                    className={cn(
                      'group relative flex items-center gap-3 px-3 py-3 rounded-2xl',
                      'border transition-all duration-200 overflow-hidden',
                      active
                        ? [
                            // ✅ Blue → Indigo gradient active background
                            'bg-gradient-to-r from-blue-600 to-indigo-600',
                            'border-blue-600/30',
                            'text-white',
                            'shadow-[0_18px_40px_-22px_rgba(37,99,235,0.65)]',
                          ].join(' ')
                        : [
                            'bg-white',
                            'border-transparent',
                            'text-slate-700',
                            'hover:bg-slate-50',
                            'hover:border-slate-200',
                            'hover:shadow-[0_16px_30px_-22px_rgba(15,23,42,0.18)]',
                          ].join(' ')
                    )}
                  >
                    {/* Active glow */}
                    {active && (
                      <span className="pointer-events-none absolute -inset-10 bg-gradient-to-r from-blue-500/30 to-indigo-500/30 blur-2xl" />
                    )}

                    {/* Icon badge */}
                    <span
                      className={cn(
                        'relative z-10 w-10 h-10 rounded-2xl flex items-center justify-center shrink-0',
                        'border shadow-[inset_0_1px_0_rgba(255,255,255,0.25)] transition-colors',
                        active
                          ? 'bg-white/15 border-white/20'
                          : 'bg-slate-50 border-slate-200 group-hover:bg-white'
                      )}
                    >
                      <Icon className={cn('w-5 h-5', active ? 'text-white' : 'text-slate-600')} />
                    </span>

                    {/* Title */}
                    <span className={cn('relative z-10 font-semibold truncate', active ? 'text-white' : 'text-slate-700')}>
                      {item.name}
                    </span>

                    {/* Chevron */}
                    <span
                      className={cn(
                        'relative z-10 ml-auto transition-all',
                        active ? 'opacity-100 text-white/90' : 'opacity-0 group-hover:opacity-100 text-slate-400'
                      )}
                    >
                      <HiChevronRight className="w-5 h-5" />
                    </span>
                  </NavLink>
                </motion.div>
              );
            })}
          </nav>
        </div>
      </motion.aside>
    </>
  );
};

export default Sidebar;