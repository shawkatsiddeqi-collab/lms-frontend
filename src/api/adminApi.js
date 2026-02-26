// src/api/adminApi.js
import api from "./axiosInstance";

export const adminApi = {
  // Dashboard
  getDashboard: () => api.get("/admin/dashboard"),

  // Students
  getStudents: () => api.get("/admin/students"),
  addStudent: (data) => api.post("/admin/add-student", data),

  // Teachers
  getTeachers: () => api.get("/admin/teachers"),
  addTeacher: (data) => api.post("/admin/add-teacher", data),

  // Common update/delete user
  updateUser: (id, data) => api.patch(`/admin/update-user/${id}`, data),
  deleteUser: (id) => api.delete(`/admin/delete-user/${id}`),

  // Courses
  getCourses: () => api.get("/admin/courses"),
  createCourse: (data) => api.post("/admin/courses", data),
  updateCourse: (id, data) => api.put(`/admin/courses/${id}`, data),
  deleteCourse: (id) => api.delete(`/admin/courses/${id}`),

  // Attendance
  markAttendance: (data) => api.post("/admin/attendance", data),
  getAttendanceReport: (courseId) =>
    api.get("/admin/attendance-report", { params: { courseId } }),

  // Announcements
  getAnnouncements: () => api.get("/admin/announcements"),
  createAnnouncement: (data) => api.post("/admin/announcement", data),
  updateAnnouncement: (id, data) => api.put(`/admin/announcement/${id}`, data),
  deleteAnnouncement: (id) => api.delete(`/admin/announcement/${id}`),
};

export default adminApi;