import React, { useState } from 'react';
import { Outlet } from 'react-router-dom';
import { motion } from 'framer-motion';
import Navbar from '../components/common/Navbar';
import Sidebar from '../components/common/Sidebar';
import { SIDEBAR_ITEMS } from '../utils/constants';
import Footer from '../components/common/Footer';

const TeacherLayout = () => {
  const [sidebarOpen, setSidebarOpen] = useState(false);

  const toggleSidebar = () => {
    setSidebarOpen(!sidebarOpen);
  };

  const closeSidebar = () => {
    setSidebarOpen(false);
  };

  return (
    <div className="min-h-screen bg-dark-50">
      {/* Navbar */}
      <Navbar onMenuClick={toggleSidebar} />
      
      {/* Sidebar */}
      <Sidebar 
        items={SIDEBAR_ITEMS.teacher} 
        isOpen={sidebarOpen}
        onClose={closeSidebar}
      />
      
      {/* Main Content */}
      <main className="lg:ml-72 pt-20 min-h-screen">
        <motion.div 
          initial={{ opacity: 0, y: 20 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{ duration: 0.3 }}
          className="p-4 lg:p-8"
        >
          <Outlet />
        </motion.div>
      </main>
    
    </div>
  );
};

export default TeacherLayout;