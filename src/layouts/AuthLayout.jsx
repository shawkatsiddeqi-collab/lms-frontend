import React from 'react';
import { Navigate, Outlet } from 'react-router-dom';
import { motion } from 'framer-motion';
import { useAuth } from '../hooks/useAuth';
import { ROUTES, ROLES } from '../utils/constants';
import { HiAcademicCap, HiUsers, HiLightningBolt, HiChartBar } from 'react-icons/hi';


const AuthLayout = () => {
  const { isAuthenticated, user, getDashboardRoute } = useAuth();

  if (isAuthenticated) {
    return <Navigate to={getDashboardRoute(user?.role)} replace />;
  }

  const features = [
    { icon: HiAcademicCap, title: 'Expert Courses', description: 'Learn from industry professionals' },
    { icon: HiUsers, title: 'Community', description: 'Connect with fellow learners' },
    { icon: HiLightningBolt, title: 'Fast Progress', description: 'Track your learning journey' },
    { icon: HiChartBar, title: 'Analytics', description: 'Detailed performance insights' },
  ];

  return (
    <div className="min-h-screen flex">
      {/* Left Side - Branding */}
      <motion.div 
        initial={{ opacity: 0, x: -50 }}
        animate={{ opacity: 1, x: 0 }}
        transition={{ duration: 0.6 }}
        className="hidden lg:flex lg:w-1/2 relative overflow-hidden"
      >
        {/* Background Gradient */}
        <div className="absolute inset-0 bg-gradient-to-br from-primary-600 via-primary-700 to-accent-600" />
        
        {/* Pattern Overlay */}
        <div className="absolute inset-0 bg-hero-pattern opacity-10" />
        
        {/* Floating Elements */}
        <div className="absolute inset-0">
          <motion.div
            animate={{ y: [0, -20, 0] }}
            transition={{ duration: 6, repeat: Infinity, ease: 'easeInOut' }}
            className="absolute top-20 left-20 w-32 h-32 bg-white/10 rounded-full blur-2xl"
          />
          <motion.div
            animate={{ y: [0, 20, 0] }}
            transition={{ duration: 8, repeat: Infinity, ease: 'easeInOut' }}
            className="absolute bottom-32 right-20 w-48 h-48 bg-accent-400/20 rounded-full blur-3xl"
          />
          <motion.div
            animate={{ y: [0, -15, 0] }}
            transition={{ duration: 7, repeat: Infinity, ease: 'easeInOut' }}
            className="absolute top-1/2 left-1/3 w-24 h-24 bg-secondary-400/20 rounded-full blur-2xl"
          />
        </div>

        {/* Content */}
        <div className="relative z-10 flex flex-col justify-between p-12 text-white">
          {/* Logo */}
          <motion.div 
            initial={{ opacity: 0, y: -20 }}
            animate={{ opacity: 1, y: 0 }}
            transition={{ delay: 0.3 }}
            className="flex items-center gap-3"
          >
            <div className="w-12 h-12 rounded-xl bg-white/20 backdrop-blur-sm flex items-center justify-center">
              <span className="text-2xl font-bold">L</span>
            </div>
            <div>
              <h1 className="text-2xl font-bold">LMS System</h1>
              <p className="text-white/70 text-sm">Learning Management</p>
            </div>
          </motion.div>
          
          {/* Main Text */}
          <motion.div
            initial={{ opacity: 0, y: 20 }}
            animate={{ opacity: 1, y: 0 }}
            transition={{ delay: 0.5 }}
          >
            <h2 className="text-4xl xl:text-5xl font-bold leading-tight mb-6">
              Empower Your
              <span className="block text-transparent bg-clip-text bg-gradient-to-r from-secondary-300 to-accent-300">
                Learning Journey
              </span>
            </h2>
            <p className="text-white/80 text-lg max-w-md">
              Access world-class courses, connect with expert instructors, and achieve your educational goals.
            </p>
          </motion.div>

          {/* Features */}
          <motion.div
            initial={{ opacity: 0, y: 20 }}
            animate={{ opacity: 1, y: 0 }}
            transition={{ delay: 0.7 }}
            className="grid grid-cols-2 gap-4"
          >
            {features.map((feature, index) => (
              <motion.div
                key={index}
                initial={{ opacity: 0, scale: 0.9 }}
                animate={{ opacity: 1, scale: 1 }}
                transition={{ delay: 0.8 + index * 0.1 }}
                className="p-4 rounded-xl bg-white/10 backdrop-blur-sm hover:bg-white/20 transition-colors"
              >
                <feature.icon className="w-6 h-6 mb-2" />
                <h3 className="font-semibold">{feature.title}</h3>
                <p className="text-sm text-white/70">{feature.description}</p>
              </motion.div>
            ))}
          </motion.div>

          {/* Stats */}
          <motion.div
            initial={{ opacity: 0 }}
            animate={{ opacity: 1 }}
            transition={{ delay: 1 }}
            className="flex items-center gap-8"
          >
            <div>
              <p className="text-3xl font-bold">10K+</p>
              <p className="text-white/70 text-sm">Active Students</p>
            </div>
            <div className="w-px h-12 bg-white/20" />
            <div>
              <p className="text-3xl font-bold">500+</p>
              <p className="text-white/70 text-sm">Courses</p>
            </div>
            <div className="w-px h-12 bg-white/20" />
            <div>
              <p className="text-3xl font-bold">95%</p>
              <p className="text-white/70 text-sm">Satisfaction</p>
            </div>
          </motion.div>
        </div>
      </motion.div>

      {/* Right Side - Form */}
      <motion.div 
        initial={{ opacity: 0, x: 50 }}
        animate={{ opacity: 1, x: 0 }}
        transition={{ duration: 0.6 }}
        className="w-full lg:w-1/2 flex items-center justify-center p-8 bg-white"
      >
        <Outlet />
      </motion.div>
      
    </div>
  );
};

export default AuthLayout;