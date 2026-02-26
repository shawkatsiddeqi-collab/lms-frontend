import React from 'react';
import { Link } from 'react-router-dom';
import { motion } from 'framer-motion';
import Button from '../components/common/Button';
import { HiHome, HiArrowLeft } from 'react-icons/hi';

const NotFound = () => {
  return (
    <div className="min-h-screen flex items-center justify-center bg-dark-50 px-4">
      <motion.div 
        initial={{ opacity: 0, y: 20 }}
        animate={{ opacity: 1, y: 0 }}
        className="text-center max-w-lg"
      >
        {/* 404 Illustration */}
        <motion.div
          initial={{ scale: 0 }}
          animate={{ scale: 1 }}
          transition={{ type: 'spring', delay: 0.2 }}
          className="relative mb-8"
        >
          <div className="text-[180px] font-bold text-dark-100 select-none">404</div>
          <motion.div
            animate={{ y: [0, -10, 0] }}
            transition={{ duration: 2, repeat: Infinity, ease: 'easeInOut' }}
            className="absolute inset-0 flex items-center justify-center"
          >
            <div className="w-32 h-32 rounded-full bg-gradient-to-br from-primary-500 to-accent-500 flex items-center justify-center shadow-lg shadow-primary-500/30">
              <span className="text-5xl">🔍</span>
            </div>
          </motion.div>
        </motion.div>

        <h1 className="text-3xl font-bold text-dark-900 mb-4">
          Page Not Found
        </h1>
        <p className="text-dark-600 mb-8">
          Oops! The page you're looking for doesn't exist or has been moved. 
          Let's get you back on track.
        </p>
        
        <div className="flex flex-col sm:flex-row justify-center gap-4">
          <Link to="/">
            <Button size="lg" icon={HiHome}>
              Go Home
            </Button>
          </Link>
          <Button 
            size="lg" 
            variant="outline" 
            icon={HiArrowLeft}
            onClick={() => window.history.back()}
          >
            Go Back
          </Button>
        </div>
      </motion.div>
    </div>
  );
};

export default NotFound;