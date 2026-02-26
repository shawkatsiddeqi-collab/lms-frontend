// src/pages/admin/Courses.jsx
import React, { useEffect, useMemo, useState } from "react";
import { motion } from "framer-motion";
import {
  HiAcademicCap,
  HiPlus,
  HiRefresh,
  HiSearch,
  HiPencil,
  HiTrash,
  HiUsers,
  HiClock,
  HiTag,
  HiClipboardList, // ✅ FIXED: added missing import
} from "react-icons/hi";

import Card from "../../components/common/Card";
import Button from "../../components/common/Button";
import Input from "../../components/common/Input";
import Modal from "../../components/common/Modal";
import ConfirmDialog from "../../components/common/ConfirmDialog";
import Loader from "../../components/common/Loader";

import { adminApi } from "../../api/adminApi";
import { useApi } from "../../hooks/useApi";
import { cn, formatDate, truncateText } from "../../utils/helpers";
import { staggerContainer, slideUp } from "../../utils/constants";

const Courses = () => {
  const { loading, execute } = useApi();

  const [courses, setCourses] = useState([]);
  const [teachers, setTeachers] = useState([]);

  const [search, setSearch] = useState("");
  const [category, setCategory] = useState("all");

  const [isModalOpen, setIsModalOpen] = useState(false);
  const [isDeleteOpen, setIsDeleteOpen] = useState(false);
  const [selectedCourse, setSelectedCourse] = useState(null);

  const [formData, setFormData] = useState({
    title: "",
    description: "",
    category: "",
    duration: "",
    teacher: "", // teacherId
    status: "approved",
  });

  const fetchCourses = async () => {
    await execute(() => adminApi.getCourses(), {
      showSuccessToast: false,
      onSuccess: (data) => {
        const list = Array.isArray(data) ? data : data?.data;
        setCourses(Array.isArray(list) ? list : []);
      },
    });
  };

  const fetchTeachers = async () => {
    await execute(() => adminApi.getTeachers(), {
      showSuccessToast: false,
      onSuccess: (data) => {
        const list = Array.isArray(data) ? data : data?.data;
        setTeachers(Array.isArray(list) ? list : []);
      },
    });
  };

  useEffect(() => {
    fetchCourses();
    fetchTeachers();
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, []);

  const resetForm = () => {
    setFormData({
      title: "",
      description: "",
      category: "",
      duration: "",
      teacher: "",
      status: "approved",
    });
    setSelectedCourse(null);
  };

  const openCreate = () => {
    resetForm();
    setIsModalOpen(true);
  };

  const openEdit = (course) => {
    setSelectedCourse(course);
    setFormData({
      title: course?.title || "",
      description: course?.description || "",
      category: course?.category || "",
      duration: course?.duration || "",
      teacher: course?.teacher?._id || course?.teacher || "",
      status: course?.status || "approved",
    });
    setIsModalOpen(true);
  };

  const handleSubmit = async (e) => {
    e.preventDefault();

    const payload = {
      title: formData.title,
      description: formData.description,
      category: formData.category,
      duration: formData.duration,
      teacher: formData.teacher || null,
      status: formData.status || "approved",
    };

    if (selectedCourse?._id) {
      await execute(() => adminApi.updateCourse(selectedCourse._id, payload), {
        showSuccessToast: true,
        successMessage: "Course updated successfully!",
        onSuccess: () => {
          setIsModalOpen(false);
          resetForm();
          fetchCourses();
        },
      });
    } else {
      await execute(() => adminApi.createCourse(payload), {
        showSuccessToast: true,
        successMessage: "Course created successfully!",
        onSuccess: () => {
          setIsModalOpen(false);
          resetForm();
          fetchCourses();
        },
      });
    }
  };

  const handleDelete = async () => {
    if (!selectedCourse?._id) return;

    await execute(() => adminApi.deleteCourse(selectedCourse._id), {
      showSuccessToast: true,
      successMessage: "Course deleted successfully!",
      onSuccess: () => {
        setIsDeleteOpen(false);
        setSelectedCourse(null);
        fetchCourses();
      },
    });
  };

  const categories = useMemo(() => {
    const set = new Set();
    for (const c of courses) set.add(c.category || "Uncategorized");
    return ["all", ...Array.from(set)];
  }, [courses]);

  const filteredCourses = useMemo(() => {
    return courses.filter((c) => {
      const t = (c.title || "").toLowerCase();
      const d = (c.description || "").toLowerCase();
      const cat = c.category || "Uncategorized";

      const matchesSearch =
        t.includes(search.toLowerCase()) || d.includes(search.toLowerCase());

      const matchesCategory = category === "all" || cat === category;

      return matchesSearch && matchesCategory;
    });
  }, [courses, search, category]);

  const stats = useMemo(() => {
    const total = courses.length;
    const approved = courses.filter(
      (c) => (c.status || "").toLowerCase() === "approved"
    ).length;
    const uniqueCategories = new Set(
      courses.map((c) => c.category || "Uncategorized")
    ).size;
    return { total, approved, uniqueCategories };
  }, [courses]);

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
      </div>
    </motion.div>
  );

  const CourseCard = ({ course }) => {
    const teacherName = course?.teacher?.name || "Not Assigned";
    const courseCategory = course?.category || "Uncategorized";

    return (
      <motion.div
        whileHover={{ y: -6 }}
        transition={{ type: "spring", stiffness: 280, damping: 18 }}
        className={cn(
          "relative overflow-hidden rounded-2xl border border-dark-100 bg-white",
          "shadow-[0_18px_35px_-18px_rgba(15,23,42,0.25)]",
          "hover:shadow-[0_28px_55px_-22px_rgba(99,102,241,0.28)] transition-all"
        )}
      >
        <div className="absolute -top-14 -right-14 w-44 h-44 rounded-full blur-3xl opacity-20 bg-gradient-to-br from-primary-500 to-accent-500" />

        <div className="p-6 relative">
          <div className="flex items-start justify-between gap-4">
            <div className="min-w-0">
              <div className="flex items-center gap-2">
                <div className="p-2 rounded-xl bg-gradient-to-br from-primary-500 to-accent-500 text-white shadow-lg">
                  <HiAcademicCap className="w-5 h-5" />
                </div>
                <span className="badge badge-info capitalize">
                  {course?.status || "approved"}
                </span>
              </div>

              <h3 className="mt-3 text-lg font-extrabold text-dark-900 truncate">
                {course?.title || "Untitled"}
              </h3>

              <p className="mt-2 text-sm text-dark-600">
                {truncateText(course?.description || "No description", 100)}
              </p>
            </div>

            <div className="flex gap-2 shrink-0">
              <button
                onClick={() => openEdit(course)}
                className="p-2 rounded-xl border border-dark-100 text-dark-600 hover:text-primary-600 hover:bg-primary-50 transition-colors"
                title="Edit"
              >
                <HiPencil className="w-4 h-4" />
              </button>
              <button
                onClick={() => {
                  setSelectedCourse(course);
                  setIsDeleteOpen(true);
                }}
                className="p-2 rounded-xl border border-dark-100 text-dark-600 hover:text-red-600 hover:bg-red-50 transition-colors"
                title="Delete"
              >
                <HiTrash className="w-4 h-4" />
              </button>
            </div>
          </div>

          <div className="mt-5 grid grid-cols-1 sm:grid-cols-2 gap-3">
            <div className="p-3 rounded-xl bg-dark-50 border border-dark-100">
              <div className="flex items-center gap-2 text-xs font-semibold text-dark-500">
                <HiUsers className="w-4 h-4 text-primary-600" />
                Teacher
              </div>
              <p className="mt-1 text-sm font-semibold text-dark-900 truncate">
                {teacherName}
              </p>
            </div>

            <div className="p-3 rounded-xl bg-dark-50 border border-dark-100">
              <div className="flex items-center gap-2 text-xs font-semibold text-dark-500">
                <HiTag className="w-4 h-4 text-accent-600" />
                Category
              </div>
              <p className="mt-1 text-sm font-semibold text-dark-900 truncate">
                {courseCategory}
              </p>
            </div>

            <div className="p-3 rounded-xl bg-dark-50 border border-dark-100">
              <div className="flex items-center gap-2 text-xs font-semibold text-dark-500">
                <HiClock className="w-4 h-4 text-amber-600" />
                Duration
              </div>
              <p className="mt-1 text-sm font-semibold text-dark-900 truncate">
                {course?.duration || "N/A"}
              </p>
            </div>

            <div className="p-3 rounded-xl bg-dark-50 border border-dark-100">
              <div className="text-xs font-semibold text-dark-500">Created</div>
              <p className="mt-1 text-sm font-semibold text-dark-900 truncate">
                {course?.createdAt ? formatDate(course.createdAt) : "—"}
              </p>
            </div>
          </div>
        </div>
      </motion.div>
    );
  };

  return (
    <motion.div initial="initial" animate="animate" variants={staggerContainer} className="space-y-6">
      <motion.div variants={slideUp} className="flex flex-col gap-4 lg:flex-row lg:items-center lg:justify-between">
        <div>
          <h1 className="text-2xl sm:text-3xl font-extrabold text-dark-900">Courses</h1>
          <p className="text-dark-500 mt-1">Manage all courses from database</p>
        </div>

        <div className="flex flex-col sm:flex-row gap-3">
          <Button variant="ghost" icon={HiRefresh} onClick={fetchCourses}>
            Refresh
          </Button>
          <Button icon={HiPlus} onClick={openCreate}>
            Create Course
          </Button>
        </div>
      </motion.div>

      <motion.div variants={slideUp} className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-4">
        <StatCard3D
          title="Total Courses"
          value={stats.total}
          icon={HiAcademicCap}
          gradient="from-primary-500 to-primary-600"
          hint="All courses in DB"
        />
        <StatCard3D
          title="Approved Courses"
          value={stats.approved}
          icon={HiClipboardList}
          gradient="from-emerald-500 to-emerald-600"
          hint="Approved status"
        />
        <StatCard3D
          title="Categories"
          value={stats.uniqueCategories}
          icon={HiTag}
          gradient="from-accent-500 to-accent-600"
          hint="Unique categories"
        />
      </motion.div>

      <motion.div variants={slideUp}>
        <Card padding={false} className="p-4">
          <div className="flex flex-col md:flex-row gap-4">
            <div className="flex-1">
              <div className="relative">
                <HiSearch className="absolute left-4 top-1/2 -translate-y-1/2 w-5 h-5 text-dark-400" />
                <input
                  type="text"
                  placeholder="Search courses..."
                  value={search}
                  onChange={(e) => setSearch(e.target.value)}
                  className="input pl-12"
                />
              </div>
            </div>

            <select
              value={category}
              onChange={(e) => setCategory(e.target.value)}
              className="input w-auto min-w-[200px]"
            >
              {categories.map((c) => (
                <option key={c} value={c}>
                  {c === "all" ? "All Categories" : c}
                </option>
              ))}
            </select>
          </div>
        </Card>
      </motion.div>

      <motion.div variants={slideUp}>
        {loading ? (
          <div className="py-10">
            <Loader size="lg" text="Loading courses..." />
          </div>
        ) : (
          <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-5">
            {filteredCourses.map((course) => (
              <CourseCard key={course._id} course={course} />
            ))}
          </div>
        )}

        {!loading && filteredCourses.length === 0 && (
          <div className="py-16 text-center text-dark-500">No courses found.</div>
        )}
      </motion.div>

      <Modal
        isOpen={isModalOpen}
        onClose={() => {
          setIsModalOpen(false);
          resetForm();
        }}
        title={selectedCourse ? "Edit Course" : "Create Course"}
        description="Manage course details"
        size="lg"
      >
        <form onSubmit={handleSubmit} className="space-y-4">
          <Input
            label="Course Title"
            name="title"
            value={formData.title}
            onChange={(e) => setFormData((p) => ({ ...p, title: e.target.value }))}
            placeholder="e.g., MERN Stack Masterclass"
            required
          />

          <div>
            <label className="block text-sm font-semibold text-dark-700 mb-2">
              Description
            </label>
            <textarea
              className="input"
              rows={4}
              value={formData.description}
              onChange={(e) => setFormData((p) => ({ ...p, description: e.target.value }))}
              placeholder="Course description..."
              required
            />
          </div>

          <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
            <Input
              label="Category"
              name="category"
              value={formData.category}
              onChange={(e) => setFormData((p) => ({ ...p, category: e.target.value }))}
              placeholder="e.g., Web Development"
              required
            />
            <Input
              label="Duration"
              name="duration"
              value={formData.duration}
              onChange={(e) => setFormData((p) => ({ ...p, duration: e.target.value }))}
              placeholder="e.g., 12 weeks"
              required
            />
          </div>

          <div>
            <label className="block text-sm font-semibold text-dark-700 mb-2">
              Assign Teacher (optional)
            </label>
            <select
              className="input"
              value={formData.teacher}
              onChange={(e) => setFormData((p) => ({ ...p, teacher: e.target.value }))}
            >
              <option value="">-- No teacher --</option>
              {teachers.map((t) => (
                <option key={t._id} value={t._id}>
                  {t.name} ({t.email})
                </option>
              ))}
            </select>
          </div>

          <div className="flex justify-end gap-3 pt-4 border-t border-dark-100">
            <Button
              type="button"
              variant="ghost"
              onClick={() => {
                setIsModalOpen(false);
                resetForm();
              }}
            >
              Cancel
            </Button>
            <Button type="submit" loading={loading}>
              {selectedCourse ? "Update Course" : "Create Course"}
            </Button>
          </div>
        </form>
      </Modal>

      <ConfirmDialog
        isOpen={isDeleteOpen}
        onClose={() => {
          setIsDeleteOpen(false);
          setSelectedCourse(null);
        }}
        onConfirm={handleDelete}
        title="Delete Course"
        message={`Are you sure you want to delete "${selectedCourse?.title}"? This action cannot be undone.`}
        confirmText="Delete"
        loading={loading}
      />
    </motion.div>
  );
};

export default Courses;