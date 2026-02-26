// src/pages/teacher/Announcements.jsx
import React, { useEffect, useMemo, useState } from 'react';
import { motion, AnimatePresence } from 'framer-motion';
import {
  HiSpeakerphone,
  HiCalendar,
  HiClock,
  HiUsers,              // ✅ ADD THIS
  HiBell,
  HiExclamationCircle,
  HiInformationCircle,
  HiRefresh,
  HiSparkles,
  HiSearch,
} from 'react-icons/hi';

import Card from '../../components/common/Card';
import Button from '../../components/common/Button';
import Loader from '../../components/common/Loader';
import { useApi } from '../../hooks/useApi';
import { teacherApi } from '../../api/teacherApi';
import { staggerContainer, slideUp } from '../../utils/constants';
import { getRelativeTime, formatDate, cn } from '../../utils/helpers';

const TeacherAnnouncements = () => {
  const { loading, execute } = useApi();

  const [announcements, setAnnouncements] = useState([]);
  const [filter, setFilter] = useState('all'); // all | teacher | high
  const [searchQuery, setSearchQuery] = useState('');

  const fetchAnnouncements = async () => {
    await execute(() => teacherApi.getAnnouncements(), {
      showSuccessToast: false,
      onSuccess: (data) => {
        const list = Array.isArray(data) ? data : data?.data || [];
        setAnnouncements(Array.isArray(list) ? list : []);
      },
      onError: () => setAnnouncements([]),
    });
  };

  useEffect(() => {
    fetchAnnouncements();
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, []);

  const stats = useMemo(() => {
    const weekAgo = new Date(Date.now() - 7 * 24 * 60 * 60 * 1000);
    const thisWeek = announcements.filter((a) => new Date(a.createdAt) > weekAgo).length;
    const highPriority = announcements.filter((a) => a.priority === 'high' || a.priority === 'urgent').length;

    return {
      total: announcements.length,
      thisWeek,
      highPriority,
      teacherOnly: announcements.filter((a) => a.roleVisibility === 'teacher').length,
    };
  }, [announcements]);

  const filteredAnnouncements = useMemo(() => {
    let filtered = [...announcements];

    if (filter === 'teacher') {
      filtered = filtered.filter((a) => a.roleVisibility === 'teacher');
    } else if (filter === 'high') {
      filtered = filtered.filter((a) => a.priority === 'high' || a.priority === 'urgent');
    }

    if (searchQuery.trim()) {
      const q = searchQuery.toLowerCase();
      filtered = filtered.filter(
        (a) =>
          a.title?.toLowerCase().includes(q) ||
          a.description?.toLowerCase().includes(q)
      );
    }

    filtered.sort((a, b) => new Date(b.createdAt || 0) - new Date(a.createdAt || 0));
    return filtered;
  }, [announcements, filter, searchQuery]);

  const getPriorityUI = (priority) => {
    const map = {
      urgent: { badge: 'badge-danger', gradient: 'from-red-500 to-red-600', icon: '🚨' },
      high: { badge: 'badge-warning', gradient: 'from-amber-500 to-amber-600', icon: '🔴' },
      normal: { badge: 'badge-info', gradient: 'from-blue-500 to-blue-600', icon: '🔵' },
      low: { badge: 'badge-secondary', gradient: 'from-gray-500 to-gray-600', icon: '⚪' },
    };
    return map[priority] || map.normal;
  };

  const StatCard3D = ({ label, value, icon: Icon, gradient }) => (
    <motion.div
      whileHover={{ y: -4 }}
      transition={{ type: 'spring', stiffness: 280, damping: 18 }}
      className={cn(
        'relative overflow-hidden rounded-2xl border border-dark-100 bg-white',
        'shadow-[0_18px_35px_-18px_rgba(15,23,42,0.25)]',
        'hover:shadow-[0_28px_55px_-22px_rgba(99,102,241,0.28)]',
        'transition-all'
      )}
    >
      <div className={cn('absolute -top-14 -right-14 w-44 h-44 rounded-full blur-3xl opacity-20 bg-gradient-to-br', gradient)} />
      <div className="p-5 relative">
        <div className="flex items-start justify-between gap-4">
          <div>
            <p className="text-sm font-medium text-dark-500">{label}</p>
            <p className="mt-2 text-3xl font-extrabold text-dark-900">{value}</p>
          </div>
          <div className={cn('shrink-0 p-4 rounded-2xl text-white shadow-lg bg-gradient-to-br', gradient)}>
            <Icon className="w-6 h-6" />
          </div>
        </div>
      </div>
    </motion.div>
  );

  return (
    <motion.div initial="initial" animate="animate" variants={staggerContainer} className="space-y-6">
      {/* Header */}
      <motion.div variants={slideUp} className="relative overflow-hidden rounded-2xl">
        <div className="absolute inset-0 bg-gradient-to-br from-primary-600 via-primary-700 to-accent-600" />
        <div className="absolute inset-0 bg-hero-pattern opacity-10" />
        <div className="relative p-6 sm:p-8">
          <div className="flex flex-col gap-4 lg:flex-row lg:items-center lg:justify-between">
            <div className="text-white">
              <div className="inline-flex items-center gap-2 px-3 py-1.5 rounded-full bg-white/15 backdrop-blur-sm border border-white/10">
                <HiSparkles className="w-4 h-4" />
                <span className="text-xs font-semibold">Teacher Notices</span>
              </div>
              <h1 className="mt-4 text-2xl sm:text-3xl font-extrabold">Announcements</h1>
              <p className="mt-2 text-white/80 text-sm sm:text-base">
                Fetched live from your database
              </p>
            </div>

            <Button
              variant="outline"
              className="border-white/30 text-white hover:bg-white/10"
              icon={HiRefresh}
              onClick={fetchAnnouncements}
            >
              Refresh
            </Button>
          </div>
        </div>
      </motion.div>

      {loading && (
        <div className="py-10">
          <Loader size="lg" text="Loading announcements..." />
        </div>
      )}

      {!loading && (
        <>
          {/* Stats */}
          <motion.div variants={slideUp} className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-4">
            <StatCard3D label="Total" value={stats.total} icon={HiSpeakerphone} gradient="from-blue-500 to-blue-600" />
            <StatCard3D label="This Week" value={stats.thisWeek} icon={HiCalendar} gradient="from-green-500 to-green-600" />
            <StatCard3D label="High Priority" value={stats.highPriority} icon={HiExclamationCircle} gradient="from-amber-500 to-amber-600" />
            <StatCard3D label="Teacher Only" value={stats.teacherOnly} icon={HiBell} gradient="from-purple-500 to-purple-600" />
          </motion.div>

          {/* Filters */}
          <motion.div variants={slideUp}>
            <Card padding={false} className="p-4">
              <div className="flex flex-col lg:flex-row gap-4">
                <div className="relative flex-1">
                  <HiSearch className="absolute left-3 top-1/2 -translate-y-1/2 w-5 h-5 text-dark-400" />
                  <input
                    value={searchQuery}
                    onChange={(e) => setSearchQuery(e.target.value)}
                    placeholder="Search announcements..."
                    className="input pl-10 w-full"
                  />
                </div>

                <div className="flex flex-wrap gap-2">
                  {[
                    { key: 'all', label: 'All' },
                    { key: 'teacher', label: 'Teacher Only' },
                    { key: 'high', label: 'High Priority' },
                  ].map((f) => (
                    <button
                      key={f.key}
                      onClick={() => setFilter(f.key)}
                      className={cn(
                        'px-4 py-2 rounded-lg font-medium transition-all',
                        filter === f.key
                          ? 'bg-primary-600 text-white shadow-lg shadow-primary-500/30'
                          : 'bg-dark-100 text-dark-600 hover:bg-dark-200'
                      )}
                    >
                      {f.label}
                    </button>
                  ))}
                </div>
              </div>
            </Card>
          </motion.div>

          {/* List */}
          <motion.div variants={slideUp} className="space-y-4">
            <AnimatePresence mode="popLayout">
              {filteredAnnouncements.length === 0 ? (
                <motion.div initial={{ opacity: 0 }} animate={{ opacity: 1 }} className="text-center py-16">
                  <HiSpeakerphone className="w-16 h-16 mx-auto mb-4 text-dark-300" />
                  <p className="text-dark-500 font-medium">No announcements found</p>
                </motion.div>
              ) : (
                filteredAnnouncements.map((a, index) => {
                  const p = getPriorityUI(a.priority);
                  return (
                    <motion.div
                      key={a._id}
                      layout
                      initial={{ opacity: 0, y: 20 }}
                      animate={{ opacity: 1, y: 0 }}
                      exit={{ opacity: 0, x: -100 }}
                      transition={{ delay: index * 0.05 }}
                      className="card hover:shadow-soft-lg transition-all"
                    >
                      <div className="p-6">
                        <div className="flex items-start gap-4">
                          <div className={cn('w-14 h-14 rounded-2xl flex items-center justify-center text-2xl shadow-lg bg-gradient-to-br', p.gradient)}>
                            {p.icon}
                          </div>

                          <div className="flex-1 min-w-0">
                            <div className="flex items-start justify-between gap-3">
                              <div className="min-w-0">
                                <div className="flex items-center gap-2 mb-2">
                                  <h3 className="text-lg font-bold text-dark-900 truncate">{a.title}</h3>
                                  <span className={cn('badge capitalize shrink-0', p.badge)}>
                                    {a.priority || 'normal'}
                                  </span>
                                </div>
                                <p className="text-dark-600">{a.description}</p>

                                <div className="mt-3 flex flex-wrap items-center gap-4 text-sm text-dark-500">
                                  <div className="flex items-center gap-1">
                                    <HiUsers className="w-4 h-4" />
                                    <span className="capitalize">{a.roleVisibility || 'all'}</span>
                                  </div>
                                  <div className="flex items-center gap-1">
                                    <HiClock className="w-4 h-4" />
                                    <span>{a.createdAt ? getRelativeTime(a.createdAt) : ''}</span>
                                  </div>
                                  <div className="flex items-center gap-1">
                                    <HiInformationCircle className="w-4 h-4" />
                                    <span>
                                      By {typeof a.createdBy === 'object' ? a.createdBy?.name : 'Admin'}
                                    </span>
                                  </div>
                                  <span className="text-xs text-dark-400">
                                    {a.createdAt ? formatDate(a.createdAt) : ''}
                                  </span>
                                </div>
                              </div>
                            </div>
                          </div>
                        </div>
                      </div>
                    </motion.div>
                  );
                })
              )}
            </AnimatePresence>
          </motion.div>
        </>
      )}
    </motion.div>
  );
};

export default TeacherAnnouncements;