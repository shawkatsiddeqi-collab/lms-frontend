import React, { useState } from 'react';
import { Link } from 'react-router-dom';
import { motion } from 'framer-motion';
import { useAuth } from '../../hooks/useAuth';
import Input from '../common/Input';
import Button from '../common/Button';
import Alert from '../common/Alert';
import { HiMail, HiLockClosed, HiArrowRight } from 'react-icons/hi';
import { slideUp, staggerContainer } from '../../utils/constants';

const LoginForm = () => {
  const { login } = useAuth();
  const [formData, setFormData] = useState({
    email: '',
    password: '',
  });
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState('');
  const [rememberMe, setRememberMe] = useState(false);

  const handleChange = (e) => {
    const { name, value } = e.target;
    setFormData((prev) => ({ ...prev, [name]: value }));
    setError('');
  };

  const handleSubmit = async (e) => {
    e.preventDefault();
    
    // Basic validation
    if (!formData.email || !formData.password) {
      setError('Please fill in all fields');
      return;
    }

    setLoading(true);
    setError('');

    try {
      const result = await login(formData.email, formData.password);
      
      if (!result.success) {
        setError(result.message || 'Login failed');
      }
    } catch (err) {
      console.error('Login error:', err);
      setError('An unexpected error occurred');
    } finally {
      setLoading(false);
    }
  };

  return (
    <motion.div
      initial="initial"
      animate="animate"
      variants={staggerContainer}
      className="w-full max-w-md"
    >
      {/* Header */}
      <motion.div variants={slideUp} className="text-center mb-8">
        <motion.div
          initial={{ scale: 0 }}
          animate={{ scale: 1 }}
          transition={{ type: 'spring', delay: 0.2 }}
          className="inline-flex items-center justify-center w-16 h-16 rounded-2xl bg-gradient-to-br from-primary-500 to-accent-500 mb-6"
        >
          <HiLockClosed className="w-8 h-8 text-white" />
        </motion.div>
        <h1 className="text-3xl font-bold text-dark-900">Welcome Back!</h1>
        <p className="text-dark-500 mt-2">Sign in to continue your learning journey</p>
      </motion.div>

      {/* Error Alert */}
      {error && (
        <Alert 
          type="error" 
          message={error} 
          onClose={() => setError('')}
          show={!!error}
          className="mb-6"
        />
      )}

      {/* Form */}
      <motion.form variants={slideUp} onSubmit={handleSubmit} className="space-y-5">
        <Input
          label="Email Address"
          type="email"
          name="email"
          value={formData.email}
          onChange={handleChange}
          placeholder="Enter your email"
          required
          icon={HiMail}
        />

        <Input
          label="Password"
          type="password"
          name="password"
          value={formData.password}
          onChange={handleChange}
          placeholder="Enter your password"
          required
          icon={HiLockClosed}
        />

        <div className="flex items-center justify-between">
          <label className="flex items-center gap-2 cursor-pointer group">
            <div className="relative">
              <input 
                type="checkbox" 
                checked={rememberMe}
                onChange={(e) => setRememberMe(e.target.checked)}
                className="sr-only peer" 
              />
              <div className="w-5 h-5 border-2 border-dark-300 rounded-md peer-checked:border-primary-500 peer-checked:bg-primary-500 transition-all">
                <svg 
                  className={`w-3 h-3 text-white absolute top-1/2 left-1/2 -translate-x-1/2 -translate-y-1/2 transition-opacity ${rememberMe ? 'opacity-100' : 'opacity-0'}`}
                  fill="currentColor" 
                  viewBox="0 0 20 20"
                >
                  <path fillRule="evenodd" d="M16.707 5.293a1 1 0 010 1.414l-8 8a1 1 0 01-1.414 0l-4-4a1 1 0 011.414-1.414L8 12.586l7.293-7.293a1 1 0 011.414 0z" clipRule="evenodd" />
                </svg>
              </div>
            </div>
            <span className="text-sm text-dark-600 group-hover:text-dark-900 transition-colors">Remember me</span>
          </label>
          <Link 
            to="/forgot-password" 
            className="text-sm font-medium text-primary-600 hover:text-primary-700 transition-colors"
          >
            Forgot password?
          </Link>
        </div>

        <Button
          type="submit"
          fullWidth
          size="lg"
          loading={loading}
          icon={HiArrowRight}
          iconPosition="right"
          className="mt-6"
        >
          Sign In
        </Button>
      </motion.form>

      {/* Divider */}
      <motion.div variants={slideUp} className="relative my-8">
        <div className="absolute inset-0 flex items-center">
          <div className="w-full border-t border-dark-200"></div>
        </div>
        <div className="relative flex justify-center text-sm">
          <span className="px-4 bg-white text-dark-500">Or continue with</span>
        </div>
      </motion.div>

      {/* Social Login */}
      <motion.div variants={slideUp} className="grid grid-cols-2 gap-4">
        <button className="flex items-center justify-center gap-2 px-4 py-3 border-2 border-dark-200 rounded-xl hover:bg-dark-50 hover:border-dark-300 transition-all">
          <svg className="w-5 h-5" viewBox="0 0 24 24">
            <path fill="#4285F4" d="M22.56 12.25c0-.78-.07-1.53-.2-2.25H12v4.26h5.92c-.26 1.37-1.04 2.53-2.21 3.31v2.77h3.57c2.08-1.92 3.28-4.74 3.28-8.09z"/>
            <path fill="#34A853" d="M12 23c2.97 0 5.46-.98 7.28-2.66l-3.57-2.77c-.98.66-2.23 1.06-3.71 1.06-2.86 0-5.29-1.93-6.16-4.53H2.18v2.84C3.99 20.53 7.7 23 12 23z"/>
            <path fill="#FBBC05" d="M5.84 14.09c-.22-.66-.35-1.36-.35-2.09s.13-1.43.35-2.09V7.07H2.18C1.43 8.55 1 10.22 1 12s.43 3.45 1.18 4.93l2.85-2.22.81-.62z"/>
            <path fill="#EA4335" d="M12 5.38c1.62 0 3.06.56 4.21 1.64l3.15-3.15C17.45 2.09 14.97 1 12 1 7.7 1 3.99 3.47 2.18 7.07l3.66 2.84c.87-2.6 3.3-4.53 6.16-4.53z"/>
          </svg>
          <span className="text-sm font-medium text-dark-700">Google</span>
        </button>
        <button className="flex items-center justify-center gap-2 px-4 py-3 border-2 border-dark-200 rounded-xl hover:bg-dark-50 hover:border-dark-300 transition-all">
          <svg className="w-5 h-5" fill="#1877F2" viewBox="0 0 24 24">
            <path d="M24 12.073c0-6.627-5.373-12-12-12s-12 5.373-12 12c0 5.99 4.388 10.954 10.125 11.854v-8.385H7.078v-3.47h3.047V9.43c0-3.007 1.792-4.669 4.533-4.669 1.312 0 2.686.235 2.686.235v2.953H15.83c-1.491 0-1.956.925-1.956 1.874v2.25h3.328l-.532 3.47h-2.796v8.385C19.612 23.027 24 18.062 24 12.073z"/>
          </svg>
          <span className="text-sm font-medium text-dark-700">Facebook</span>
        </button>
      </motion.div>

      {/* Sign Up Link */}
      <motion.p variants={slideUp} className="text-center text-dark-600 mt-8">
        Don't have an account?{' '}
        <Link 
          to="/register" 
          className="font-semibold text-primary-600 hover:text-primary-700 transition-colors"
        >
          Create Account
        </Link>
      </motion.p>
    </motion.div>
  );
};

export default LoginForm;