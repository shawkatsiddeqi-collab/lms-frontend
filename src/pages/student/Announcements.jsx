// src/pages/student/Announcements.jsx
import React, { useState, useEffect, useMemo } from 'react';
import { motion, AnimatePresence } from 'framer-motion';
import {
  HiSpeakerphone,
  HiCalendar,
  HiClock,
  HiBell,
  HiExclamationCircle,
  HiInformationCircle,
  HiBookmark,
  HiBookmarkAlt,
  HiCheckCircle,
  HiRefresh,
  HiSparkles,
  HiArrowRight,
  HiFilter,
  HiSearch,
  HiAcademicCap,
} from 'react-icons/hi';

import Card from '../../components/common/Card';
import Button from '../../components/common/Button';
import Loader from '../../components/common/Loader';
import { staggerContainer, slideUp } from '../../utils/constants';
import { formatDate, getRelativeTime, cn } from '../../utils/helpers';
import { useApi } from '../../hooks/useApi';
import { studentApi } from '../../api/studentApi';

const StudentAnnouncements = () => {
  // ============ State ============
  const [announcements, setAnnouncements] = useState([]);
  const [filter, setFilter] = useState('all');
  const [searchQuery, setSearchQuery] = useState('');
  const [bookmarkedIds, setBookmarkedIds] = useState([]);
  const [readIds, setReadIds] = useState([]);

  const { loading, execute } = useApi();

  // ============ Load saved bookmarks and read status from localStorage ============
  useEffect(() => {
    const savedBookmarks = JSON.parse(localStorage.getItem('bookmarkedAnnouncements') || '[]');
    const savedRead = JSON.parse(localStorage.getItem('readAnnouncements') || '[]');
    setBookmarkedIds(savedBookmarks);
    setReadIds(savedRead);
  }, []);

  // ============ Fetch Announcements ============
  const fetchAnnouncements = async () => {
    await execute(() => studentApi.getAnnouncements(), {
      showSuccessToast: false,
      onSuccess: (data) => {
        const list = Array.isArray(data) ? data : data?.data || data?.announcements || [];
        setAnnouncements(list);
      },
      onError: () => {
        setAnnouncements([]);
      },
    });
  };

  useEffect(() => {
    fetchAnnouncements();
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, []);

  // ============ Bookmark Toggle ============
  const toggleBookmark = (id) => {
    const updated = bookmarkedIds.includes(id)
      ? bookmarkedIds.filter((bookId) => bookId !== id)
      : [...bookmarkedIds, id];
    setBookmarkedIds(updated);
    localStorage.setItem('bookmarkedAnnouncements', JSON.stringify(updated));
  };

  // ============ Mark as Read ============
  const markAsRead = (id) => {
    if (!readIds.includes(id)) {
      const updated = [...readIds, id];
      setReadIds(updated);
      localStorage.setItem('readAnnouncements', JSON.stringify(updated));
    }
  };

  // ============ Mark All as Read ============
  const markAllAsRead = () => {
    const allIds = announcements.map((a) => a._id);
    setReadIds(allIds);
    localStorage.setItem('readAnnouncements', JSON.stringify(allIds));
  };

  // ============ Priority Helpers ============
  const getPriorityConfig = (priority) => {
    const configs = {
      urgent: {
        badge: 'bg-red-100 text-red-700 border border-red-200',
        icon: '🚨',
        gradient: 'from-red-500 to-red-600',
      },
      high: {
        badge: 'bg-orange-100 text-orange-700 border border-orange-200',
        icon: '🔴',
        gradient: 'from-orange-500 to-orange-600',
      },
      normal: {
        badge: 'bg-blue-100 text-blue-700 border border-blue-200',
        icon: '🔵',
        gradient: 'from-blue-500 to-blue-600',
      },
      low: {
        badge: 'bg-gray-100 text-gray-700 border border-gray-200',
        icon: '⚪',
        gradient: 'from-gray-500 to-gray-600',
      },
    };
    return configs[priority] || configs.normal;
  };

  // ============ Visibility Helpers ============
  const getVisibilityBadge = (visibility) => {
    const badges = {
      all: { text: 'Everyone', class: 'bg-purple-100 text-purple-700' },
      student: { text: 'Students', class: 'bg-green-100 text-green-700' },
      teacher: { text: 'Teachers', class: 'bg-blue-100 text-blue-700' },
    };
    return badges[visibility] || badges.all;
  };

  // ============ Computed Values ============
  const unreadCount = useMemo(() => {
    return announcements.filter((a) => !readIds.includes(a._id)).length;
  }, [announcements, readIds]);

  const thisWeekCount = useMemo(() => {
    const weekAgo = new Date(Date.now() - 7 * 24 * 60 * 60 * 1000);
    return announcements.filter((a) => new Date(a.createdAt) > weekAgo).length;
  }, [announcements]);

  const urgentCount = useMemo(() => {
    return announcements.filter((a) => a.priority === 'urgent' || a.priority === 'high').length;
  }, [announcements]);

  // ============ Filtered Announcements ============
  const filteredAnnouncements = useMemo(() => {
    let filtered = [...announcements];

    // Apply filter
    if (filter === 'bookmarked') {
      filtered = filtered.filter((a) => bookmarkedIds.includes(a._id));
    } else if (filter === 'unread') {
      filtered = filtered.filter((a) => !readIds.includes(a._id));
    } else if (filter === 'urgent') {
      filtered = filtered.filter((a) => a.priority === 'urgent' || a.priority === 'high');
    }

    // Apply search
    if (searchQuery.trim()) {
      const query = searchQuery.toLowerCase();
      filtered = filtered.filter(
        (a) =>
          a.title?.toLowerCase().includes(query) ||
          a.description?.toLowerCase().includes(query)
      );
    }

    // Sort by date (newest first)
    filtered.sort((a, b) => new Date(b.createdAt) - new Date(a.createdAt));

    return filtered;
  }, [announcements, filter, bookmarkedIds, readIds, searchQuery]);

  // ============ 3D Stat Card Component ============
  const StatCard3D = ({ title, value, icon: Icon, gradient, hint }) => (
    <motion.div
      whileHover={{ y: -4 }}
      transition={{ type: 'spring', stiffness: 300, damping: 20 }}
      className={cn(
        'relative overflow-hidden rounded-2xl border border-dark-100 bg-white',
        'shadow-[0_18px_35px_-18px_rgba(15,23,42,0.25)]',
        'hover:shadow-[0_28px_55px_-22px_rgba(99,102,241,0.28)]',
        'transition-all'
      )}
    >
      <div
        className={cn(
          'absolute -top-14 -right-14 w-44 h-44 rounded-full blur-3xl opacity-20 bg-gradient-to-br',
          gradient
        )}
      />
      <div className="p-5 relative">
        <div className="flex items-start justify-between gap-4">
          <div className="min-w-0">
            <p className="text-sm font-medium text-dark-500">{title}</p>
            <p className="mt-2 text-3xl font-extrabold text-dark-900 tracking-tight">
              {value}
            </p>
            {hint && <p className="mt-1 text-xs text-dark-400">{hint}</p>}
          </div>
          <div
            className={cn(
              'shrink-0 p-4 rounded-2xl text-white shadow-lg bg-gradient-to-br',
              gradient
            )}
          >
            <Icon className="w-6 h-6" />
          </div>
        </div>
      </div>
    </motion.div>
  );

  return (
    <motion.div
      initial="initial"
      animate="animate"
      variants={staggerContainer}
      className="space-y-6 sm:space-y-8"
    >
      {/* ============ HEADER ============ */}
      <motion.div variants={slideUp} className="relative overflow-hidden rounded-2xl">
        <div className="absolute inset-0 bg-gradient-to-br from-primary-600 via-primary-700 to-accent-600" />
        <div className="absolute inset-0 bg-hero-pattern opacity-10" />
        <div className="relative p-6 sm:p-8">
          <div className="flex flex-col gap-4 lg:flex-row lg:items-center lg:justify-between">
            <div className="text-white">
              <div className="inline-flex items-center gap-2 px-3 py-1.5 rounded-full bg-white/15 backdrop-blur-sm border border-white/10">
                <HiSparkles className="w-4 h-4" />
                <span className="text-xs font-semibold">Stay Updated</span>
              </div>

              <h1 className="mt-4 text-2xl sm:text-3xl font-extrabold leading-tight">
                Announcements
              </h1>
              <p className="mt-2 text-white/80 text-sm sm:text-base max-w-2xl">
                Important notifications and updates from your institution
              </p>
            </div>

            <div className="flex flex-col sm:flex-row gap-3">
              {unreadCount > 0 && (
                <Button
                  variant="outline"
                  className="border-white/30 text-white hover:bg-white/10"
                  icon={HiCheckCircle}
                  onClick={markAllAsRead}
                >
                  Mark All Read ({unreadCount})
                </Button>
              )}
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
        </div>

        {/* Decorative Elements */}
        <div className="absolute -top-16 -left-16 w-48 h-48 bg-white/10 rounded-full blur-3xl" />
        <div className="absolute -bottom-16 -right-16 w-56 h-56 bg-accent-300/20 rounded-full blur-3xl" />
      </motion.div>

      {/* ============ LOADING ============ */}
      {loading && (
        <div className="py-10">
          <Loader size="lg" text="Loading announcements..." />
        </div>
      )}

      {/* ============ STATS CARDS ============ */}
      {!loading && (
        <motion.div
          variants={slideUp}
          className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-4 sm:gap-5"
        >
          <StatCard3D
            title="Total Announcements"
            value={announcements.length}
            icon={HiSpeakerphone}
            gradient="from-blue-500 to-blue-600"
            hint="All notifications"
          />
          <StatCard3D
            title="Unread"
            value={unreadCount}
            icon={HiBell}
            gradient="from-red-500 to-red-600"
            hint="Needs attention"
          />
          <StatCard3D
            title="Bookmarked"
            value={bookmarkedIds.length}
            icon={HiBookmarkAlt}
            gradient="from-purple-500 to-purple-600"
            hint="Saved for later"
          />
          <StatCard3D
            title="This Week"
            value={thisWeekCount}
            icon={HiCalendar}
            gradient="from-green-500 to-green-600"
            hint="Recent updates"
          />
        </motion.div>
      )}

      {/* ============ FILTERS & SEARCH ============ */}
      {!loading && (
        <motion.div variants={slideUp}>
          <Card
            padding={false}
            className="p-4 shadow-[0_18px_35px_-20px_rgba(15,23,42,0.25)]"
          >
            <div className="flex flex-col lg:flex-row gap-4">
              {/* Search */}
              <div className="relative flex-1">
                <HiSearch className="absolute left-3 top-1/2 -translate-y-1/2 w-5 h-5 text-dark-400" />
                <input
                  type="text"
                  placeholder="Search announcements..."
                  value={searchQuery}
                  onChange={(e) => setSearchQuery(e.target.value)}
                  className="input pl-10 w-full"
                />
              </div>

              {/* Filter Buttons */}
              <div className="flex flex-wrap gap-2">
                {[
                  { value: 'all', label: 'All', icon: HiSpeakerphone },
                  { value: 'unread', label: `Unread (${unreadCount})`, icon: HiBell },
                  { value: 'bookmarked', label: 'Bookmarked', icon: HiBookmarkAlt },
                  { value: 'urgent', label: `Urgent (${urgentCount})`, icon: HiExclamationCircle },
                ].map((filterOption) => (
                  <button
                    key={filterOption.value}
                    onClick={() => setFilter(filterOption.value)}
                    className={cn(
                      'inline-flex items-center gap-2 px-4 py-2 rounded-xl font-medium transition-all',
                      filter === filterOption.value
                        ? 'bg-primary-600 text-white shadow-lg shadow-primary-500/30'
                        : 'bg-dark-100 text-dark-600 hover:bg-dark-200'
                    )}
                  >
                    <filterOption.icon className="w-4 h-4" />
                    {filterOption.label}
                  </button>
                ))}
              </div>
            </div>
          </Card>
        </motion.div>
      )}

      {/* ============ ANNOUNCEMENTS LIST ============ */}
      {!loading && (
        <motion.div variants={slideUp} className="space-y-4">
          <AnimatePresence mode="popLayout">
            {filteredAnnouncements.length === 0 ? (
              <motion.div
                initial={{ opacity: 0 }}
                animate={{ opacity: 1 }}
                className="text-center py-16"
              >
                <div className="mx-auto w-20 h-20 rounded-full bg-dark-100 flex items-center justify-center mb-4">
                  <HiSpeakerphone className="w-10 h-10 text-dark-400" />
                </div>
                <p className="text-dark-500 font-medium text-lg">No announcements found</p>
                <p className="text-sm text-dark-400 mt-1">
                  {filter !== 'all'
                    ? 'Try changing the filter to see more announcements'
                    : searchQuery
                    ? 'Try a different search term'
                    : 'Check back later for updates'}
                </p>
                {filter !== 'all' && (
                  <Button
                    variant="outline"
                    className="mt-4"
                    onClick={() => {
                      setFilter('all');
                      setSearchQuery('');
                    }}
                  >
                    Clear Filters
                  </Button>
                )}
              </motion.div>
            ) : (
              filteredAnnouncements.map((announcement, index) => {
                const isRead = readIds.includes(announcement._id);
                const isBookmarked = bookmarkedIds.includes(announcement._id);
                const priorityConfig = getPriorityConfig(announcement.priority);
                const visibilityBadge = getVisibilityBadge(announcement.roleVisibility);

                return (
                  <motion.div
                    key={announcement._id}
                    layout
                    initial={{ opacity: 0, y: 20 }}
                    animate={{ opacity: 1, y: 0 }}
                    exit={{ opacity: 0, x: -100 }}
                    transition={{ delay: index * 0.05 }}
                    onClick={() => markAsRead(announcement._id)}
                    className={cn(
                      'relative overflow-hidden rounded-2xl border bg-white cursor-pointer group',
                      'shadow-[0_10px_30px_-15px_rgba(15,23,42,0.15)]',
                      'hover:shadow-[0_20px_40px_-20px_rgba(99,102,241,0.25)]',
                      'transition-all duration-300',
                      !isRead && 'border-l-4 border-l-primary-500 border-t border-r border-b border-dark-100',
                      isRead && 'border-dark-100'
                    )}
                  >
                    {/* Priority Indicator Strip */}
                    <div
                      className={cn(
                        'absolute top-0 right-0 w-24 h-24 -mr-12 -mt-12 rounded-full blur-2xl opacity-20 bg-gradient-to-br',
                        priorityConfig.gradient
                      )}
                    />

                    <div className="p-6 relative">
                      <div className="flex items-start gap-4">
                        {/* Icon */}
                        <div
                          className={cn(
                            'w-14 h-14 rounded-2xl flex items-center justify-center text-2xl flex-shrink-0 shadow-lg bg-gradient-to-br',
                            priorityConfig.gradient
                          )}
                        >
                          {priorityConfig.icon}
                        </div>

                        {/* Content */}
                        <div className="flex-1 min-w-0">
                          <div className="flex items-start justify-between gap-4 mb-3">
                            <div className="flex-1 min-w-0">
                              {/* Title Row */}
                              <div className="flex flex-wrap items-center gap-2 mb-2">
                                <h3
                                  className={cn(
                                    'text-lg font-bold truncate',
                                    isRead ? 'text-dark-700' : 'text-dark-900'
                                  )}
                                >
                                  {announcement.title}
                                </h3>
                                {!isRead && (
                                  <span className="px-2 py-1 bg-primary-100 text-primary-700 text-xs font-semibold rounded-full animate-pulse">
                                    NEW
                                  </span>
                                )}
                              </div>

                              {/* Badges Row */}
                              <div className="flex flex-wrap items-center gap-2 mb-3">
                                <span
                                  className={cn(
                                    'px-2 py-1 rounded-lg text-xs font-semibold capitalize',
                                    priorityConfig.badge
                                  )}
                                >
                                  {announcement.priority || 'normal'}
                                </span>
                                <span
                                  className={cn(
                                    'px-2 py-1 rounded-lg text-xs font-semibold',
                                    visibilityBadge.class
                                  )}
                                >
                                  {visibilityBadge.text}
                                </span>
                              </div>

                              {/* Description */}
                              <p
                                className={cn(
                                  'text-sm mb-4 line-clamp-2',
                                  isRead ? 'text-dark-500' : 'text-dark-600'
                                )}
                              >
                                {announcement.description}
                              </p>

                              {/* Meta Info */}
                              <div className="flex flex-wrap items-center gap-4 text-xs text-dark-500">
                                {announcement.createdBy && (
                                  <div className="flex items-center gap-1">
                                    <HiAcademicCap className="w-4 h-4" />
                                    <span>
                                      {typeof announcement.createdBy === 'object'
                                        ? announcement.createdBy.name
                                        : 'Admin'}
                                    </span>
                                  </div>
                                )}
                                <div className="flex items-center gap-1">
                                  <HiClock className="w-4 h-4" />
                                  <span>{getRelativeTime(announcement.createdAt)}</span>
                                </div>
                                <div className="flex items-center gap-1">
                                  <HiCalendar className="w-4 h-4" />
                                  <span>{formatDate(announcement.createdAt)}</span>
                                </div>
                              </div>
                            </div>

                            {/* Bookmark Button */}
                            <motion.button
                              whileHover={{ scale: 1.1 }}
                              whileTap={{ scale: 0.9 }}
                              onClick={(e) => {
                                e.stopPropagation();
                                toggleBookmark(announcement._id);
                              }}
                              className={cn(
                                'p-3 rounded-xl transition-colors flex-shrink-0',
                                isBookmarked
                                  ? 'text-amber-600 bg-amber-50 shadow-lg shadow-amber-500/20'
                                  : 'text-dark-400 hover:bg-dark-50'
                              )}
                            >
                              {isBookmarked ? (
                                <HiBookmarkAlt className="w-5 h-5" />
                              ) : (
                                <HiBookmark className="w-5 h-5" />
                              )}
                            </motion.button>
                          </div>
                        </div>
                      </div>

                      {/* Read Indicator */}
                      {isRead && (
                        <div className="absolute bottom-4 right-4">
                          <div className="flex items-center gap-1 text-xs text-green-600">
                            <HiCheckCircle className="w-4 h-4" />
                            <span>Read</span>
                          </div>
                        </div>
                      )}
                    </div>
                  </motion.div>
                );
              })
            )}
          </AnimatePresence>
        </motion.div>
      )}

      {/* ============ LOAD MORE / PAGINATION (if needed) ============ */}
      {!loading && filteredAnnouncements.length > 0 && (
        <motion.div variants={slideUp} className="flex justify-center pt-4">
          <p className="text-sm text-dark-500">
            Showing {filteredAnnouncements.length} of {announcements.length} announcements
          </p>
        </motion.div>
      )}
    </motion.div>
  );
};

export default StudentAnnouncements;