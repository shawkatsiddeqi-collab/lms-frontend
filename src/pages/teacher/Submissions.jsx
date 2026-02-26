// src/pages/teacher/Submissions.jsx
import React, { useEffect, useMemo, useState } from 'react';
import { motion, AnimatePresence } from 'framer-motion';
import {
  HiDocumentText,
  HiClock,
  HiCheckCircle,
  HiXCircle,
  HiDownload,
  HiEye,
  HiPencil,
  HiSearch,
  HiRefresh,
  HiSparkles,
  HiUsers,
  HiAcademicCap,
  HiExclamationCircle,
} from 'react-icons/hi';

import Card from '../../components/common/Card';
import Button from '../../components/common/Button';
import Modal from '../../components/common/Modal';
import Input from '../../components/common/Input';
import Loader from '../../components/common/Loader';
import { useApi } from '../../hooks/useApi';
import { useAuth } from '../../hooks/useAuth';
import { teacherApi } from '../../api/teacherApi';
import { staggerContainer, slideUp } from '../../utils/constants';
import { formatDateTime, getRelativeTime, getInitials, cn } from '../../utils/helpers';
import toast from 'react-hot-toast';

const TeacherSubmissions = () => {
  const { user } = useAuth();
  const { loading, execute } = useApi();

  const [assignments, setAssignments] = useState([]);
  const [submissions, setSubmissions] = useState([]);

  const [filterAssignmentId, setFilterAssignmentId] = useState('all');
  const [filterStatus, setFilterStatus] = useState('all');
  const [searchQuery, setSearchQuery] = useState('');

  const [selectedSubmission, setSelectedSubmission] = useState(null);
  const [isGradeModalOpen, setIsGradeModalOpen] = useState(false);
  const [isViewModalOpen, setIsViewModalOpen] = useState(false);

  const [gradeData, setGradeData] = useState({ grade: '', feedback: '' });
  const [grading, setGrading] = useState(false);

  const baseHost = useMemo(() => {
    const apiUrl = import.meta.env.VITE_API_URL || 'http://localhost:5000/api';
    return apiUrl.replace(/\/api\/?$/, '');
  }, []);

  // -----------------------
  // Helpers
  // -----------------------
  const normalizeAssignment = (a) => ({
    ...a,
    _id: a._id,
    courseId: a.course?._id || a.course,
    courseTitle: a.course?.title || a.course?.name || 'Course',
    dueDate: a.dueDate ? new Date(a.dueDate) : null,
    teacherId: a.teacher?._id || a.teacher,
  });

  const normalizeSubmission = (sub, assignment) => {
    const due = assignment?.dueDate ? new Date(assignment.dueDate) : null;
    const submittedAt = sub.submittedAt ? new Date(sub.submittedAt) : sub.createdAt ? new Date(sub.createdAt) : null;

    const isLate = Boolean(due && submittedAt && submittedAt > due);

    const rawStatus =
      sub.status ||
      (sub.grade !== undefined && sub.grade !== null ? 'graded' : 'submitted');

    const status =
      rawStatus === 'graded' ? 'graded' : isLate ? 'late' : 'pending';

    return {
      ...sub,
      _id: sub._id,
      status,
      assignmentId: assignment?._id,
      assignmentTitle: assignment?.title || 'Assignment',
      totalMarks: assignment?.totalMarks || assignment?.marks || 100,
      courseId: assignment?.courseId,
      courseTitle: assignment?.courseTitle || 'Course',
      dueDate: assignment?.dueDate || null,
    };
  };

  const getStatusBadge = (status) => {
    const styles = {
      pending: 'badge-warning',
      graded: 'badge-success',
      late: 'badge-danger',
    };
    return styles[status] || styles.pending;
  };

  const downloadFile = (fileUrl) => {
    if (!fileUrl) {
      toast.error('No file available');
      return;
    }
    const url = fileUrl.startsWith('http') ? fileUrl : `${baseHost}/${fileUrl.replace(/^\//, '')}`;
    window.open(url, '_blank', 'noopener,noreferrer');
  };

  // -----------------------
  // Fetching
  // -----------------------
  const fetchAssignmentsAndSubmissions = async () => {
    // 1) Get all assignments
    const assignmentsData = await execute(() => teacherApi.getAssignments(), {
      showSuccessToast: false,
    });

    const list = Array.isArray(assignmentsData) ? assignmentsData : assignmentsData?.data || [];
    const myAssignments = list
      .map(normalizeAssignment)
      .filter((a) => String(a.teacherId) === String(user?._id));

    setAssignments(myAssignments);

    // 2) Fetch submissions for all teacher assignments
    if (myAssignments.length === 0) {
      setSubmissions([]);
      return;
    }

    const results = await Promise.allSettled(
      myAssignments.map((a) => teacherApi.getSubmissions(a._id))
    );

    const merged = [];
    results.forEach((r, idx) => {
      if (r.status === 'fulfilled') {
        const assignment = myAssignments[idx];
        const data = r.value?.data;
        const subs = Array.isArray(data) ? data : data?.records || data?.submissions || [];
        for (const sub of subs) merged.push(normalizeSubmission(sub, assignment));
      }
    });

    // newest first
    merged.sort((a, b) => new Date(b.submittedAt || b.createdAt || 0) - new Date(a.submittedAt || a.createdAt || 0));
    setSubmissions(merged);
  };

  useEffect(() => {
    fetchAssignmentsAndSubmissions();
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, []);

  // -----------------------
  // Filters + Stats
  // -----------------------
  const filteredSubmissions = useMemo(() => {
    let filtered = [...submissions];

    if (filterAssignmentId !== 'all') {
      filtered = filtered.filter((s) => String(s.assignmentId) === String(filterAssignmentId));
    }

    if (filterStatus !== 'all') {
      filtered = filtered.filter((s) => s.status === filterStatus);
    }

    if (searchQuery.trim()) {
      const q = searchQuery.toLowerCase();
      filtered = filtered.filter((s) => {
        const studentName = s.student?.name || '';
        const studentEmail = s.student?.email || '';
        const assignmentTitle = s.assignmentTitle || '';
        const courseTitle = s.courseTitle || '';
        return (
          studentName.toLowerCase().includes(q) ||
          studentEmail.toLowerCase().includes(q) ||
          assignmentTitle.toLowerCase().includes(q) ||
          courseTitle.toLowerCase().includes(q)
        );
      });
    }

    return filtered;
  }, [submissions, filterAssignmentId, filterStatus, searchQuery]);

  const stats = useMemo(() => {
    const total = submissions.length;
    const pending = submissions.filter((s) => s.status === 'pending').length;
    const graded = submissions.filter((s) => s.status === 'graded').length;
    const late = submissions.filter((s) => s.status === 'late').length;
    return { total, pending, graded, late };
  }, [submissions]);

  // -----------------------
  // Grade Flow
  // -----------------------
  const openGradeModal = (submission) => {
    setSelectedSubmission(submission);
    setGradeData({
      grade: submission.grade ?? '',
      feedback: submission.feedback ?? '',
    });
    setIsGradeModalOpen(true);
  };

  const openViewModal = (submission) => {
    setSelectedSubmission(submission);
    setIsViewModalOpen(true);
  };

  const submitGrade = async (e) => {
    e.preventDefault();
    if (!selectedSubmission?._id) return;

    const grade = Number(gradeData.grade);
    if (Number.isNaN(grade)) {
      toast.error('Please enter a valid grade');
      return;
    }

    setGrading(true);
    try {
      await execute(
        () => teacherApi.updateGrade(selectedSubmission._id, { grade, feedback: gradeData.feedback }),
        {
          successMessage: 'Grade saved successfully!',
          onSuccess: () => {
            setSubmissions((prev) =>
              prev.map((s) =>
                s._id === selectedSubmission._id
                  ? { ...s, grade, feedback: gradeData.feedback, status: 'graded' }
                  : s
              )
            );
            setIsGradeModalOpen(false);
            setSelectedSubmission(null);
            setGradeData({ grade: '', feedback: '' });
          },
        }
      );
    } finally {
      setGrading(false);
    }
  };

  // -----------------------
  // UI Helpers
  // -----------------------
  const StatCard3D = ({ title, value, icon: Icon, gradient }) => (
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
      {/* HEADER */}
      <motion.div variants={slideUp} className="relative overflow-hidden rounded-2xl">
        <div className="absolute inset-0 bg-gradient-to-br from-purple-600 via-purple-700 to-indigo-600" />
        <div className="absolute inset-0 bg-hero-pattern opacity-10" />
        <div className="absolute -top-16 -left-16 w-48 h-48 bg-white/10 rounded-full blur-3xl" />
        <div className="absolute -bottom-16 -right-16 w-56 h-56 bg-indigo-300/20 rounded-full blur-3xl" />

        <div className="relative p-6 sm:p-8">
          <div className="flex flex-col gap-4 lg:flex-row lg:items-center lg:justify-between">
            <div className="text-white">
              <div className="inline-flex items-center gap-2 px-3 py-1.5 rounded-full bg-white/15 backdrop-blur-sm border border-white/10">
                <HiSparkles className="w-4 h-4" />
                <span className="text-xs font-semibold">Submission Review</span>
              </div>
              <h1 className="mt-4 text-2xl sm:text-3xl font-extrabold">Submissions</h1>
              <p className="mt-2 text-white/80 text-sm sm:text-base">
                Review student submissions and publish grades
              </p>
            </div>

            <div className="flex flex-col sm:flex-row gap-3">
              <Button
                variant="outline"
                className="border-white/30 text-white hover:bg-white/10"
                icon={HiRefresh}
                onClick={fetchAssignmentsAndSubmissions}
              >
                Refresh
              </Button>
            </div>
          </div>
        </div>
      </motion.div>

      {/* LOADING */}
      {loading && (
        <div className="py-10">
          <Loader size="lg" text="Loading submissions..." />
        </div>
      )}

      {/* STATS */}
      {!loading && (
        <motion.div variants={slideUp} className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-4">
          <StatCard3D title="Total Submissions" value={stats.total} icon={HiDocumentText} gradient="from-blue-500 to-blue-600" />
          <StatCard3D title="Pending Review" value={stats.pending} icon={HiClock} gradient="from-amber-500 to-amber-600" />
          <StatCard3D title="Graded" value={stats.graded} icon={HiCheckCircle} gradient="from-green-500 to-green-600" />
          <StatCard3D title="Late" value={stats.late} icon={HiXCircle} gradient="from-red-500 to-red-600" />
        </motion.div>
      )}

      {/* FILTERS */}
      {!loading && (
        <motion.div variants={slideUp}>
          <Card padding={false} className="p-4">
            <div className="flex flex-col lg:flex-row gap-4">
              {/* Search */}
              <div className="relative flex-1">
                <HiSearch className="absolute left-3 top-1/2 -translate-y-1/2 w-5 h-5 text-dark-400" />
                <input
                  type="text"
                  placeholder="Search by student / assignment / course..."
                  value={searchQuery}
                  onChange={(e) => setSearchQuery(e.target.value)}
                  className="input pl-10 w-full"
                />
              </div>

              {/* Assignment Filter */}
              <select
                value={filterAssignmentId}
                onChange={(e) => setFilterAssignmentId(e.target.value)}
                className="input w-auto min-w-[220px]"
              >
                <option value="all">All Assignments</option>
                {assignments.map((a) => (
                  <option key={a._id} value={a._id}>
                    {a.title}
                  </option>
                ))}
              </select>

              {/* Status Filter */}
              <select
                value={filterStatus}
                onChange={(e) => setFilterStatus(e.target.value)}
                className="input w-auto min-w-[160px]"
              >
                <option value="all">All Status</option>
                <option value="pending">Pending</option>
                <option value="graded">Graded</option>
                <option value="late">Late</option>
              </select>
            </div>
          </Card>
        </motion.div>
      )}

      {/* LIST */}
      {!loading && (
        <motion.div variants={slideUp} className="space-y-4">
          <AnimatePresence mode="wait">
            {filteredSubmissions.length === 0 ? (
              <motion.div
                initial={{ opacity: 0 }}
                animate={{ opacity: 1 }}
                className="text-center py-16"
              >
                <HiDocumentText className="w-16 h-16 mx-auto mb-4 text-dark-300" />
                <p className="text-dark-500 font-medium">No submissions found</p>
                <p className="text-sm text-dark-400 mt-1">
                  {assignments.length === 0
                    ? 'You have not created any assignments yet.'
                    : 'Try changing filters or search.'}
                </p>

                {assignments.length === 0 && (
                  <div className="mt-6 max-w-md mx-auto p-4 bg-amber-50 border border-amber-200 rounded-xl">
                    <div className="flex items-start gap-3">
                      <HiExclamationCircle className="w-6 h-6 text-amber-600 shrink-0" />
                      <div className="text-left">
                        <p className="text-sm font-semibold text-amber-700">No assignments</p>
                        <p className="text-sm text-amber-700/90">
                          Create an assignment first so students can submit.
                        </p>
                      </div>
                    </div>
                  </div>
                )}
              </motion.div>
            ) : (
              filteredSubmissions.map((s, index) => (
                <motion.div
                  key={s._id}
                  initial={{ opacity: 0, x: -20 }}
                  animate={{ opacity: 1, x: 0 }}
                  transition={{ delay: index * 0.03 }}
                  className="card p-6"
                >
                  <div className="flex items-start gap-4">
                    {/* Student Avatar */}
                    <div className="avatar avatar-lg flex-shrink-0">
                      {getInitials(s.student?.name || 'Student')}
                    </div>

                    <div className="flex-1 min-w-0">
                      <div className="flex items-start justify-between gap-4 mb-3">
                        <div className="min-w-0">
                          <h3 className="font-semibold text-dark-900 truncate">
                            {s.student?.name || 'Unknown Student'}
                          </h3>
                          <p className="text-sm text-dark-500 truncate">
                            {s.student?.email || 'No email'}
                          </p>
                        </div>
                        <span className={cn('badge capitalize shrink-0', getStatusBadge(s.status))}>
                          {s.status}
                        </span>
                      </div>

                      <div className="p-4 bg-dark-50 rounded-xl mb-4">
                        <div className="flex items-center justify-between mb-2 gap-4">
                          <h4 className="font-medium text-dark-900 truncate">
                            {s.assignmentTitle}
                          </h4>
                          <span className="text-sm text-dark-500 truncate">
                            {s.courseTitle}
                          </span>
                        </div>

                        <div className="grid grid-cols-2 md:grid-cols-4 gap-4 text-sm">
                          <div>
                            <p className="text-dark-500">Submitted</p>
                            <p className="font-medium text-dark-700">
                              {getRelativeTime(s.submittedAt || s.createdAt)}
                            </p>
                          </div>

                          <div>
                            <p className="text-dark-500">File</p>
                            <p className="font-medium text-dark-700 truncate">
                              {s.fileUrl ? s.fileUrl.split('/').pop() : '—'}
                            </p>
                          </div>

                          <div>
                            <p className="text-dark-500">Due</p>
                            <p className="font-medium text-dark-700">
                              {s.dueDate ? formatDateTime(s.dueDate) : '—'}
                            </p>
                          </div>

                          <div>
                            <p className="text-dark-500">Score</p>
                            <p className={cn('font-medium', s.status === 'graded' ? 'text-primary-600' : 'text-dark-700')}>
                              {s.status === 'graded'
                                ? `${s.grade ?? 0}/${s.totalMarks ?? 100}`
                                : 'Not graded'}
                            </p>
                          </div>
                        </div>
                      </div>

                      {/* Feedback */}
                      {s.feedback && (
                        <div className="p-4 bg-green-50 rounded-xl mb-4">
                          <p className="text-sm font-medium text-green-700 mb-1">Feedback</p>
                          <p className="text-sm text-green-600">{s.feedback}</p>
                        </div>
                      )}

                      {/* Actions */}
                      <div className="flex flex-wrap gap-3">
                        <Button
                          size="sm"
                          variant="outline"
                          icon={HiDownload}
                          onClick={() => downloadFile(s.fileUrl)}
                        >
                          Download
                        </Button>

                        <Button
                          size="sm"
                          variant="outline"
                          icon={HiEye}
                          onClick={() => openViewModal(s)}
                        >
                          View
                        </Button>

                        <Button
                          size="sm"
                          icon={HiPencil}
                          onClick={() => openGradeModal(s)}
                        >
                          {s.status === 'graded' ? 'Edit Grade' : 'Grade'}
                        </Button>
                      </div>
                    </div>
                  </div>
                </motion.div>
              ))
            )}
          </AnimatePresence>
        </motion.div>
      )}

      {/* GRADE MODAL */}
      <Modal
        isOpen={isGradeModalOpen}
        onClose={() => {
          setIsGradeModalOpen(false);
          setSelectedSubmission(null);
          setGradeData({ grade: '', feedback: '' });
        }}
        title="Grade Submission"
        description={selectedSubmission ? `Student: ${selectedSubmission.student?.name || ''}` : ''}
      >
        {selectedSubmission && (
          <form onSubmit={submitGrade} className="space-y-4">
            <div className="p-4 bg-dark-50 rounded-xl">
              <p className="text-sm text-dark-500 mb-1">Assignment</p>
              <p className="font-semibold text-dark-900">{selectedSubmission.assignmentTitle}</p>
              <p className="text-sm text-dark-600 mt-1">
                Total Marks: {selectedSubmission.totalMarks ?? 100}
              </p>
            </div>

            <Input
              label="Grade"
              type="number"
              value={gradeData.grade}
              onChange={(e) => setGradeData({ ...gradeData, grade: e.target.value })}
              placeholder="Enter grade"
              min="0"
              max={selectedSubmission.totalMarks ?? 100}
              required
            />

            <div>
              <label className="block text-sm font-semibold text-dark-700 mb-2">
                Feedback (optional)
              </label>
              <textarea
                value={gradeData.feedback}
                onChange={(e) => setGradeData({ ...gradeData, feedback: e.target.value })}
                placeholder="Write feedback for the student..."
                rows={5}
                className="input"
              />
            </div>

            <div className="flex justify-end gap-3 pt-4 border-t border-dark-100">
              <Button
                variant="ghost"
                onClick={() => {
                  setIsGradeModalOpen(false);
                  setSelectedSubmission(null);
                }}
              >
                Cancel
              </Button>
              <Button type="submit" icon={HiCheckCircle} loading={grading}>
                Save Grade
              </Button>
            </div>
          </form>
        )}
      </Modal>

      {/* VIEW MODAL */}
      <Modal
        isOpen={isViewModalOpen}
        onClose={() => {
          setIsViewModalOpen(false);
          setSelectedSubmission(null);
        }}
        title="Submission Details"
        size="lg"
      >
        {selectedSubmission && (
          <div className="space-y-6">
            <div className="grid grid-cols-2 gap-4">
              <div className="p-4 bg-dark-50 rounded-xl">
                <p className="text-sm text-dark-500 mb-1">Student</p>
                <p className="font-semibold text-dark-900">{selectedSubmission.student?.name || '—'}</p>
                <p className="text-sm text-dark-600">{selectedSubmission.student?.email || '—'}</p>
              </div>

              <div className="p-4 bg-dark-50 rounded-xl">
                <p className="text-sm text-dark-500 mb-1">Assignment</p>
                <p className="font-semibold text-dark-900">{selectedSubmission.assignmentTitle}</p>
                <p className="text-sm text-dark-600">{selectedSubmission.courseTitle}</p>
              </div>
            </div>

            <div className="p-4 bg-dark-50 rounded-xl">
              <p className="text-sm text-dark-500 mb-1">Submitted At</p>
              <p className="font-semibold text-dark-900">
                {formatDateTime(selectedSubmission.submittedAt || selectedSubmission.createdAt)}
              </p>
              {selectedSubmission.dueDate && (
                <p className="text-sm text-dark-500 mt-1">
                  Due: <span className="font-medium text-dark-700">{formatDateTime(selectedSubmission.dueDate)}</span>
                </p>
              )}
            </div>

            {selectedSubmission.status === 'graded' && (
              <div className="grid grid-cols-2 gap-4">
                <div className="p-4 bg-primary-50 rounded-xl">
                  <p className="text-sm text-primary-600 mb-1">Score</p>
                  <p className="text-3xl font-bold text-primary-700">
                    {selectedSubmission.grade ?? 0}/{selectedSubmission.totalMarks ?? 100}
                  </p>
                </div>
                <div className="p-4 bg-green-50 rounded-xl">
                  <p className="text-sm text-green-700 mb-1">Feedback</p>
                  <p className="text-green-600">{selectedSubmission.feedback || '—'}</p>
                </div>
              </div>
            )}

            <div className="flex gap-3">
              <Button
                fullWidth
                variant="outline"
                icon={HiDownload}
                onClick={() => downloadFile(selectedSubmission.fileUrl)}
              >
                Download File
              </Button>

              <Button
                fullWidth
                icon={HiPencil}
                onClick={() => {
                  setIsViewModalOpen(false);
                  openGradeModal(selectedSubmission);
                }}
              >
                {selectedSubmission.status === 'graded' ? 'Edit Grade' : 'Grade Now'}
              </Button>
            </div>
          </div>
        )}
      </Modal>
    </motion.div>
  );
};

export default TeacherSubmissions;