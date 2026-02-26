// src/pages/student/MyCourses.jsx
import React, { useState, useEffect, useMemo } from 'react';
import { motion, AnimatePresence } from 'framer-motion';
import { useNavigate } from 'react-router-dom';
import {
  HiAcademicCap,
  HiUsers,
  HiClock,
  HiBookOpen,
  HiClipboardList,
  HiChartBar,
  HiPlay,
  HiCheckCircle,
  HiRefresh,
  HiSparkles,
  HiPlus,
  HiSearch,
} from 'react-icons/hi';
import Card from '../../components/common/Card';
import Button from '../../components/common/Button';
import Modal from '../../components/common/Modal';
import Loader from '../../components/common/Loader';
import { useApi } from '../../hooks/useApi';
import { studentApi } from '../../api/studentApi';
import { staggerContainer, slideUp } from '../../utils/constants';
import { cn } from '../../utils/helpers';

const StudentCourses = () => {
  const navigate = useNavigate();
  const { loading, execute } = useApi();

  // ============ State ============
  const [myCourses, setMyCourses] = useState([]);
  const [availableCourses, setAvailableCourses] = useState([]);
  const [progress, setProgress] = useState([]);
  const [selectedCourse, setSelectedCourse] = useState(null);
  const [isDetailsModalOpen, setIsDetailsModalOpen] = useState(false);
  const [isEnrollModalOpen, setIsEnrollModalOpen] = useState(false);
  const [viewMode, setViewMode] = useState('grid');
  const [searchQuery, setSearchQuery] = useState('');
  const [enrolling, setEnrolling] = useState(false);

  // ============ Fetch Data ============
  const fetchData = async () => {
    await Promise.all([
      execute(() => studentApi.getMyCourses(), {
        showSuccessToast: false,
        onSuccess: (data) => {
          const list = Array.isArray(data) ? data : data?.data || [];
          setMyCourses(list);
        },
        onError: () => setMyCourses([]),
      }),
      execute(() => studentApi.getApprovedCourses(), {
        showSuccessToast: false,
        onSuccess: (data) => {
          const list = Array.isArray(data) ? data : data?.data || [];
          setAvailableCourses(list);
        },
        onError: () => setAvailableCourses([]),
      }),
      execute(() => studentApi.getProgress(), {
        showSuccessToast: false,
        onSuccess: (data) => {
          const progressData = data?.progress || data || [];
          setProgress(Array.isArray(progressData) ? progressData : []);
        },
        onError: () => setProgress([]),
      }),
    ]);
  };

  useEffect(() => {
    fetchData();
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, []);

  // ============ Computed Values ============
  const coursesWithProgress = useMemo(() => {
    return myCourses.map((course) => {
      const courseProgress = progress.find((p) => p.courseId === course._id);
      const progressPercent =
        courseProgress && courseProgress.totalAssignments > 0
          ? Math.round(
              (courseProgress.gradedAssignments /
                courseProgress.totalAssignments) *
                100
            )
          : 0;

      return {
        ...course,
        progressInfo: courseProgress,
        progressPercent,
        completedLectures:
          course.lectures?.filter((l) => l.completed)?.length || 0,
        totalLectures: course.lectures?.length || 0,
      };
    });
  }, [myCourses, progress]);

  const notEnrolledCourses = useMemo(() => {
    const enrolledIds = new Set(myCourses.map((c) => c._id));
    return availableCourses.filter((c) => !enrolledIds.has(c._id));
  }, [availableCourses, myCourses]);

  const filteredCourses = useMemo(() => {
    if (!searchQuery) return coursesWithProgress;
    const query = searchQuery.toLowerCase();
    return coursesWithProgress.filter(
      (course) =>
        course.title?.toLowerCase().includes(query) ||
        course.description?.toLowerCase().includes(query) ||
        course.category?.toLowerCase().includes(query)
    );
  }, [coursesWithProgress, searchQuery]);

  const stats = useMemo(() => {
    const total = coursesWithProgress.length;
    const inProgress = coursesWithProgress.filter(
      (c) => c.progressPercent < 100 && c.progressPercent > 0
    ).length;
    const completed = coursesWithProgress.filter(
      (c) => c.progressPercent === 100
    ).length;
    const avgProgress =
      total > 0
        ? Math.round(
            coursesWithProgress.reduce(
              (sum, c) => sum + c.progressPercent,
              0
            ) / total
          )
        : 0;

    return { total, inProgress, completed, avgProgress };
  }, [coursesWithProgress]);

  // ============ Handlers ============
  const handleEnroll = async (courseId) => {
    setEnrolling(true);
    try {
      await execute(() => studentApi.enrollCourse(courseId), {
        successMessage: 'Enrollment request sent successfully!',
        onSuccess: () => {
          setIsEnrollModalOpen(false);
          fetchData();
        },
      });
    } finally {
      setEnrolling(false);
    }
  };

  const handleViewCourse = async (course) => {
    try {
      const response = await execute(() => studentApi.getCourse(course._id), {
        showSuccessToast: false,
      });
      if (response) {
        setSelectedCourse({ ...course, ...response });
        setIsDetailsModalOpen(true);
      }
    } catch (error) {
      setSelectedCourse(course);
      setIsDetailsModalOpen(true);
    }
  };

  // NEW: navigate to course lectures/details page
  const handleContinue = (courseId) => {
    // This assumes you will add a route like:
    // <Route path="courses/:courseId" element={<StudentCourseDetail />} />
    navigate(`/student/courses/${courseId}`);
  };

  // ============ Helpers ============
  const getProgressColor = (progress) => {
    if (progress >= 75) return 'from-green-500 to-green-600';
    if (progress >= 50) return 'from-blue-500 to-blue-600';
    if (progress >= 25) return 'from-amber-500 to-amber-600';
    return 'from-red-500 to-red-600';
  };

  const getCategoryEmoji = (category) => {
    const emojis = {
      'Computer Science': '💻',
      Programming: '⌨️',
      'Web Development': '🌐',
      Database: '🗄️',
      Design: '🎨',
      Business: '📊',
      default: '📚',
    };
    return emojis[category] || emojis.default;
  };

  // ============ 3D Stat Card ============
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
          <div>
            <p className="text-sm font-medium text-dark-500">{title}</p>
            <p className="mt-2 text-3xl font-extrabold text-dark-900">
              {value}
            </p>
            {hint && <p className="mt-1 text-xs text-dark-400">{hint}</p>}
          </div>
          <div
            className={cn(
              'p-4 rounded-2xl text-white shadow-lg bg-gradient-to-br',
              gradient
            )}
          >
            <Icon className="w-6 h-6" />
          </div>
        </div>
      </div>
    </motion.div>
  );

  // ============ Course Card ============
  const CourseCard = ({ course }) => (
    <motion.div
      initial={{ opacity: 0, scale: 0.9 }}
      animate={{ opacity: 1, scale: 1 }}
      whileHover={{ y: -5 }}
      transition={{ duration: 0.2 }}
      className="card-hover group relative overflow-hidden rounded-2xl border border-dark-100 bg-white shadow-soft hover:shadow-soft-lg transition-all"
    >
      <div className="p-6">
        {/* Header */}
        <div className="flex items-start justify-between mb-4">
          <div className="flex items-center gap-3">
            <div className="w-14 h-14 rounded-2xl bg-gradient-to-br from-primary-500 to-accent-500 flex items-center justify-center text-2xl shadow-lg shadow-primary-500/30">
              {getCategoryEmoji(course.category)}
            </div>
            <div className="min-w-0">
              <h3 className="text-lg font-bold text-dark-900 truncate">
                {course.title}
              </h3>
              <p className="text-sm text-dark-500">
                {course.category || 'General'}
              </p>
            </div>
          </div>
        </div>

        {/* Instructor */}
        <div className="flex items-center gap-2 mb-4 p-3 bg-dark-50 rounded-xl">
          <HiUsers className="w-4 h-4 text-dark-400" />
          <span className="text-sm text-dark-600 truncate">
            <span className="font-medium">Instructor:</span>{' '}
            {course.teacher?.name || 'Not assigned'}
          </span>
        </div>

        {/* Progress */}
        <div className="mb-4">
          <div className="flex justify-between text-sm mb-2">
            <span className="text-dark-500">Progress</span>
            <span className="font-semibold text-dark-900">
              {course.progressPercent}%
            </span>
          </div>
          <div className="w-full h-2 bg-dark-100 rounded-full overflow-hidden">
            <motion.div
              initial={{ width: 0 }}
              animate={{ width: `${course.progressPercent}%` }}
              transition={{ delay: 0.3, duration: 0.8, ease: 'easeOut' }}
              className={cn(
                'h-full bg-gradient-to-r rounded-full',
                getProgressColor(course.progressPercent)
              )}
            />
          </div>
        </div>

        {/* Stats */}
        <div className="grid grid-cols-2 gap-3 mb-4">
          <div className="p-2 bg-primary-50 rounded-lg">
            <div className="flex items-center gap-2">
              <HiPlay className="w-4 h-4 text-primary-600" />
              <span className="text-xs text-primary-700">Lectures</span>
            </div>
            <p className="text-sm font-semibold text-primary-900 mt-1">
              {course.totalLectures || 0}
            </p>
          </div>
          <div className="p-2 bg-accent-50 rounded-lg">
            <div className="flex items-center gap-2">
              <HiClipboardList className="w-4 h-4 text-accent-600" />
              <span className="text-xs text-accent-700">Tasks</span>
            </div>
            <p className="text-sm font-semibold text-accent-900 mt-1">
              {course.progressInfo?.gradedAssignments || 0}/
              {course.progressInfo?.totalAssignments || 0}
            </p>
          </div>
        </div>

        {/* Duration */}
        {course.duration && (
          <div className="p-3 bg-amber-50 rounded-xl mb-4">
            <div className="flex items-center justify-between">
              <div className="flex items-center gap-2">
                <HiClock className="w-4 h-4 text-amber-600" />
                <span className="text-xs text-amber-700 font-medium">
                  Duration
                </span>
              </div>
              <span className="text-xs text-amber-900 font-semibold">
                {course.duration}
              </span>
            </div>
          </div>
        )}

        {/* Actions */}
        <div className="grid grid-cols-2 gap-2">
          <Button
            size="sm"
            variant="outline"
            onClick={() => handleViewCourse(course)}
          >
            View Details
          </Button>
          <Button
            size="sm"
            icon={HiPlay}
            onClick={() => handleContinue(course._id)}
          >
            Continue
          </Button>
        </div>
      </div>
    </motion.div>
  );

  return (
    <motion.div
      initial="initial"
      animate="animate"
      variants={staggerContainer}
      className="space-y-6"
    >
      {/* ============ Header ============ */}
      <motion.div
        variants={slideUp}
        className="relative overflow-hidden rounded-2xl"
      >
        <div className="absolute inset-0 bg-gradient-to-br from-primary-600 via-primary-700 to-accent-600" />
        <div className="absolute inset-0 bg-hero-pattern opacity-10" />
        <div className="relative p-6 sm:p-8">
          <div className="flex flex-col gap-4 lg:flex-row lg:items-center lg:justify-between">
            <div className="text-white">
              <div className="inline-flex items-center gap-2 px-3 py-1.5 rounded-full bg-white/15 backdrop-blur-sm border border-white/10">
                <HiSparkles className="w-4 h-4" />
                <span className="text-xs font-semibold">My Learning</span>
              </div>
              <h1 className="mt-4 text-2xl sm:text-3xl font-extrabold">
                My Courses
              </h1>
              <p className="mt-2 text-white/80 text-sm sm:text-base">
                Track your enrolled courses and continue learning
              </p>
            </div>
            <div className="flex flex-col sm:flex-row gap-3">
              <Button
                variant="outline"
                className="border-white/30 text-white hover:bg-white/10"
                icon={HiRefresh}
                onClick={fetchData}
              >
                Refresh
              </Button>
              <Button
                className="bg-white text-primary-700 hover:bg-white/90"
                icon={HiPlus}
                onClick={() => setIsEnrollModalOpen(true)}
              >
                Enroll New
              </Button>
            </div>
          </div>
        </div>
      </motion.div>

      {/* ============ Loading ============ */}
      {loading && (
        <div className="py-10">
          <Loader size="lg" text="Loading courses..." />
        </div>
      )}

      {/* ============ Stats ============ */}
      {!loading && (
        <motion.div
          variants={slideUp}
          className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-4"
        >
          <StatCard3D
            title="Total Courses"
            value={stats.total}
            icon={HiAcademicCap}
            gradient="from-blue-500 to-blue-600"
            hint="Enrolled courses"
          />
          <StatCard3D
            title="In Progress"
            value={stats.inProgress}
            icon={HiClock}
            gradient="from-amber-500 to-amber-600"
            hint="Currently learning"
          />
          <StatCard3D
            title="Completed"
            value={stats.completed}
            icon={HiCheckCircle}
            gradient="from-green-500 to-green-600"
            hint="Finished courses"
          />
          <StatCard3D
            title="Avg. Progress"
            value={`${stats.avgProgress}%`}
            icon={HiChartBar}
            gradient="from-purple-500 to-purple-600"
            hint="Overall completion"
          />
        </motion.div>
      )}

      {/* ============ Search & View Toggle ============ */}
      {!loading && (
        <motion.div variants={slideUp}>
          <Card padding={false} className="p-4">
            <div className="flex flex-col sm:flex-row gap-4 items-center justify-between">
              <div className="relative w-full sm:w-80">
                <HiSearch className="absolute left-3 top-1/2 -translate-y-1/2 w-5 h-5 text-dark-400" />
                <input
                  type="text"
                  placeholder="Search courses..."
                  value={searchQuery}
                  onChange={(e) => setSearchQuery(e.target.value)}
                  className="input pl-10 w-full"
                />
              </div>
              <div className="flex gap-1 p-1 bg-dark-100 rounded-lg">
                <button
                  onClick={() => setViewMode('grid')}
                  className={cn(
                    'p-2 rounded-lg transition-colors',
                    viewMode === 'grid'
                      ? 'bg-white text-primary-600 shadow-sm'
                      : 'text-dark-500'
                  )}
                >
                  <svg
                    className="w-5 h-5"
                    fill="none"
                    stroke="currentColor"
                    viewBox="0 0 24 24"
                  >
                    <path
                      strokeLinecap="round"
                      strokeLinejoin="round"
                      strokeWidth={2}
                      d="M4 6a2 2 0 012-2h2a2 2 0 012 2v2a2 2 0 01-2 2H6a2 2 0 01-2-2V6zM14 6a2 2 0 012-2h2a2 2 0 012 2v2a2 2 0 01-2 2h-2a2 2 0 01-2-2V6zM4 16a2 2 0 012-2h2a2 2 0 012 2v2a2 2 0 01-2 2H6a2 2 0 01-2-2v-2zM14 16a2 2 0 012-2h2a2 2 0 012 2v2a2 2 0 01-2 2h-2a2 2 0 01-2-2v-2z"
                    />
                  </svg>
                </button>
                <button
                  onClick={() => setViewMode('list')}
                  className={cn(
                    'p-2 rounded-lg transition-colors',
                    viewMode === 'list'
                      ? 'bg-white text-primary-600 shadow-sm'
                      : 'text-dark-500'
                  )}
                >
                  <svg
                    className="w-5 h-5"
                    fill="none"
                    stroke="currentColor"
                    viewBox="0 0 24 24"
                  >
                    <path
                      strokeLinecap="round"
                      strokeLinejoin="round"
                      strokeWidth={2}
                      d="M4 6h16M4 10h16M4 14h16M4 18h16"
                    />
                  </svg>
                </button>
              </div>
            </div>
          </Card>
        </motion.div>
      )}

      {/* ============ Courses Grid/List ============ */}
      {!loading && (
        <>
          {viewMode === 'grid' ? (
            <motion.div
              variants={slideUp}
              className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 xl:grid-cols-4 gap-6"
            >
              <AnimatePresence mode="wait">
                {filteredCourses.length === 0 ? (
                  <motion.div
                    initial={{ opacity: 0 }}
                    animate={{ opacity: 1 }}
                    className="col-span-full text-center py-16"
                  >
                    <HiAcademicCap className="w-16 h-16 mx-auto mb-4 text-dark-300" />
                    <p className="text-dark-500 font-medium">
                      No courses found
                    </p>
                    <p className="text-sm text-dark-400 mt-1 mb-4">
                      {searchQuery
                        ? 'Try a different search term'
                        : 'Enroll in courses to start learning'}
                    </p>
                    <Button
                      icon={HiPlus}
                      onClick={() => setIsEnrollModalOpen(true)}
                    >
                      Browse Courses
                    </Button>
                  </motion.div>
                ) : (
                  filteredCourses.map((course) => (
                    <CourseCard key={course._id} course={course} />
                  ))
                )}
              </AnimatePresence>
            </motion.div>
          ) : (
            <motion.div variants={slideUp} className="space-y-4">
              {filteredCourses.map((course, index) => (
                <motion.div
                  key={course._id}
                  initial={{ opacity: 0, x: -20 }}
                  animate={{ opacity: 1, x: 0 }}
                  transition={{ delay: index * 0.1 }}
                  className="card p-6"
                >
                  <div className="flex items-center gap-6">
                    <div className="w-20 h-20 rounded-2xl bg-gradient-to-br from-primary-500 to-accent-500 flex items-center justify-center text-4xl flex-shrink-0">
                      {getCategoryEmoji(course.category)}
                    </div>
                    <div className="flex-1 min-w-0">
                      <div className="flex items-start justify-between gap-4">
                        <div className="min-w-0">
                          <h3 className="text-xl font-bold text-dark-900 truncate">
                            {course.title}
                          </h3>
                          <p className="text-dark-600 mt-1 line-clamp-1">
                            {course.description}
                          </p>
                          <div className="flex flex-wrap gap-4 mt-3 text-sm text-dark-500">
                            <div className="flex items-center gap-1">
                              <HiUsers className="w-4 h-4" />
                              <span>
                                {course.teacher?.name || 'Instructor'}
                              </span>
                            </div>
                            <div className="flex items-center gap-1">
                              <HiBookOpen className="w-4 h-4" />
                              <span>{course.totalLectures} Lectures</span>
                            </div>
                            <div className="flex items-center gap-1">
                              <HiChartBar className="w-4 h-4" />
                              <span>{course.progressPercent}% Complete</span>
                            </div>
                          </div>
                        </div>
                        <div className="flex gap-2 flex-shrink-0">
                          <Button
                            variant="outline"
                            onClick={() => handleViewCourse(course)}
                          >
                            Details
                          </Button>
                          <Button
                            icon={HiPlay}
                            onClick={() => handleContinue(course._id)}
                          >
                            Continue
                          </Button>
                        </div>
                      </div>
                    </div>
                  </div>
                </motion.div>
              ))}
            </motion.div>
          )}
        </>
      )}

      {/* ============ Enroll Modal ============ */}
      <Modal
        isOpen={isEnrollModalOpen}
        onClose={() => setIsEnrollModalOpen(false)}
        title="Available Courses"
        description="Browse and enroll in new courses"
        size="lg"
      >
        <div className="space-y-4 max-h-96 overflow-y-auto">
          {notEnrolledCourses.length === 0 ? (
            <div className="text-center py-8">
              <HiCheckCircle className="w-12 h-12 mx-auto mb-3 text-green-400" />
              <p className="text-dark-500">
                You're enrolled in all available courses!
              </p>
            </div>
          ) : (
            notEnrolledCourses.map((course) => (
              <div
                key={course._id}
                className="p-4 rounded-xl border border-dark-100 hover:border-primary-200 hover:bg-primary-50/50 transition-all"
              >
                <div className="flex items-center justify-between gap-4">
                  <div className="flex items-center gap-3 min-w-0">
                    <div className="w-12 h-12 rounded-xl bg-gradient-to-br from-primary-500 to-accent-500 flex items-center justify-center text-xl flex-shrink-0">
                      {getCategoryEmoji(course.category)}
                    </div>
                    <div className="min-w-0">
                      <h4 className="font-semibold text-dark-900 truncate">
                        {course.title}
                      </h4>
                      <p className="text-sm text-dark-500">
                        {course.teacher?.name || 'Instructor'} •{' '}
                        {course.category}
                      </p>
                    </div>
                  </div>
                  <Button
                    size="sm"
                    icon={HiPlus}
                    onClick={() => handleEnroll(course._id)}
                    loading={enrolling}
                  >
                    Enroll
                  </Button>
                </div>
              </div>
            ))
          )}
        </div>
      </Modal>

      {/* ============ Details Modal ============ */}
      <Modal
        isOpen={isDetailsModalOpen}
        onClose={() => {
          setIsDetailsModalOpen(false);
          setSelectedCourse(null);
        }}
        title={selectedCourse?.title}
        size="lg"
      >
        {selectedCourse && (
          <div className="space-y-6">
            <div>
              <h4 className="font-semibold text-dark-900 mb-2">
                Description
              </h4>
              <p className="text-dark-600">
                {selectedCourse.description || 'No description available.'}
              </p>
            </div>

            <div className="grid grid-cols-2 gap-4">
              <div className="p-4 bg-dark-50 rounded-xl">
                <p className="text-sm text-dark-500 mb-1">Category</p>
                <p className="font-semibold text-dark-900">
                  {selectedCourse.category || 'General'}
                </p>
              </div>
              <div className="p-4 bg-dark-50 rounded-xl">
                <p className="text-sm text-dark-500 mb-1">Duration</p>
                <p className="font-semibold text-dark-900">
                  {selectedCourse.duration || 'N/A'}
                </p>
              </div>
              <div className="p-4 bg-dark-50 rounded-xl">
                <p className="text-sm text-dark-500 mb-1">Instructor</p>
                <p className="font-semibold text-dark-900">
                  {selectedCourse.teacher?.name || 'Not assigned'}
                </p>
              </div>
              <div className="p-4 bg-dark-50 rounded-xl">
                <p className="text-sm text-dark-500 mb-1">Total Lectures</p>
                <p className="font-semibold text-dark-900">
                  {selectedCourse.lectures?.length || 0}
                </p>
              </div>
            </div>

            <div className="p-4 bg-primary-50 rounded-xl">
              <div className="flex items-center justify-between mb-2">
                <span className="text-sm text-primary-700">
                  Your Progress
                </span>
                <span className="text-lg font-bold text-primary-700">
                  {selectedCourse.progressPercent || 0}%
                </span>
              </div>
              <div className="w-full h-3 bg-primary-100 rounded-full overflow-hidden">
                <div
                  className="h-full bg-gradient-to-r from-primary-500 to-accent-500 rounded-full"
                  style={{
                    width: `${selectedCourse.progressPercent || 0}%`,
                  }}
                />
              </div>
            </div>

            {selectedCourse.lectures?.length > 0 && (
              <div>
                <h4 className="font-semibold text-dark-900 mb-3">
                  Lectures
                </h4>
                <div className="space-y-2 max-h-48 overflow-y-auto">
                  {selectedCourse.lectures.map((lecture, index) => (
                    <div
                      key={index}
                      className="flex items-center gap-3 p-3 bg-dark-50 rounded-lg hover:bg-dark-100 transition-colors"
                    >
                      <div className="w-8 h-8 rounded-full bg-primary-100 flex items-center justify-center text-sm font-semibold text-primary-600">
                        {index + 1}
                      </div>
                      <div className="flex-1 min-w-0">
                        <p className="font-medium text-dark-900 truncate">
                          {lecture.title || `Lecture ${index + 1}`}
                        </p>
                      </div>
                      <HiPlay className="w-5 h-5 text-primary-600" />
                    </div>
                  ))}
                </div>
              </div>
            )}

            <div className="flex gap-3">
              <Button
                fullWidth
                variant="outline"
                onClick={() => setIsDetailsModalOpen(false)}
              >
                Close
              </Button>
              <Button
                fullWidth
                icon={HiPlay}
                onClick={() => {
                  setIsDetailsModalOpen(false);
                  handleContinue(selectedCourse._id);
                }}
              >
                Continue Learning
              </Button>
            </div>
          </div>
        )}
      </Modal>
    </motion.div>
  );
};

export default StudentCourses;