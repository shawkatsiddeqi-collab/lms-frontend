// src/pages/admin/Dashboard.jsx
import React, { useEffect, useMemo, useState } from "react";
import { motion } from "framer-motion";
import { useNavigate } from "react-router-dom";
import {
  HiUsers,
  HiAcademicCap,
  HiClipboardList,
  HiDocumentText,
  HiRefresh,
  HiSparkles,
  HiChartPie,
  HiArrowRight,
} from "react-icons/hi";
import { PieChart, Pie, Cell, ResponsiveContainer, Tooltip } from "recharts";

import Card from "../../components/common/Card";
import Button from "../../components/common/Button";
import Loader from "../../components/common/Loader";
import { staggerContainer, slideUp } from "../../utils/constants";
import { cn, formatDate, truncateText } from "../../utils/helpers";
import { useApi } from "../../hooks/useApi";
import { adminApi } from "../../api/adminApi";

const AdminDashboard = () => {
  const navigate = useNavigate();
  const { loading, execute } = useApi();

  const [dashboard, setDashboard] = useState({
    totalCourses: 0,
    totalAssignments: 0,
    totalSubmissions: 0,
    courses: [],
    assignments: [],
  });

  const [totalStudents, setTotalStudents] = useState(0);
  const [totalTeachers, setTotalTeachers] = useState(0);

  const fetchAll = async () => {
    await Promise.all([
      execute(() => adminApi.getDashboard(), {
        showSuccessToast: false,
        onSuccess: (data) => {
          setDashboard({
            totalCourses: data?.totalCourses || 0,
            totalAssignments: data?.totalAssignments || 0,
            totalSubmissions: data?.totalSubmissions || 0,
            courses: Array.isArray(data?.courses) ? data.courses : [],
            assignments: Array.isArray(data?.assignments) ? data.assignments : [],
          });
        },
      }),

      execute(() => adminApi.getStudents(), {
        showSuccessToast: false,
        onSuccess: (data) => {
          const list = Array.isArray(data) ? data : data?.data;
          setTotalStudents(Array.isArray(list) ? list.length : 0);
        },
      }),

      execute(() => adminApi.getTeachers(), {
        showSuccessToast: false,
        onSuccess: (data) => {
          const list = Array.isArray(data) ? data : data?.data;
          setTotalTeachers(Array.isArray(list) ? list.length : 0);
        },
      }),
    ]);
  };

  useEffect(() => {
    fetchAll();
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, []);

  const recentCourses = useMemo(() => {
    const arr = [...(dashboard.courses || [])];
    arr.sort((a, b) => new Date(b.createdAt || 0) - new Date(a.createdAt || 0));
    return arr.slice(0, 5);
  }, [dashboard.courses]);

  const recentAssignments = useMemo(() => {
    const arr = [...(dashboard.assignments || [])];
    arr.sort((a, b) => new Date(b.createdAt || 0) - new Date(a.createdAt || 0));
    return arr.slice(0, 5);
  }, [dashboard.assignments]);

  const categoryData = useMemo(() => {
    const map = new Map();
    for (const c of dashboard.courses || []) {
      const key = c.category || "Uncategorized";
      map.set(key, (map.get(key) || 0) + 1);
    }
    return Array.from(map.entries()).map(([name, value]) => ({ name, value }));
  }, [dashboard.courses]);

  const pieColors = ["#6366f1", "#14b8a6", "#f59e0b", "#ec4899", "#22c55e", "#3b82f6"];

  // 3D clickable stat card
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
      <div className={cn("absolute -top-14 -right-14 w-44 h-44 rounded-full blur-3xl opacity-20 bg-gradient-to-br", gradient)} />
      <div className="p-5 sm:p-6 relative">
        <div className="flex items-start justify-between gap-4">
          <div className="min-w-0">
            <p className="text-sm font-medium text-dark-500">{title}</p>
            <p className="mt-2 text-3xl font-extrabold text-dark-900 tracking-tight truncate">
              {value}
            </p>
            {hint && <p className="mt-1 text-xs text-dark-400">{hint}</p>}
          </div>

          <div className={cn("shrink-0 p-4 rounded-2xl text-white shadow-lg bg-gradient-to-br", gradient)}>
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

  return (
    <motion.div
      initial="initial"
      animate="animate"
      variants={staggerContainer}
      className="space-y-6 sm:space-y-8"
    >
      {/* HEADER */}
      <motion.div variants={slideUp} className="relative overflow-hidden rounded-2xl">
        <div className="absolute inset-0 bg-gradient-to-br from-primary-600 via-primary-700 to-accent-600" />
        <div className="absolute inset-0 bg-hero-pattern opacity-10" />
        <div className="relative p-6 sm:p-8">
          <div className="flex flex-col gap-4 lg:flex-row lg:items-center lg:justify-between">
            <div className="text-white">
              <div className="inline-flex items-center gap-2 px-3 py-1.5 rounded-full bg-white/15 backdrop-blur-sm border border-white/10">
                <HiSparkles className="w-4 h-4" />
                <span className="text-xs font-semibold">Admin Control Center</span>
              </div>

              <h1 className="mt-4 text-2xl sm:text-3xl font-extrabold leading-tight">
                Dashboard Overview
              </h1>
              <p className="mt-2 text-white/80 text-sm sm:text-base max-w-2xl">
                Live stats fetched from your database.
              </p>
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
            </div>
          </div>
        </div>

        <div className="absolute -top-16 -left-16 w-48 h-48 bg-white/10 rounded-full blur-3xl" />
        <div className="absolute -bottom-16 -right-16 w-56 h-56 bg-accent-300/20 rounded-full blur-3xl" />
      </motion.div>

      {/* LOADING */}
      {loading && (
        <div className="py-10">
          <Loader size="lg" text="Loading dashboard..." />
        </div>
      )}

      {/* ✅ GRID TEMPLATE: 3 COL (responsive) */}
      <motion.div
        variants={slideUp}
        className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-4 sm:gap-5"
      >
        <StatCard3D
          title="Students"
          value={totalStudents}
          icon={HiUsers}
          gradient="from-blue-500 to-blue-600"
          hint="Total registered students"
          to="/admin/students"
        />
        <StatCard3D
          title="Teachers"
          value={totalTeachers}
          icon={HiUsers}
          gradient="from-emerald-500 to-emerald-600"
          hint="Total registered teachers"
          to="/admin/teachers"
        />
        <StatCard3D
          title="Courses"
          value={dashboard.totalCourses}
          icon={HiAcademicCap}
          gradient="from-primary-500 to-primary-600"
          hint="All available courses"
          to="/admin/courses"
        />

        {/* These pages don't exist in your routes yet.
            Keep them non-clickable until you add /admin/assignments or /admin/submissions pages. */}
        <StatCard3D
          title="Assignments"
          value={dashboard.totalAssignments}
          icon={HiClipboardList}
          gradient="from-accent-500 to-accent-600"
          hint="Created assignments"
        />
        <StatCard3D
          title="Submissions"
          value={dashboard.totalSubmissions}
          icon={HiDocumentText}
          gradient="from-amber-500 to-amber-600"
          hint="Total submissions"
        />
      </motion.div>

      {/* ✅ MAIN SECTION: 3 COLUMN GRID ON LARGE */}
      <div className="grid grid-cols-1 lg:grid-cols-3 gap-6">
        {/* Column 1: Chart */}
        <motion.div variants={slideUp}>
          <Card
            title="Courses by Category"
            subtitle="Distribution from DB"
            className="shadow-[0_18px_35px_-20px_rgba(15,23,42,0.25)] hover:shadow-[0_28px_55px_-24px_rgba(99,102,241,0.22)] transition-all"
          >
            <div className="flex items-center gap-2 text-sm text-dark-500 mb-3">
              <HiChartPie className="w-4 h-4 text-primary-600" />
              <span>Categories summary</span>
            </div>

            <div className="w-full min-w-0 h-72 sm:h-80">
              {categoryData.length === 0 ? (
                <div className="h-full flex items-center justify-center text-dark-500">
                  No course data available
                </div>
              ) : (
                <ResponsiveContainer width="100%" height="100%" minWidth={0} minHeight={0}>
                  <PieChart>
                    <Pie
                      data={categoryData}
                      dataKey="value"
                      nameKey="name"
                      innerRadius={65}
                      outerRadius={105}
                      paddingAngle={4}
                    >
                      {categoryData.map((_, index) => (
                        <Cell key={index} fill={pieColors[index % pieColors.length]} />
                      ))}
                    </Pie>
                    <Tooltip />
                  </PieChart>
                </ResponsiveContainer>
              )}
            </div>
          </Card>
        </motion.div>

        {/* Column 2: Recent Courses */}
        <motion.div variants={slideUp}>
          <Card
            title="Recent Courses"
            subtitle="Latest added"
            className="shadow-[0_18px_35px_-20px_rgba(15,23,42,0.25)] hover:shadow-[0_28px_55px_-24px_rgba(99,102,241,0.22)] transition-all"
            headerAction={
              <Button variant="ghost" size="sm" onClick={() => navigate("/admin/courses")}>
                View all
              </Button>
            }
          >
            <div className="space-y-3">
              {recentCourses.length === 0 ? (
                <p className="text-dark-500">No courses available.</p>
              ) : (
                recentCourses.map((course) => (
                  <button
                    key={course._id}
                    type="button"
                    onClick={() => navigate("/admin/courses")}
                    className="w-full text-left p-4 rounded-xl border border-dark-100 bg-white hover:bg-primary-50/40 transition-colors"
                  >
                    <div className="flex items-start justify-between gap-4">
                      <div className="min-w-0">
                        <p className="font-semibold text-dark-900 truncate">{course.title}</p>
                        <p className="text-sm text-dark-500 mt-1 truncate">
                          Teacher:{" "}
                          <span className="font-medium text-dark-700">
                            {course.teacher?.name || "Not Assigned"}
                          </span>
                        </p>
                        <p className="text-xs text-dark-400 mt-1">
                          {course.createdAt ? formatDate(course.createdAt) : "—"}
                        </p>
                      </div>
                      <span className="badge badge-info capitalize shrink-0">
                        {course.status || "unknown"}
                      </span>
                    </div>
                  </button>
                ))
              )}
            </div>
          </Card>
        </motion.div>

        {/* Column 3: Recent Assignments */}
        <motion.div variants={slideUp}>
          <Card
            title="Recent Assignments"
            subtitle="Latest created"
            className="shadow-[0_18px_35px_-20px_rgba(15,23,42,0.25)] hover:shadow-[0_28px_55px_-24px_rgba(99,102,241,0.22)] transition-all"
          >
            <div className="space-y-3">
              {recentAssignments.length === 0 ? (
                <p className="text-dark-500">No assignments available.</p>
              ) : (
                recentAssignments.map((a) => (
                  <div
                    key={a._id}
                    className="p-4 rounded-xl border border-dark-100 bg-white hover:bg-accent-50/30 transition-colors"
                  >
                    <div className="flex items-start justify-between gap-4">
                      <div className="min-w-0">
                        <p className="font-semibold text-dark-900 truncate">{a.title}</p>
                        <p className="text-sm text-dark-500 mt-1 truncate">
                          Teacher:{" "}
                          <span className="font-medium text-dark-700">
                            {a.teacher?.name || "Unknown"}
                          </span>
                        </p>
                        <p className="text-xs text-dark-400 mt-1">
                          {a.createdAt ? formatDate(a.createdAt) : "—"}
                        </p>
                      </div>

                      {a.dueDate ? (
                        <span className="badge badge-warning shrink-0">
                          Due: {formatDate(a.dueDate)}
                        </span>
                      ) : (
                        <span className="badge badge-secondary shrink-0">No Due</span>
                      )}
                    </div>

                    {a.description && (
                      <p className="text-sm text-dark-600 mt-2">
                        {truncateText(a.description, 110)}
                      </p>
                    )}
                  </div>
                ))
              )}
            </div>
          </Card>
        </motion.div>
      </div>
    </motion.div>
  );
};

export default AdminDashboard;