// src/pages/teacher/Assignments.jsx
import React, { useState, useEffect, useMemo } from 'react';
import { motion, AnimatePresence } from 'framer-motion';
import { 
  HiPlus,
  HiClipboardList,
  HiClock,
  HiCalendar,
  HiPencil,
  HiTrash,
  HiEye,
  HiDownload,
  HiDocumentText,
  HiUsers,
  HiCheckCircle,
  HiExclamationCircle,
  HiRefresh,
  HiSparkles,
  HiArrowRight,
  HiSearch,
  HiAcademicCap,
} from 'react-icons/hi';

import Card from '../../components/common/Card';
import Button from '../../components/common/Button';
import Input from '../../components/common/Input';
import Modal from '../../components/common/Modal';
import ConfirmDialog from '../../components/common/ConfirmDialog';
import Loader from '../../components/common/Loader';
import { useApi } from '../../hooks/useApi';
import { teacherApi } from '../../api/teacherApi';
import { staggerContainer, slideUp } from '../../utils/constants';
import { formatDate, formatDateTime, getRelativeTime, cn } from '../../utils/helpers';
import toast from 'react-hot-toast';

const TeacherAssignments = () => {
  const { loading, execute } = useApi();

  // ============ State ============
  const [assignments, setAssignments] = useState([]);
  const [courses, setCourses] = useState([]);
  const [isModalOpen, setIsModalOpen] = useState(false);
  const [isDeleteOpen, setIsDeleteOpen] = useState(false);
  const [isViewOpen, setIsViewOpen] = useState(false);
  const [selectedAssignment, setSelectedAssignment] = useState(null);
  const [filterCourse, setFilterCourse] = useState('all');
  const [filterStatus, setFilterStatus] = useState('all');
  const [searchQuery, setSearchQuery] = useState('');
  const [viewMode, setViewMode] = useState('grid');
  const [submitting, setSubmitting] = useState(false);
  const [deleting, setDeleting] = useState(false);

  const [formData, setFormData] = useState({
    title: '',
    description: '',
    courseId: '',
    dueDate: '',
    totalMarks: 100,
    instructions: '',
  });

  // ============ Fetch Data ============
  const fetchData = async () => {
    await Promise.all([
      execute(() => teacherApi.getAssignments(), {
        showSuccessToast: false,
        onSuccess: (data) => {
          const list = Array.isArray(data) ? data : data?.data || [];
          setAssignments(list);
        },
        onError: () => setAssignments([]),
      }),
      execute(() => teacherApi.getCourses(), {
        showSuccessToast: false,
        onSuccess: (data) => {
          const courseList = data?.courses || [];
          setCourses(Array.isArray(courseList) ? courseList : []);
        },
        onError: () => setCourses([]),
      }),
    ]);
  };

  useEffect(() => {
    fetchData();
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, []);

  // ============ Computed Stats ============
  const stats = useMemo(() => {
    const total = assignments.length;
    const active = assignments.filter((a) => a.status === 'active').length;
    const closed = assignments.filter((a) => a.status === 'closed').length;
    
    // Calculate average score if grades exist
    const gradedAssignments = assignments.filter((a) => a.avgScore && a.avgScore > 0);
    const avgScore = gradedAssignments.length > 0
      ? Math.round(gradedAssignments.reduce((sum, a) => sum + (a.avgScore || 0), 0) / gradedAssignments.length)
      : 0;

    return { total, active, closed, avgScore };
  }, [assignments]);

  // ============ Filtered Assignments ============
  const filteredAssignments = useMemo(() => {
    let filtered = [...assignments];

    // Filter by course
    if (filterCourse !== 'all') {
      filtered = filtered.filter((a) => {
        const courseId = a.course?._id || a.course;
        return courseId === filterCourse;
      });
    }

    // Filter by status
    if (filterStatus !== 'all') {
      filtered = filtered.filter((a) => a.status === filterStatus);
    }

    // Search
    if (searchQuery.trim()) {
      const query = searchQuery.toLowerCase();
      filtered = filtered.filter(
        (a) =>
          a.title?.toLowerCase().includes(query) ||
          a.description?.toLowerCase().includes(query)
      );
    }

    // Sort by created date (newest first)
    return filtered.sort((a, b) => new Date(b.createdAt || 0) - new Date(a.createdAt || 0));
  }, [assignments, filterCourse, filterStatus, searchQuery]);

  // ============ Form Handlers ============
  const resetForm = () => {
    setFormData({
      title: '',
      description: '',
      courseId: '',
      dueDate: '',
      totalMarks: 100,
      instructions: '',
    });
    setSelectedAssignment(null);
  };

  const handleSubmit = async (e) => {
    e.preventDefault();
    setSubmitting(true);

    try {
      const payload = {
        title: formData.title,
        description: formData.description,
        courseId: formData.courseId,
        dueDate: formData.dueDate,
      };

      if (selectedAssignment) {
        // Update
        await execute(() => teacherApi.updateAssignment(selectedAssignment._id, payload), {
          successMessage: 'Assignment updated successfully!',
          onSuccess: () => {
            setIsModalOpen(false);
            resetForm();
            fetchData();
          },
        });
      } else {
        // Create
        await execute(() => teacherApi.createAssignment(payload), {
          successMessage: 'Assignment created successfully!',
          onSuccess: () => {
            setIsModalOpen(false);
            resetForm();
            fetchData();
          },
        });
      }
    } finally {
      setSubmitting(false);
    }
  };

  const handleDelete = async () => {
    if (!selectedAssignment) return;
    setDeleting(true);

    try {
      await execute(() => teacherApi.deleteAssignment(selectedAssignment._id), {
        successMessage: 'Assignment deleted successfully!',
        onSuccess: () => {
          setIsDeleteOpen(false);
          setSelectedAssignment(null);
          fetchData();
        },
      });
    } finally {
      setDeleting(false);
    }
  };

  const openEditModal = (assignment) => {
    setSelectedAssignment(assignment);
    setFormData({
      title: assignment.title || '',
      description: assignment.description || '',
      courseId: assignment.course?._id || assignment.course || '',
      dueDate: assignment.dueDate ? new Date(assignment.dueDate).toISOString().split('T')[0] : '',
      totalMarks: assignment.totalMarks || 100,
      instructions: assignment.instructions || '',
    });
    setIsModalOpen(true);
  };

  const openViewModal = (assignment) => {
    setSelectedAssignment(assignment);
    setIsViewOpen(true);
  };

  const openDeleteDialog = (assignment) => {
    setSelectedAssignment(assignment);
    setIsDeleteOpen(true);
  };

  // ============ Helpers ============
  const getStatusColor = (status, dueDate) => {
    const isOverdue = new Date(dueDate) < new Date();
    if (status === 'closed' || isOverdue) return 'from-red-500 to-red-600';
    if (status === 'active') return 'from-green-500 to-green-600';
    return 'from-gray-500 to-gray-600';
  };

  const getStatusBadge = (status, dueDate) => {
    const isOverdue = new Date(dueDate) < new Date() && status === 'active';
    if (isOverdue) return 'badge-danger';
    if (status === 'active') return 'badge-success';
    if (status === 'closed') return 'badge-secondary';
    return 'badge-info';
  };

  const getStatusLabel = (status, dueDate) => {
    const isOverdue = new Date(dueDate) < new Date() && status === 'active';
    if (isOverdue) return 'Overdue';
    return status || 'draft';
  };

  // ============ 3D Stat Card ============
  const StatCard3D = ({ title, value, subtitle, icon: Icon, gradient }) => (
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
    </motion.div>
  );

  // ============ Assignment Card ============
  const AssignmentCard = ({ assignment }) => {
    const courseTitle = assignment.course?.title || courses.find(c => c._id === assignment.course)?.title || 'Unknown Course';
    const daysLeft = Math.ceil((new Date(assignment.dueDate) - new Date()) / (1000 * 60 * 60 * 24));
    const isOverdue = daysLeft < 0 && assignment.status === 'active';

    return (
      <motion.div
        initial={{ opacity: 0, scale: 0.9 }}
        animate={{ opacity: 1, scale: 1 }}
        whileHover={{ y: -5 }}
        transition={{ duration: 0.2 }}
        className="card-hover group relative overflow-hidden rounded-2xl border border-dark-100 bg-white shadow-soft hover:shadow-soft-lg transition-all"
      >
        {/* Status Indicator */}
        <div className={cn(
          'absolute top-0 left-0 right-0 h-1.5 rounded-t-2xl bg-gradient-to-r',
          getStatusColor(assignment.status, assignment.dueDate)
        )} />

        <div className="p-6">
          {/* Header */}
          <div className="flex items-start justify-between mb-4">
            <div className="flex-1 min-w-0">
              <h3 className="text-lg font-bold text-dark-900 mb-1 truncate">{assignment.title}</h3>
              <p className="text-sm text-primary-600 font-medium truncate">{courseTitle}</p>
            </div>
            <span className={cn('badge shrink-0', getStatusBadge(assignment.status, assignment.dueDate))}>
              {getStatusLabel(assignment.status, assignment.dueDate)}
            </span>
          </div>

          {/* Description */}
          <p className="text-sm text-dark-600 mb-4 line-clamp-2">{assignment.description || 'No description'}</p>

          {/* Meta Info */}
          <div className="space-y-3 mb-4">
            <div className="flex items-center justify-between text-sm">
              <div className="flex items-center gap-2 text-dark-500">
                <HiCalendar className="w-4 h-4" />
                <span>Due Date</span>
              </div>
              <span className={cn(
                'font-medium',
                isOverdue ? 'text-red-600' : daysLeft <= 2 ? 'text-amber-600' : 'text-dark-700'
              )}>
                {formatDate(assignment.dueDate)}
              </span>
            </div>
            <div className="flex items-center justify-between text-sm">
              <div className="flex items-center gap-2 text-dark-500">
                <HiClock className="w-4 h-4" />
                <span>Time Left</span>
              </div>
              <span className={cn(
                'font-medium',
                isOverdue ? 'text-red-600' : daysLeft <= 2 ? 'text-amber-600' : 'text-dark-700'
              )}>
                {isOverdue ? 'Expired' : daysLeft === 0 ? 'Due today' : `${daysLeft} days`}
              </span>
            </div>
            <div className="flex items-center justify-between text-sm">
              <div className="flex items-center gap-2 text-dark-500">
                <HiDocumentText className="w-4 h-4" />
                <span>Created</span>
              </div>
              <span className="font-medium text-dark-700">
                {getRelativeTime(assignment.createdAt)}
              </span>
            </div>
          </div>

          {/* Actions */}
          <div className="flex gap-2">
            <Button
              size="sm"
              variant="outline"
              icon={HiEye}
              onClick={() => openViewModal(assignment)}
              className="flex-1"
            >
              View
            </Button>
            <Button
              size="sm"
              icon={HiPencil}
              onClick={() => openEditModal(assignment)}
              className="flex-1"
            >
              Edit
            </Button>
            <motion.button
              whileHover={{ scale: 1.1 }}
              whileTap={{ scale: 0.9 }}
              onClick={() => openDeleteDialog(assignment)}
              className="p-2 rounded-lg text-red-500 hover:bg-red-50 transition-colors"
            >
              <HiTrash className="w-4 h-4" />
            </motion.button>
          </div>
        </div>
      </motion.div>
    );
  };

  return (
    <motion.div
      initial="initial"
      animate="animate"
      variants={staggerContainer}
      className="space-y-6"
    >
      {/* ============ HEADER ============ */}
      <motion.div variants={slideUp} className="relative overflow-hidden rounded-2xl">
        <div className="absolute inset-0 bg-gradient-to-br from-blue-600 via-blue-700 to-indigo-600" />
        <div className="absolute inset-0 bg-hero-pattern opacity-10" />
        <div className="absolute -top-16 -left-16 w-48 h-48 bg-white/10 rounded-full blur-3xl" />
        <div className="absolute -bottom-16 -right-16 w-56 h-56 bg-indigo-300/20 rounded-full blur-3xl" />

        <div className="relative p-6 sm:p-8">
          <div className="flex flex-col gap-4 lg:flex-row lg:items-center lg:justify-between">
            <div className="text-white">
              <div className="inline-flex items-center gap-2 px-3 py-1.5 rounded-full bg-white/15 backdrop-blur-sm border border-white/10">
                <HiSparkles className="w-4 h-4" />
                <span className="text-xs font-semibold">Assignment Manager</span>
              </div>
              <h1 className="mt-4 text-2xl sm:text-3xl font-extrabold">Assignments</h1>
              <p className="mt-2 text-white/80 text-sm sm:text-base">
                Create and manage course assignments
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
                className="bg-white text-blue-700 hover:bg-white/90"
                icon={HiPlus}
                onClick={() => {
                  resetForm();
                  setIsModalOpen(true);
                }}
              >
                Create Assignment
              </Button>
            </div>
          </div>
        </div>
      </motion.div>

      {/* ============ LOADING ============ */}
      {loading && (
        <div className="py-10">
          <Loader size="lg" text="Loading assignments..." />
        </div>
      )}

      {/* ============ STATS ============ */}
      {!loading && (
        <motion.div variants={slideUp} className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-4">
          <StatCard3D
            title="Total Assignments"
            value={stats.total}
            subtitle="All created"
            icon={HiClipboardList}
            gradient="from-blue-500 to-blue-600"
          />
          <StatCard3D
            title="Active"
            value={stats.active}
            subtitle="Currently open"
            icon={HiCheckCircle}
            gradient="from-green-500 to-green-600"
          />
          <StatCard3D
            title="Closed"
            value={stats.closed}
            subtitle="Past deadline"
            icon={HiClock}
            gradient="from-amber-500 to-amber-600"
          />
          <StatCard3D
            title="Avg. Score"
            value={stats.avgScore > 0 ? `${stats.avgScore}%` : 'N/A'}
            subtitle="Student average"
            icon={HiDocumentText}
            gradient="from-purple-500 to-purple-600"
          />
        </motion.div>
      )}

      {/* ============ FILTERS ============ */}
      {!loading && (
        <motion.div variants={slideUp}>
          <Card padding={false} className="p-4">
            <div className="flex flex-col lg:flex-row gap-4">
              {/* Search */}
              <div className="relative flex-1">
                <HiSearch className="absolute left-3 top-1/2 -translate-y-1/2 w-5 h-5 text-dark-400" />
                <input
                  type="text"
                  placeholder="Search assignments..."
                  value={searchQuery}
                  onChange={(e) => setSearchQuery(e.target.value)}
                  className="input pl-10 w-full"
                />
              </div>

              {/* Course Filter */}
              <select
                value={filterCourse}
                onChange={(e) => setFilterCourse(e.target.value)}
                className="input w-auto min-w-[180px]"
              >
                <option value="all">All Courses</option>
                {courses.map((course) => (
                  <option key={course._id} value={course._id}>{course.title}</option>
                ))}
              </select>

              {/* Status Filter */}
              <select
                value={filterStatus}
                onChange={(e) => setFilterStatus(e.target.value)}
                className="input w-auto min-w-[140px]"
              >
                <option value="all">All Status</option>
                <option value="active">Active</option>
                <option value="closed">Closed</option>
              </select>

              {/* View Toggle */}
              <div className="flex gap-1 p-1 bg-dark-100 rounded-lg">
                <button
                  onClick={() => setViewMode('grid')}
                  className={cn(
                    'p-2 rounded-lg transition-colors',
                    viewMode === 'grid' ? 'bg-white text-primary-600 shadow-sm' : 'text-dark-500'
                  )}
                >
                  <svg className="w-5 h-5" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                    <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M4 6a2 2 0 012-2h2a2 2 0 012 2v2a2 2 0 01-2 2H6a2 2 0 01-2-2V6zM14 6a2 2 0 012-2h2a2 2 0 012 2v2a2 2 0 01-2 2h-2a2 2 0 01-2-2V6zM4 16a2 2 0 012-2h2a2 2 0 012 2v2a2 2 0 01-2 2H6a2 2 0 01-2-2v-2zM14 16a2 2 0 012-2h2a2 2 0 012 2v2a2 2 0 01-2 2h-2a2 2 0 01-2-2v-2z" />
                  </svg>
                </button>
                <button
                  onClick={() => setViewMode('list')}
                  className={cn(
                    'p-2 rounded-lg transition-colors',
                    viewMode === 'list' ? 'bg-white text-primary-600 shadow-sm' : 'text-dark-500'
                  )}
                >
                  <svg className="w-5 h-5" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                    <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M4 6h16M4 10h16M4 14h16M4 18h16" />
                  </svg>
                </button>
              </div>
            </div>
          </Card>
        </motion.div>
      )}

      {/* ============ ASSIGNMENTS GRID/LIST ============ */}
      {!loading && (
        <>
          {viewMode === 'grid' ? (
            <motion.div
              variants={slideUp}
              className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6"
            >
              <AnimatePresence mode="wait">
                {filteredAssignments.length === 0 ? (
                  <motion.div
                    initial={{ opacity: 0 }}
                    animate={{ opacity: 1 }}
                    className="col-span-full text-center py-16"
                  >
                    <HiClipboardList className="w-16 h-16 mx-auto mb-4 text-dark-300" />
                    <p className="text-dark-500 font-medium">No assignments found</p>
                    <p className="text-sm text-dark-400 mt-1 mb-4">
                      {searchQuery || filterCourse !== 'all' || filterStatus !== 'all'
                        ? 'Try adjusting your filters'
                        : 'Create your first assignment to get started'}
                    </p>
                    <Button
                      icon={HiPlus}
                      onClick={() => {
                        resetForm();
                        setIsModalOpen(true);
                      }}
                    >
                      Create Assignment
                    </Button>
                  </motion.div>
                ) : (
                  filteredAssignments.map((assignment) => (
                    <AssignmentCard key={assignment._id} assignment={assignment} />
                  ))
                )}
              </AnimatePresence>
            </motion.div>
          ) : (
            <motion.div variants={slideUp} className="space-y-4">
              {filteredAssignments.length === 0 ? (
                <div className="text-center py-16">
                  <HiClipboardList className="w-16 h-16 mx-auto mb-4 text-dark-300" />
                  <p className="text-dark-500 font-medium">No assignments found</p>
                </div>
              ) : (
                filteredAssignments.map((assignment, index) => {
                  const courseTitle = assignment.course?.title || courses.find(c => c._id === assignment.course)?.title || 'Unknown';
                  const isOverdue = new Date(assignment.dueDate) < new Date() && assignment.status === 'active';

                  return (
                    <motion.div
                      key={assignment._id}
                      initial={{ opacity: 0, x: -20 }}
                      animate={{ opacity: 1, x: 0 }}
                      transition={{ delay: index * 0.05 }}
                      className="card p-6"
                    >
                      <div className="flex items-center justify-between">
                        <div className="flex-1 min-w-0">
                          <div className="flex items-center gap-3 mb-2">
                            <h3 className="text-lg font-bold text-dark-900 truncate">{assignment.title}</h3>
                            <span className={cn('badge shrink-0', getStatusBadge(assignment.status, assignment.dueDate))}>
                              {getStatusLabel(assignment.status, assignment.dueDate)}
                            </span>
                          </div>
                          <p className="text-dark-600 mb-3 line-clamp-1">{assignment.description}</p>
                          <div className="flex flex-wrap gap-6 text-sm text-dark-500">
                            <div className="flex items-center gap-2">
                              <HiAcademicCap className="w-4 h-4 text-dark-400" />
                              <span>{courseTitle}</span>
                            </div>
                            <div className="flex items-center gap-2">
                              <HiCalendar className="w-4 h-4 text-dark-400" />
                              <span className={isOverdue ? 'text-red-600' : ''}>
                                Due: {formatDate(assignment.dueDate)}
                              </span>
                            </div>
                            <div className="flex items-center gap-2">
                              <HiClock className="w-4 h-4 text-dark-400" />
                              <span>Created {getRelativeTime(assignment.createdAt)}</span>
                            </div>
                          </div>
                        </div>
                        <div className="flex gap-2 shrink-0 ml-4">
                          <Button
                            size="sm"
                            variant="outline"
                            icon={HiEye}
                            onClick={() => openViewModal(assignment)}
                          >
                            View
                          </Button>
                          <Button
                            size="sm"
                            icon={HiPencil}
                            onClick={() => openEditModal(assignment)}
                          >
                            Edit
                          </Button>
                          <Button
                            size="sm"
                            variant="ghost"
                            className="text-red-500 hover:bg-red-50"
                            onClick={() => openDeleteDialog(assignment)}
                          >
                            <HiTrash className="w-4 h-4" />
                          </Button>
                        </div>
                      </div>
                    </motion.div>
                  );
                })
              )}
            </motion.div>
          )}
        </>
      )}

      {/* ============ CREATE/EDIT MODAL ============ */}
      <Modal
        isOpen={isModalOpen}
        onClose={() => {
          setIsModalOpen(false);
          resetForm();
        }}
        title={selectedAssignment ? 'Edit Assignment' : 'Create Assignment'}
        description="Set up assignment details and requirements"
        size="lg"
      >
        <form onSubmit={handleSubmit} className="space-y-4">
          <Input
            label="Title"
            name="title"
            value={formData.title}
            onChange={(e) => setFormData({ ...formData, title: e.target.value })}
            placeholder="Enter assignment title"
            required
          />

          <div>
            <label className="block text-sm font-semibold text-dark-700 mb-2">
              Description
            </label>
            <textarea
              value={formData.description}
              onChange={(e) => setFormData({ ...formData, description: e.target.value })}
              placeholder="Enter assignment description and requirements"
              rows={4}
              className="input"
              required
            />
          </div>

          <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
            <div>
              <label className="block text-sm font-semibold text-dark-700 mb-2">
                Course <span className="text-red-500">*</span>
              </label>
              <select
                value={formData.courseId}
                onChange={(e) => setFormData({ ...formData, courseId: e.target.value })}
                className="input"
                required
              >
                <option value="">Select Course</option>
                {courses.map((course) => (
                  <option key={course._id} value={course._id}>{course.title}</option>
                ))}
              </select>
              {courses.length === 0 && (
                <p className="text-xs text-amber-600 mt-1">No courses found. Create a course first.</p>
              )}
            </div>
            <Input
              label="Due Date"
              type="date"
              name="dueDate"
              value={formData.dueDate}
              onChange={(e) => setFormData({ ...formData, dueDate: e.target.value })}
              required
            />
          </div>

          <div>
            <label className="block text-sm font-semibold text-dark-700 mb-2">
              Additional Instructions (Optional)
            </label>
            <textarea
              value={formData.instructions}
              onChange={(e) => setFormData({ ...formData, instructions: e.target.value })}
              placeholder="Any additional instructions for students..."
              rows={3}
              className="input"
            />
          </div>

          <div className="flex justify-end gap-3 pt-4 border-t border-dark-100">
            <Button
              variant="ghost"
              onClick={() => {
                setIsModalOpen(false);
                resetForm();
              }}
            >
              Cancel
            </Button>
            <Button type="submit" loading={submitting}>
              {selectedAssignment ? 'Update' : 'Create'} Assignment
            </Button>
          </div>
        </form>
      </Modal>

      {/* ============ VIEW MODAL ============ */}
      <Modal
        isOpen={isViewOpen}
        onClose={() => {
          setIsViewOpen(false);
          setSelectedAssignment(null);
        }}
        title={selectedAssignment?.title}
        size="lg"
      >
        {selectedAssignment && (
          <div className="space-y-6">
            <div>
              <h4 className="font-semibold text-dark-900 mb-2">Description</h4>
              <p className="text-dark-600">{selectedAssignment.description || 'No description'}</p>
            </div>

            <div className="grid grid-cols-2 gap-4">
              <div className="p-4 bg-dark-50 rounded-xl">
                <p className="text-sm text-dark-500 mb-1">Course</p>
                <p className="font-semibold text-dark-900">
                  {selectedAssignment.course?.title || courses.find(c => c._id === selectedAssignment.course)?.title || 'Unknown'}
                </p>
              </div>
              <div className="p-4 bg-dark-50 rounded-xl">
                <p className="text-sm text-dark-500 mb-1">Due Date</p>
                <p className="font-semibold text-dark-900">{formatDateTime(selectedAssignment.dueDate)}</p>
              </div>
              <div className="p-4 bg-dark-50 rounded-xl">
                <p className="text-sm text-dark-500 mb-1">Status</p>
                <p className={cn(
                  'font-semibold capitalize',
                  selectedAssignment.status === 'active' ? 'text-green-600' : 'text-red-600'
                )}>
                  {getStatusLabel(selectedAssignment.status, selectedAssignment.dueDate)}
                </p>
              </div>
              <div className="p-4 bg-dark-50 rounded-xl">
                <p className="text-sm text-dark-500 mb-1">Created</p>
                <p className="font-semibold text-dark-900">{formatDate(selectedAssignment.createdAt)}</p>
              </div>
            </div>

            <div className="flex gap-3">
              <Button
                fullWidth
                variant="outline"
                icon={HiPencil}
                onClick={() => {
                  setIsViewOpen(false);
                  openEditModal(selectedAssignment);
                }}
              >
                Edit Assignment
              </Button>
              <Button
                fullWidth
                icon={HiEye}
                onClick={() => {
                  setIsViewOpen(false);
                  // Navigate to submissions page
                  toast.success('Navigate to submissions');
                }}
              >
                View Submissions
              </Button>
            </div>
          </div>
        )}
      </Modal>

      {/* ============ DELETE CONFIRMATION ============ */}
      <ConfirmDialog
        isOpen={isDeleteOpen}
        onClose={() => {
          setIsDeleteOpen(false);
          setSelectedAssignment(null);
        }}
        onConfirm={handleDelete}
        title="Delete Assignment"
        message={`Are you sure you want to delete "${selectedAssignment?.title}"? This action cannot be undone and will remove all associated submissions.`}
        confirmText="Delete"
        loading={deleting}
      />
    </motion.div>
  );
};

export default TeacherAssignments;