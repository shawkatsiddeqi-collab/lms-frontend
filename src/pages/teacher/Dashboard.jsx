// src/pages/teacher/Dashboard.jsx
import React, { useEffect, useMemo, useState } from 'react';
import { motion } from 'framer-motion';
import { Link, useNavigate } from 'react-router-dom';
import { 
  HiAcademicCap, 
  HiClipboardList, 
  HiUsers, 
  HiClock,
  HiTrendingUp,
  HiCalendar,
  HiArrowRight,
  HiBookOpen,
  HiCheckCircle,
  HiExclamationCircle,
  HiRefresh,
  HiSparkles,
  HiChartPie,
} from 'react-icons/hi';
import { 
  AreaChart, 
  Area, 
  BarChart, 
  Bar, 
  PieChart,
  Pie,
  Cell,
  XAxis, 
  YAxis, 
  CartesianGrid, 
  Tooltip, 
  ResponsiveContainer, 
  RadialBarChart, 
  RadialBar, 
  Legend 
} from 'recharts';

import Card from '../../components/common/Card';
import Button from '../../components/common/Button';
import Loader from '../../components/common/Loader';
import { useAuth } from '../../hooks/useAuth';
import { useApi } from '../../hooks/useApi';
import { teacherApi } from '../../api/teacherApi';
import { staggerContainer, slideUp } from '../../utils/constants';
import { formatDate, getInitials, getRelativeTime, cn } from '../../utils/helpers';

const TeacherDashboard = () => {
  const { user } = useAuth();
  const navigate = useNavigate();
  const { loading, execute } = useApi();

  // ============ State ============
  const [dashboard, setDashboard] = useState({
    courses: [],
    assignments: [],
    allAssignments: [],
  });

  // ============ Fetch Data ============
  const fetchAll = async () => {
    await execute(() => teacherApi.getDashboard(), {
      showSuccessToast: false,
      onSuccess: (data) => {
        setDashboard({
          courses: Array.isArray(data?.courses) ? data.courses : [],
          assignments: Array.isArray(data?.assignments) ? data.assignments : [],
          allAssignments: Array.isArray(data?.allAssignments) ? data.allAssignments : [],
        });
      },
    });
  };

  useEffect(() => {
    fetchAll();
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, []);

  // ============ Computed Stats ============
  const stats = useMemo(() => {
    const totalCourses = dashboard.courses.length;
    
    // Count total students across all courses
    const totalStudents = dashboard.courses.reduce((sum, course) => {
      return sum + (course.studentsEnrolled?.length || 0);
    }, 0);

    // Count pending assignments (active assignments)
    const pendingAssignments = dashboard.allAssignments.filter(
      (a) => a.status === 'active'
    ).length;

    // Today's classes (courses that are active)
    const todayClasses = dashboard.courses.filter((c) => c.status === 'approved').length;

    return {
      totalCourses,
      totalStudents,
      pendingAssignments,
      todayClasses,
    };
  }, [dashboard]);

  // ============ Recent Assignments ============
  const recentAssignments = useMemo(() => {
    return [...dashboard.allAssignments]
      .sort((a, b) => new Date(b.createdAt || 0) - new Date(a.createdAt || 0))
      .slice(0, 5);
  }, [dashboard.allAssignments]);

  // ============ Course Performance Data ============
  const coursePerformance = useMemo(() => {
    return dashboard.courses.slice(0, 4).map((course, index) => {
      const colors = ['#6366f1', '#14b8a6', '#f59e0b', '#ec4899'];
      return {
        name: course.title?.substring(0, 15) || 'Course',
        students: course.studentsEnrolled?.length || 0,
        lectures: course.lectures?.length || 0,
        fill: colors[index % colors.length],
      };
    });
  }, [dashboard.courses]);

  // ============ Category Distribution ============
  const categoryData = useMemo(() => {
    const categoryMap = new Map();
    for (const course of dashboard.courses) {
      const key = course.category || 'Uncategorized';
      categoryMap.set(key, (categoryMap.get(key) || 0) + 1);
    }
    return Array.from(categoryMap.entries()).map(([name, value]) => ({ name, value }));
  }, [dashboard.courses]);

  const pieColors = ['#6366f1', '#14b8a6', '#f59e0b', '#ec4899', '#22c55e', '#3b82f6'];

  // ============ Submission Trends (Mock for now - replace with real data) ============
  const submissionTrends = [
    { name: 'Mon', submissions: 12 },
    { name: 'Tue', submissions: 18 },
    { name: 'Wed', submissions: 15 },
    { name: 'Thu', submissions: 22 },
    { name: 'Fri', submissions: 28 },
    { name: 'Sat', submissions: 8 },
    { name: 'Sun', submissions: 5 },
  ];

  // ============ Overall Attendance (Mock) ============
  const attendanceData = [
    { name: 'Attendance', value: 92, fill: '#10b981' },
  ];

  // ============ Quick Actions ============
  const quickActions = [
    { name: 'Create Assignment', icon: HiClipboardList, path: '/teacher/assignments', color: 'from-blue-500 to-blue-600' },
    { name: 'Mark Attendance', icon: HiUsers, path: '/teacher/attendance', color: 'from-green-500 to-green-600' },
    { name: 'View Submissions', icon: HiBookOpen, path: '/teacher/submissions', color: 'from-purple-500 to-purple-600' },
    { name: 'My Courses', icon: HiAcademicCap, path: '/teacher/courses', color: 'from-orange-500 to-orange-600' },
  ];

  // ============ 3D Stat Card ============
  const StatCard3D = ({ title, value, subtitle, icon: Icon, gradient, trend, trendValue, to }) => (
    <motion.button
      type="button"
      whileHover={{ y: -6, scale: 1.02 }}
      whileTap={{ scale: 0.99 }}
      transition={{ type: 'spring', stiffness: 280, damping: 18 }}
      onClick={() => to && navigate(to)}
      className={cn(
        'relative w-full text-left overflow-hidden rounded-3xl border border-dark-100 bg-white',
        'shadow-[0_20px_50px_-15px_rgba(15,23,42,0.3)]',
        'hover:shadow-[0_30px_60px_-20px_rgba(99,102,241,0.35)]',
        'transition-all duration-300',
        to && 'cursor-pointer'
      )}
    >
      <div className={cn('absolute inset-0 bg-gradient-to-br opacity-5', gradient)} />
      <div className={cn('absolute -top-20 -right-20 w-56 h-56 rounded-full blur-3xl opacity-20 bg-gradient-to-br', gradient)} />
      
      <div className="relative p-6 sm:p-8">
        <div className="flex items-start justify-between mb-6">
          <div className="flex-1 min-w-0">
            <p className="text-sm font-semibold text-dark-500 uppercase tracking-wider mb-2">{title}</p>
            <div className="flex items-baseline gap-3">
              <h2 className="text-4xl sm:text-5xl font-black text-dark-900 tracking-tight">
                {value}
              </h2>
            </div>
            {subtitle && (
              <p className="text-sm text-dark-500 mt-2">{subtitle}</p>
            )}
            {trend && (
              <div className={cn(
                'inline-flex items-center gap-2 px-3 py-1.5 rounded-full text-sm font-semibold mt-3',
                'bg-green-50 text-green-700 border border-green-200'
              )}>
                <HiTrendingUp className="w-4 h-4" />
                <span>{trendValue}</span>
              </div>
            )}
          </div>

          <motion.div 
            whileHover={{ rotate: 360 }}
            transition={{ duration: 0.6 }}
            className={cn(
              'shrink-0 p-5 rounded-2xl text-white shadow-2xl bg-gradient-to-br',
              gradient
            )}
          >
            <Icon className="w-8 h-8" />
          </motion.div>
        </div>

        <div className="h-[2px] w-full bg-gradient-to-r from-transparent via-dark-200 to-transparent" />

        {to && (
          <div className="mt-4 flex items-center justify-between text-xs text-dark-500">
            <span>Open</span>
            <span className="inline-flex items-center gap-1 font-semibold text-primary-600">
              View <HiArrowRight className="w-4 h-4" />
            </span>
          </div>
        )}
      </div>

      <div className={cn('h-1.5 w-full bg-gradient-to-r', gradient)} />
    </motion.button>
  );

  return (
    <motion.div
      initial="initial"
      animate="animate"
      variants={staggerContainer}
      className="space-y-6 sm:space-y-8"
    >
      {/* ============ HEADER ============ */}
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
                <span className="text-sm font-bold">Teacher Dashboard</span>
              </div>
              
              <h1 className="text-3xl sm:text-4xl lg:text-5xl font-black leading-tight mb-3">
                Welcome back, {user?.name || 'Teacher'}! 👋
              </h1>
              <p className="text-white/90 text-base sm:text-lg max-w-2xl">
                Here's your teaching overview for today
              </p>

              <div className="mt-6 grid grid-cols-2 sm:grid-cols-4 gap-4">
                <div className="backdrop-blur-sm bg-white/10 rounded-xl p-3 border border-white/20">
                  <p className="text-white/70 text-xs font-medium">Today's Date</p>
                  <p className="text-xl font-bold text-white mt-1">{formatDate(new Date())}</p>
                </div>
                <div className="backdrop-blur-sm bg-white/10 rounded-xl p-3 border border-white/20">
                  <p className="text-white/70 text-xs font-medium">Active Courses</p>
                  <p className="text-xl font-bold text-white mt-1">{stats.totalCourses}</p>
                </div>
                <div className="backdrop-blur-sm bg-white/10 rounded-xl p-3 border border-white/20">
                  <p className="text-white/70 text-xs font-medium">Total Students</p>
                  <p className="text-xl font-bold text-white mt-1">{stats.totalStudents}</p>
                </div>
                <div className="backdrop-blur-sm bg-white/10 rounded-xl p-3 border border-white/20">
                  <p className="text-white/70 text-xs font-medium">Pending Review</p>
                  <p className="text-xl font-bold text-white mt-1">{stats.pendingAssignments}</p>
                </div>
              </div>
            </div>

            <div className="flex flex-col sm:flex-row gap-3">
              <Button
                variant="outline"
                className="border-white/40 text-white hover:bg-white/20 backdrop-blur-sm"
                icon={HiRefresh}
                onClick={fetchAll}
              >
                Refresh
              </Button>
            </div>
          </div>
        </div>
      </motion.div>

      {/* ============ LOADING ============ */}
      {loading && (
        <div className="py-16">
          <Loader size="lg" text="Loading dashboard..." />
        </div>
      )}

      {/* ============ STATS CARDS (2 COLUMNS) ============ */}
      {!loading && (
        <motion.div 
          variants={slideUp} 
          className="grid grid-cols-1 lg:grid-cols-2 gap-6"
        >
          <StatCard3D
            title="My Courses"
            value={stats.totalCourses}
            subtitle="Active teaching courses"
            icon={HiAcademicCap}
            gradient="from-primary-500 to-primary-600"
            trend="up"
            trendValue={stats.totalCourses > 0 ? 'Active' : 'No courses'}
            to="/teacher/courses"
          />
          
          <StatCard3D
            title="Total Students"
            value={stats.totalStudents}
            subtitle="Across all courses"
            icon={HiUsers}
            gradient="from-green-500 to-green-600"
            trend="up"
            trendValue="Enrolled"
            to="/teacher/courses"
          />
        </motion.div>
      )}

      {/* ============ QUICK ACTIONS ============ */}
      {!loading && (
        <motion.div variants={slideUp}>
          <Card 
            title="Quick Actions" 
            subtitle="Frequently used features"
            className="shadow-[0_20px_50px_-15px_rgba(15,23,42,0.2)]"
          >
            <div className="grid grid-cols-2 md:grid-cols-4 gap-4">
              {quickActions.map((action, index) => (
                <Link key={index} to={action.path}>
                  <motion.div
                    whileHover={{ scale: 1.05, y: -5 }}
                    whileTap={{ scale: 0.95 }}
                    className="p-4 rounded-xl bg-gradient-to-br from-dark-50 to-dark-100 hover:from-white hover:to-dark-50 border border-dark-200 hover:border-primary-200 transition-all cursor-pointer group"
                  >
                    <div className={`w-12 h-12 rounded-xl bg-gradient-to-br ${action.color} flex items-center justify-center mb-3 group-hover:scale-110 transition-transform shadow-lg`}>
                      <action.icon className="w-6 h-6 text-white" />
                    </div>
                    <p className="font-medium text-dark-900 group-hover:text-primary-600 transition-colors text-sm">
                      {action.name}
                    </p>
                  </motion.div>
                </Link>
              ))}
            </div>
          </Card>
        </motion.div>
      )}

      {/* ============ CHARTS ROW ============ */}
      {!loading && (
        <div className="grid lg:grid-cols-5 gap-6">
          {/* Submission Trends - 3 columns */}
          <motion.div variants={slideUp} className="lg:col-span-3">
            <Card 
              title="Weekly Submissions" 
              subtitle="Assignment submission trends"
              className="h-full shadow-[0_20px_50px_-15px_rgba(15,23,42,0.2)]"
            >
              <div className="w-full" style={{ height: '360px', minHeight: '360px' }}>
                <ResponsiveContainer width="100%" height="100%">
                  <AreaChart data={submissionTrends} margin={{ top: 10, right: 10, left: -20, bottom: 0 }}>
                    <defs>
                      <linearGradient id="colorSubmissions" x1="0" y1="0" x2="0" y2="1">
                        <stop offset="5%" stopColor="#6366f1" stopOpacity={0.3}/>
                        <stop offset="95%" stopColor="#6366f1" stopOpacity={0}/>
                      </linearGradient>
                    </defs>
                    <CartesianGrid strokeDasharray="3 3" stroke="#e2e8f0" vertical={false} />
                    <XAxis dataKey="name" stroke="#64748b" fontSize={12} tickLine={false} axisLine={false} />
                    <YAxis stroke="#64748b" fontSize={12} tickLine={false} axisLine={false} />
                    <Tooltip 
                      contentStyle={{ 
                        backgroundColor: '#fff', 
                        border: 'none', 
                        borderRadius: '16px',
                        boxShadow: '0 20px 40px -10px rgba(0,0,0,0.15)',
                        padding: '12px 16px'
                      }}
                    />
                    <Area 
                      type="monotone" 
                      dataKey="submissions" 
                      stroke="#6366f1" 
                      strokeWidth={4}
                      fillOpacity={1} 
                      fill="url(#colorSubmissions)" 
                    />
                  </AreaChart>
                </ResponsiveContainer>
              </div>
            </Card>
          </motion.div>

          {/* Attendance Rate - 2 columns */}
          <motion.div variants={slideUp} className="lg:col-span-2">
            <Card 
              title="Overall Attendance" 
              subtitle="This month"
              className="h-full shadow-[0_20px_50px_-15px_rgba(15,23,42,0.2)]"
            >
              <div className="w-full" style={{ height: '360px', minHeight: '360px' }}>
                <div style={{ height: '70%' }} className="flex items-center justify-center">
                  <ResponsiveContainer width="100%" height="100%">
                    <RadialBarChart cx="50%" cy="50%" innerRadius="60%" outerRadius="90%" data={attendanceData}>
                      <RadialBar dataKey="value" fill="#10b981" background={{ fill: '#f3f4f6' }} cornerRadius={10} />
                      <Legend 
                        iconSize={10} 
                        layout="vertical" 
                        verticalAlign="middle" 
                        content={() => (
                          <div className="text-center">
                            <p className="text-5xl font-black text-dark-900">92%</p>
                            <p className="text-sm text-dark-500 mt-1">Attendance Rate</p>
                          </div>
                        )}
                      />
                    </RadialBarChart>
                  </ResponsiveContainer>
                </div>
                <div className="grid grid-cols-2 gap-4 mt-4">
                  <div className="text-center p-3 bg-green-50 rounded-xl border-2 border-green-200">
                    <p className="text-2xl font-bold text-green-600">138</p>
                    <p className="text-xs text-green-700">Present</p>
                  </div>
                  <div className="text-center p-3 bg-red-50 rounded-xl border-2 border-red-200">
                    <p className="text-2xl font-bold text-red-600">12</p>
                    <p className="text-xs text-red-700">Absent</p>
                  </div>
                </div>
              </div>
            </Card>
          </motion.div>
        </div>
      )}

      {/* ============ CONTENT ROW ============ */}
      {!loading && (
        <div className="grid lg:grid-cols-3 gap-6">
          {/* Course Distribution - 1 column */}
          <motion.div variants={slideUp}>
            <Card
              title="Courses by Category"
              subtitle="Distribution"
              className="shadow-[0_20px_50px_-15px_rgba(15,23,42,0.2)] h-full"
            >
              <div className="flex items-center gap-2 text-sm text-dark-500 mb-3">
                <HiChartPie className="w-4 h-4 text-primary-600" />
                <span>Category breakdown</span>
              </div>

              <div className="w-full" style={{ height: '280px', minHeight: '280px' }}>
                {categoryData.length === 0 ? (
                  <div className="h-full flex flex-col items-center justify-center text-dark-500">
                    <HiAcademicCap className="w-12 h-12 mb-3 text-dark-300" />
                    <p className="font-medium">No courses yet</p>
                  </div>
                ) : (
                  <ResponsiveContainer width="100%" height="100%">
                    <PieChart>
                      <Pie
                        data={categoryData}
                        dataKey="value"
                        nameKey="name"
                        innerRadius={60}
                        outerRadius={90}
                        paddingAngle={4}
                      >
                        {categoryData.map((_, index) => (
                          <Cell 
                            key={index} 
                            fill={pieColors[index % pieColors.length]}
                            stroke="#fff"
                            strokeWidth={3}
                          />
                        ))}
                      </Pie>
                      <Tooltip />
                    </PieChart>
                  </ResponsiveContainer>
                )}
              </div>
            </Card>
          </motion.div>

          {/* Recent Assignments - 2 columns */}
          <motion.div variants={slideUp} className="lg:col-span-2">
            <Card 
              title="Recent Assignments" 
              subtitle="Latest created"
              className="shadow-[0_20px_50px_-15px_rgba(15,23,42,0.2)] h-full"
              headerAction={
                <Button variant="ghost" size="sm" onClick={() => navigate('/teacher/assignments')}>
                  View All
                </Button>
              }
            >
              <div className="space-y-3">
                {recentAssignments.length === 0 ? (
                  <div className="text-center py-8">
                    <HiClipboardList className="w-12 h-12 mx-auto mb-3 text-dark-300" />
                    <p className="text-dark-500">No assignments yet</p>
                  </div>
                ) : (
                  recentAssignments.map((assignment, index) => (
                    <motion.button
                      key={assignment._id}
                      type="button"
                      initial={{ opacity: 0, x: -20 }}
                      animate={{ opacity: 1, x: 0 }}
                      transition={{ delay: index * 0.1 }}
                      onClick={() => navigate('/teacher/assignments')}
                      className="w-full text-left p-4 rounded-xl border border-dark-100 bg-white hover:bg-primary-50/40 transition-colors"
                    >
                      <div className="flex items-start justify-between gap-4">
                        <div className="min-w-0 flex-1">
                          <p className="font-semibold text-dark-900 truncate">{assignment.title}</p>
                          <p className="text-sm text-dark-500 mt-1 truncate">
                            Course: <span className="font-medium text-dark-700">
                              {assignment.course?.title || 'Not assigned'}
                            </span>
                          </p>
                          <p className="text-xs text-dark-400 mt-1">
                            {assignment.createdAt ? formatDate(assignment.createdAt) : '—'}
                          </p>
                        </div>
                        <span className={cn(
                          'badge shrink-0',
                          assignment.status === 'active' ? 'badge-success' : 'badge-secondary'
                        )}>
                          {assignment.status || 'draft'}
                        </span>
                      </div>
                    </motion.button>
                  ))
                )}
              </div>
            </Card>
          </motion.div>
        </div>
      )}

      {/* ============ COURSE PERFORMANCE ============ */}
      {!loading && coursePerformance.length > 0 && (
        <motion.div variants={slideUp}>
          <Card 
            title="Course Performance" 
            subtitle="Student enrollment by course"
            className="shadow-[0_20px_50px_-15px_rgba(15,23,42,0.2)]"
          >
            <div className="w-full" style={{ height: '320px', minHeight: '320px' }}>
              <ResponsiveContainer width="100%" height="100%">
                <BarChart data={coursePerformance} margin={{ top: 10, right: 10, left: -20, bottom: 0 }}>
                  <CartesianGrid strokeDasharray="3 3" stroke="#e2e8f0" vertical={false} />
                  <XAxis dataKey="name" stroke="#64748b" fontSize={12} tickLine={false} axisLine={false} />
                  <YAxis stroke="#64748b" fontSize={12} tickLine={false} axisLine={false} />
                  <Tooltip 
                    contentStyle={{ 
                      backgroundColor: '#fff', 
                      border: 'none', 
                      borderRadius: '16px',
                      boxShadow: '0 20px 40px -10px rgba(0,0,0,0.15)',
                      padding: '12px 16px'
                    }}
                  />
                  <Bar dataKey="students" radius={[8, 8, 0, 0]}>
                    {coursePerformance.map((entry, index) => (
                      <Cell key={index} fill={entry.fill} />
                    ))}
                  </Bar>
                </BarChart>
              </ResponsiveContainer>
            </div>
            
            <div className="grid grid-cols-2 lg:grid-cols-4 gap-4 mt-6">
              {coursePerformance.map((course, index) => (
                <div key={index} className="text-center p-3 rounded-xl bg-dark-50">
                  <div className="flex items-center justify-center gap-2 mb-2">
                    <div className="w-3 h-3 rounded-full" style={{ backgroundColor: course.fill }} />
                    <span className="text-sm font-medium text-dark-900 truncate">{course.name}</span>
                  </div>
                  <p className="text-2xl font-bold text-dark-900">{course.students}</p>
                  <p className="text-xs text-dark-500">students</p>
                </div>
              ))}
            </div>
          </Card>
        </motion.div>
      )}
    </motion.div>
  );
};

export default TeacherDashboard;