// src/pages/teacher/Attendance.jsx
import React, { useState, useEffect, useMemo } from 'react';
import { motion, AnimatePresence } from 'framer-motion';
import { 
  HiCalendar,
  HiClock,
  HiUsers,
  HiCheckCircle,
  HiXCircle,
  HiDownload,
  HiRefresh,
  HiChartBar,
  HiAcademicCap,
  HiExclamationCircle,
  HiSparkles,
  HiArrowRight,
  HiSearch,
  HiSave,
  HiUserGroup,
} from 'react-icons/hi';
import { PieChart, Pie, Cell, ResponsiveContainer, Tooltip, BarChart, Bar, XAxis, YAxis, CartesianGrid } from 'recharts';

import Card from '../../components/common/Card';
import Button from '../../components/common/Button';
import Modal from '../../components/common/Modal';
import Loader from '../../components/common/Loader';
import { useApi } from '../../hooks/useApi';
import { teacherApi } from '../../api/teacherApi';
import { staggerContainer, slideUp } from '../../utils/constants';
import { formatDate, getInitials, cn } from '../../utils/helpers';
import toast from 'react-hot-toast';

const TeacherAttendance = () => {
  const { loading, execute } = useApi();

  // ============ State ============
  const [courses, setCourses] = useState([]);
  const [selectedDate, setSelectedDate] = useState(new Date().toISOString().split('T')[0]);
  const [selectedCourse, setSelectedCourse] = useState('');
  const [students, setStudents] = useState([]);
  const [attendanceData, setAttendanceData] = useState({});
  const [existingRecords, setExistingRecords] = useState([]);
  const [isSubmitting, setIsSubmitting] = useState(false);
  const [showStats, setShowStats] = useState(false);
  const [searchQuery, setSearchQuery] = useState('');

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

  // ============ Fetch Attendance for Course ============
  const fetchAttendance = async (courseId) => {
    if (!courseId) return;

    await execute(() => teacherApi.getAttendance(courseId), {
      showSuccessToast: false,
      onSuccess: (data) => {
        const records = data?.records || [];
        setExistingRecords(Array.isArray(records) ? records : []);
        
        // Pre-fill attendance data from existing records for today
        const todayRecords = records.filter((r) => {
          const recordDate = new Date(r.date || r.createdAt).toISOString().split('T')[0];
          return recordDate === selectedDate;
        });

        const initialAttendance = {};
        todayRecords.forEach((record) => {
          const studentId = record.student?._id || record.student;
          if (studentId) {
            initialAttendance[studentId] = record.status;
          }
        });

        setAttendanceData(initialAttendance);
      },
      onError: () => {
        setExistingRecords([]);
        setAttendanceData({});
      },
    });
  };

  // ============ Initial Load ============
  useEffect(() => {
    fetchCourses();
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, []);

  // ============ When Course Changes ============
  useEffect(() => {
    if (selectedCourse) {
      // Find selected course and get enrolled students
      const course = courses.find((c) => c._id === selectedCourse);
      if (course) {
        const enrolledStudents = course.studentsEnrolled || [];
        setStudents(enrolledStudents);
        
        // Initialize all as present by default
        const initialAttendance = {};
        enrolledStudents.forEach((student) => {
          const studentId = student._id || student;
          initialAttendance[studentId] = 'present';
        });
        setAttendanceData(initialAttendance);
        
        // Fetch existing attendance records
        fetchAttendance(selectedCourse);
      }
    } else {
      setStudents([]);
      setAttendanceData({});
      setExistingRecords([]);
    }
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [selectedCourse, selectedDate]);

  // ============ Computed Stats ============
  const stats = useMemo(() => {
    const present = Object.values(attendanceData).filter((s) => s === 'present').length;
    const absent = Object.values(attendanceData).filter((s) => s === 'absent').length;
    const total = Object.keys(attendanceData).length;
    const percentage = total > 0 ? Math.round((present / total) * 100) : 0;

    return { present, absent, total, percentage };
  }, [attendanceData]);

  // ============ Pie Chart Data ============
  const pieData = useMemo(() => [
    { name: 'Present', value: stats.present, color: '#10b981' },
    { name: 'Absent', value: stats.absent, color: '#ef4444' },
  ], [stats]);

  // ============ Filtered Students ============
  const filteredStudents = useMemo(() => {
    if (!searchQuery.trim()) return students;
    
    const query = searchQuery.toLowerCase();
    return students.filter((student) => {
      const name = student.name || '';
      const email = student.email || '';
      return name.toLowerCase().includes(query) || email.toLowerCase().includes(query);
    });
  }, [students, searchQuery]);

  // ============ Historical Stats (from existing records) ============
  const historicalStats = useMemo(() => {
    if (existingRecords.length === 0) return [];

    // Group by date
    const dateMap = new Map();
    existingRecords.forEach((record) => {
      const date = new Date(record.date || record.createdAt).toISOString().split('T')[0];
      if (!dateMap.has(date)) {
        dateMap.set(date, { present: 0, absent: 0 });
      }
      const data = dateMap.get(date);
      if (record.status === 'present') {
        data.present += 1;
      } else {
        data.absent += 1;
      }
    });

    // Convert to array and sort by date
    return Array.from(dateMap.entries())
      .map(([date, data]) => ({
        date: formatDate(date),
        present: data.present,
        absent: data.absent,
        percentage: Math.round((data.present / (data.present + data.absent)) * 100),
      }))
      .slice(-7); // Last 7 dates
  }, [existingRecords]);

  // ============ Handlers ============
  const handleAttendanceChange = (studentId, status) => {
    setAttendanceData((prev) => ({
      ...prev,
      [studentId]: status,
    }));
  };

  const markAllPresent = () => {
    const newData = {};
    students.forEach((student) => {
      const studentId = student._id || student;
      newData[studentId] = 'present';
    });
    setAttendanceData(newData);
    toast.success('All students marked as present');
  };

  const markAllAbsent = () => {
    const newData = {};
    students.forEach((student) => {
      const studentId = student._id || student;
      newData[studentId] = 'absent';
    });
    setAttendanceData(newData);
    toast.success('All students marked as absent');
  };

  const submitAttendance = async () => {
    if (!selectedCourse) {
      toast.error('Please select a course first');
      return;
    }

    if (Object.keys(attendanceData).length === 0) {
      toast.error('No students to mark attendance for');
      return;
    }

    setIsSubmitting(true);

    try {
      // Submit attendance for each student
      const promises = Object.entries(attendanceData).map(([studentId, status]) => {
        return execute(() => teacherApi.markAttendance(selectedCourse, { studentId, status }), {
          showSuccessToast: false,
          showErrorToast: false,
        });
      });

      await Promise.all(promises);
      toast.success(`Attendance submitted for ${Object.keys(attendanceData).length} students!`);
      
      // Refresh attendance records
      fetchAttendance(selectedCourse);
    } catch (error) {
      toast.error('Some attendance records failed to submit');
    } finally {
      setIsSubmitting(false);
    }
  };

  const exportAttendance = () => {
    // Generate CSV data
    const csvContent = [
      ['Student Name', 'Email', 'Status', 'Date', 'Course'].join(','),
      ...students.map((student) => {
        const status = attendanceData[student._id || student] || 'not marked';
        const course = courses.find((c) => c._id === selectedCourse);
        return [
          student.name || 'Unknown',
          student.email || 'N/A',
          status,
          selectedDate,
          course?.title || 'Unknown Course',
        ].join(',');
      }),
    ].join('\n');

    const blob = new Blob([csvContent], { type: 'text/csv' });
    const url = window.URL.createObjectURL(blob);
    const a = document.createElement('a');
    a.href = url;
    a.download = `attendance_${selectedDate}.csv`;
    a.click();
    window.URL.revokeObjectURL(url);
    
    toast.success('Attendance report downloaded');
  };

  // ============ 3D Stat Card ============
  const StatCard3D = ({ title, value, subtitle, icon: Icon, gradient, large = false }) => (
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
            <p className={cn(
              'mt-2 font-extrabold text-dark-900',
              large ? 'text-4xl' : 'text-3xl'
            )}>{value}</p>
            {subtitle && <p className="mt-1 text-xs text-dark-400">{subtitle}</p>}
          </div>
          <div className={cn('shrink-0 p-4 rounded-2xl text-white shadow-lg bg-gradient-to-br', gradient)}>
            <Icon className="w-6 h-6" />
          </div>
        </div>
      </div>
    </motion.div>
  );

  // ============ Attendance Card ============
  const AttendanceCard = ({ student }) => {
    const studentId = student._id || student;
    const status = attendanceData[studentId] || 'present';

    return (
      <motion.div
        initial={{ opacity: 0, scale: 0.9 }}
        animate={{ opacity: 1, scale: 1 }}
        whileHover={{ scale: 1.02 }}
        className={cn(
          'p-4 rounded-xl border-2 transition-all',
          status === 'present'
            ? 'bg-green-50 border-green-200'
            : 'bg-red-50 border-red-200'
        )}
      >
        <div className="flex items-center justify-between">
          <div className="flex items-center gap-3">
            <div className={cn(
              'w-12 h-12 rounded-full flex items-center justify-center text-white font-bold text-sm',
              status === 'present'
                ? 'bg-gradient-to-br from-green-500 to-green-600'
                : 'bg-gradient-to-br from-red-500 to-red-600'
            )}>
              {getInitials(student.name || 'Student')}
            </div>
            <div className="min-w-0">
              <p className="font-semibold text-dark-900 truncate">{student.name || 'Unknown Student'}</p>
              <p className="text-sm text-dark-500 truncate">{student.email || 'No email'}</p>
            </div>
          </div>
          <div className="flex gap-2 shrink-0">
            <motion.button
              whileHover={{ scale: 1.1 }}
              whileTap={{ scale: 0.9 }}
              onClick={() => handleAttendanceChange(studentId, 'present')}
              className={cn(
                'p-2.5 rounded-lg transition-all',
                status === 'present'
                  ? 'bg-green-500 text-white shadow-lg shadow-green-500/30'
                  : 'bg-white text-green-600 hover:bg-green-50 border border-green-200'
              )}
            >
              <HiCheckCircle className="w-5 h-5" />
            </motion.button>
            <motion.button
              whileHover={{ scale: 1.1 }}
              whileTap={{ scale: 0.9 }}
              onClick={() => handleAttendanceChange(studentId, 'absent')}
              className={cn(
                'p-2.5 rounded-lg transition-all',
                status === 'absent'
                  ? 'bg-red-500 text-white shadow-lg shadow-red-500/30'
                  : 'bg-white text-red-600 hover:bg-red-50 border border-red-200'
              )}
            >
              <HiXCircle className="w-5 h-5" />
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
      <motion.div variants={slideUp} className="relative overflow-hidden rounded-3xl">
        <div className="absolute inset-0 bg-gradient-to-br from-green-600 via-emerald-700 to-teal-600" />
        <div className="absolute inset-0 bg-hero-pattern opacity-10" />
        <div className="absolute -top-20 -left-20 w-64 h-64 bg-white/10 rounded-full blur-3xl" />
        <div className="absolute -bottom-20 -right-20 w-80 h-80 bg-teal-300/20 rounded-full blur-3xl" />

        <div className="relative p-6 sm:p-10">
          <div className="flex flex-col gap-6 lg:flex-row lg:items-center lg:justify-between">
            <div className="text-white">
              <div className="inline-flex items-center gap-2 px-4 py-2 rounded-full bg-white/20 backdrop-blur-sm border border-white/30 mb-4">
                <HiSparkles className="w-5 h-5" />
                <span className="text-sm font-bold">Attendance Manager</span>
              </div>

              <h1 className="text-3xl sm:text-4xl lg:text-5xl font-black leading-tight mb-3">
                Mark Attendance
              </h1>
              <p className="text-white/90 text-base sm:text-lg max-w-2xl">
                Track and manage student attendance for your courses
              </p>

              {/* Quick Stats in Header */}
              {selectedCourse && students.length > 0 && (
                <div className="mt-6 grid grid-cols-2 sm:grid-cols-4 gap-4">
                  <div className="backdrop-blur-sm bg-white/10 rounded-xl p-3 border border-white/20">
                    <p className="text-white/70 text-xs font-medium">Total Students</p>
                    <p className="text-2xl font-bold text-white mt-1">{stats.total}</p>
                  </div>
                  <div className="backdrop-blur-sm bg-white/10 rounded-xl p-3 border border-white/20">
                    <p className="text-white/70 text-xs font-medium">Present</p>
                    <p className="text-2xl font-bold text-white mt-1">{stats.present}</p>
                  </div>
                  <div className="backdrop-blur-sm bg-white/10 rounded-xl p-3 border border-white/20">
                    <p className="text-white/70 text-xs font-medium">Absent</p>
                    <p className="text-2xl font-bold text-white mt-1">{stats.absent}</p>
                  </div>
                  <div className="backdrop-blur-sm bg-white/10 rounded-xl p-3 border border-white/20">
                    <p className="text-white/70 text-xs font-medium">Attendance</p>
                    <p className="text-2xl font-bold text-white mt-1">{stats.percentage}%</p>
                  </div>
                </div>
              )}
            </div>

            <div className="flex flex-col sm:flex-row gap-3">
              <Button
                variant="outline"
                className="border-white/40 text-white hover:bg-white/20 backdrop-blur-sm"
                icon={HiChartBar}
                onClick={() => setShowStats(true)}
              >
                View Stats
              </Button>
              <Button
                className="bg-white text-green-700 hover:bg-white/90 shadow-lg"
                icon={HiDownload}
                onClick={exportAttendance}
                disabled={!selectedCourse || students.length === 0}
              >
                Export Report
              </Button>
            </div>
          </div>
        </div>
      </motion.div>

      {/* ============ LOADING ============ */}
      {loading && (
        <div className="py-16">
          <Loader size="lg" text="Loading..." />
        </div>
      )}

      {/* ============ FILTERS ============ */}
      {!loading && (
        <motion.div variants={slideUp}>
          <Card padding={false} className="p-4 shadow-[0_20px_50px_-15px_rgba(15,23,42,0.2)]">
            <div className="grid grid-cols-1 md:grid-cols-4 gap-4">
              <div>
                <label className="block text-xs font-semibold text-dark-500 mb-2">Select Date</label>
                <input
                  type="date"
                  value={selectedDate}
                  onChange={(e) => setSelectedDate(e.target.value)}
                  className="input"
                />
              </div>
              <div>
                <label className="block text-xs font-semibold text-dark-500 mb-2">Select Course</label>
                <select
                  value={selectedCourse}
                  onChange={(e) => setSelectedCourse(e.target.value)}
                  className="input"
                >
                  <option value="">Choose a course</option>
                  {courses.map((course) => (
                    <option key={course._id} value={course._id}>
                      {course.title} ({course.studentsEnrolled?.length || 0} students)
                    </option>
                  ))}
                </select>
              </div>
              <div className="md:col-span-2 flex items-end gap-2">
                <Button
                  variant="outline"
                  onClick={markAllPresent}
                  disabled={!selectedCourse || students.length === 0}
                  className="flex-1"
                >
                  <HiCheckCircle className="w-4 h-4 mr-2" />
                  Mark All Present
                </Button>
                <Button
                  variant="outline"
                  onClick={markAllAbsent}
                  disabled={!selectedCourse || students.length === 0}
                  className="flex-1"
                >
                  <HiXCircle className="w-4 h-4 mr-2" />
                  Mark All Absent
                </Button>
              </div>
            </div>
          </Card>
        </motion.div>
      )}

      {/* ============ WHEN COURSE IS SELECTED ============ */}
      {!loading && selectedCourse && (
        <>
          {/* Stats Cards */}
          <motion.div variants={slideUp} className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-4">
            <StatCard3D
              title="Total Students"
              value={stats.total}
              subtitle="In this course"
              icon={HiUsers}
              gradient="from-blue-500 to-blue-600"
            />
            <StatCard3D
              title="Present"
              value={stats.present}
              subtitle="Marked present"
              icon={HiCheckCircle}
              gradient="from-green-500 to-green-600"
            />
            <StatCard3D
              title="Absent"
              value={stats.absent}
              subtitle="Marked absent"
              icon={HiXCircle}
              gradient="from-red-500 to-red-600"
            />
            <StatCard3D
              title="Attendance Rate"
              value={`${stats.percentage}%`}
              subtitle={stats.percentage >= 75 ? 'Good' : 'Low'}
              icon={HiChartBar}
              gradient="from-purple-500 to-purple-600"
            />
          </motion.div>

          {/* Attendance Progress Bar */}
          <motion.div variants={slideUp}>
            <Card padding={false} className="p-4 shadow-[0_20px_50px_-15px_rgba(15,23,42,0.2)]">
              <div className="flex items-center justify-between mb-3">
                <h3 className="font-semibold text-dark-900">Attendance Progress</h3>
                <span className={cn(
                  'px-3 py-1 rounded-full text-sm font-bold',
                  stats.percentage >= 75 ? 'bg-green-100 text-green-700' : 'bg-red-100 text-red-700'
                )}>
                  {stats.percentage}%
                </span>
              </div>
              <div className="w-full h-4 bg-dark-100 rounded-full overflow-hidden">
                <motion.div
                  initial={{ width: 0 }}
                  animate={{ width: `${stats.percentage}%` }}
                  transition={{ duration: 0.8, ease: 'easeOut' }}
                  className={cn(
                    'h-full rounded-full',
                    stats.percentage >= 90 ? 'bg-gradient-to-r from-green-400 to-green-600' :
                    stats.percentage >= 75 ? 'bg-gradient-to-r from-amber-400 to-amber-600' :
                    'bg-gradient-to-r from-red-400 to-red-600'
                  )}
                />
              </div>
              <div className="flex justify-between mt-2 text-sm text-dark-500">
                <span>Present: {stats.present}</span>
                <span>Absent: {stats.absent}</span>
              </div>
            </Card>
          </motion.div>

          {/* Search Students */}
          {students.length > 0 && (
            <motion.div variants={slideUp}>
              <div className="relative">
                <HiSearch className="absolute left-3 top-1/2 -translate-y-1/2 w-5 h-5 text-dark-400" />
                <input
                  type="text"
                  placeholder="Search students by name or email..."
                  value={searchQuery}
                  onChange={(e) => setSearchQuery(e.target.value)}
                  className="input pl-10 w-full"
                />
              </div>
            </motion.div>
          )}

          {/* Students Grid */}
          <motion.div variants={slideUp}>
            <Card
              title="Mark Attendance"
              subtitle={`${courses.find((c) => c._id === selectedCourse)?.title || 'Course'} - ${formatDate(selectedDate)}`}
              className="shadow-[0_20px_50px_-15px_rgba(15,23,42,0.2)]"
            >
              {students.length === 0 ? (
                <div className="text-center py-12">
                  <HiUserGroup className="w-16 h-16 mx-auto mb-4 text-dark-300" />
                  <p className="text-dark-500 font-medium">No students enrolled</p>
                  <p className="text-sm text-dark-400 mt-1">
                    This course doesn't have any enrolled students yet
                  </p>
                </div>
              ) : (
                <>
                  <div className="grid grid-cols-1 lg:grid-cols-2 gap-4 mb-6">
                    <AnimatePresence>
                      {filteredStudents.map((student) => (
                        <AttendanceCard key={student._id || student} student={student} />
                      ))}
                    </AnimatePresence>
                  </div>

                  {filteredStudents.length === 0 && searchQuery && (
                    <div className="text-center py-8">
                      <p className="text-dark-500">No students match your search</p>
                    </div>
                  )}

                  <div className="flex justify-end gap-3 pt-6 border-t border-dark-100">
                    <Button
                      variant="outline"
                      icon={HiRefresh}
                      onClick={() => {
                        setSelectedCourse('');
                        setStudents([]);
                        setAttendanceData({});
                      }}
                    >
                      Reset
                    </Button>
                    <Button
                      icon={HiSave}
                      onClick={submitAttendance}
                      loading={isSubmitting}
                      className="min-w-[180px]"
                    >
                      Submit Attendance
                    </Button>
                  </div>
                </>
              )}
            </Card>
          </motion.div>
        </>
      )}

      {/* ============ NO COURSE SELECTED ============ */}
      {!loading && !selectedCourse && (
        <motion.div variants={slideUp}>
          <Card className="shadow-[0_20px_50px_-15px_rgba(15,23,42,0.2)]">
            <div className="text-center py-16">
              <motion.div
                animate={{ y: [0, -10, 0] }}
                transition={{ duration: 2, repeat: Infinity }}
                className="mx-auto w-20 h-20 rounded-full bg-gradient-to-br from-green-100 to-green-200 flex items-center justify-center mb-6"
              >
                <HiAcademicCap className="w-10 h-10 text-green-600" />
              </motion.div>
              <h3 className="text-xl font-bold text-dark-900 mb-2">Select a Course</h3>
              <p className="text-dark-500 max-w-md mx-auto">
                Please select a course from the dropdown above to view enrolled students and mark their attendance
              </p>
              
              {courses.length === 0 && (
                <div className="mt-6 p-4 bg-amber-50 rounded-xl border border-amber-200 max-w-md mx-auto">
                  <div className="flex items-center gap-3">
                    <HiExclamationCircle className="w-6 h-6 text-amber-600 shrink-0" />
                    <p className="text-sm text-amber-700 text-left">
                      No courses found. Create a course first to mark attendance.
                    </p>
                  </div>
                </div>
              )}
            </div>
          </Card>
        </motion.div>
      )}

      {/* ============ STATS MODAL ============ */}
      <Modal
        isOpen={showStats}
        onClose={() => setShowStats(false)}
        title="Attendance Statistics"
        size="lg"
      >
        <div className="space-y-6">
          {/* Overall Stats */}
          <div className="grid grid-cols-3 gap-4">
            <div className="text-center p-4 bg-blue-50 rounded-xl border-2 border-blue-200">
              <p className="text-3xl font-black text-blue-600">{stats.percentage}%</p>
              <p className="text-sm text-blue-700 mt-1">Today's Attendance</p>
            </div>
            <div className="text-center p-4 bg-green-50 rounded-xl border-2 border-green-200">
              <p className="text-3xl font-black text-green-600">{stats.present}</p>
              <p className="text-sm text-green-700 mt-1">Present</p>
            </div>
            <div className="text-center p-4 bg-red-50 rounded-xl border-2 border-red-200">
              <p className="text-3xl font-black text-red-600">{stats.absent}</p>
              <p className="text-sm text-red-700 mt-1">Absent</p>
            </div>
          </div>

          {/* Distribution Chart */}
          {stats.total > 0 && (
            <div>
              <h4 className="font-semibold text-dark-900 mb-3">Today's Distribution</h4>
              <div className="w-full" style={{ height: '200px', minHeight: '200px' }}>
                <ResponsiveContainer width="100%" height="100%">
                  <PieChart>
                    <Pie
                      data={pieData}
                      cx="50%"
                      cy="50%"
                      innerRadius={60}
                      outerRadius={80}
                      paddingAngle={5}
                      dataKey="value"
                    >
                      {pieData.map((entry, index) => (
                        <Cell key={index} fill={entry.color} stroke="#fff" strokeWidth={3} />
                      ))}
                    </Pie>
                    <Tooltip />
                  </PieChart>
                </ResponsiveContainer>
              </div>
              <div className="flex justify-center gap-6 mt-4">
                {pieData.map((entry, index) => (
                  <div key={index} className="flex items-center gap-2">
                    <div className="w-4 h-4 rounded-full" style={{ backgroundColor: entry.color }} />
                    <span className="text-sm text-dark-600">
                      {entry.name}: <span className="font-bold">{entry.value}</span>
                    </span>
                  </div>
                ))}
              </div>
            </div>
          )}

          {/* Historical Trend */}
          {historicalStats.length > 0 && (
            <div>
              <h4 className="font-semibold text-dark-900 mb-3">Recent Attendance Trend</h4>
              <div className="w-full" style={{ height: '200px', minHeight: '200px' }}>
                <ResponsiveContainer width="100%" height="100%">
                  <BarChart data={historicalStats}>
                    <CartesianGrid strokeDasharray="3 3" stroke="#e2e8f0" vertical={false} />
                    <XAxis dataKey="date" stroke="#64748b" fontSize={10} tickLine={false} />
                    <YAxis stroke="#64748b" fontSize={10} tickLine={false} />
                    <Tooltip 
                      contentStyle={{
                        backgroundColor: '#fff',
                        border: 'none',
                        borderRadius: '12px',
                        boxShadow: '0 10px 30px -10px rgba(0,0,0,0.15)',
                      }}
                    />
                    <Bar dataKey="present" fill="#10b981" radius={[4, 4, 0, 0]} name="Present" />
                    <Bar dataKey="absent" fill="#ef4444" radius={[4, 4, 0, 0]} name="Absent" />
                  </BarChart>
                </ResponsiveContainer>
              </div>
            </div>
          )}

          <div className="flex justify-end pt-4 border-t border-dark-100">
            <Button onClick={() => setShowStats(false)}>Close</Button>
          </div>
        </div>
      </Modal>
    </motion.div>
  );
};

export default TeacherAttendance;