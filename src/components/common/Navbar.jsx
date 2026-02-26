
// src/components/layout/Navbar.jsx
import React, { useMemo, useState } from 'react';
import { Link } from 'react-router-dom';
import { motion, AnimatePresence } from 'framer-motion';
import { useAuth } from '../../hooks/useAuth';
import { getInitials, capitalize } from '../../utils/helpers';
import {
  HiBell,
  HiMenuAlt3,
  HiChevronDown,
  HiUser,
  HiLogout,
  HiCog,
  HiArrowRight,
  HiCheckCircle,
} from 'react-icons/hi';

const Navbar = ({ onMenuClick }) => {
  const { user, logout } = useAuth();
  const [dropdownOpen, setDropdownOpen] = useState(false);
  const [notificationsOpen, setNotificationsOpen] = useState(false);

  // (Still mock here — you can replace with DB notifications later)
  const notifications = [
    { id: 1, title: 'New assignment posted', time: '5 min ago', unread: true },
    { id: 2, title: 'Course update available', time: '1 hour ago', unread: true },
    { id: 3, title: 'Your submission was graded', time: '2 hours ago', unread: false },
  ];

  const unreadCount = useMemo(
    () => notifications.filter((n) => n.unread).length,
    [notifications]
  );

  const handleLogout = () => {
    setDropdownOpen(false);
    logout();
  };

  return (
    <nav
      className={[
        'fixed top-0 w-full z-40',
        'bg-white/75 backdrop-blur-xl',
        'border-b border-slate-200/70',
        'shadow-[0_14px_40px_-26px_rgba(15,23,42,0.45)]',
      ].join(' ')}
    >
      {/* Subtle top highlight */}
      <div className="absolute inset-x-0 top-0 h-[1px] bg-gradient-to-r from-transparent via-white to-transparent opacity-70" />

      <div className="px-4 py-3 lg:px-6">
        <div className="flex items-center justify-between">
          {/* LEFT */}
          <div className="flex items-center gap-4">
            <motion.button
              whileHover={{ scale: 1.05 }}
              whileTap={{ scale: 0.96 }}
              onClick={onMenuClick}
              className={[
                'lg:hidden p-2.5 rounded-2xl',
                'text-slate-700 hover:text-slate-900',
                'bg-white border border-slate-200',
                'shadow-[0_14px_30px_-22px_rgba(15,23,42,0.35)]',
                'hover:shadow-[0_18px_40px_-24px_rgba(15,23,42,0.40)]',
                'transition-all',
              ].join(' ')}
            >
              <HiMenuAlt3 className="h-6 w-6" />
            </motion.button>

            <Link to="/" className="flex items-center gap-3">
              <div className="relative">
                <div className="w-10 h-10 rounded-2xl bg-gradient-to-br from-primary-500 to-accent-500 flex items-center justify-center shadow-lg shadow-primary-500/25">
                  <span className="text-white font-extrabold text-lg">L</span>
                </div>
                <div className="absolute -inset-2 rounded-3xl bg-primary-500/15 blur-xl -z-10" />
              </div>

              <div className="hidden sm:block leading-tight">
                <div className="flex items-baseline gap-1">
                  <span className="text-xl font-extrabold text-slate-900">LMS</span>
                  <span className="text-xl font-light text-slate-500">System</span>
                </div>
                <p className="text-xs text-slate-500">
                  {capitalize(user?.role || 'user')} Portal
                </p>
              </div>
            </Link>
          </div>

          {/* RIGHT */}
          <div className="flex items-center gap-2">
            {/* Notifications */}
            <div className="relative">
              <motion.button
                whileHover={{ y: -1 }}
                whileTap={{ scale: 0.97 }}
                onClick={() => {
                  setNotificationsOpen((v) => !v);
                  setDropdownOpen(false);
                }}
                className={[
                  'relative p-2.5 rounded-2xl',
                  'bg-white border border-slate-200',
                  'text-slate-700 hover:text-slate-900',
                  'shadow-[0_14px_30px_-22px_rgba(15,23,42,0.35)]',
                  'hover:shadow-[0_18px_40px_-24px_rgba(15,23,42,0.40)]',
                  'transition-all',
                ].join(' ')}
                aria-label="Notifications"
              >
                <HiBell className="h-5 w-5" />

                {unreadCount > 0 && (
                  <span className="absolute -top-1 -right-1 min-w-[18px] h-[18px] px-1 rounded-full bg-red-500 text-white text-[10px] font-bold flex items-center justify-center ring-2 ring-white">
                    {unreadCount}
                  </span>
                )}
              </motion.button>

              <AnimatePresence>
                {notificationsOpen && (
                  <>
                    <div className="fixed inset-0 z-10" onClick={() => setNotificationsOpen(false)} />

                    <motion.div
                      initial={{ opacity: 0, y: 10, scale: 0.98 }}
                      animate={{ opacity: 1, y: 0, scale: 1 }}
                      exit={{ opacity: 0, y: 10, scale: 0.98 }}
                      transition={{ type: 'spring', stiffness: 260, damping: 22 }}
                      className={[
                        'absolute right-0 mt-3 w-[22rem] z-50',
                        'rounded-3xl overflow-hidden',
                        'bg-white border border-slate-200',
                        'shadow-[0_30px_70px_-45px_rgba(15,23,42,0.55)]',
                      ].join(' ')}
                    >
                      {/* Header */}
                      <div className="px-4 py-3 bg-slate-50 border-b border-slate-200">
                        <div className="flex items-center justify-between">
                          <h4 className="font-bold text-slate-900">Notifications</h4>
                          {unreadCount > 0 && (
                            <span className="text-xs font-semibold text-slate-600">
                              {unreadCount} unread
                            </span>
                          )}
                        </div>
                      </div>

                      {/* List */}
                      <div className="max-h-80 overflow-y-auto">
                        {notifications.map((n) => (
                          <button
                            key={n.id}
                            type="button"
                            className={[
                              'w-full text-left px-4 py-3',
                              'hover:bg-slate-50 transition-colors',
                              n.unread ? 'bg-blue-50/60' : 'bg-white',
                            ].join(' ')}
                          >
                            <div className="flex gap-3">
                              <div className="mt-1 shrink-0">
                                {n.unread ? (
                                  <span className="w-2.5 h-2.5 rounded-full bg-blue-600 block" />
                                ) : (
                                  <HiCheckCircle className="w-4 h-4 text-slate-300" />
                                )}
                              </div>
                              <div className="min-w-0">
                                <p className="text-sm font-semibold text-slate-900 truncate">
                                  {n.title}
                                </p>
                                <p className="text-xs text-slate-500 mt-0.5">{n.time}</p>
                              </div>
                            </div>
                          </button>
                        ))}
                      </div>

                      {/* Footer */}
                      <div className="px-4 py-3 bg-white border-t border-slate-200">
                        <button className="text-sm font-semibold text-blue-600 hover:text-blue-700 inline-flex items-center gap-1">
                          View all <HiArrowRight className="w-4 h-4" />
                        </button>
                      </div>
                    </motion.div>
                  </>
                )}
              </AnimatePresence>
            </div>

            {/* User Dropdown */}
            <div className="relative">
              <motion.button
                whileHover={{ y: -1 }}
                whileTap={{ scale: 0.98 }}
                onClick={() => {
                  setDropdownOpen((v) => !v);
                  setNotificationsOpen(false);
                }}
                className={[
                  'flex items-center gap-3 p-1.5 pr-3 rounded-2xl',
                  'bg-white border border-slate-200',
                  'shadow-[0_14px_30px_-22px_rgba(15,23,42,0.35)]',
                  'hover:shadow-[0_18px_40px_-24px_rgba(15,23,42,0.40)]',
                  'transition-all',
                ].join(' ')}
              >
                <div className="relative">
                  <div className="h-10 w-10 rounded-2xl bg-gradient-to-br from-primary-500 to-accent-500 flex items-center justify-center text-white font-extrabold shadow-lg shadow-primary-500/25">
                    {getInitials(user?.name)}
                  </div>
                  <div className="absolute -inset-2 rounded-3xl bg-primary-500/10 blur-xl -z-10" />
                </div>

                <div className="hidden md:block text-left leading-tight">
                  <p className="text-sm font-bold text-slate-900 truncate max-w-[140px]">
                    {user?.name || 'User'}
                  </p>
                  <p className="text-xs text-slate-500">{capitalize(user?.role || 'user')}</p>
                </div>

                <HiChevronDown
                  className={[
                    'h-4 w-4 text-slate-400 transition-transform duration-200',
                    dropdownOpen ? 'rotate-180' : '',
                  ].join(' ')}
                />
              </motion.button>

              <AnimatePresence>
                {dropdownOpen && (
                  <>
                    <div className="fixed inset-0 z-10" onClick={() => setDropdownOpen(false)} />

                    <motion.div
                      initial={{ opacity: 0, y: 10, scale: 0.98 }}
                      animate={{ opacity: 1, y: 0, scale: 1 }}
                      exit={{ opacity: 0, y: 10, scale: 0.98 }}
                      transition={{ type: 'spring', stiffness: 260, damping: 22 }}
                      className={[
                        'absolute right-0 mt-3 w-60 z-50',
                        'rounded-3xl overflow-hidden',
                        'bg-white border border-slate-200',
                        'shadow-[0_30px_70px_-45px_rgba(15,23,42,0.55)]',
                      ].join(' ')}
                    >
                      {/* User block */}
                      <div className="px-4 py-3 bg-slate-50 border-b border-slate-200">
                        <p className="text-sm font-bold text-slate-900">{user?.name}</p>
                        <p className="text-xs text-slate-500 truncate">{user?.email}</p>
                      </div>

                      <div className="py-2">
                        <Link
                          to="/profile"
                          className="flex items-center gap-3 px-4 py-2.5 text-sm text-slate-700 hover:bg-slate-50 hover:text-slate-900 transition-colors"
                          onClick={() => setDropdownOpen(false)}
                        >
                          <HiUser className="h-4 w-4" />
                          Profile
                        </Link>
                        <Link
                          to="/settings"
                          className="flex items-center gap-3 px-4 py-2.5 text-sm text-slate-700 hover:bg-slate-50 hover:text-slate-900 transition-colors"
                          onClick={() => setDropdownOpen(false)}
                        >
                          <HiCog className="h-4 w-4" />
                          Settings
                        </Link>
                      </div>

                      <div className="py-2 border-t border-slate-200">
                        <button
                          onClick={handleLogout}
                          className="flex items-center gap-3 px-4 py-2.5 text-sm text-red-600 hover:bg-red-50 w-full transition-colors"
                        >
                          <HiLogout className="h-4 w-4" />
                          Logout
                        </button>
                      </div>
                    </motion.div>
                  </>
                )}
              </AnimatePresence>
            </div>
          </div>
        </div>
      </div>
    </nav>
  );
};

export default Navbar;
