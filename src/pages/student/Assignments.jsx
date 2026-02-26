// src/pages/student/Assignments.jsx
import React, { useState, useEffect, useMemo } from 'react';
import { motion, AnimatePresence } from 'framer-motion';
import { 
  HiClipboardList,
  HiClock,
  HiCalendar,
  HiCheckCircle,
  HiExclamationCircle,
  HiDocumentText,
  HiUpload,
  HiEye,
  HiDownload,
  HiFilter,
  HiTrendingUp,
  HiStar,
  HiRefresh,
  HiSparkles,
  HiArrowRight,
} from 'react-icons/hi';
import Card from '../../components/common/Card';
import Button from '../../components/common/Button';
import Modal from '../../components/common/Modal';
import Loader from '../../components/common/Loader';
import { useApi } from '../../hooks/useApi';
import { studentApi } from '../../api/studentApi';
import { staggerContainer, slideUp } from '../../utils/constants';
import { formatDate, formatDateTime, getRelativeTime, cn } from '../../utils/helpers';
import toast from 'react-hot-toast';

const StudentAssignments = () => {
  const { loading, execute } = useApi();

  // ============ State ============
  const [assignments, setAssignments] = useState([]);
  const [myCourses, setMyCourses] = useState([]);
  const [myGrades, setMyGrades] = useState([]);
  const [selectedAssignment, setSelectedAssignment] = useState(null);
  const [isSubmitModalOpen, setIsSubmitModalOpen] = useState(false);
  const [isViewModalOpen, setIsViewModalOpen] = useState(false);
  const [filterCourse, setFilterCourse] = useState('all');
  const [filterStatus, setFilterStatus] = useState('all');
  const [uploadFile, setUploadFile] = useState(null);
  const [uploadProgress, setUploadProgress] = useState(0);
  const [submitting, setSubmitting] = useState(false);
  const [comments, setComments] = useState('');

  // ============ Fetch Data ============
  const fetchData = async () => {
    await Promise.all([
      execute(() => studentApi.getAssignments(), {
        showSuccessToast: false,
        onSuccess: (data) => {
          const list = Array.isArray(data) ? data : data?.data || [];
          setAssignments(list);
        },
      }),
      execute(() => studentApi.getMyCourses(), {
        showSuccessToast: false,
        onSuccess: (data) => {
          const list = Array.isArray(data) ? data : data?.data || [];
          setMyCourses(list);
        },
      }),
      execute(() => studentApi.getMyGrades(), {
        showSuccessToast: false,
        onSuccess: (data) => {
          const list = Array.isArray(data) ? data : data?.data || [];
          setMyGrades(list);
        },
      }),
    ]);
  };

  useEffect(() => {
    fetchData();
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, []);

  // ============ Computed Values ============
  const assignmentsWithStatus = useMemo(() => {
    return assignments.map((assignment) => {
      const grade = myGrades.find(
        (g) => g.assignment?._id === assignment._id || g.assignment === assignment._id
      );
      const course = myCourses.find(
        (c) => c._id === assignment.course?._id || c._id === assignment.course
      );

      let status = 'pending';
      if (grade) {
        status = 'graded';
      } else if (assignment.status === 'closed') {
        status = 'closed';
      }

      const isOverdue = new Date(assignment.dueDate) < new Date() && status === 'pending';

      return {
        ...assignment,
        courseDetails: course || assignment.course,
        gradeInfo: grade,
        computedStatus: isOverdue ? 'overdue' : status,
        isOverdue,
      };
    });
  }, [assignments, myCourses, myGrades]);

  const stats = useMemo(() => {
    const total = assignmentsWithStatus.length;
    const pending = assignmentsWithStatus.filter((a) => a.computedStatus === 'pending').length;
    const graded = assignmentsWithStatus.filter((a) => a.computedStatus === 'graded').length;
    const overdue = assignmentsWithStatus.filter((a) => a.computedStatus === 'overdue').length;

    const gradedItems = assignmentsWithStatus.filter((a) => a.gradeInfo?.grade);
    const avgScore =
      gradedItems.length > 0
        ? Math.round(gradedItems.reduce((sum, a) => sum + (a.gradeInfo.grade || 0), 0) / gradedItems.length)
        : 0;

    return { total, pending, graded, overdue, avgScore };
  }, [assignmentsWithStatus]);

  const filteredAssignments = useMemo(() => {
    return assignmentsWithStatus.filter((assignment) => {
      const courseId = assignment.course?._id || assignment.course;
      const matchesCourse = filterCourse === 'all' || courseId === filterCourse;
      const matchesStatus = filterStatus === 'all' || assignment.computedStatus === filterStatus;
      return matchesCourse && matchesStatus;
    });
  }, [assignmentsWithStatus, filterCourse, filterStatus]);

  // ============ Handlers ============
  const handleSubmit = async (e) => {
    e.preventDefault();

    if (!uploadFile) {
      toast.error('Please select a file to upload');
      return;
    }

    setSubmitting(true);
    setUploadProgress(0);

    const formData = new FormData();
    formData.append('file', uploadFile);
    if (comments) {
      formData.append('comments', comments);
    }

    // Simulate progress
    const progressInterval = setInterval(() => {
      setUploadProgress((prev) => {
        if (prev >= 90) {
          clearInterval(progressInterval);
          return 90;
        }
        return prev + 10;
      });
    }, 200);

    try {
      await execute(
        () => studentApi.submitAssignment(selectedAssignment._id, formData),
        {
          successMessage: 'Assignment submitted successfully!',
          onSuccess: () => {
            setUploadProgress(100);
            setTimeout(() => {
              setIsSubmitModalOpen(false);
              setSelectedAssignment(null);
              setUploadFile(null);
              setUploadProgress(0);
              setComments('');
              fetchData();
            }, 500);
          },
        }
      );
    } catch (error) {
      console.error('Submit error:', error);
    } finally {
      clearInterval(progressInterval);
      setSubmitting(false);
    }
  };

  const handleFileChange = (e) => {
    const file = e.target.files[0];
    if (file) {
      // Validate file size (10MB max)
      if (file.size > 10 * 1024 * 1024) {
        toast.error('File size must be less than 10MB');
        return;
      }
      setUploadFile(file);
    }
  };

  // ============ Helpers ============
  const getStatusColor = (status) => {
    const colors = {
      pending: 'text-amber-700 bg-amber-100',
      graded: 'text-green-700 bg-green-100',
      overdue: 'text-red-700 bg-red-100',
      closed: 'text-gray-700 bg-gray-100',
    };
    return colors[status] || colors.pending;
  };

  const getStatusLabel = (status, gradeInfo) => {
    if (status === 'graded' && gradeInfo) {
      return `Graded: ${gradeInfo.grade}%`;
    }
    const labels = {
      pending: 'Pending',
      overdue: 'Overdue',
      closed: 'Closed',
    };
    return labels[status] || 'Pending';
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
      <div className={cn('absolute -top-14 -right-14 w-44 h-44 rounded-full blur-3xl opacity-20 bg-gradient-to-br', gradient)} />
      <div className="p-5 relative">
        <div className="flex items-start justify-between gap-4">
          <div>
            <p className="text-sm font-medium text-dark-500">{title}</p>
            <p className="mt-2 text-3xl font-extrabold text-dark-900">{value}</p>
            {hint && <p className="mt-1 text-xs text-dark-400">{hint}</p>}
          </div>
          <div className={cn('p-4 rounded-2xl text-white shadow-lg bg-gradient-to-br', gradient)}>
            <Icon className="w-6 h-6" />
          </div>
        </div>
      </div>
    </motion.div>
  );

  // ============ Assignment Card ============
  const AssignmentCard = ({ assignment }) => {
    const daysLeft = Math.ceil(
      (new Date(assignment.dueDate) - new Date()) / (1000 * 60 * 60 * 24)
    );

    return (
      <motion.div
        layout
        initial={{ opacity: 0, scale: 0.9 }}
        animate={{ opacity: 1, scale: 1 }}
        whileHover={{ y: -5 }}
        className="card-hover group relative overflow-hidden rounded-2xl border border-dark-100 bg-white shadow-soft hover:shadow-soft-lg transition-all"
      >
        {/* Status indicator */}
        {assignment.computedStatus === 'overdue' && (
          <div className="absolute top-0 left-0 right-0 h-1 bg-gradient-to-r from-red-500 to-red-600" />
        )}
        {assignment.computedStatus === 'graded' && (
          <div className="absolute top-0 left-0 right-0 h-1 bg-gradient-to-r from-green-500 to-green-600" />
        )}

        <div className="p-6">
          {/* Header */}
          <div className="mb-4">
            <div className="flex items-start justify-between gap-2 mb-2">
              <h3 className="text-lg font-bold text-dark-900 line-clamp-2">
                {assignment.title}
              </h3>
              <span
                className={cn(
                  'px-2 py-1 rounded-lg text-xs font-semibold whitespace-nowrap',
                  getStatusColor(assignment.computedStatus)
                )}
              >
                {getStatusLabel(assignment.computedStatus, assignment.gradeInfo)}
              </span>
            </div>
            <p className="text-sm text-primary-600 font-medium">
              {assignment.courseDetails?.title || 'Course'}
            </p>
          </div>

          {/* Description */}
          {assignment.description && (
            <p className="text-sm text-dark-600 mb-4 line-clamp-2">
              {assignment.description}
            </p>
          )}

          {/* Meta Info */}
          <div className="space-y-2 mb-4">
            <div className="flex items-center justify-between">
              <div className="flex items-center gap-2 text-sm text-dark-500">
                <HiCalendar className="w-4 h-4" />
                <span>Due Date</span>
              </div>
              <span
                className={cn(
                  'text-sm font-medium',
                  assignment.isOverdue
                    ? 'text-red-600'
                    : daysLeft <= 2 && daysLeft >= 0
                    ? 'text-amber-600'
                    : 'text-dark-700'
                )}
              >
                {assignment.isOverdue ? 'Overdue' : formatDate(assignment.dueDate)}
              </span>
            </div>

            {assignment.computedStatus === 'pending' && daysLeft >= 0 && (
              <div className="flex items-center justify-between">
                <div className="flex items-center gap-2 text-sm text-dark-500">
                  <HiClock className="w-4 h-4" />
                  <span>Time Left</span>
                </div>
                <span
                  className={cn(
                    'text-sm font-medium',
                    daysLeft <= 2 ? 'text-amber-600' : 'text-dark-700'
                  )}
                >
                  {daysLeft === 0 ? 'Due today' : `${daysLeft} days`}
                </span>
              </div>
            )}
          </div>

          {/* Score Display for Graded */}
          {assignment.computedStatus === 'graded' && assignment.gradeInfo && (
            <div className="p-3 bg-green-50 rounded-xl mb-4">
              <div className="flex items-center justify-between">
                <span className="text-sm font-medium text-green-700">Your Score</span>
                <div className="flex items-center gap-1">
                  <HiStar className="w-4 h-4 text-yellow-500" />
                  <span className="text-lg font-bold text-green-700">
                    {assignment.gradeInfo.grade}%
                  </span>
                </div>
              </div>
            </div>
          )}

          {/* Actions */}
          <div className="flex gap-2">
            <Button
              size="sm"
              variant="outline"
              icon={HiEye}
              onClick={() => {
                setSelectedAssignment(assignment);
                setIsViewModalOpen(true);
              }}
              fullWidth
            >
              Details
            </Button>
            {assignment.computedStatus === 'pending' && (
              <Button
                size="sm"
                icon={HiUpload}
                onClick={() => {
                  setSelectedAssignment(assignment);
                  setIsSubmitModalOpen(true);
                }}
                fullWidth
              >
                Submit
              </Button>
            )}
            {assignment.computedStatus === 'overdue' && (
              <Button
                size="sm"
                icon={HiUpload}
                onClick={() => {
                  setSelectedAssignment(assignment);
                  setIsSubmitModalOpen(true);
                }}
                fullWidth
                className="bg-red-600 hover:bg-red-700"
              >
                Late Submit
              </Button>
            )}
            {assignment.computedStatus === 'graded' && (
              <Button size="sm" variant="secondary" disabled fullWidth>
                Completed
              </Button>
            )}
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
      {/* ============ Header ============ */}
      <motion.div variants={slideUp} className="relative overflow-hidden rounded-2xl">
        <div className="absolute inset-0 bg-gradient-to-br from-accent-600 via-accent-700 to-primary-600" />
        <div className="absolute inset-0 bg-hero-pattern opacity-10" />
        <div className="relative p-6 sm:p-8">
          <div className="flex flex-col gap-4 lg:flex-row lg:items-center lg:justify-between">
            <div className="text-white">
              <div className="inline-flex items-center gap-2 px-3 py-1.5 rounded-full bg-white/15 backdrop-blur-sm border border-white/10">
                <HiSparkles className="w-4 h-4" />
                <span className="text-xs font-semibold">Assignments</span>
              </div>
              <h1 className="mt-4 text-2xl sm:text-3xl font-extrabold">My Assignments</h1>
              <p className="mt-2 text-white/80 text-sm sm:text-base">
                Track and submit your course assignments
              </p>
            </div>
            <Button
              variant="outline"
              className="border-white/30 text-white hover:bg-white/10"
              icon={HiRefresh}
              onClick={fetchData}
            >
              Refresh
            </Button>
          </div>
        </div>
      </motion.div>

      {/* ============ Loading ============ */}
      {loading && (
        <div className="py-10">
          <Loader size="lg" text="Loading assignments..." />
        </div>
      )}

      {/* ============ Stats Cards ============ */}
      {!loading && (
        <motion.div variants={slideUp} className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-4">
          <StatCard3D
            title="Total Assignments"
            value={stats.total}
            icon={HiClipboardList}
            gradient="from-blue-500 to-blue-600"
            hint="All assignments"
          />
          <StatCard3D
            title="Pending"
            value={stats.pending}
            icon={HiClock}
            gradient="from-amber-500 to-amber-600"
            hint="Need to submit"
          />
          <StatCard3D
            title="Completed"
            value={stats.graded}
            icon={HiCheckCircle}
            gradient="from-green-500 to-green-600"
            hint="Graded assignments"
          />
          <StatCard3D
            title="Average Score"
            value={stats.avgScore > 0 ? `${stats.avgScore}%` : 'N/A'}
            icon={HiTrendingUp}
            gradient="from-purple-500 to-purple-600"
            hint={stats.graded > 0 ? `From ${stats.graded} graded` : 'No grades yet'}
          />
        </motion.div>
      )}

      {/* ============ Filters ============ */}
      {!loading && (
        <motion.div variants={slideUp}>
          <Card padding={false} className="p-4">
            <div className="flex flex-col md:flex-row gap-4">
              <div className="flex-1">
                <label className="block text-sm font-medium text-dark-600 mb-1">
                  Filter by Course
                </label>
                <select
                  value={filterCourse}
                  onChange={(e) => setFilterCourse(e.target.value)}
                  className="input w-full"
                >
                  <option value="all">All Courses</option>
                  {myCourses.map((course) => (
                    <option key={course._id} value={course._id}>
                      {course.title}
                    </option>
                  ))}
                </select>
              </div>
              <div className="w-full md:w-48">
                <label className="block text-sm font-medium text-dark-600 mb-1">
                  Filter by Status
                </label>
                <select
                  value={filterStatus}
                  onChange={(e) => setFilterStatus(e.target.value)}
                  className="input w-full"
                >
                  <option value="all">All Status</option>
                  <option value="pending">Pending</option>
                  <option value="graded">Graded</option>
                  <option value="overdue">Overdue</option>
                </select>
              </div>
            </div>
          </Card>
        </motion.div>
      )}

      {/* ============ Assignments Grid ============ */}
      {!loading && (
        <motion.div
          layout
          variants={slideUp}
          className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6"
        >
          <AnimatePresence mode="popLayout">
            {filteredAssignments.length === 0 ? (
              <motion.div
                initial={{ opacity: 0 }}
                animate={{ opacity: 1 }}
                className="col-span-full text-center py-16"
              >
                <HiClipboardList className="w-16 h-16 mx-auto mb-4 text-dark-300" />
                <p className="text-dark-500 font-medium">No assignments found</p>
                <p className="text-sm text-dark-400 mt-1">
                  {filterCourse !== 'all' || filterStatus !== 'all'
                    ? 'Try changing the filters'
                    : 'Assignments will appear here when assigned'}
                </p>
              </motion.div>
            ) : (
              filteredAssignments.map((assignment) => (
                <AssignmentCard key={assignment._id} assignment={assignment} />
              ))
            )}
          </AnimatePresence>
        </motion.div>
      )}

      {/* ============ Submit Modal ============ */}
      <Modal
        isOpen={isSubmitModalOpen}
        onClose={() => {
          if (!submitting) {
            setIsSubmitModalOpen(false);
            setSelectedAssignment(null);
            setUploadFile(null);
            setUploadProgress(0);
            setComments('');
          }
        }}
        title="Submit Assignment"
        description={selectedAssignment?.title}
      >
        <form onSubmit={handleSubmit} className="space-y-4">
          {/* Assignment Info */}
          <div className="p-4 bg-dark-50 rounded-xl">
            <div className="flex items-center justify-between mb-2">
              <span className="text-sm text-dark-500">Course</span>
              <span className="text-sm font-semibold text-dark-700">
                {selectedAssignment?.courseDetails?.title || 'Course'}
              </span>
            </div>
            <div className="flex items-center justify-between mb-2">
              <span className="text-sm text-dark-500">Due Date</span>
              <span
                className={cn(
                  'text-sm font-semibold',
                  selectedAssignment?.isOverdue ? 'text-red-600' : 'text-dark-700'
                )}
              >
                {selectedAssignment && formatDate(selectedAssignment.dueDate)}
                {selectedAssignment?.isOverdue && ' (Overdue)'}
              </span>
            </div>
          </div>

          {/* Comments */}
          <div>
            <label className="block text-sm font-semibold text-dark-700 mb-2">
              Comments (Optional)
            </label>
            <textarea
              placeholder="Add any comments or notes about your submission..."
              rows={3}
              className="input w-full"
              value={comments}
              onChange={(e) => setComments(e.target.value)}
              disabled={submitting}
            />
          </div>

          {/* File Upload */}
          <div>
            <label className="block text-sm font-semibold text-dark-700 mb-2">
              Upload File <span className="text-red-500">*</span>
            </label>
            <label
              className={cn(
                'block border-2 border-dashed rounded-xl p-6 text-center transition-colors cursor-pointer',
                uploadFile
                  ? 'border-green-300 bg-green-50'
                  : 'border-dark-300 hover:border-primary-500'
              )}
            >
              {uploadFile ? (
                <div>
                  <HiCheckCircle className="w-12 h-12 text-green-500 mx-auto mb-3" />
                  <p className="text-sm text-green-700 font-medium">{uploadFile.name}</p>
                  <p className="text-xs text-green-600 mt-1">
                    {(uploadFile.size / 1024 / 1024).toFixed(2)} MB
                  </p>
                </div>
              ) : (
                <div>
                  <HiUpload className="w-12 h-12 text-dark-400 mx-auto mb-3" />
                  <p className="text-sm text-dark-600 mb-1">
                    Click to upload or drag and drop
                  </p>
                  <p className="text-xs text-dark-400">PDF, DOC, ZIP (max 10MB)</p>
                </div>
              )}
              <input
                type="file"
                className="hidden"
                onChange={handleFileChange}
                accept=".pdf,.doc,.docx,.zip,.rar"
                disabled={submitting}
              />
            </label>

            {/* Upload Progress */}
            {uploadProgress > 0 && (
              <div className="mt-3">
                <div className="flex justify-between text-sm mb-1">
                  <span className="text-dark-600">Uploading...</span>
                  <span className="font-medium text-primary-600">{uploadProgress}%</span>
                </div>
                <div className="w-full h-2 bg-dark-100 rounded-full overflow-hidden">
                  <motion.div
                    initial={{ width: 0 }}
                    animate={{ width: `${uploadProgress}%` }}
                    className="h-full bg-gradient-to-r from-primary-500 to-accent-500 rounded-full"
                  />
                </div>
              </div>
            )}
          </div>

          {/* Actions */}
          <div className="flex justify-end gap-3 pt-4 border-t border-dark-100">
            <Button
              type="button"
              variant="ghost"
              onClick={() => {
                setIsSubmitModalOpen(false);
                setSelectedAssignment(null);
                setUploadFile(null);
                setUploadProgress(0);
                setComments('');
              }}
              disabled={submitting}
            >
              Cancel
            </Button>
            <Button
              type="submit"
              icon={HiUpload}
              loading={submitting}
              disabled={!uploadFile || submitting}
            >
              Submit Assignment
            </Button>
          </div>
        </form>
      </Modal>

      {/* ============ View Modal ============ */}
      <Modal
        isOpen={isViewModalOpen}
        onClose={() => {
          setIsViewModalOpen(false);
          setSelectedAssignment(null);
        }}
        title={selectedAssignment?.title}
        size="lg"
      >
        {selectedAssignment && (
          <div className="space-y-6">
            {/* Description */}
            <div>
              <h4 className="font-semibold text-dark-900 mb-2">Description</h4>
              <p className="text-dark-600">
                {selectedAssignment.description || 'No description provided.'}
              </p>
            </div>

            {/* Details Grid */}
            <div className="grid grid-cols-2 gap-4">
              <div className="p-4 bg-dark-50 rounded-xl">
                <p className="text-sm text-dark-500 mb-1">Course</p>
                <p className="font-semibold text-dark-900">
                  {selectedAssignment.courseDetails?.title || 'Course'}
                </p>
              </div>
              <div className="p-4 bg-dark-50 rounded-xl">
                <p className="text-sm text-dark-500 mb-1">Due Date</p>
                <p className="font-semibold text-dark-900">
                  {formatDateTime(selectedAssignment.dueDate)}
                </p>
              </div>
              <div className="p-4 bg-dark-50 rounded-xl">
                <p className="text-sm text-dark-500 mb-1">Teacher</p>
                <p className="font-semibold text-dark-900">
                  {selectedAssignment.teacher?.name || 'Instructor'}
                </p>
              </div>
              <div className="p-4 bg-dark-50 rounded-xl">
                <p className="text-sm text-dark-500 mb-1">Status</p>
                <span
                  className={cn(
                    'px-2 py-1 rounded-lg text-xs font-semibold inline-block',
                    getStatusColor(selectedAssignment.computedStatus)
                  )}
                >
                  {getStatusLabel(selectedAssignment.computedStatus, selectedAssignment.gradeInfo)}
                </span>
              </div>
            </div>

            {/* Grade Info */}
            {selectedAssignment.computedStatus === 'graded' && selectedAssignment.gradeInfo && (
              <div className="p-4 bg-green-50 rounded-xl">
                <div className="flex items-center justify-between mb-2">
                  <span className="text-sm text-green-700">Your Score</span>
                  <div className="flex items-center gap-1">
                    <HiStar className="w-5 h-5 text-yellow-500" />
                    <span className="text-2xl font-bold text-green-700">
                      {selectedAssignment.gradeInfo.grade}%
                    </span>
                  </div>
                </div>
              </div>
            )}

            {/* Actions */}
            <div className="flex justify-end gap-3">
              {(selectedAssignment.computedStatus === 'pending' ||
                selectedAssignment.computedStatus === 'overdue') && (
                <Button
                  icon={HiUpload}
                  onClick={() => {
                    setIsViewModalOpen(false);
                    setIsSubmitModalOpen(true);
                  }}
                >
                  Submit Assignment
                </Button>
              )}
              <Button variant="ghost" onClick={() => setIsViewModalOpen(false)}>
                Close
              </Button>
            </div>
          </div>
        )}
      </Modal>
    </motion.div>
  );
};

export default StudentAssignments;