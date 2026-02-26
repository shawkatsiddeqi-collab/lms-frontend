// src/api/teacherApi.js
import api from './axiosInstance';

export const teacherApi = {
  // ============ Dashboard ============
  getDashboard: async () => {
    try {
      const [dashboardRes, assignmentsRes, announcementsRes] = await Promise.allSettled([
        api.get('/teacher/dashboard'),
        api.get('/assignments'),
        api.get('/announcements'),
      ]);

      const dashboardData = dashboardRes.status === 'fulfilled' ? dashboardRes.value.data : {};
      const assignments = assignmentsRes.status === 'fulfilled' ? (assignmentsRes.value.data || []) : [];
      const announcements = announcementsRes.status === 'fulfilled' ? (announcementsRes.value.data || []) : [];

      return {
        courses: dashboardData.courses || [],
        totalCourses: dashboardData.totalCourses || 0,
        assignments: Array.isArray(assignments) ? assignments : [],
        announcements: Array.isArray(announcements) ? announcements : [],
      };
    } catch (error) {
      console.error('getDashboard error:', error);
      return { courses: [], totalCourses: 0, assignments: [], announcements: [] };
    }
  },

  // ============ Courses ============
  getCourses: () => api.get('/teacher/dashboard'),
  getCourse: (id) => api.get(`/courses/${id}`),
  createCourse: (data) => api.post('/teacher/create-course', data),
  updateCourse: (id, data) => api.put(`/teacher/course/${id}`, data),
  deleteCourse: (id) => api.delete(`/teacher/course/${id}`),
  
  // ============ Lectures ============
  uploadLecture: (courseId, formData) => 
    api.post(`/teacher/upload-lecture/${courseId}`, formData, {
      headers: { 'Content-Type': 'multipart/form-data' },
    }),
  
  // ============ Assignments ============
  getAssignments: () => api.get('/assignments'),
  getAssignment: (id) => api.get(`/assignments/${id}`),
  createAssignment: (data) => api.post('/teacher/create-assignment', data),
  updateAssignment: (id, data) => api.put(`/teacher/update-assignment/${id}`, data),
  deleteAssignment: (id) => api.delete(`/teacher/delete-assignment/${id}`),
  
  // ============ Submissions & Grading ============
  getSubmissions: (assignmentId) => api.get(`/assignments/submissions/${assignmentId}`),
  assignGrade: (data) => api.post('/teacher/assign-grade', data),
  updateGrade: (id, data) => api.put(`/teacher/update-grade/${id}`, data),
  deleteGrade: (id) => api.delete(`/teacher/delete-grade/${id}`),
  
  // ============ Attendance ============
  getAttendance: (courseId) => api.get(`/teacher/attendance/${courseId}`),
  getMyAttendance: () => api.get('/teacher/attendance'),
  markAttendance: (courseId, data) => api.post(`/teacher/attendance/${courseId}`, data),
  
  // ============ Enrollment ============
  approveEnrollment: (enrollmentId) => api.put(`/teacher/approve-enrollment/${enrollmentId}`),
  
  // ============ Announcements ============
  getAnnouncements: () => api.get("/teacher/announcements"),
};

export default teacherApi;