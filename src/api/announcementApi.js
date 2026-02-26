// src/api/announcementApi.js
import api from "./axiosInstance";

/**
 * Backend routes (your adminRoutes.js):
 * GET    /api/admin/announcements
 * POST   /api/admin/announcement
 * PUT    /api/admin/announcement/:id
 * DELETE /api/admin/announcement/:id
 */

const announcementApi = {
  // ✅ keep both names to prevent "getAdminAll is not a function"
  getAll: () => api.get("/admin/announcements"),
  getAdminAll: () => api.get("/admin/announcements"),

  create: (data) => api.post("/admin/announcement", data),
  update: (id, data) => api.put(`/admin/announcement/${id}`, data),
  remove: (id) => api.delete(`/admin/announcement/${id}`),
};

export default announcementApi;