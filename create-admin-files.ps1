# Create admin folder
New-Item -ItemType Directory -Force -Path "src\pages\admin"

# Create AdminDashboard.jsx
@"
import { useContext, useEffect, useState } from "react";
import { AuthContext } from "../../context/AuthContext";
import { Link } from "react-router-dom";
import Layout from "../../components/common/Layout";
import axiosInstance from "../../api/axiosInstance";

const AdminDashboard = () => {
  const { user } = useContext(AuthContext);
  const [stats, setStats] = useState({
    totalStudents: 0,
    totalTeachers: 0,
    pendingUsers: 0,
  });

  useEffect(() => {
    fetchDashboard();
  }, []);

  const fetchDashboard = async () => {
    try {
      const { data } = await axiosInstance.get("/admin/dashboard");
      setStats(data);
    } catch (error) {
      console.error(error);
    }
  };

  return (
    <Layout>
      <div className="max-w-6xl mx-auto">
        <h1 className="text-4xl font-bold mb-8 text-gray-800">
          Admin Dashboard - Welcome, {user?.name}!
        </h1>
        <div className="grid md:grid-cols-3 gap-6 mb-8">
          <div className="card bg-gradient-to-br from-blue-500 to-blue-600 text-white">
            <h3 className="text-lg font-semibold mb-2">Total Students</h3>
            <p className="text-4xl font-bold">{stats.totalStudents}</p>
          </div>
          <div className="card bg-gradient-to-br from-green-500 to-green-600 text-white">
            <h3 className="text-lg font-semibold mb-2">Total Teachers</h3>
            <p className="text-4xl font-bold">{stats.totalTeachers}</p>
          </div>
          <div className="card bg-gradient-to-br from-yellow-500 to-yellow-600 text-white">
            <h3 className="text-lg font-semibold mb-2">Pending Users</h3>
            <p className="text-4xl font-bold">{stats.pendingUsers}</p>
          </div>
        </div>
        <div className="grid md:grid-cols-2 gap-6">
          <Link to="/admin/pending-users" className="card hover:shadow-xl transition">
            <h3 className="text-xl font-bold mb-2 text-gray-800">Pending Users</h3>
            <p className="text-gray-600">Approve or reject user registrations</p>
          </Link>
          <Link to="/admin/pending-courses" className="card hover:shadow-xl transition">
            <h3 className="text-xl font-bold mb-2 text-gray-800">Pending Courses</h3>
            <p className="text-gray-600">Approve or reject course submissions</p>
          </Link>
        </div>
      </div>
    </Layout>
  );
};

