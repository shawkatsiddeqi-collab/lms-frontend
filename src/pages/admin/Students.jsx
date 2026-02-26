// src/pages/admin/Students.jsx
import React, { useEffect, useMemo, useState } from "react";
import { motion } from "framer-motion";
import {
  HiPlus,
  HiSearch,
  HiPencil,
  HiTrash,
  HiPhone,
  HiUsers,
  HiRefresh,
} from "react-icons/hi";

import Card from "../../components/common/Card";
import Button from "../../components/common/Button";
import Input from "../../components/common/Input";
import Modal from "../../components/common/Modal";
import Table from "../../components/common/Table";
import ConfirmDialog from "../../components/common/ConfirmDialog";
import Pagination from "../../components/common/Pagination";

import { useApi } from "../../hooks/useApi";
import { adminApi } from "../../api/adminApi";
import { staggerContainer, slideUp } from "../../utils/constants";
import { cn, formatDate, getInitials, getStatusColor } from "../../utils/helpers";

const Students = () => {
  const { loading, execute } = useApi();

  const [students, setStudents] = useState([]);
  const [searchTerm, setSearchTerm] = useState("");
  const [filterStatus, setFilterStatus] = useState("all");

  const [isModalOpen, setIsModalOpen] = useState(false);
  const [isDeleteOpen, setIsDeleteOpen] = useState(false);
  const [selectedStudent, setSelectedStudent] = useState(null);

  const [currentPage, setCurrentPage] = useState(1);
  const pageSize = 10;

  // ✅ Correct status values from User.js enum
  const STATUS_OPTIONS = [
    { value: "approved", label: "Approved" },
    { value: "pending", label: "Pending" },
    { value: "rejected", label: "Rejected" },
  ];

  const [formData, setFormData] = useState({
    name: "",
    email: "",
    phone: "",
    password: "",
    status: "pending",
  });

  const fetchStudents = async () => {
    await execute(() => adminApi.getStudents(), {
      showSuccessToast: false,
      onSuccess: (data) => {
        const list = Array.isArray(data) ? data : data?.data;
        setStudents(Array.isArray(list) ? list : []);
      },
    });
  };

  useEffect(() => {
    fetchStudents();
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, []);

  const resetForm = () => {
    setFormData({
      name: "",
      email: "",
      phone: "",
      password: "",
      status: "pending",
    });
    setSelectedStudent(null);
  };

  const openCreateModal = () => {
    resetForm();
    setIsModalOpen(true);
  };

  const openEditModal = (student) => {
    setSelectedStudent(student);
    setFormData({
      name: student?.name || "",
      email: student?.email || "",
      phone: student?.phone || "",
      password: "",
      status: student?.status || "pending",
    });
    setIsModalOpen(true);
  };

  const handleSubmit = async (e) => {
    e.preventDefault();

    const payload = {
      name: formData.name,
      email: formData.email,
      phone: formData.phone,
      status: formData.status, // ✅ approved/pending/rejected
    };

    if (formData.password && formData.password.trim().length > 0) {
      payload.password = formData.password;
    }

    if (selectedStudent?._id) {
      await execute(() => adminApi.updateUser(selectedStudent._id, payload), {
        showSuccessToast: true,
        successMessage: "Student updated successfully!",
        onSuccess: () => {
          setIsModalOpen(false);
          resetForm();
          fetchStudents();
        },
      });
    } else {
      await execute(
        () =>
          adminApi.addStudent({
            name: formData.name,
            email: formData.email,
            phone: formData.phone,
            password: formData.password,
            status: formData.status,
          }),
        {
          showSuccessToast: true,
          successMessage: "Student added successfully!",
          onSuccess: () => {
            setIsModalOpen(false);
            resetForm();
            fetchStudents();
          },
        }
      );
    }
  };

  const handleDelete = async () => {
    if (!selectedStudent?._id) return;

    await execute(() => adminApi.deleteUser(selectedStudent._id), {
      showSuccessToast: true,
      successMessage: "Student deleted successfully!",
      onSuccess: () => {
        setIsDeleteOpen(false);
        setSelectedStudent(null);
        fetchStudents();
      },
    });
  };

  const filteredStudents = useMemo(() => {
    return students.filter((s) => {
      const name = (s.name || "").toLowerCase();
      const email = (s.email || "").toLowerCase();

      const matchesSearch =
        name.includes(searchTerm.toLowerCase()) ||
        email.includes(searchTerm.toLowerCase());

      const matchesStatus =
        filterStatus === "all" || (s.status || "pending") === filterStatus;

      return matchesSearch && matchesStatus;
    });
  }, [students, searchTerm, filterStatus]);

  const totalPages = Math.max(1, Math.ceil(filteredStudents.length / pageSize));
  const paginated = filteredStudents.slice(
    (currentPage - 1) * pageSize,
    currentPage * pageSize
  );

  const columns = [
    {
      header: "Student",
      accessor: "name",
      render: (_, row) => (
        <div className="flex items-center gap-3">
          <div className="avatar avatar-md">{getInitials(row.name || row.email)}</div>
          <div className="min-w-0">
            <p className="font-semibold text-dark-900 truncate">{row.name}</p>
            <p className="text-sm text-dark-500 truncate">{row.email}</p>
          </div>
        </div>
      ),
    },
    {
      header: "Phone",
      accessor: "phone",
      render: (value) => (
        <div className="flex items-center gap-2 text-dark-600">
          <HiPhone className="w-4 h-4" />
          {value || "N/A"}
        </div>
      ),
    },
    {
      header: "Status",
      accessor: "status",
      render: (value) => (
        <span className={cn("badge capitalize", getStatusColor(value || "pending"))}>
          {value || "pending"}
        </span>
      ),
    },
    {
      header: "Joined",
      accessor: "createdAt",
      render: (value) => formatDate(value),
    },
    {
      header: "Actions",
      accessor: "_id",
      render: (_, row) => (
        <div className="flex items-center gap-2">
          <motion.button
            whileHover={{ scale: 1.08 }}
            whileTap={{ scale: 0.95 }}
            onClick={() => openEditModal(row)}
            className="p-2 rounded-xl border border-dark-100 text-dark-600 hover:text-primary-600 hover:bg-primary-50 transition-colors"
          >
            <HiPencil className="w-4 h-4" />
          </motion.button>
          <motion.button
            whileHover={{ scale: 1.08 }}
            whileTap={{ scale: 0.95 }}
            onClick={() => {
              setSelectedStudent(row);
              setIsDeleteOpen(true);
            }}
            className="p-2 rounded-xl border border-dark-100 text-dark-600 hover:text-red-600 hover:bg-red-50 transition-colors"
          >
            <HiTrash className="w-4 h-4" />
          </motion.button>
        </div>
      ),
    },
  ];

  return (
    <motion.div initial="initial" animate="animate" variants={staggerContainer} className="space-y-6">
      <motion.div variants={slideUp} className="flex flex-col sm:flex-row sm:items-center sm:justify-between gap-4">
        <div>
          <h1 className="text-2xl sm:text-3xl font-extrabold text-dark-900">Students</h1>
          <p className="text-dark-500 mt-1">Manage student approvals</p>
        </div>
        <div className="flex flex-col sm:flex-row gap-3">
          <Button variant="ghost" icon={HiRefresh} onClick={fetchStudents}>
            Refresh
          </Button>
          <Button icon={HiPlus} onClick={openCreateModal}>
            Add Student
          </Button>
        </div>
      </motion.div>

      <motion.div variants={slideUp}>
        <Card padding={false} className="p-4">
          <div className="flex flex-col md:flex-row gap-4">
            <div className="flex-1 relative">
              <HiSearch className="absolute left-4 top-1/2 -translate-y-1/2 w-5 h-5 text-dark-400" />
              <input
                type="text"
                placeholder="Search students..."
                value={searchTerm}
                onChange={(e) => setSearchTerm(e.target.value)}
                className="input pl-12"
              />
            </div>

            <select
              value={filterStatus}
              onChange={(e) => setFilterStatus(e.target.value)}
              className="input w-auto min-w-[200px]"
            >
              <option value="all">All Status</option>
              <option value="approved">Approved</option>
              <option value="pending">Pending</option>
              <option value="rejected">Rejected</option>
            </select>
          </div>
        </Card>
      </motion.div>

      <motion.div variants={slideUp}>
        <Card padding={false}>
          <Table columns={columns} data={paginated} loading={loading} emptyMessage="No students found" emptyIcon={HiUsers} />
          <div className="p-4 border-t border-dark-100">
            <Pagination currentPage={currentPage} totalPages={totalPages} onPageChange={setCurrentPage} />
          </div>
        </Card>
      </motion.div>

      <Modal
        isOpen={isModalOpen}
        onClose={() => {
          setIsModalOpen(false);
          resetForm();
        }}
        title={selectedStudent ? "Edit Student" : "Add New Student"}
        description={selectedStudent ? "Update student status/details" : "Create a new student"}
      >
        <form onSubmit={handleSubmit} className="space-y-4">
          <Input label="Full Name" value={formData.name} onChange={(e) => setFormData((p) => ({ ...p, name: e.target.value }))} required />
          <Input label="Email Address" type="email" value={formData.email} onChange={(e) => setFormData((p) => ({ ...p, email: e.target.value }))} required />
          <Input label="Phone Number" value={formData.phone} onChange={(e) => setFormData((p) => ({ ...p, phone: e.target.value }))} />

          {!selectedStudent ? (
            <Input label="Password" type="password" value={formData.password} onChange={(e) => setFormData((p) => ({ ...p, password: e.target.value }))} required />
          ) : (
            <Input label="Password (leave blank to keep current)" type="password" value={formData.password} onChange={(e) => setFormData((p) => ({ ...p, password: e.target.value }))} />
          )}

          <div>
            <label className="block text-sm font-semibold text-dark-700 mb-2">Status</label>
            <select
              value={formData.status}
              onChange={(e) => setFormData((p) => ({ ...p, status: e.target.value }))}
              className="input"
            >
              {STATUS_OPTIONS.map((opt) => (
                <option key={opt.value} value={opt.value}>
                  {opt.label}
                </option>
              ))}
            </select>
          </div>

          <div className="flex justify-end gap-3 pt-4">
            <Button type="button" variant="ghost" onClick={() => setIsModalOpen(false)}>
              Cancel
            </Button>
            <Button type="submit" loading={loading}>
              {selectedStudent ? "Update Student" : "Add Student"}
            </Button>
          </div>
        </form>
      </Modal>

      <ConfirmDialog
        isOpen={isDeleteOpen}
        onClose={() => {
          setIsDeleteOpen(false);
          setSelectedStudent(null);
        }}
        onConfirm={handleDelete}
        title="Delete Student"
        message={`Are you sure you want to delete "${selectedStudent?.name}"? This cannot be undone.`}
        confirmText="Delete"
        loading={loading}
      />
    </motion.div>
  );
};

export default Students;