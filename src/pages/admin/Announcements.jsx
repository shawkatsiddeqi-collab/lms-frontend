// src/pages/admin/Announcements.jsx
import React, { useEffect, useMemo, useState } from "react";
import { motion, AnimatePresence } from "framer-motion";
import {
  HiSpeakerphone,
  HiPlus,
  HiRefresh,
  HiSearch,
  HiTrash,
  HiPencil,
  HiEye,
  HiBell,
  HiUsers,
} from "react-icons/hi";

import Card from "../../components/common/Card";
import Button from "../../components/common/Button";
import Modal from "../../components/common/Modal";
import ConfirmDialog from "../../components/common/ConfirmDialog";
import Input from "../../components/common/Input";
import Loader from "../../components/common/Loader";

import { useApi } from "../../hooks/useApi";
import announcementApi from "../../api/announcementApi";
import { staggerContainer, slideUp } from "../../utils/constants";
import { cn, truncateText, getRelativeTime } from "../../utils/helpers";

const Announcements = () => {
  const { loading, execute } = useApi();

  const [announcements, setAnnouncements] = useState([]);

  const [search, setSearch] = useState("");
  const [roleVisibility, setRoleVisibility] = useState("all");
  const [priority, setPriority] = useState("all");

  const [isModalOpen, setIsModalOpen] = useState(false);
  const [isViewOpen, setIsViewOpen] = useState(false);
  const [isDeleteOpen, setIsDeleteOpen] = useState(false);

  const [selected, setSelected] = useState(null);

  const [form, setForm] = useState({
    title: "",
    description: "",
    roleVisibility: "all",
    priority: "normal",
  });

  const fetchAnnouncements = async () => {
    await execute(() => announcementApi.getAll(), {
      showSuccessToast: false,
      onSuccess: (data) => {
        const list = Array.isArray(data) ? data : data?.data;
        setAnnouncements(Array.isArray(list) ? list : []);
      },
    });
  };

  useEffect(() => {
    fetchAnnouncements();
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, []);

  const filteredAnnouncements = useMemo(() => {
    return announcements.filter((a) => {
      const matchesSearch =
        (a.title || "").toLowerCase().includes(search.toLowerCase()) ||
        (a.description || "").toLowerCase().includes(search.toLowerCase());

      const matchesRole = roleVisibility === "all" || a.roleVisibility === roleVisibility;
      const matchesPriority = priority === "all" || a.priority === priority;

      return matchesSearch && matchesRole && matchesPriority;
    });
  }, [announcements, search, roleVisibility, priority]);

  const stats = useMemo(() => {
    const total = announcements.length;
    const urgentHigh = announcements.filter((a) => ["urgent", "high"].includes(a.priority)).length;
    const forStudents = announcements.filter((a) => a.roleVisibility === "student").length;
    const forTeachers = announcements.filter((a) => a.roleVisibility === "teacher").length;
    return { total, urgentHigh, forStudents, forTeachers };
  }, [announcements]);

  const resetForm = () => {
    setForm({ title: "", description: "", roleVisibility: "all", priority: "normal" });
    setSelected(null);
  };

  const openCreate = () => {
    resetForm();
    setIsModalOpen(true);
  };

  const openEdit = (a) => {
    setSelected(a);
    setForm({
      title: a.title || "",
      description: a.description || "",
      roleVisibility: a.roleVisibility || "all",
      priority: a.priority || "normal",
    });
    setIsModalOpen(true);
  };

  const openView = (a) => {
    setSelected(a);
    setIsViewOpen(true);
  };

  const priorityBadge = (p) => {
    if (p === "urgent") return "badge-danger";
    if (p === "high") return "badge-warning";
    if (p === "low") return "badge-secondary";
    return "badge-info";
  };

  const handleSave = async (e) => {
    e.preventDefault();

    const payload = {
      title: form.title.trim(),
      description: form.description.trim(),
      roleVisibility: form.roleVisibility,
      priority: form.priority,
    };

    if (!payload.title || !payload.description) return;

    if (selected?._id) {
      await execute(() => announcementApi.update(selected._id, payload), {
        showSuccessToast: true,
        successMessage: "Announcement updated!",
        onSuccess: () => {
          setIsModalOpen(false);
          resetForm();
          fetchAnnouncements();
        },
      });
    } else {
      await execute(() => announcementApi.create(payload), {
        showSuccessToast: true,
        successMessage: "Announcement created!",
        onSuccess: () => {
          setIsModalOpen(false);
          resetForm();
          fetchAnnouncements();
        },
      });
    }
  };

  const handleDelete = async () => {
    if (!selected?._id) return;

    await execute(() => announcementApi.remove(selected._id), {
      showSuccessToast: true,
      successMessage: "Announcement deleted!",
      onSuccess: () => {
        setIsDeleteOpen(false);
        setSelected(null);
        fetchAnnouncements();
      },
    });
  };

  const StatCard3D = ({ title, value, icon: Icon, gradient, hint }) => (
    <motion.div
      whileHover={{ y: -6 }}
      transition={{ type: "spring", stiffness: 280, damping: 18 }}
      className={cn(
        "relative overflow-hidden rounded-2xl border border-dark-100 bg-white",
        "shadow-[0_18px_35px_-18px_rgba(15,23,42,0.25)]",
        "hover:shadow-[0_28px_55px_-22px_rgba(99,102,241,0.28)] transition-all"
      )}
    >
      <div className={cn("absolute -top-14 -right-14 w-44 h-44 rounded-full blur-3xl opacity-20 bg-gradient-to-br", gradient)} />
      <div className="p-5 sm:p-6 relative">
        <div className="flex items-start justify-between gap-4">
          <div className="min-w-0">
            <p className="text-sm font-medium text-dark-500">{title}</p>
            <p className="mt-2 text-3xl font-extrabold text-dark-900 tracking-tight truncate">{value}</p>
            {hint && <p className="mt-1 text-xs text-dark-400">{hint}</p>}
          </div>
          <div className={cn("shrink-0 p-4 rounded-2xl text-white shadow-lg bg-gradient-to-br", gradient)}>
            <Icon className="w-7 h-7" />
          </div>
        </div>
        <div className="mt-5 h-[1px] w-full bg-gradient-to-r from-transparent via-dark-200 to-transparent" />
      </div>
    </motion.div>
  );

  return (
    <motion.div initial="initial" animate="animate" variants={staggerContainer} className="space-y-6">
      <motion.div variants={slideUp} className="flex flex-col gap-4 lg:flex-row lg:items-center lg:justify-between">
        <div>
          <h1 className="text-2xl sm:text-3xl font-extrabold text-dark-900">Announcements</h1>
          <p className="text-dark-500 mt-1">Create and manage announcements from database</p>
        </div>

        <div className="flex flex-col sm:flex-row gap-3">
          <Button variant="ghost" icon={HiRefresh} onClick={fetchAnnouncements}>
            Refresh
          </Button>
          <Button icon={HiPlus} onClick={openCreate}>
            Create Announcement
          </Button>
        </div>
      </motion.div>

      <motion.div variants={slideUp} className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-4">
        <StatCard3D title="Total" value={stats.total} icon={HiSpeakerphone} gradient="from-primary-500 to-primary-600" hint="All announcements" />
        <StatCard3D title="Urgent/High" value={stats.urgentHigh} icon={HiBell} gradient="from-red-500 to-red-600" hint="Needs attention" />
        <StatCard3D title="Teachers Targeted" value={stats.forTeachers} icon={HiUsers} gradient="from-emerald-500 to-emerald-600" hint="Teacher announcements" />
      </motion.div>

      <motion.div variants={slideUp}>
        <Card padding={false} className="p-4">
          <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
            <div className="relative">
              <HiSearch className="absolute left-4 top-1/2 -translate-y-1/2 w-5 h-5 text-dark-400" />
              <input className="input pl-12" placeholder="Search..." value={search} onChange={(e) => setSearch(e.target.value)} />
            </div>

            <select className="input" value={roleVisibility} onChange={(e) => setRoleVisibility(e.target.value)}>
              <option value="all">All Audiences</option>
              <option value="student">Students</option>
              <option value="teacher">Teachers</option>
            </select>

            <select className="input" value={priority} onChange={(e) => setPriority(e.target.value)}>
              <option value="all">All Priorities</option>
              <option value="urgent">Urgent</option>
              <option value="high">High</option>
              <option value="normal">Normal</option>
              <option value="low">Low</option>
            </select>
          </div>
        </Card>
      </motion.div>

      <motion.div variants={slideUp}>
        <Card
          title="All Announcements"
          subtitle="Fetched from DB"
          className="shadow-[0_18px_35px_-20px_rgba(15,23,42,0.25)] hover:shadow-[0_28px_55px_-24px_rgba(99,102,241,0.22)] transition-all"
        >
          {loading ? (
            <div className="py-10">
              <Loader size="lg" text="Loading announcements..." />
            </div>
          ) : filteredAnnouncements.length === 0 ? (
            <div className="py-14 text-center text-dark-500">No announcements found.</div>
          ) : (
            <div className="grid grid-cols-1 lg:grid-cols-2 gap-4">
              <AnimatePresence mode="popLayout">
                {filteredAnnouncements.map((a) => (
                  <motion.div
                    key={a._id}
                    layout
                    initial={{ opacity: 0, y: 10 }}
                    animate={{ opacity: 1, y: 0 }}
                    exit={{ opacity: 0, y: -10 }}
                    className={cn(
                      "relative overflow-hidden rounded-2xl border border-dark-100 bg-white",
                      "shadow-[0_18px_35px_-18px_rgba(15,23,42,0.18)]",
                      "hover:shadow-[0_28px_55px_-24px_rgba(99,102,241,0.22)] transition-all"
                    )}
                  >
                    <div className="absolute -top-12 -right-12 w-40 h-40 rounded-full blur-3xl opacity-20 bg-gradient-to-br from-primary-500 to-accent-500" />
                    <div className="p-5 relative">
                      <div className="flex items-start justify-between gap-3">
                        <div className="min-w-0">
                          <div className="flex items-center gap-2 mb-2">
                            <span className={cn("badge capitalize", priorityBadge(a.priority))}>
                              {a.priority}
                            </span>
                            <span className="badge badge-info capitalize">
                              {a.roleVisibility === "all" ? "Everyone" : a.roleVisibility}
                            </span>
                          </div>

                          <h3 className="text-lg font-extrabold text-dark-900 truncate">{a.title}</h3>

                          <p className="mt-2 text-sm text-dark-600">
                            {truncateText(a.description, 140)}
                          </p>

                          <p className="mt-3 text-xs text-dark-400">
                            {getRelativeTime(a.createdAt)} • By {a.createdBy?.name || "Admin"}
                          </p>
                        </div>

                        <div className="flex gap-2 shrink-0">
                          <button
                            onClick={() => openView(a)}
                            className="p-2 rounded-xl border border-dark-100 text-dark-600 hover:text-blue-600 hover:bg-blue-50 transition-colors"
                            title="View"
                          >
                            <HiEye className="w-4 h-4" />
                          </button>
                          <button
                            onClick={() => openEdit(a)}
                            className="p-2 rounded-xl border border-dark-100 text-dark-600 hover:text-primary-600 hover:bg-primary-50 transition-colors"
                            title="Edit"
                          >
                            <HiPencil className="w-4 h-4" />
                          </button>
                          <button
                            onClick={() => {
                              setSelected(a);
                              setIsDeleteOpen(true);
                            }}
                            className="p-2 rounded-xl border border-dark-100 text-dark-600 hover:text-red-600 hover:bg-red-50 transition-colors"
                            title="Delete"
                          >
                            <HiTrash className="w-4 h-4" />
                          </button>
                        </div>
                      </div>
                    </div>
                  </motion.div>
                ))}
              </AnimatePresence>
            </div>
          )}
        </Card>
      </motion.div>

      {/* Create/Edit */}
      <Modal
        isOpen={isModalOpen}
        onClose={() => {
          setIsModalOpen(false);
          resetForm();
        }}
        title={selected ? "Edit Announcement" : "Create Announcement"}
        description="Write a message for users"
        size="lg"
      >
        <form onSubmit={handleSave} className="space-y-4">
          <Input
            label="Title"
            value={form.title}
            onChange={(e) => setForm((p) => ({ ...p, title: e.target.value }))}
            placeholder="Enter title..."
            required
          />

          <div>
            <label className="block text-sm font-semibold text-dark-700 mb-2">
              Description
            </label>
            <textarea
              className="input"
              rows={5}
              value={form.description}
              onChange={(e) => setForm((p) => ({ ...p, description: e.target.value }))}
              placeholder="Write announcement..."
              required
            />
          </div>

          <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
            <div>
              <label className="block text-sm font-semibold text-dark-700 mb-2">Audience</label>
              <select
                className="input"
                value={form.roleVisibility}
                onChange={(e) => setForm((p) => ({ ...p, roleVisibility: e.target.value }))}
              >
                <option value="all">Everyone</option>
                <option value="student">Students</option>
                <option value="teacher">Teachers</option>
              </select>
            </div>

            <div>
              <label className="block text-sm font-semibold text-dark-700 mb-2">Priority</label>
              <select
                className="input"
                value={form.priority}
                onChange={(e) => setForm((p) => ({ ...p, priority: e.target.value }))}
              >
                <option value="low">Low</option>
                <option value="normal">Normal</option>
                <option value="high">High</option>
                <option value="urgent">Urgent</option>
              </select>
            </div>
          </div>

          <div className="flex justify-end gap-3 pt-4 border-t border-dark-100">
            <Button type="button" variant="ghost" onClick={() => setIsModalOpen(false)}>
              Cancel
            </Button>
            <Button type="submit" loading={loading}>
              {selected ? "Update" : "Create"}
            </Button>
          </div>
        </form>
      </Modal>

      {/* View */}
      <Modal isOpen={isViewOpen} onClose={() => setIsViewOpen(false)} title={selected?.title || "Announcement"} size="lg">
        {selected && (
          <div className="space-y-4">
            <div className="flex flex-wrap gap-2">
              <span className={cn("badge capitalize", priorityBadge(selected.priority))}>{selected.priority}</span>
              <span className="badge badge-info capitalize">
                {selected.roleVisibility === "all" ? "Everyone" : selected.roleVisibility}
              </span>
            </div>

            <p className="text-dark-700 whitespace-pre-wrap">{selected.description}</p>

            <div className="pt-4 border-t border-dark-100 text-sm text-dark-500">
              Created {getRelativeTime(selected.createdAt)} • By {selected.createdBy?.name || "Admin"}
            </div>

            <div className="flex justify-end">
              <Button variant="ghost" onClick={() => setIsViewOpen(false)}>Close</Button>
            </div>
          </div>
        )}
      </Modal>

      {/* Delete */}
      <ConfirmDialog
        isOpen={isDeleteOpen}
        onClose={() => setIsDeleteOpen(false)}
        onConfirm={handleDelete}
        title="Delete Announcement"
        message={`Are you sure you want to delete "${selected?.title}"?`}
        confirmText="Delete"
        loading={loading}
      />
    </motion.div>
  );
};

export default Announcements;