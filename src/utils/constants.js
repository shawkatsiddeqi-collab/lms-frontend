export const API_URL = import.meta.env.VITE_API_URL || 'http://localhost:5000';
export const APP_NAME = import.meta.env.VITE_APP_NAME || 'LMS System';

export const ROLES = {
  ADMIN: 'admin',
  TEACHER: 'teacher',
  STUDENT: 'student'
};

export const STATUS = {
  ACTIVE: 'active',
  INACTIVE: 'inactive',
  PENDING: 'pending'
};

export const ATTENDANCE_STATUS = {
  PRESENT: 'present',
  ABSENT: 'absent'
};

export const ROUTES = {
  HOME: '/',
  LOGIN: '/login',
  REGISTER: '/register',
  
  // Admin Routes
  ADMIN_DASHBOARD: '/admin/dashboard',
  ADMIN_STUDENTS: '/admin/students',
  ADMIN_TEACHERS: '/admin/teachers',
  ADMIN_COURSES: '/admin/courses',
  ADMIN_ATTENDANCE: '/admin/attendance',
  ADMIN_ANNOUNCEMENTS: '/admin/announcements',
  
  // Teacher Routes
  TEACHER_DASHBOARD: '/teacher/dashboard',
  TEACHER_COURSES: '/teacher/courses',
  TEACHER_ASSIGNMENTS: '/teacher/assignments',
  TEACHER_SUBMISSIONS: '/teacher/submissions',
  TEACHER_ATTENDANCE: '/teacher/attendance',
  TEACHER_ANNOUNCEMENTS: '/teacher/announcements',
  
  // Student Routes
  STUDENT_DASHBOARD: '/student/dashboard',
  STUDENT_COURSES: '/student/courses',
  STUDENT_ASSIGNMENTS: '/student/assignments',
  STUDENT_ATTENDANCE: '/student/attendance',
  STUDENT_ANNOUNCEMENTS: '/student/announcements',
};

export const SIDEBAR_ITEMS = {
  admin: [
    { name: 'Dashboard', path: ROUTES.ADMIN_DASHBOARD, icon: 'dashboard' },
    { name: 'Students', path: ROUTES.ADMIN_STUDENTS, icon: 'students' },
    { name: 'Teachers', path: ROUTES.ADMIN_TEACHERS, icon: 'teachers' },
    { name: 'Courses', path: ROUTES.ADMIN_COURSES, icon: 'courses' },
    { name: 'Attendance', path: ROUTES.ADMIN_ATTENDANCE, icon: 'attendance' },
    { name: 'Announcements', path: ROUTES.ADMIN_ANNOUNCEMENTS, icon: 'announcements' },
  ],
  teacher: [
    { name: 'Dashboard', path: ROUTES.TEACHER_DASHBOARD, icon: 'dashboard' },
    { name: 'My Courses', path: ROUTES.TEACHER_COURSES, icon: 'courses' },
    { name: 'Assignments', path: ROUTES.TEACHER_ASSIGNMENTS, icon: 'assignments' },
    { name: 'Submissions', path: ROUTES.TEACHER_SUBMISSIONS, icon: 'submissions' },
    { name: 'Attendance', path: ROUTES.TEACHER_ATTENDANCE, icon: 'attendance' },
    { name: 'Announcements', path: ROUTES.TEACHER_ANNOUNCEMENTS, icon: 'announcements' },
  ],
  student: [
    { name: 'Dashboard', path: ROUTES.STUDENT_DASHBOARD, icon: 'dashboard' },
    { name: 'My Courses', path: ROUTES.STUDENT_COURSES, icon: 'courses' },
    { name: 'Assignments', path: ROUTES.STUDENT_ASSIGNMENTS, icon: 'assignments' },
    { name: 'My Attendance', path: ROUTES.STUDENT_ATTENDANCE, icon: 'attendance' },
    { name: 'Announcements', path: ROUTES.STUDENT_ANNOUNCEMENTS, icon: 'announcements' },
  ],
};

// ============================================
// ANIMATION VARIANTS FOR FRAMER MOTION
// ============================================

export const pageTransition = {
  initial: { opacity: 0, y: 20 },
  animate: { opacity: 1, y: 0 },
  exit: { opacity: 0, y: -20 },
  transition: { duration: 0.3, ease: 'easeInOut' }
};

export const fadeIn = {
  initial: { opacity: 0 },
  animate: { opacity: 1 },
  exit: { opacity: 0 },
  transition: { duration: 0.2 }
};

export const slideUp = {
  initial: { opacity: 0, y: 30 },
  animate: { opacity: 1, y: 0 },
  transition: { duration: 0.4, ease: [0.22, 1, 0.36, 1] }
};

export const slideDown = {
  initial: { opacity: 0, y: -30 },
  animate: { opacity: 1, y: 0 },
  transition: { duration: 0.4, ease: [0.22, 1, 0.36, 1] }
};

export const slideLeft = {
  initial: { opacity: 0, x: 30 },
  animate: { opacity: 1, x: 0 },
  transition: { duration: 0.4, ease: [0.22, 1, 0.36, 1] }
};

export const slideRight = {
  initial: { opacity: 0, x: -30 },
  animate: { opacity: 1, x: 0 },
  transition: { duration: 0.4, ease: [0.22, 1, 0.36, 1] }
};

export const staggerContainer = {
  initial: {},
  animate: {
    transition: {
      staggerChildren: 0.1,
      delayChildren: 0.1
    }
  }
};

export const scaleIn = {
  initial: { opacity: 0, scale: 0.9 },
  animate: { opacity: 1, scale: 1 },
  transition: { duration: 0.3, ease: [0.22, 1, 0.36, 1] }
};

export const pop = {
  initial: { opacity: 0, scale: 0.5 },
  animate: { opacity: 1, scale: 1 },
  transition: { type: 'spring', stiffness: 300, damping: 20 }
};

export const hoverScale = {
  whileHover: { scale: 1.02 },
  whileTap: { scale: 0.98 }
};

export const cardVariant = {
  initial: { opacity: 0, y: 20 },
  animate: { opacity: 1, y: 0 },
  exit: { opacity: 0, y: 20 },
  transition: { duration: 0.3 }
};

export const listItem = {
  initial: { opacity: 0, x: -20 },
  animate: { opacity: 1, x: 0 },
  exit: { opacity: 0, x: 20 }
};

export const modalVariant = {
  initial: { opacity: 0, scale: 0.95, y: 20 },
  animate: { opacity: 1, scale: 1, y: 0 },
  exit: { opacity: 0, scale: 0.95, y: 20 },
  transition: { type: 'spring', duration: 0.3 }
};

export const backdropVariant = {
  initial: { opacity: 0 },
  animate: { opacity: 1 },
  exit: { opacity: 0 },
  transition: { duration: 0.2 }
};