// src/pages/student/Dashboard.jsx
import React, { useEffect, useMemo, useState } from "react";
import { motion } from "framer-motion";
import { useNavigate, Link } from "react-router-dom";
import {
  HiAcademicCap,
  HiClipboardList,
  HiCheckCircle,
  HiClock,
  HiTrendingUp,
  HiCalendar,
  HiBell,
  HiArrowRight,
  HiBookOpen,
  HiChartBar,
  HiRefresh,
  HiSparkles,
  HiStar,
  HiPlay,
  HiDocumentText,
  HiChartPie,
} from "react-icons/hi";
import {
  AreaChart,
  Area,
  RadialBarChart,
  RadialBar,
  PieChart,
  Pie,
  Cell,
  XAxis,
  YAxis,
  CartesianGrid,
  Tooltip,
  ResponsiveContainer,
  Legend,
} from "recharts";

import Card from "../../components/common/Card";
import Button from "../../components/common/Button";
import Loader from "../../components/common/Loader";
import { useAuth } from "../../hooks/useAuth";
import { useApi } from "../../hooks/useApi";
import { studentApi } from "../../api/studentApi";
import { staggerContainer, slideUp } from "../../utils/constants";
import { formatDate, getRelativeTime, cn } from "../../utils/helpers";

const StudentDashboard = () => {
  const { user } = useAuth();
  const navigate = useNavigate();
  const { loading, execute } = useApi();

  // ============ State ============
  const [dashboard, setDashboard] = useState({
    courses: [],
    grades: [],
    progress: [],
    notifications: [],
  });

  const [assignments, setAssignments] = useState([]);

  // ============ Fetch All Data ============
  const fetchAll = async () => {
    await Promise.all([
      execute(() => studentApi.getDashboard(), {
        showSuccessToast: false,
        onSuccess: (data) => {
          setDashboard({
            courses: Array.isArray(data?.courses) ? data.courses : [],
            grades: Array.isArray(data?.grades) ? data.grades : [],
            progress: Array.isArray(data?.progress) ? data.progress : [],
            notifications: Array.isArray(data?.notifications) ? data.notifications : [],
          });
        },
      }),
      execute(() => studentApi.getAssignments(), {
        showSuccessToast: false,
        onSuccess: (data) => {
          const list = Array.isArray(data) ? data : data?.data || [];
          setAssignments(list);
        },
      }),
    ]);
  };

  useEffect(() => {
    fetchAll();
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, []);

  // ============ Computed Stats ============
  const stats = useMemo(() => {
    const totalCourses = dashboard.courses.length;
    const totalGrades = dashboard.grades.length;

    // Calculate average grade
    const gradesWithScores = dashboard.grades.filter((g) => g.grade !== undefined);
    const averageGrade =
      gradesWithScores.length > 0
        ? Math.round(
            gradesWithScores.reduce((sum, g) => sum + (g.grade || 0), 0) /
              gradesWithScores.length
          )
        : 0;

    // Calculate pending and completed assignments
    const now = new Date();
    const pendingAssignments = assignments.filter(
      (a) => a.status === "active" && new Date(a.dueDate) > now
    ).length;
    const completedAssignments = totalGrades;

    // Unread notifications
    const unreadNotifications = dashboard.notifications.filter((n) => !n.isRead).length;

    return {
      enrolledCourses: totalCourses,
      completedAssignments,
      pendingAssignments,
      averageGrade,
      unreadNotifications,
    };
  }, [dashboard, assignments]);

  // ============ Recent Courses ============
  const recentCourses = useMemo(() => {
    return [...dashboard.courses]
      .sort((a, b) => new Date(b.createdAt || 0) - new Date(a.createdAt || 0))
      .slice(0, 4);
  }, [dashboard.courses]);

  // ============ Upcoming Deadlines ============
  const upcomingDeadlines = useMemo(() => {
    const now = new Date();
    return assignments
      .filter((a) => a.status === "active" && new Date(a.dueDate) > now)
      .sort((a, b) => new Date(a.dueDate) - new Date(b.dueDate))
      .slice(0, 5);
  }, [assignments]);

  // ============ Recent Grades ============
  const recentGrades = useMemo(() => {
    return [...dashboard.grades]
      .sort((a, b) => new Date(b.createdAt || 0) - new Date(a.createdAt || 0))
      .slice(0, 5);
  }, [dashboard.grades]);

  // ============ Progress Chart Data ============
  const progressChartData = useMemo(() => {
    if (dashboard.progress.length === 0) return [];

    return dashboard.progress.map((p) => ({
      name: p.courseTitle || "Course",
      completed: p.gradedAssignments || 0,
      total: p.totalAssignments || 0,
      percentage:
        p.totalAssignments > 0
          ? Math.round((p.gradedAssignments / p.totalAssignments) * 100)
          : 0,
    }));
  }, [dashboard.progress]);

  // ============ Course Distribution Data ============
  const courseDistributionData = useMemo(() => {
    const categoryMap = new Map();
    for (const course of dashboard.courses) {
      const key = course.category || "Uncategorized";
      categoryMap.set(key, (categoryMap.get(key) || 0) + 1);
    }
    return Array.from(categoryMap.entries()).map(([name, value]) => ({ name, value }));
  }, [dashboard.courses]);

  const pieColors = ["#6366f1", "#14b8a6", "#f59e0b", "#ec4899", "#22c55e", "#3b82f6"];

  // ============ 3D Stat Card Component ============
  const StatCard3D = ({ title, value, icon: Icon, gradient, hint, to }) => (
    <motion.button
      type="button"
      whileHover={{ y: -6 }}
      whileTap={{ scale: 0.99 }}
      transition={{ type: "spring", stiffness: 280, damping: 18 }}
      onClick={() => to && navigate(to)}
      className={cn(
        "relative w-full text-left overflow-hidden rounded-2xl border border-dark-100 bg-white",
        "shadow-[0_18px_35px_-18px_rgba(15,23,42,0.25)]",
        "hover:shadow-[0_28px_55px_-22px_rgba(99,102,241,0.28)]",
        "transition-all",
        to && "cursor-pointer"
      )}
    >
      <div
        className={cn(
          "absolute -top-14 -right-14 w-44 h-44 rounded-full blur-3xl opacity-20 bg-gradient-to-br",
          gradient
        )}
      />
      <div className="p-5 sm:p-6 relative">
        <div className="flex items-start justify-between gap-4">
          <div className="min-w-0">
            <p className="text-sm font-medium text-dark-500">{title}</p>
            <p className="mt-2 text-3xl font-extrabold text-dark-900 tracking-tight truncate">
              {value}
            </p>
            {hint && <p className="mt-1 text-xs text-dark-400">{hint}</p>}
          </div>

          <div
            className={cn(
              "shrink-0 p-4 rounded-2xl text-white shadow-lg bg-gradient-to-br",
              gradient
            )}
          >
            <Icon className="w-7 h-7" />
          </div>
        </div>

        <div className="mt-5 h-[1px] w-full bg-gradient-to-r from-transparent via-dark-200 to-transparent" />

        {to && (
          <div className="mt-3 flex items-center justify-between text-xs text-dark-500">
            <span>Open</span>
            <span className="inline-flex items-center gap-1 font-semibold text-primary-600">
              View <HiArrowRight className="w-4 h-4" />
            </span>
          </div>
        )}
      </div>
    </motion.button>
  );

  // ============ Grade Color Helper ============
  const getGradeColor = (grade) => {
    if (grade >= 90) return "text-green-600 bg-green-50";
    if (grade >= 80) return "text-blue-600 bg-blue-50";
    if (grade >= 70) return "text-amber-600 bg-amber-50";
    return "text-red-600 bg-red-50";
  };

  const getGradeLetter = (grade) => {
    if (grade >= 90) return "A";
    if (grade >= 80) return "B";
    if (grade >= 70) return "C";
    if (grade >= 60) return "D";
    return "F";
  };

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
                <span className="text-xs font-semibold">Student Portal</span>
              </div>

              <h1 className="mt-4 text-2xl sm:text-3xl font-extrabold leading-tight">
                Welcome back, {user?.name || "Student"}! 🎓
              </h1>
              <p className="mt-2 text-white/80 text-sm sm:text-base max-w-2xl">
                Keep up the great work! Your learning journey continues.
              </p>

              {/* Quick Stats in Header */}
              <div className="mt-6 grid grid-cols-2 md:grid-cols-4 gap-4 sm:gap-6">
                <div>
                  <p className="text-primary-200 text-sm">Enrolled Courses</p>
                  <p className="text-xl font-semibold">{stats.enrolledCourses}</p>
                </div>
                <div>
                  <p className="text-primary-200 text-sm">Avg. Grade</p>
                  <p className="text-xl font-semibold">
                    {stats.averageGrade > 0 ? `${stats.averageGrade}%` : "N/A"}
                  </p>
                </div>
                <div>
                  <p className="text-primary-200 text-sm">Pending Tasks</p>
                  <p className="text-xl font-semibold">{stats.pendingAssignments}</p>
                </div>
                <div>
                  <p className="text-primary-200 text-sm">Notifications</p>
                  <p className="text-xl font-semibold">{stats.unreadNotifications}</p>
                </div>
              </div>
            </div>

            <div className="flex flex-col sm:flex-row gap-3">
              <Button
                variant="outline"
                className="border-white/30 text-white hover:bg-white/10"
                icon={HiRefresh}
                onClick={fetchAll}
              >
                Refresh
              </Button>
              <Button
                className="bg-white text-primary-700 hover:bg-white/90"
                icon={HiPlay}
                onClick={() => navigate("/student/courses")}
              >
                Continue Learning
              </Button>
            </div>
          </div>
        </div>

        {/* Decorative Elements */}
        <motion.div
          animate={{ rotate: 360 }}
          transition={{ duration: 50, repeat: Infinity, ease: "linear" }}
          className="absolute -top-20 -right-20 w-80 h-80 border-[40px] border-white/5 rounded-full"
        />
        <div className="absolute -bottom-16 -left-16 w-56 h-56 bg-accent-300/20 rounded-full blur-3xl" />
      </motion.div>

      {/* ============ LOADING ============ */}
      {loading && (
        <div className="py-10">
          <Loader size="lg" text="Loading your dashboard..." />
        </div>
      )}

      {/* ============ STAT CARDS GRID ============ */}
      {!loading && (
        <motion.div
          variants={slideUp}
          className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-4 sm:gap-5"
        >
          <StatCard3D
            title="Enrolled Courses"
            value={stats.enrolledCourses}
            icon={HiAcademicCap}
            gradient="from-primary-500 to-primary-600"
            hint="Active courses"
            to="/student/courses"
          />
          <StatCard3D
            title="Pending Tasks"
            value={stats.pendingAssignments}
            icon={HiClipboardList}
            gradient="from-amber-500 to-amber-600"
            hint="Due soon"
            to="/student/assignments"
          />
          <StatCard3D
            title="Completed"
            value={stats.completedAssignments}
            icon={HiCheckCircle}
            gradient="from-green-500 to-green-600"
            hint="Submitted assignments"
            to="/student/assignments"
          />
          <StatCard3D
            title="Average Grade"
            value={stats.averageGrade > 0 ? `${stats.averageGrade}%` : "N/A"}
            icon={HiChartBar}
            gradient="from-purple-500 to-purple-600"
            hint={stats.averageGrade > 0 ? `Grade: ${getGradeLetter(stats.averageGrade)}` : "No grades yet"}
          />
        </motion.div>
      )}

      {/* ============ MAIN CONTENT GRID ============ */}
      {!loading && (
        <div className="grid grid-cols-1 lg:grid-cols-3 gap-6">
          {/* Column 1: Course Progress Chart */}
          <motion.div variants={slideUp}>
            <Card
              title="Course Progress"
              subtitle="Your learning progress"
              className="shadow-[0_18px_35px_-20px_rgba(15,23,42,0.25)] hover:shadow-[0_28px_55px_-24px_rgba(99,102,241,0.22)] transition-all h-full"
            >
              <div className="flex items-center gap-2 text-sm text-dark-500 mb-3">
                <HiChartPie className="w-4 h-4 text-primary-600" />
                <span>By course</span>
              </div>

              <div className="w-full min-w-0 h-72 sm:h-80">
                {courseDistributionData.length === 0 ? (
                  <div className="h-full flex flex-col items-center justify-center text-dark-500">
                    <HiAcademicCap className="w-12 h-12 mb-3 text-dark-300" />
                    <p>No courses enrolled yet</p>
                    <Button
                      size="sm"
                      variant="outline"
                      className="mt-3"
                      onClick={() => navigate("/student/courses")}
                    >
                      Browse Courses
                    </Button>
                  </div>
                ) : (
                  <ResponsiveContainer width="100%" height="100%" minWidth={0} minHeight={0}>
                    <PieChart>
                      <Pie
                        data={courseDistributionData}
                        dataKey="value"
                        nameKey="name"
                        innerRadius={65}
                        outerRadius={105}
                        paddingAngle={4}
                      >
                        {courseDistributionData.map((_, index) => (
                          <Cell key={index} fill={pieColors[index % pieColors.length]} />
                        ))}
                      </Pie>
                      <Tooltip />
                      <Legend />
                    </PieChart>
                  </ResponsiveContainer>
                )}
              </div>
            </Card>
          </motion.div>

          {/* Column 2: Upcoming Deadlines */}
          <motion.div variants={slideUp}>
            <Card
              title="Upcoming Deadlines"
              subtitle="Don't miss these"
              className="shadow-[0_18px_35px_-20px_rgba(15,23,42,0.25)] hover:shadow-[0_28px_55px_-24px_rgba(99,102,241,0.22)] transition-all h-full"
              headerAction={
                <Button
                  variant="ghost"
                  size="sm"
                  onClick={() => navigate("/student/assignments")}
                >
                  View All
                </Button>
              }
            >
              <div className="space-y-3">
                {upcomingDeadlines.length === 0 ? (
                  <div className="text-center py-8">
                    <HiCheckCircle className="w-12 h-12 mx-auto mb-3 text-green-400" />
                    <p className="text-dark-500">No pending deadlines!</p>
                    <p className="text-sm text-dark-400 mt-1">You're all caught up</p>
                  </div>
                ) : (
                  upcomingDeadlines.map((assignment, index) => {
                    const daysLeft = Math.ceil(
                      (new Date(assignment.dueDate) - new Date()) / (1000 * 60 * 60 * 24)
                    );
                    const isUrgent = daysLeft <= 2;

                    return (
                      <motion.div
                        key={assignment._id}
                        initial={{ opacity: 0, x: -20 }}
                        animate={{ opacity: 1, x: 0 }}
                        transition={{ delay: index * 0.1 }}
                        className={cn(
                          "p-3 rounded-xl border transition-colors",
                          isUrgent
                            ? "bg-gradient-to-r from-red-50 to-orange-50 border-red-200"
                            : "bg-gradient-to-r from-amber-50 to-orange-50 border-amber-200"
                        )}
                      >
                        <div className="flex items-start justify-between">
                          <div className="min-w-0 flex-1">
                            <h4 className="font-semibold text-dark-900 text-sm truncate">
                              {assignment.title}
                            </h4>
                            <p className="text-xs text-dark-600 mt-1 truncate">
                              {assignment.course?.title || "Course"}
                            </p>
                          </div>
                          <HiClock
                            className={cn(
                              "w-4 h-4 flex-shrink-0 ml-2",
                              isUrgent ? "text-red-600" : "text-amber-600"
                            )}
                          />
                        </div>
                        <div className="flex items-center justify-between mt-2">
                          <span
                            className={cn(
                              "text-xs font-medium",
                              isUrgent ? "text-red-700" : "text-amber-700"
                            )}
                          >
                            {daysLeft === 0
                              ? "Due today!"
                              : daysLeft === 1
                              ? "Due tomorrow"
                              : `${daysLeft} days left`}
                          </span>
                          <Button
                            size="sm"
                            className="text-xs py-1 px-2"
                            onClick={() => navigate("/student/assignments")}
                          >
                            Submit
                          </Button>
                        </div>
                      </motion.div>
                    );
                  })
                )}
              </div>
            </Card>
          </motion.div>

          {/* Column 3: Recent Grades */}
          <motion.div variants={slideUp}>
            <Card
              title="Recent Grades"
              subtitle="Your latest scores"
              className="shadow-[0_18px_35px_-20px_rgba(15,23,42,0.25)] hover:shadow-[0_28px_55px_-24px_rgba(99,102,241,0.22)] transition-all h-full"
            >
              <div className="space-y-3">
                {recentGrades.length === 0 ? (
                  <div className="text-center py-8">
                    <HiDocumentText className="w-12 h-12 mx-auto mb-3 text-dark-300" />
                    <p className="text-dark-500">No grades yet</p>
                    <p className="text-sm text-dark-400 mt-1">
                      Complete assignments to see grades
                    </p>
                  </div>
                ) : (
                  recentGrades.map((grade, index) => (
                    <motion.div
                      key={grade._id || index}
                      initial={{ opacity: 0, scale: 0.9 }}
                      animate={{ opacity: 1, scale: 1 }}
                      transition={{ delay: index * 0.1 }}
                      className="p-3 rounded-xl border border-dark-200 hover:shadow-soft transition-shadow"
                    >
                      <div className="flex items-center justify-between mb-2">
                        <h4 className="font-semibold text-dark-900 text-sm truncate flex-1">
                          {grade.assignment?.title || "Assignment"}
                        </h4>
                        <span
                          className={cn(
                            "px-2 py-1 rounded-lg text-xs font-bold ml-2",
                            getGradeColor(grade.grade || 0)
                          )}
                        >
                          {getGradeLetter(grade.grade || 0)}
                        </span>
                      </div>
                      <p className="text-xs text-dark-600 mb-2">
                        {grade.course?.title || "Course"}
                      </p>
                      <div className="flex items-center justify-between">
                        <div className="flex items-center gap-2 flex-1">
                          <div
                            className="h-2 bg-dark-100 rounded-full overflow-hidden"
                            style={{ width: "80px" }}
                          >
                            <div
                              className="h-full bg-gradient-to-r from-primary-500 to-accent-500 rounded-full"
                              style={{ width: `${grade.grade || 0}%` }}
                            />
                          </div>
                          <span className="text-xs font-semibold text-dark-700">
                            {grade.grade || 0}%
                          </span>
                        </div>
                        {grade.grade >= 90 && <HiStar className="w-4 h-4 text-yellow-500" />}
                      </div>
                    </motion.div>
                  ))
                )}
              </div>
            </Card>
          </motion.div>
        </div>
      )}

      {/* ============ ENROLLED COURSES SECTION ============ */}
      {!loading && (
        <motion.div variants={slideUp}>
          <Card
            title="My Courses"
            subtitle="Continue where you left off"
            className="shadow-[0_18px_35px_-20px_rgba(15,23,42,0.25)]"
            headerAction={
              <Button variant="ghost" size="sm" onClick={() => navigate("/student/courses")}>
                View All
              </Button>
            }
          >
            {recentCourses.length === 0 ? (
              <div className="text-center py-12">
                <HiAcademicCap className="w-16 h-16 mx-auto mb-4 text-dark-300" />
                <p className="text-dark-500 font-medium">No courses enrolled yet</p>
                <p className="text-sm text-dark-400 mt-1 mb-4">
                  Start your learning journey today
                </p>
                <Button onClick={() => navigate("/student/courses")}>Browse Courses</Button>
              </div>
            ) : (
              <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-4">
                {recentCourses.map((course, index) => {
                  // Calculate progress from dashboard.progress
                  const courseProgress = dashboard.progress.find(
                    (p) => p.courseId === course._id
                  );
                  const progressPercent =
                    courseProgress && courseProgress.totalAssignments > 0
                      ? Math.round(
                          (courseProgress.gradedAssignments / courseProgress.totalAssignments) *
                            100
                        )
                      : 0;

                  return (
                    <motion.button
                      key={course._id}
                      type="button"
                      initial={{ opacity: 0, y: 20 }}
                      animate={{ opacity: 1, y: 0 }}
                      transition={{ delay: index * 0.1 }}
                      whileHover={{ y: -5 }}
                      onClick={() => navigate(`/student/courses`)}
                      className="w-full text-left p-4 rounded-xl border border-dark-100 bg-white hover:shadow-lg hover:border-primary-200 transition-all group"
                    >
                      <div className="flex items-center gap-3 mb-3">
                        <div className="w-12 h-12 rounded-xl bg-gradient-to-br from-primary-500 to-accent-500 flex items-center justify-center text-xl shadow-lg">
                          📚
                        </div>
                        <div className="min-w-0 flex-1">
                          <h4 className="font-semibold text-dark-900 truncate">
                            {course.title}
                          </h4>
                          <p className="text-xs text-dark-500 truncate">
                            {course.teacher?.name || "Instructor"}
                          </p>
                        </div>
                      </div>

                      <div className="mb-3">
                        <div className="flex justify-between text-xs mb-1">
                          <span className="text-dark-500">Progress</span>
                          <span className="font-semibold text-dark-700">{progressPercent}%</span>
                        </div>
                        <div className="w-full h-2 bg-dark-100 rounded-full overflow-hidden">
                          <motion.div
                            initial={{ width: 0 }}
                            animate={{ width: `${progressPercent}%` }}
                            transition={{ delay: 0.5 + index * 0.1, duration: 1 }}
                            className="h-full bg-gradient-to-r from-primary-500 to-accent-500 rounded-full"
                          />
                        </div>
                      </div>

                      <div className="flex items-center justify-between">
                        <span className="text-xs text-dark-400">
                          {course.lectures?.length || 0} lectures
                        </span>
                        <span className="inline-flex items-center gap-1 text-xs font-semibold text-primary-600 opacity-0 group-hover:opacity-100 transition-opacity">
                          Continue <HiArrowRight className="w-3 h-3" />
                        </span>
                      </div>
                    </motion.button>
                  );
                })}
              </div>
            )}
          </Card>
        </motion.div>
      )}

      {/* ============ NOTIFICATIONS SECTION ============ */}
      {!loading && dashboard.notifications.length > 0 && (
        <motion.div variants={slideUp}>
          <Card
            title="Recent Notifications"
            subtitle="Stay updated"
            className="shadow-[0_18px_35px_-20px_rgba(15,23,42,0.25)]"
            headerAction={
              <Button
                variant="ghost"
                size="sm"
                onClick={() => navigate("/student/announcements")}
              >
                View All
              </Button>
            }
          >
            <div className="space-y-3">
              {dashboard.notifications.slice(0, 5).map((notification, index) => (
                <motion.div
                  key={notification._id}
                  initial={{ opacity: 0, x: -20 }}
                  animate={{ opacity: 1, x: 0 }}
                  transition={{ delay: index * 0.05 }}
                  className={cn(
                    "p-4 rounded-xl border transition-colors",
                    notification.isRead
                      ? "bg-white border-dark-100"
                      : "bg-primary-50 border-primary-200"
                  )}
                >
                  <div className="flex items-start gap-3">
                    <div
                      className={cn(
                        "w-10 h-10 rounded-full flex items-center justify-center flex-shrink-0",
                        notification.isRead ? "bg-dark-100" : "bg-primary-100"
                      )}
                    >
                      <HiBell
                        className={cn(
                          "w-5 h-5",
                          notification.isRead ? "text-dark-400" : "text-primary-600"
                        )}
                      />
                    </div>
                    <div className="min-w-0 flex-1">
                      <p
                        className={cn(
                          "text-sm",
                          notification.isRead ? "text-dark-600" : "text-dark-800 font-medium"
                        )}
                      >
                        {notification.message}
                      </p>
                      <p className="text-xs text-dark-400 mt-1">
                        {getRelativeTime(notification.createdAt)}
                      </p>
                    </div>
                    {!notification.isRead && (
                      <div className="w-2 h-2 bg-primary-500 rounded-full flex-shrink-0" />
                    )}
                  </div>
                </motion.div>
              ))}
            </div>
          </Card>
        </motion.div>
      )}

      {/* ============ COURSE PROGRESS DETAILS ============ */}
      {!loading && dashboard.progress.length > 0 && (
        <motion.div variants={slideUp}>
          <Card
            title="Course Progress"
            subtitle="Your learning progress"
            className="shadow-[0_18px_35px_-20px_rgba(15,23,42,0.25)] hover:shadow-[0_28px_55px_-24px_rgba(99,102,241,0.22)] transition-all h-full"
          >
            <div className="flex items-center gap-2 text-sm text-dark-500 mb-3">
              <HiChartPie className="w-4 h-4 text-primary-600" />
              <span>By course</span>
            </div>

            {/* ✅ FIX: Add min-height and ensure proper sizing */}
            <div className="w-full" style={{ minHeight: '320px', height: '320px' }}>
              {courseDistributionData.length === 0 ? (
                <div className="h-full flex flex-col items-center justify-center text-dark-500">
                  <HiAcademicCap className="w-12 h-12 mb-3 text-dark-300" />
                  <p>No courses enrolled yet</p>
                  <Button
                    size="sm"
                    variant="outline"
                    className="mt-3"
                    onClick={() => navigate("/student/courses")}
                  >
                    Browse Courses
                  </Button>
                </div>
              ) : (
                <ResponsiveContainer width="100%" height="100%">
                  <PieChart>
                    <Pie
                      data={courseDistributionData}
                      dataKey="value"
                      nameKey="name"
                      innerRadius={65}
                      outerRadius={105}
                      paddingAngle={4}
                    >
                      {courseDistributionData.map((_, index) => (
                        <Cell key={index} fill={pieColors[index % pieColors.length]} />
                      ))}
                    </Pie>
                    <Tooltip />
                    <Legend />
                  </PieChart>
                </ResponsiveContainer>
              )}
            </div>
          </Card>
        </motion.div>
      )}
    </motion.div>
  );
};

export default StudentDashboard;