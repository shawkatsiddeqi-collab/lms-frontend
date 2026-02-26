// src/pages/teacher/MyCourses.jsx
import React, { useState, useEffect, useMemo } from 'react';
import { motion, AnimatePresence } from 'framer-motion';
import { useNavigate } from 'react-router-dom';
import {
  HiAcademicCap,
  HiUsers,
  HiClock,
  HiCalendar,
  HiEye,
  HiPlus,
  HiUpload,
  HiVideoCamera,
  HiPencil,
  HiTrash,
  HiRefresh,
  HiSparkles,
  HiSearch,
  HiCheckCircle,
  HiExclamationCircle,
  HiPlay,
  HiFolder,
} from 'react-icons/hi';

import Card from '../../components/common/Card';
import Button from '../../components/common/Button';
import Modal from '../../components/common/Modal';
import Input from '../../components/common/Input';
import ConfirmDialog from '../../components/common/ConfirmDialog';
import Loader from '../../components/common/Loader';
import { useApi } from '../../hooks/useApi';
import { teacherApi } from '../../api/teacherApi';
import { staggerContainer, slideUp } from '../../utils/constants';
import { formatDate, cn } from '../../utils/helpers';

const TeacherCourses = () => {
  const navigate = useNavigate(); // (not used yet, keeping)
  const { loading, execute } = useApi();

  // ============ State ============
  const [courses, setCourses] = useState([]);
  const [selectedCourse, setSelectedCourse] = useState(null);
  const [viewMode, setViewMode] = useState('grid');
  const [searchQuery, setSearchQuery] = useState('');
  const [filterStatus, setFilterStatus] = useState('all');

  // Modal States
  const [isCreateModalOpen, setIsCreateModalOpen] = useState(false);
  const [isEditModalOpen, setIsEditModalOpen] = useState(false);
  const [isViewModalOpen, setIsViewModalOpen] = useState(false);
  const [isUploadModalOpen, setIsUploadModalOpen] = useState(false);
  const [isDeleteOpen, setIsDeleteOpen] = useState(false);

  // Loading States
  const [submitting, setSubmitting] = useState(false);
  const [uploading, setUploading] = useState(false);
  const [deleting, setDeleting] = useState(false);

  // Form Data
  const [courseFormData, setCourseFormData] = useState({
    title: '',
    description: '',
    category: '',
    duration: '',
  });

  const [uploadFormData, setUploadFormData] = useState({
    title: '',
    file: null,
    description: '',
  });

  // ============ Fetch Courses ============
  const fetchCourses = async () => {
    await execute(() => teacherApi.getCourses(), {
      showSuccessToast: false,
      onSuccess: (data) => {
        const courseList = data?.courses || [];
        setCourses(Array.isArray(courseList) ? courseList : []);
      },
      onError: () => setCourses([]),
    });
  };

  useEffect(() => {
    fetchCourses();
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, []);

  // ============ Computed Stats ============
  const stats = useMemo(() => {
    const total = courses.length;
    const approved = courses.filter((c) => c.status === 'approved').length;
    const pending = courses.filter((c) => c.status === 'pending').length;
    const totalStudents = courses.reduce((sum, c) => sum + (c.studentsEnrolled?.length || 0), 0);
    const totalLectures = courses.reduce((sum, c) => sum + (c.lectures?.length || 0), 0);

    return { total, approved, pending, totalStudents, totalLectures };
  }, [courses]);

  // ============ Filtered Courses ============
  const filteredCourses = useMemo(() => {
    let filtered = [...courses];

    if (filterStatus !== 'all') {
      filtered = filtered.filter((c) => c.status === filterStatus);
    }

    if (searchQuery.trim()) {
      const query = searchQuery.toLowerCase();
      filtered = filtered.filter(
        (c) =>
          c.title?.toLowerCase().includes(query) ||
          c.description?.toLowerCase().includes(query) ||
          c.category?.toLowerCase().includes(query)
      );
    }

    return filtered.sort((a, b) => new Date(b.createdAt || 0) - new Date(a.createdAt || 0));
  }, [courses, filterStatus, searchQuery]);

  // ============ Form Reset ============
  const resetCourseForm = () => {
    setCourseFormData({
      title: '',
      description: '',
      category: '',
      duration: '',
    });
    setSelectedCourse(null);
  };

  const resetUploadForm = () => {
    setUploadFormData({
      title: '',
      file: null,
      description: '',
    });
  };

  // ============ Handlers ============
  const handleCreateCourse = async (e) => {
    e.preventDefault();
    setSubmitting(true);

    try {
      await execute(() => teacherApi.createCourse(courseFormData), {
        successMessage: 'Course created successfully! Awaiting admin approval.',
        onSuccess: () => {
          setIsCreateModalOpen(false);
          resetCourseForm();
          fetchCourses();
        },
      });
    } finally {
      setSubmitting(false);
    }
  };

  const handleUpdateCourse = async (e) => {
    e.preventDefault();
    if (!selectedCourse) return;
    setSubmitting(true);

    try {
      await execute(() => teacherApi.updateCourse(selectedCourse._id, courseFormData), {
        successMessage: 'Course updated successfully!',
        onSuccess: () => {
          setIsEditModalOpen(false);
          resetCourseForm();
          fetchCourses();
        },
      });
    } finally {
      setSubmitting(false);
    }
  };

  const handleDeleteCourse = async () => {
    if (!selectedCourse) return;
    setDeleting(true);

    try {
      await execute(() => teacherApi.deleteCourse(selectedCourse._id), {
        successMessage: 'Course deleted successfully!',
        onSuccess: () => {
          setIsDeleteOpen(false);
          setSelectedCourse(null);
          fetchCourses();
        },
      });
    } finally {
      setDeleting(false);
    }
  };

  const handleUploadLecture = async (e) => {
    e.preventDefault();
    if (!selectedCourse || !uploadFormData.file) return;
    setUploading(true);

    try {
      const formData = new FormData();
      formData.append('title', uploadFormData.title);
      formData.append('file', uploadFormData.file);
      if (uploadFormData.description) {
        formData.append('description', uploadFormData.description);
      }

      await execute(() => teacherApi.uploadLecture(selectedCourse._id, formData), {
        successMessage: 'Lecture uploaded successfully!',
        onSuccess: () => {
          setIsUploadModalOpen(false);
          resetUploadForm();
          fetchCourses();
        },
      });
    } finally {
      setUploading(false);
    }
  };

  // ============ Modal Openers ============
  const openEditModal = (course) => {
    setSelectedCourse(course);
    setCourseFormData({
      title: course.title || '',
      description: course.description || '',
      category: course.category || '',
      duration: course.duration || '',
    });
    setIsEditModalOpen(true);
  };

  const openViewModal = (course) => {
    setSelectedCourse(course);
    setIsViewModalOpen(true);
  };

  const openUploadModal = (course) => {
    setSelectedCourse(course);
    resetUploadForm();
    setIsUploadModalOpen(true);
  };

  const openDeleteDialog = (course) => {
    setSelectedCourse(course);
    setIsDeleteOpen(true);
  };

  // ============ Helpers ============
  const getStatusBadge = (status) => {
    if (status === 'approved') return 'badge-success';
    if (status === 'pending') return 'badge-warning';
    return 'badge-secondary';
  };

  const getStatusLabel = (status) => {
    if (status === 'approved') return 'Approved';
    if (status === 'pending') return 'Pending Approval';
    return status || 'Unknown';
  };

  const getCategoryEmoji = (category) => {
    const emojis = {
      'Computer Science': '💻',
      Programming: '⌨️',
      'Web Development': '🌐',
      Database: '🗄️',
      Design: '🎨',
      Business: '📊',
      Mathematics: '📐',
      Science: '🔬',
    };
    return emojis[category] || '📚';
  };

  // ============ 3D Stat Card ============
  const StatCard3D = ({ title, value, subtitle, icon: Icon, gradient, onClick }) => (
    <motion.button
      type="button"
      whileHover={{ y: -4 }}
      whileTap={{ scale: 0.99 }}
      transition={{ type: 'spring', stiffness: 300, damping: 20 }}
      onClick={onClick}
      className={cn(
        'relative w-full text-left overflow-hidden rounded-2xl border border-dark-100 bg-white',
        'shadow-[0_18px_35px_-18px_rgba(15,23,42,0.25)]',
        'hover:shadow-[0_28px_55px_-22px_rgba(99,102,241,0.28)]',
        'transition-all',
        onClick && 'cursor-pointer'
      )}
    >
      <div className={cn('absolute -top-14 -right-14 w-44 h-44 rounded-full blur-3xl opacity-20 bg-gradient-to-br', gradient)} />
      <div className="p-5 relative">
        <div className="flex items-start justify-between gap-4">
          <div>
            <p className="text-sm font-medium text-dark-500">{title}</p>
            <p className="mt-2 text-3xl font-extrabold text-dark-900">{value}</p>
            {subtitle && <p className="mt-1 text-xs text-dark-400">{subtitle}</p>}
          </div>
          <div className={cn('shrink-0 p-4 rounded-2xl text-white shadow-lg bg-gradient-to-br', gradient)}>
            <Icon className="w-6 h-6" />
          </div>
        </div>
      </div>
    </motion.button>
  );

  // ============ Course Card ============
  const CourseCard = ({ course }) => {
    const studentsCount = course.studentsEnrolled?.length || 0;
    const lecturesCount = course.lectures?.length || 0;

    return (
      <motion.div
        initial={{ opacity: 0, scale: 0.9 }}
        animate={{ opacity: 1, scale: 1 }}
        whileHover={{ y: -5 }}
        transition={{ duration: 0.2 }}
        className="card-hover group relative overflow-hidden rounded-2xl border border-dark-100 bg-white shadow-soft hover:shadow-soft-lg transition-all"
      >
        {/* Status Badge */}
        <div className={cn('absolute top-4 right-4 z-10', course.status === 'pending' && 'animate-pulse')}>
          <span className={cn('badge', getStatusBadge(course.status))}>{getStatusLabel(course.status)}</span>
        </div>

        <div className="p-6">
          {/* Header */}
          <div className="flex items-start gap-4 mb-4">
            <div className="w-16 h-16 rounded-2xl bg-gradient-to-br from-primary-500 to-accent-500 flex items-center justify-center text-3xl shadow-lg shadow-primary-500/30 shrink-0">
              {getCategoryEmoji(course.category)}
            </div>
            <div className="flex-1 min-w-0">
              <h3 className="text-lg font-bold text-dark-900 mb-1 truncate pr-20">{course.title}</h3>
              <div className="flex items-center gap-2 text-sm text-dark-500">
                <span className="font-medium">{course.category || 'Uncategorized'}</span>
              </div>
            </div>
          </div>

          {/* Description */}
          <p className="text-sm text-dark-600 mb-4 line-clamp-2">{course.description || 'No description'}</p>

          {/* Stats */}
          <div className="grid grid-cols-2 gap-4 mb-4">
            <div className="flex items-center gap-2">
              <div className="w-8 h-8 rounded-lg bg-blue-100 flex items-center justify-center">
                <HiUsers className="w-4 h-4 text-blue-600" />
              </div>
              <div>
                <p className="text-xs text-dark-500">Students</p>
                <p className="text-sm font-bold text-dark-900">{studentsCount}</p>
              </div>
            </div>

            <div className="flex items-center gap-2">
              <div className="w-8 h-8 rounded-lg bg-purple-100 flex items-center justify-center">
                <HiVideoCamera className="w-4 h-4 text-purple-600" />
              </div>
              <div>
                <p className="text-xs text-dark-500">Lectures</p>
                <p className="text-sm font-bold text-dark-900">{lecturesCount}</p>
              </div>
            </div>

            <div className="flex items-center gap-2">
              <div className="w-8 h-8 rounded-lg bg-green-100 flex items-center justify-center">
                <HiClock className="w-4 h-4 text-green-600" />
              </div>
              <div>
                <p className="text-xs text-dark-500">Duration</p>
                <p className="text-sm font-bold text-dark-900">{course.duration || 'N/A'}</p>
              </div>
            </div>

            <div className="flex items-center gap-2">
              <div className="w-8 h-8 rounded-lg bg-amber-100 flex items-center justify-center">
                <HiCalendar className="w-4 h-4 text-amber-600" />
              </div>
              <div>
                <p className="text-xs text-dark-500">Created</p>
                <p className="text-sm font-bold text-dark-900">{formatDate(course.createdAt)}</p>
              </div>
            </div>
          </div>

          {/* Pending Warning */}
          {course.status === 'pending' && (
            <div className="p-3 bg-amber-50 rounded-xl mb-4 border border-amber-200">
              <div className="flex items-center gap-2">
                <HiExclamationCircle className="w-5 h-5 text-amber-600 shrink-0" />
                <p className="text-xs text-amber-700">
                  Awaiting admin approval. Students cannot enroll yet.
                </p>
              </div>
            </div>
          )}

          {/* Actions */}
          <div className="grid grid-cols-2 gap-2">
            <Button size="sm" variant="outline" icon={HiVideoCamera} onClick={() => openUploadModal(course)}>
              Add Lecture
            </Button>
            <Button size="sm" icon={HiEye} onClick={() => openViewModal(course)}>
              View Details
            </Button>
          </div>

          {/* Edit/Delete Row */}
          <div className="flex gap-2 mt-2">
            <Button size="sm" variant="ghost" icon={HiPencil} onClick={() => openEditModal(course)} className="flex-1">
              Edit
            </Button>
            <Button
              size="sm"
              variant="ghost"
              className="flex-1 text-red-500 hover:bg-red-50"
              onClick={() => openDeleteDialog(course)}
            >
              <HiTrash className="w-4 h-4 mr-1" />
              Delete
            </Button>
          </div>
        </div>
      </motion.div>
    );
  };

  return (
    <motion.div initial="initial" animate="animate" variants={staggerContainer} className="space-y-6">
      {/* HEADER */}
      <motion.div variants={slideUp} className="relative overflow-hidden rounded-3xl">
        <div className="absolute inset-0 bg-gradient-to-br from-primary-600 via-primary-700 to-accent-600" />
        <div className="absolute inset-0 bg-hero-pattern opacity-10" />
        <div className="absolute -top-20 -left-20 w-64 h-64 bg-white/10 rounded-full blur-3xl" />
        <div className="absolute -bottom-20 -right-20 w-80 h-80 bg-accent-300/20 rounded-full blur-3xl" />

        <div className="relative p-6 sm:p-10">
          <div className="flex flex-col gap-6 lg:flex-row lg:items-center lg:justify-between">
            <div className="text-white">
              <div className="inline-flex items-center gap-2 px-4 py-2 rounded-full bg-white/20 backdrop-blur-sm border border-white/30 mb-4">
                <HiSparkles className="w-5 h-5" />
                <span className="text-sm font-bold">Course Manager</span>
              </div>

              <h1 className="text-3xl sm:text-4xl lg:text-5xl font-black leading-tight mb-3">My Courses</h1>
              <p className="text-white/90 text-base sm:text-lg max-w-2xl">
                Create, manage, and organize your teaching courses
              </p>

              <div className="mt-6 grid grid-cols-2 sm:grid-cols-4 gap-4">
                <div className="backdrop-blur-sm bg-white/10 rounded-xl p-3 border border-white/20">
                  <p className="text-white/70 text-xs font-medium">Total Courses</p>
                  <p className="text-2xl font-bold text-white mt-1">{stats.total}</p>
                </div>
                <div className="backdrop-blur-sm bg-white/10 rounded-xl p-3 border border-white/20">
                  <p className="text-white/70 text-xs font-medium">Approved</p>
                  <p className="text-2xl font-bold text-white mt-1">{stats.approved}</p>
                </div>
                <div className="backdrop-blur-sm bg-white/10 rounded-xl p-3 border border-white/20">
                  <p className="text-white/70 text-xs font-medium">Total Students</p>
                  <p className="text-2xl font-bold text-white mt-1">{stats.totalStudents}</p>
                </div>
                <div className="backdrop-blur-sm bg-white/10 rounded-xl p-3 border border-white/20">
                  <p className="text-white/70 text-xs font-medium">Lectures</p>
                  <p className="text-2xl font-bold text-white mt-1">{stats.totalLectures}</p>
                </div>
              </div>
            </div>

            <div className="flex flex-col sm:flex-row gap-3">
              <Button
                variant="outline"
                className="border-white/40 text-white hover:bg-white/20 backdrop-blur-sm"
                icon={HiRefresh}
                onClick={fetchCourses}
              >
                Refresh
              </Button>
              <Button
                className="bg-white text-primary-700 hover:bg-white/90 shadow-lg"
                icon={HiPlus}
                onClick={() => {
                  resetCourseForm();
                  setIsCreateModalOpen(true);
                }}
              >
                Create Course
              </Button>
            </div>
          </div>
        </div>
      </motion.div>

      {/* LOADING */}
      {loading && (
        <div className="py-16">
          <Loader size="lg" text="Loading courses..." />
        </div>
      )}

      {/* STATS CARDS */}
      {!loading && (
        <motion.div variants={slideUp} className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-4">
          <StatCard3D title="Total Courses" value={stats.total} subtitle="All your courses" icon={HiAcademicCap} gradient="from-blue-500 to-blue-600" />
          <StatCard3D title="Approved" value={stats.approved} subtitle="Live courses" icon={HiCheckCircle} gradient="from-green-500 to-green-600" />
          <StatCard3D title="Pending" value={stats.pending} subtitle="Awaiting approval" icon={HiClock} gradient="from-amber-500 to-amber-600" />
          <StatCard3D title="Total Students" value={stats.totalStudents} subtitle="Enrolled students" icon={HiUsers} gradient="from-purple-500 to-purple-600" />
        </motion.div>
      )}

      {/* FILTERS */}
      {!loading && (
        <motion.div variants={slideUp}>
          <Card padding={false} className="p-4 shadow-[0_20px_50px_-15px_rgba(15,23,42,0.2)]">
            <div className="flex flex-col lg:flex-row gap-4 items-center justify-between">
              <div className="relative w-full lg:w-80">
                <HiSearch className="absolute left-3 top-1/2 -translate-y-1/2 w-5 h-5 text-dark-400" />
                <input
                  type="text"
                  placeholder="Search courses..."
                  value={searchQuery}
                  onChange={(e) => setSearchQuery(e.target.value)}
                  className="input pl-10 w-full"
                />
              </div>

              <div className="flex gap-3 w-full lg:w-auto">
                <select
                  value={filterStatus}
                  onChange={(e) => setFilterStatus(e.target.value)}
                  className="input w-auto min-w-[160px]"
                >
                  <option value="all">All Status</option>
                  <option value="approved">Approved</option>
                  <option value="pending">Pending</option>
                </select>

                <div className="flex gap-1 p-1 bg-dark-100 rounded-lg">
                  <button
                    onClick={() => setViewMode('grid')}
                    className={cn('p-2 rounded-lg transition-colors', viewMode === 'grid' ? 'bg-white text-primary-600 shadow-sm' : 'text-dark-500')}
                  >
                    <svg className="w-5 h-5" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                      <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M4 6a2 2 0 012-2h2a2 2 0 012 2v2a2 2 0 01-2 2H6a2 2 0 01-2-2V6zM14 6a2 2 0 012-2h2a2 2 0 012 2v2a2 2 0 01-2 2h-2a2 2 0 01-2-2V6zM4 16a2 2 0 012-2h2a2 2 0 012 2v2a2 2 0 01-2 2H6a2 2 0 01-2-2v-2zM14 16a2 2 0 012-2h2a2 2 0 012 2v2a2 2 0 01-2 2h-2a2 2 0 01-2-2v-2z" />
                    </svg>
                  </button>
                  <button
                    onClick={() => setViewMode('list')}
                    className={cn('p-2 rounded-lg transition-colors', viewMode === 'list' ? 'bg-white text-primary-600 shadow-sm' : 'text-dark-500')}
                  >
                    <svg className="w-5 h-5" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                      <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M4 6h16M4 10h16M4 14h16M4 18h16" />
                    </svg>
                  </button>
                </div>
              </div>
            </div>
          </Card>
        </motion.div>
      )}

      {/* COURSES GRID/LIST */}
      {!loading && (
        <>
          {viewMode === 'grid' ? (
            <motion.div
              variants={slideUp}
              // ✅ CHANGE HERE: now exactly 2 cards per row on md and above
              className="grid grid-cols-1 md:grid-cols-2 gap-6"
            >
              <AnimatePresence mode="wait">
                {filteredCourses.length === 0 ? (
                  <motion.div initial={{ opacity: 0 }} animate={{ opacity: 1 }} className="col-span-full text-center py-16">
                    <HiAcademicCap className="w-16 h-16 mx-auto mb-4 text-dark-300" />
                    <p className="text-dark-500 font-medium">No courses found</p>
                    <p className="text-sm text-dark-400 mt-1 mb-4">
                      {searchQuery || filterStatus !== 'all' ? 'Try adjusting your filters' : 'Create your first course to get started'}
                    </p>
                    <Button
                      icon={HiPlus}
                      onClick={() => {
                        resetCourseForm();
                        setIsCreateModalOpen(true);
                      }}
                    >
                      Create Course
                    </Button>
                  </motion.div>
                ) : (
                  filteredCourses.map((course) => <CourseCard key={course._id} course={course} />)
                )}
              </AnimatePresence>
            </motion.div>
          ) : (
            <motion.div variants={slideUp} className="space-y-4">
              {filteredCourses.length === 0 ? (
                <div className="text-center py-16">
                  <HiAcademicCap className="w-16 h-16 mx-auto mb-4 text-dark-300" />
                  <p className="text-dark-500 font-medium">No courses found</p>
                </div>
              ) : (
                filteredCourses.map((course, index) => (
                  <motion.div
                    key={course._id}
                    initial={{ opacity: 0, x: -20 }}
                    animate={{ opacity: 1, x: 0 }}
                    transition={{ delay: index * 0.05 }}
                    className="card p-6"
                  >
                    <div className="flex items-center gap-6">
                      <div className="w-20 h-20 rounded-2xl bg-gradient-to-br from-primary-500 to-accent-500 flex items-center justify-center text-4xl shrink-0 shadow-lg">
                        {getCategoryEmoji(course.category)}
                      </div>
                      <div className="flex-1 min-w-0">
                        <div className="flex items-start justify-between gap-4">
                          <div className="min-w-0 flex-1">
                            <div className="flex items-center gap-3 mb-2">
                              <h3 className="text-xl font-bold text-dark-900 truncate">{course.title}</h3>
                              <span className={cn('badge shrink-0', getStatusBadge(course.status))}>
                                {getStatusLabel(course.status)}
                              </span>
                            </div>
                            <p className="text-dark-600 mb-3 line-clamp-1">{course.description}</p>
                            <div className="flex flex-wrap gap-6 text-sm text-dark-500">
                              <div className="flex items-center gap-1">
                                <HiFolder className="w-4 h-4 text-dark-400" />
                                <span>{course.category || 'Uncategorized'}</span>
                              </div>
                              <div className="flex items-center gap-1">
                                <HiUsers className="w-4 h-4 text-dark-400" />
                                <span>{course.studentsEnrolled?.length || 0} Students</span>
                              </div>
                              <div className="flex items-center gap-1">
                                <HiVideoCamera className="w-4 h-4 text-dark-400" />
                                <span>{course.lectures?.length || 0} Lectures</span>
                              </div>
                              <div className="flex items-center gap-1">
                                <HiClock className="w-4 h-4 text-dark-400" />
                                <span>{course.duration || 'N/A'}</span>
                              </div>
                            </div>
                          </div>
                          <div className="flex gap-2 shrink-0">
                            <Button size="sm" variant="outline" icon={HiVideoCamera} onClick={() => openUploadModal(course)}>
                              Upload
                            </Button>
                            <Button size="sm" variant="outline" icon={HiPencil} onClick={() => openEditModal(course)}>
                              Edit
                            </Button>
                            <Button size="sm" icon={HiEye} onClick={() => openViewModal(course)}>
                              View
                            </Button>
                          </div>
                        </div>
                      </div>
                    </div>
                  </motion.div>
                ))
              )}
            </motion.div>
          )}
        </>
      )}

      {/* CREATE COURSE MODAL */}
      <Modal
        isOpen={isCreateModalOpen}
        onClose={() => {
          setIsCreateModalOpen(false);
          resetCourseForm();
        }}
        title="Create New Course"
        description="Fill in the details to create a new course"
        size="lg"
      >
        <form onSubmit={handleCreateCourse} className="space-y-4">
          <Input
            label="Course Title"
            name="title"
            value={courseFormData.title}
            onChange={(e) => setCourseFormData({ ...courseFormData, title: e.target.value })}
            placeholder="e.g., Introduction to React.js"
            required
          />

          <div>
            <label className="block text-sm font-semibold text-dark-700 mb-2">
              Description <span className="text-red-500">*</span>
            </label>
            <textarea
              value={courseFormData.description}
              onChange={(e) => setCourseFormData({ ...courseFormData, description: e.target.value })}
              placeholder="Describe what students will learn in this course..."
              rows={4}
              className="input"
              required
            />
          </div>

          <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
            <Input
              label="Category"
              name="category"
              value={courseFormData.category}
              onChange={(e) => setCourseFormData({ ...courseFormData, category: e.target.value })}
              placeholder="e.g., Computer Science"
              required
            />
            <Input
              label="Duration"
              name="duration"
              value={courseFormData.duration}
              onChange={(e) => setCourseFormData({ ...courseFormData, duration: e.target.value })}
              placeholder="e.g., 12 weeks"
              required
            />
          </div>

          <div className="p-4 bg-amber-50 rounded-xl border border-amber-200">
            <div className="flex items-center gap-3">
              <HiExclamationCircle className="w-6 h-6 text-amber-600 shrink-0" />
              <p className="text-sm text-amber-700">
                New courses require admin approval before students can enroll. You'll be notified once approved.
              </p>
            </div>
          </div>

          <div className="flex justify-end gap-3 pt-4 border-t border-dark-100">
            <Button variant="ghost" onClick={() => setIsCreateModalOpen(false)}>
              Cancel
            </Button>
            <Button type="submit" icon={HiPlus} loading={submitting}>
              Create Course
            </Button>
          </div>
        </form>
      </Modal>

      {/* EDIT COURSE MODAL */}
      <Modal
        isOpen={isEditModalOpen}
        onClose={() => {
          setIsEditModalOpen(false);
          resetCourseForm();
        }}
        title="Edit Course"
        description="Update your course details"
        size="lg"
      >
        <form onSubmit={handleUpdateCourse} className="space-y-4">
          <Input
            label="Course Title"
            name="title"
            value={courseFormData.title}
            onChange={(e) => setCourseFormData({ ...courseFormData, title: e.target.value })}
            required
          />

          <div>
            <label className="block text-sm font-semibold text-dark-700 mb-2">
              Description <span className="text-red-500">*</span>
            </label>
            <textarea
              value={courseFormData.description}
              onChange={(e) => setCourseFormData({ ...courseFormData, description: e.target.value })}
              rows={4}
              className="input"
              required
            />
          </div>

          <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
            <Input
              label="Category"
              name="category"
              value={courseFormData.category}
              onChange={(e) => setCourseFormData({ ...courseFormData, category: e.target.value })}
              required
            />
            <Input
              label="Duration"
              name="duration"
              value={courseFormData.duration}
              onChange={(e) => setCourseFormData({ ...courseFormData, duration: e.target.value })}
              required
            />
          </div>

          <div className="flex justify-end gap-3 pt-4 border-t border-dark-100">
            <Button variant="ghost" onClick={() => setIsEditModalOpen(false)}>
              Cancel
            </Button>
            <Button type="submit" icon={HiPencil} loading={submitting}>
              Update Course
            </Button>
          </div>
        </form>
      </Modal>

      {/* VIEW COURSE MODAL */}
      <Modal
        isOpen={isViewModalOpen}
        onClose={() => {
          setIsViewModalOpen(false);
          setSelectedCourse(null);
        }}
        title={selectedCourse?.title}
        size="lg"
      >
        {selectedCourse && (
          <div className="space-y-6">
            {selectedCourse.status === 'pending' && (
              <div className="p-4 bg-amber-50 rounded-xl border border-amber-200">
                <div className="flex items-center gap-3">
                  <HiExclamationCircle className="w-6 h-6 text-amber-600 shrink-0" />
                  <div>
                    <p className="font-semibold text-amber-700">Pending Approval</p>
                    <p className="text-sm text-amber-600">This course is awaiting admin approval.</p>
                  </div>
                </div>
              </div>
            )}

            <div>
              <h4 className="font-semibold text-dark-900 mb-2">Description</h4>
              <p className="text-dark-600">{selectedCourse.description || 'No description'}</p>
            </div>

            <div className="grid grid-cols-2 gap-4">
              <div className="p-4 bg-dark-50 rounded-xl">
                <p className="text-sm text-dark-500 mb-1">Category</p>
                <p className="font-semibold text-dark-900">{selectedCourse.category || 'N/A'}</p>
              </div>
              <div className="p-4 bg-dark-50 rounded-xl">
                <p className="text-sm text-dark-500 mb-1">Duration</p>
                <p className="font-semibold text-dark-900">{selectedCourse.duration || 'N/A'}</p>
              </div>
              <div className="p-4 bg-dark-50 rounded-xl">
                <p className="text-sm text-dark-500 mb-1">Status</p>
                <span className={cn('badge', getStatusBadge(selectedCourse.status))}>
                  {getStatusLabel(selectedCourse.status)}
                </span>
              </div>
              <div className="p-4 bg-dark-50 rounded-xl">
                <p className="text-sm text-dark-500 mb-1">Created</p>
                <p className="font-semibold text-dark-900">{formatDate(selectedCourse.createdAt)}</p>
              </div>
            </div>

            <div>
              <h4 className="font-semibold text-dark-900 mb-3">Course Statistics</h4>
              <div className="grid grid-cols-3 gap-4">
                <div className="text-center p-4 bg-primary-50 rounded-xl border-2 border-primary-200">
                  <p className="text-3xl font-bold text-primary-600">{selectedCourse.studentsEnrolled?.length || 0}</p>
                  <p className="text-sm text-primary-700">Students</p>
                </div>
                <div className="text-center p-4 bg-purple-50 rounded-xl border-2 border-purple-200">
                  <p className="text-3xl font-bold text-purple-600">{selectedCourse.lectures?.length || 0}</p>
                  <p className="text-sm text-purple-700">Lectures</p>
                </div>
                <div className="text-center p-4 bg-green-50 rounded-xl border-2 border-green-200">
                  <p className="text-3xl font-bold text-green-600">{selectedCourse.status === 'approved' ? 'Live' : 'Pending'}</p>
                  <p className="text-sm text-green-700">Status</p>
                </div>
              </div>
            </div>

            {selectedCourse.lectures?.length > 0 && (
              <div>
                <h4 className="font-semibold text-dark-900 mb-3">Lectures ({selectedCourse.lectures.length})</h4>
                <div className="space-y-2 max-h-48 overflow-y-auto">
                  {selectedCourse.lectures.map((lecture, index) => (
                    <div
                      key={index}
                      className="flex items-center gap-3 p-3 bg-dark-50 rounded-lg hover:bg-dark-100 transition-colors"
                    >
                      <div className="w-10 h-10 rounded-full bg-primary-100 flex items-center justify-center text-sm font-bold text-primary-600">
                        {index + 1}
                      </div>
                      <div className="flex-1 min-w-0">
                        <p className="font-medium text-dark-900 truncate">
                          {lecture.title || `Lecture ${index + 1}`}
                        </p>
                        <p className="text-xs text-dark-500">{formatDate(lecture.uploadedAt)}</p>
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
                icon={HiVideoCamera}
                onClick={() => {
                  setIsViewModalOpen(false);
                  openUploadModal(selectedCourse);
                }}
              >
                Add Lecture
              </Button>
              <Button
                fullWidth
                icon={HiPencil}
                onClick={() => {
                  setIsViewModalOpen(false);
                  openEditModal(selectedCourse);
                }}
              >
                Edit Course
              </Button>
            </div>
          </div>
        )}
      </Modal>

      {/* UPLOAD LECTURE MODAL */}
      <Modal
        isOpen={isUploadModalOpen}
        onClose={() => {
          setIsUploadModalOpen(false);
          resetUploadForm();
        }}
        title="Upload Lecture"
        description={`Add new content to "${selectedCourse?.title}"`}
      >
        <form onSubmit={handleUploadLecture} className="space-y-4">
          <Input
            label="Lecture Title"
            name="title"
            value={uploadFormData.title}
            onChange={(e) => setUploadFormData({ ...uploadFormData, title: e.target.value })}
            placeholder="e.g., Introduction to Hooks"
            required
          />

          <div>
            <label className="block text-sm font-semibold text-dark-700 mb-2">Description (Optional)</label>
            <textarea
              value={uploadFormData.description}
              onChange={(e) => setUploadFormData({ ...uploadFormData, description: e.target.value })}
              placeholder="Brief description..."
              rows={3}
              className="input"
            />
          </div>

          <div>
            <label className="block text-sm font-semibold text-dark-700 mb-2">
              Upload File <span className="text-red-500">*</span>
            </label>
            <div
              className="border-2 border-dashed border-dark-300 rounded-xl p-6 text-center hover:border-primary-500 transition-colors cursor-pointer"
              onClick={() => document.getElementById('lecture-file')?.click()}
            >
              <HiUpload className="w-12 h-12 text-dark-400 mx-auto mb-3" />
              <p className="text-sm text-dark-600 mb-1">
                {uploadFormData.file ? uploadFormData.file.name : 'Click to upload or drag and drop'}
              </p>
              <p className="text-xs text-dark-400">MP4, AVI, MOV (max 500MB)</p>
              <input
                id="lecture-file"
                type="file"
                className="hidden"
                accept="video/*,.pdf,.doc,.docx,.ppt,.pptx"
                onChange={(e) => setUploadFormData({ ...uploadFormData, file: e.target.files?.[0] || null })}
                required
              />
            </div>

            {uploadFormData.file && (
              <div className="mt-2 p-3 bg-green-50 rounded-lg border border-green-200">
                <div className="flex items-center gap-2">
                  <HiCheckCircle className="w-5 h-5 text-green-600" />
                  <p className="text-sm text-green-700 truncate">{uploadFormData.file.name}</p>
                </div>
              </div>
            )}
          </div>

          <div className="flex justify-end gap-3 pt-4 border-t border-dark-100">
            <Button variant="ghost" onClick={() => setIsUploadModalOpen(false)}>
              Cancel
            </Button>
            <Button type="submit" icon={HiUpload} loading={uploading} disabled={!uploadFormData.file}>
              Upload Lecture
            </Button>
          </div>
        </form>
      </Modal>

      {/* DELETE CONFIRMATION */}
      <ConfirmDialog
        isOpen={isDeleteOpen}
        onClose={() => {
          setIsDeleteOpen(false);
          setSelectedCourse(null);
        }}
        onConfirm={handleDeleteCourse}
        title="Delete Course"
        message={`Are you sure you want to delete "${selectedCourse?.title}"? This will permanently remove the course and all related content.`}
        confirmText="Delete Course"
        loading={deleting}
      />
    </motion.div>
  );
};

export default TeacherCourses;