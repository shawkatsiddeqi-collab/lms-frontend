import React, { Suspense, lazy } from 'react';
import { Routes, Route, Navigate } from 'react-router-dom';
import { PageLoader } from '../components/common/Loader';
import ProtectedRoute from '../components/auth/ProtectedRoute';
import { ROLES } from '../utils/constants';

// Layouts
import AuthLayout from '../layouts/AuthLayout';
import AdminLayout from '../layouts/AdminLayout';
import TeacherLayout from '../layouts/TeacherLayout';
import StudentLayout from '../layouts/StudentLayout';

// Auth Components
import LoginForm from '../components/auth/LoginForm';
import RegisterForm from '../components/auth/RegisterForm';

// Lazy load pages for better performance
const Home = lazy(() => import('../pages/Home'));
const NotFound = lazy(() => import('../pages/NotFound'));

// Admin Pages
const AdminDashboard = lazy(() => import('../pages/admin/Dashboard'));
const AdminStudents = lazy(() => import('../pages/admin/Students'));
const AdminTeachers = lazy(() => import('../pages/admin/Teachers'));
const AdminCourses = lazy(() => import('../pages/admin/Courses'));
const AdminAttendance = lazy(() => import('../pages/admin/Attendance'));
const AdminAnnouncements = lazy(() => import('../pages/admin/Announcements'));

// Teacher Pages
const TeacherDashboard = lazy(() => import('../pages/teacher/Dashboard'));
const TeacherCourses = lazy(() => import('../pages/teacher/MyCourses'));
const TeacherAssignments = lazy(() => import('../pages/teacher/Assignments'));
const TeacherSubmissions = lazy(() => import('../pages/teacher/Submissions'));
const TeacherAttendance = lazy(() => import('../pages/teacher/Attendance'));
const TeacherAnnouncements = lazy(() => import('../pages/teacher/Announcements'));

// Student Pages
const StudentDashboard = lazy(() => import('../pages/student/Dashboard'));
const StudentCourses = lazy(() => import('../pages/student/MyCourses'));
const StudentCourseDetail = lazy(() => import('../pages/student/CourseDetail'));
const StudentAssignments = lazy(() => import('../pages/student/Assignments'));
const StudentAttendance = lazy(() => import('../pages/student/MyAttendance'));
const StudentAnnouncements = lazy(() => import('../pages/student/Announcements'));

const AppRoutes = () => {
  return (
    <Suspense fallback={<PageLoader />}>
      <Routes>
        {/* Public Routes */}
        <Route path="/" element={<Home />} />
        
        {/* Auth Routes */}
        <Route element={<AuthLayout />}>
          <Route path="/login" element={<LoginForm />} />
          <Route path="/register" element={<RegisterForm />} />
        </Route>

        {/* Admin Routes */}
        <Route
          path="/admin"
          element={
            <ProtectedRoute allowedRoles={[ROLES.ADMIN]}>
              <AdminLayout />
            </ProtectedRoute>
          }
        >
          <Route index element={<Navigate to="dashboard" replace />} />
          <Route path="dashboard" element={<AdminDashboard />} />
          <Route path="students" element={<AdminStudents />} />
          <Route path="teachers" element={<AdminTeachers />} />
          <Route path="courses" element={<AdminCourses />} />
          <Route path="attendance" element={<AdminAttendance />} />
          <Route path="announcements" element={<AdminAnnouncements />} />
        </Route>

        {/* Teacher Routes */}
        <Route
          path="/teacher"
          element={
            <ProtectedRoute allowedRoles={[ROLES.TEACHER]}>
              <TeacherLayout />
            </ProtectedRoute>
          }
        >
          <Route index element={<Navigate to="dashboard" replace />} />
          <Route path="dashboard" element={<TeacherDashboard />} />
          <Route path="courses" element={<TeacherCourses />} />
          <Route path="assignments" element={<TeacherAssignments />} />
          <Route path="submissions" element={<TeacherSubmissions />} />
          <Route path="attendance" element={<TeacherAttendance />} />
          <Route path="announcements" element={<TeacherAnnouncements />} />
        </Route>

        {/* Student Routes */}
        <Route
          path="/student"
          element={
            <ProtectedRoute allowedRoles={[ROLES.STUDENT]}>
              <StudentLayout />
            </ProtectedRoute>
          }
        >
          <Route index element={<Navigate to="dashboard" replace />} />
          <Route path="dashboard" element={<StudentDashboard />} />
          <Route path="courses" element={<StudentCourses />} />
          <Route path="courses/:courseId" element={<StudentCourseDetail />} /> {/* <-- add this */}
          <Route path="assignments" element={<StudentAssignments />} />
          <Route path="attendance" element={<StudentAttendance />} />
          <Route path="announcements" element={<StudentAnnouncements />} />
        </Route>

        {/* 404 Page */}
        <Route path="*" element={<NotFound />} />
      </Routes>
    </Suspense>
  );
};

export default AppRoutes;