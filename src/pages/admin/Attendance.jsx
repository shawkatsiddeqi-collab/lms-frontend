// src/pages/admin/Attendance.jsx
import React, { useEffect, useMemo, useState } from "react";
import { motion } from "framer-motion";
import {
  HiCalendar,
  HiCheckCircle,
  HiXCircle,
  HiUsers,
  HiRefresh,
  HiAcademicCap,
  HiClipboardList,
  HiSearch,
} from "react-icons/hi";

import Card from "../../components/common/Card";
import Button from "../../components/common/Button";
import Modal from "../../components/common/Modal";
import Loader from "../../components/common/Loader";
import Table from "../../components/common/Table";
import { useApi } from "../../hooks/useApi";
import { adminApi } from "../../api/adminApi";
import { staggerContainer, slideUp } from "../../utils/constants";
import { cn, formatDate, getInitials } from "../../utils/helpers";

const Attendance = () => {
  const { loading, execute } = useApi();

  const [courses, setCourses] = useState([]);
  const [students, setStudents] = useState([]);

  const [selectedCourseId, setSelectedCourseId] = useState("");
  const [records, setRecords] = useState([]);

  const [markForm, setMarkForm] = useState({
    userId: "",
    status: "present",
  });

  const [search, setSearch] = useState("");
  const [statusFilter, setStatusFilter] = useState("all");

  const [markModalOpen, setMarkModalOpen] = useState(false);

  const fetchCourses = async () => {
    await execute(() => adminApi.getCourses(), {
      showSuccessToast: false,
      onSuccess: (data) => {
        const list = Array.isArray(data) ? data : data?.data;
        setCourses(Array.isArray(list) ? list : []);
      },
    });
  };

  const fetchStudents = async () => {
    await execute(() => adminApi.getStudents(), {
      showSuccessToast: false,
      onSuccess: (data) => {
        const list = Array.isArray(data) ? data : data?.data;
        setStudents(Array.isArray(list) ? list : []);
      },
    });
  };

  const fetchReport = async (courseId) => {
    if (!courseId) {
      setRecords([]);
      return;
    }

    await execute(() => adminApi.getAttendanceReport(courseId), {
      showSuccessToast: false,
      onSuccess: (data) => {
        // backend returns: { records: [...] } OR { message, records: [] }
        const list = data?.records || data?.attendanceRecords || [];
        setRecords(Array.isArray(list) ? list : []);
      },
    });
  };

  useEffect(() => {
    fetchCourses();
    fetchStudents();
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, []);

  useEffect(() => {
    // load report whenever course changes
    fetchReport(selectedCourseId);
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [selectedCourseId]);

  const stats = useMemo(() => {
    const total = records.length;
    const present = records.filter((r) => (r.status || "").toLowerCase() === "present").length;
    const absent = records.filter((r) => (r.status || "").toLowerCase() === "absent").length;
    const rate = total > 0 ? Math.round((present / total) * 100) : 0;
    return { total, present, absent, rate };
  }, [records]);

  const filteredRecords = useMemo(() => {
    return records.filter((r) => {
      const studentName = (r.user?.name || "").toLowerCase();
      const studentEmail = (r.user?.email || "").toLowerCase();
      const matchesSearch =
        studentName.includes(search.toLowerCase()) ||
        studentEmail.includes(search.toLowerCase());

      const matchesStatus =
        statusFilter === "all" || (r.status || "").toLowerCase() === statusFilter;

      return matchesSearch && matchesStatus;
    });
  }, [records, search, statusFilter]);

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
      </div>
    </motion.div>
  );

  const handleMarkAttendance = async (e) => {
    e.preventDefault();
    if (!selectedCourseId) return;

    await execute(
      () =>
        adminApi.markAttendance({
          userId: markForm.userId,
          courseId: selectedCourseId,
          status: markForm.status,
        }),
      {
        showSuccessToast: true,
        successMessage: "Attendance marked successfully!",
        onSuccess: async () => {
          setMarkModalOpen(false);
          setMarkForm({ userId: "", status: "present" });
          await fetchReport(selectedCourseId);
        },
      }
    );
  };

  const columns = [
    {
      header: "Student",
      accessor: "user",
      render: (value, row) => (
        <div className="flex items-center gap-3">
          <div className="avatar avatar-md">
            {getInitials(row?.user?.name || row?.user?.email || "U")}
          </div>
          <div className="min-w-0">
            <p className="font-semibold text-dark-900 truncate">{row?.user?.name || "Unknown"}</p>
            <p className="text-sm text-dark-500 truncate">{row?.user?.email || "—"}</p>
          </div>
        </div>
      ),
    },
    {
      header: "Course",
      accessor: "course",
      render: (value, row) => (
        <span className="text-sm font-medium text-dark-700">
          {row?.course?.title || "—"}
        </span>
      ),
    },
    {
      header: "Status",
      accessor: "status",
      render: (value) => {
        const s = (value || "").toLowerCase();
        const badge =
          s === "present" ? "badge-success" : s === "absent" ? "badge-danger" : "badge-info";
        return <span className={cn("badge capitalize", badge)}>{value || "unknown"}</span>;
      },
    },
    {
      header: "Date",
      accessor: "date",
      render: (value, row) => formatDate(row?.date || row?.createdAt),
    },
    {
      header: "Marked By",
      accessor: "markedBy",
      render: (value) => (
        <span className="text-sm text-dark-600">
          {value ? "Admin" : "—"}
        </span>
      ),
    },
  ];

  return (
    <motion.div
      initial="initial"
      animate="animate"
      variants={staggerContainer}
      className="space-y-6"
    >
      {/* Header */}
      <motion.div variants={slideUp} className="flex flex-col gap-4 lg:flex-row lg:items-center lg:justify-between">
        <div>
          <h1 className="text-2xl sm:text-3xl font-extrabold text-dark-900">Attendance</h1>
          <p className="text-dark-500 mt-1">Mark and review attendance records from database</p>
        </div>

        <div className="flex flex-col sm:flex-row gap-3">
          <Button variant="ghost" icon={HiRefresh} onClick={() => fetchReport(selectedCourseId)}>
            Refresh
          </Button>
          <Button
            icon={HiClipboardList}
            onClick={() => setMarkModalOpen(true)}
            disabled={!selectedCourseId}
          >
            Mark Attendance
          </Button>
        </div>
      </motion.div>

      {/* Course selector */}
      <motion.div variants={slideUp}>
        <Card padding={false} className="p-4">
          <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
            <div>
              <label className="block text-sm font-semibold text-dark-700 mb-2">
                Select Course
              </label>
              <select
                className="input"
                value={selectedCourseId}
                onChange={(e) => setSelectedCourseId(e.target.value)}
              >
                <option value="">-- Choose a course --</option>
                {courses.map((c) => (
                  <option key={c._id} value={c._id}>
                    {c.title}
                  </option>
                ))}
              </select>
            </div>

            <div>
              <label className="block text-sm font-semibold text-dark-700 mb-2">
                Status Filter
              </label>
              <select
                className="input"
                value={statusFilter}
                onChange={(e) => setStatusFilter(e.target.value)}
                disabled={!selectedCourseId}
              >
                <option value="all">All</option>
                <option value="present">Present</option>
                <option value="absent">Absent</option>
              </select>
            </div>

            <div>
              <label className="block text-sm font-semibold text-dark-700 mb-2">
                Search Student
              </label>
              <div className="relative">
                <HiSearch className="absolute left-4 top-1/2 -translate-y-1/2 w-5 h-5 text-dark-400" />
                <input
                  className="input pl-12"
                  placeholder="Name or email..."
                  value={search}
                  onChange={(e) => setSearch(e.target.value)}
                  disabled={!selectedCourseId}
                />
              </div>
            </div>
          </div>
        </Card>
      </motion.div>

      {/* Stats */}
      <motion.div variants={slideUp} className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-4">
        <StatCard3D
          title="Total Records"
          value={stats.total}
          icon={HiUsers}
          gradient="from-primary-500 to-primary-600"
          hint="For selected course"
        />
        <StatCard3D
          title="Present"
          value={stats.present}
          icon={HiCheckCircle}
          gradient="from-emerald-500 to-emerald-600"
          hint="Marked present"
        />
        <StatCard3D
          title="Absent"
          value={stats.absent}
          icon={HiXCircle}
          gradient="from-red-500 to-red-600"
          hint="Marked absent"
        />
      </motion.div>

      {/* Table */}
      <motion.div variants={slideUp}>
        <Card
          title="Attendance Records"
          subtitle={selectedCourseId ? "Showing attendance report for selected course" : "Select a course to view records"}
          className="shadow-[0_18px_35px_-20px_rgba(15,23,42,0.25)] hover:shadow-[0_28px_55px_-24px_rgba(99,102,241,0.22)] transition-all"
        >
          {!selectedCourseId ? (
            <div className="py-14 text-center text-dark-500">
              Please select a course to view attendance report.
            </div>
          ) : (
            <Table
              columns={columns}
              data={filteredRecords}
              loading={loading}
              emptyMessage="No attendance records found for this course"
            />
          )}
        </Card>
      </motion.div>

      {/* Mark Attendance Modal */}
      <Modal
        isOpen={markModalOpen}
        onClose={() => setMarkModalOpen(false)}
        title="Mark Attendance"
        description="Select student and status"
        size="md"
      >
        <form onSubmit={handleMarkAttendance} className="space-y-4">
          <div className="p-4 rounded-xl bg-dark-50 border border-dark-100">
            <p className="text-sm text-dark-600">
              Course:{" "}
              <span className="font-semibold text-dark-900">
                {courses.find((c) => c._id === selectedCourseId)?.title || "—"}
              </span>
            </p>
          </div>

          <div>
            <label className="block text-sm font-semibold text-dark-700 mb-2">
              Student
            </label>
            <select
              className="input"
              value={markForm.userId}
              onChange={(e) => setMarkForm((p) => ({ ...p, userId: e.target.value }))}
              required
            >
              <option value="">-- Select student --</option>
              {students.map((s) => (
                <option key={s._id} value={s._id}>
                  {s.name} ({s.email})
                </option>
              ))}
            </select>
          </div>

          <div>
            <label className="block text-sm font-semibold text-dark-700 mb-2">
              Status
            </label>
            <div className="grid grid-cols-2 gap-3">
              <button
                type="button"
                onClick={() => setMarkForm((p) => ({ ...p, status: "present" }))}
                className={cn(
                  "p-3 rounded-xl border font-semibold transition-all",
                  markForm.status === "present"
                    ? "border-emerald-400 bg-emerald-50 text-emerald-700"
                    : "border-dark-200 bg-white text-dark-700 hover:bg-dark-50"
                )}
              >
                Present
              </button>
              <button
                type="button"
                onClick={() => setMarkForm((p) => ({ ...p, status: "absent" }))}
                className={cn(
                  "p-3 rounded-xl border font-semibold transition-all",
                  markForm.status === "absent"
                    ? "border-red-400 bg-red-50 text-red-700"
                    : "border-dark-200 bg-white text-dark-700 hover:bg-dark-50"
                )}
              >
                Absent
              </button>
            </div>
          </div>

          <div className="flex justify-end gap-3 pt-4 border-t border-dark-100">
            <Button type="button" variant="ghost" onClick={() => setMarkModalOpen(false)}>
              Cancel
            </Button>
            <Button type="submit" loading={loading} icon={HiCheckCircle}>
              Mark
            </Button>
          </div>
        </form>
      </Modal>
    </motion.div>
  );
};

export default Attendance;