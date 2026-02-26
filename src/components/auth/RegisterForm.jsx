import React, { useState } from 'react';
import { Link, useNavigate } from 'react-router-dom';
import { motion } from 'framer-motion';
import { useAuth } from '../../hooks/useAuth';
import Input from '../common/Input';
import Button from '../common/Button';
import Alert from '../common/Alert';
import { 
  HiUser, 
  HiMail, 
  HiLockClosed, 
  HiPhone,
  HiAcademicCap,
  HiArrowRight,
  HiCheckCircle
} from 'react-icons/hi';
import { slideUp, staggerContainer } from '../../utils/constants';
import { cn } from '../../utils/helpers';

const RegisterForm = () => {
  const { register } = useAuth();
  const navigate = useNavigate();
  const [step, setStep] = useState(1);
  const [formData, setFormData] = useState({
    name: '',
    email: '',
    password: '',
    confirmPassword: '',
    role: 'student',
    phone: '',
  });
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState('');
  const [errors, setErrors] = useState({});

  const handleChange = (e) => {
    const { name, value } = e.target;
    setFormData((prev) => ({ ...prev, [name]: value }));
    setError('');
    setErrors((prev) => ({ ...prev, [name]: '' }));
  };

  const validateStep1 = () => {
    const newErrors = {};
    if (!formData.name.trim()) newErrors.name = 'Name is required';
    if (!formData.email.trim()) newErrors.email = 'Email is required';
    if (!formData.phone.trim()) newErrors.phone = 'Phone is required';
    setErrors(newErrors);
    return Object.keys(newErrors).length === 0;
  };

  const validateStep2 = () => {
    const newErrors = {};
    if (formData.password.length < 6) {
      newErrors.password = 'Password must be at least 6 characters';
    }
    if (formData.password !== formData.confirmPassword) {
      newErrors.confirmPassword = 'Passwords do not match';
    }
    setErrors(newErrors);
    return Object.keys(newErrors).length === 0;
  };

  const handleNext = () => {
    if (step === 1 && validateStep1()) {
      setStep(2);
    }
  };

  const handleBack = () => {
    setStep(1);
  };

  const handleSubmit = async (e) => {
    e.preventDefault();
    
    if (!validateStep2()) return;

    setLoading(true);
    setError('');

    const result = await register({
      name: formData.name,
      email: formData.email,
      password: formData.password,
      role: formData.role,
      phone: formData.phone,
    });
    
    if (result.success) {
      navigate('/login');
    } else {
      setError(result.message);
    }
    
    setLoading(false);
  };

  const roles = [
    { 
      id: 'student', 
      name: 'Student', 
      description: 'Join courses and learn',
      icon: HiAcademicCap,
      color: 'from-blue-500 to-blue-600'
    },
    { 
      id: 'teacher', 
      name: 'Teacher', 
      description: 'Create and manage courses',
      icon: HiUser,
      color: 'from-green-500 to-green-600'
    },
  ];

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
          <HiUser className="w-8 h-8 text-white" />
        </motion.div>
        <h1 className="text-3xl font-bold text-dark-900">Create Account</h1>
        <p className="text-dark-500 mt-2">Join our learning community today</p>
      </motion.div>

      {/* Progress Steps */}
      <motion.div variants={slideUp} className="flex items-center justify-center gap-4 mb-8">
        {[1, 2].map((s) => (
          <div key={s} className="flex items-center">
            <div className={cn(
              'w-10 h-10 rounded-full flex items-center justify-center font-semibold transition-all',
              step >= s 
                ? 'bg-primary-600 text-white' 
                : 'bg-dark-100 text-dark-400'
            )}>
              {step > s ? <HiCheckCircle className="w-5 h-5" /> : s}
            </div>
            {s < 2 && (
              <div className={cn(
                'w-16 h-1 mx-2 rounded-full transition-all',
                step > s ? 'bg-primary-600' : 'bg-dark-100'
              )} />
            )}
          </div>
        ))}
      </motion.div>

      {/* Error Alert */}
      <Alert 
        type="error" 
        message={error} 
        onClose={() => setError('')}
        show={!!error}
        className="mb-6"
      />

      {/* Form */}
      <form onSubmit={handleSubmit}>
        {/* Step 1: Personal Info */}
        {step === 1 && (
          <motion.div
            key="step1"
            initial={{ opacity: 0, x: -20 }}
            animate={{ opacity: 1, x: 0 }}
            exit={{ opacity: 0, x: 20 }}
            className="space-y-5"
          >
            <Input
              label="Full Name"
              type="text"
              name="name"
              value={formData.name}
              onChange={handleChange}
              placeholder="Enter your full name"
              required
              icon={HiUser}
              error={errors.name}
            />

            <Input
              label="Email Address"
              type="email"
              name="email"
              value={formData.email}
              onChange={handleChange}
              placeholder="Enter your email"
              required
              icon={HiMail}
              error={errors.email}
            />

            <Input
              label="Phone Number"
              type="tel"
              name="phone"
              value={formData.phone}
              onChange={handleChange}
              placeholder="Enter your phone number"
              required
              icon={HiPhone}
              error={errors.phone}
            />

            {/* Role Selection */}
            <div className="space-y-3">
              <label className="block text-sm font-semibold text-dark-700">
                Register As <span className="text-red-500">*</span>
              </label>
              <div className="grid grid-cols-2 gap-4">
                {roles.map((role) => (
                  <motion.div
                    key={role.id}
                    whileHover={{ scale: 1.02 }}
                    whileTap={{ scale: 0.98 }}
                    onClick={() => setFormData(prev => ({ ...prev, role: role.id }))}
                    className={cn(
                      'relative cursor-pointer rounded-xl p-4 border-2 transition-all',
                      formData.role === role.id
                        ? 'border-primary-500 bg-primary-50'
                        : 'border-dark-200 hover:border-dark-300'
                    )}
                  >
                    <div className={cn(
                      'w-10 h-10 rounded-lg bg-gradient-to-br flex items-center justify-center mb-3',
                      role.color
                    )}>
                      <role.icon className="w-5 h-5 text-white" />
                    </div>
                    <h4 className="font-semibold text-dark-900">{role.name}</h4>
                    <p className="text-xs text-dark-500 mt-1">{role.description}</p>
                    {formData.role === role.id && (
                      <div className="absolute top-3 right-3">
                        <HiCheckCircle className="w-5 h-5 text-primary-600" />
                      </div>
                    )}
                  </motion.div>
                ))}
              </div>
            </div>

            <Button
              type="button"
              fullWidth
              size="lg"
              onClick={handleNext}
              icon={HiArrowRight}
              iconPosition="right"
              className="mt-6"
            >
              Continue
            </Button>
          </motion.div>
        )}

        {/* Step 2: Password */}
        {step === 2 && (
          <motion.div
            key="step2"
            initial={{ opacity: 0, x: 20 }}
            animate={{ opacity: 1, x: 0 }}
            exit={{ opacity: 0, x: -20 }}
            className="space-y-5"
          >
            <Input
              label="Password"
              type="password"
              name="password"
              value={formData.password}
              onChange={handleChange}
              placeholder="Create a strong password"
              required
              icon={HiLockClosed}
              error={errors.password}
            />

            <Input
              label="Confirm Password"
              type="password"
              name="confirmPassword"
              value={formData.confirmPassword}
              onChange={handleChange}
              placeholder="Confirm your password"
              required
              icon={HiLockClosed}
              error={errors.confirmPassword}
            />

            {/* Password Requirements */}
            <div className="p-4 bg-dark-50 rounded-xl">
              <p className="text-sm font-medium text-dark-700 mb-2">Password must contain:</p>
              <ul className="space-y-1">
                {[
                  { text: 'At least 6 characters', valid: formData.password.length >= 6 },
                  { text: 'Passwords match', valid: formData.password && formData.password === formData.confirmPassword },
                ].map((req, i) => (
                  <li key={i} className="flex items-center gap-2 text-sm">
                    <div className={cn(
                      'w-4 h-4 rounded-full flex items-center justify-center',
                      req.valid ? 'bg-green-500' : 'bg-dark-300'
                    )}>
                      {req.valid && <HiCheckCircle className="w-3 h-3 text-white" />}
                    </div>
                    <span className={req.valid ? 'text-green-600' : 'text-dark-500'}>
                      {req.text}
                    </span>
                  </li>
                ))}
              </ul>
            </div>

            {/* Terms */}
            <label className="flex items-start gap-3 cursor-pointer">
              <input type="checkbox" required className="mt-1" />
              <span className="text-sm text-dark-600">
                I agree to the{' '}
                <a href="#" className="text-primary-600 hover:underline">Terms of Service</a>
                {' '}and{' '}
                <a href="#" className="text-primary-600 hover:underline">Privacy Policy</a>
              </span>
            </label>

            <div className="flex gap-4 mt-6">
              <Button
                type="button"
                variant="ghost"
                size="lg"
                onClick={handleBack}
                className="flex-1"
              >
                Back
              </Button>
              <Button
                type="submit"
                size="lg"
                loading={loading}
                className="flex-1"
              >
                Create Account
              </Button>
            </div>
          </motion.div>
        )}
      </form>

      {/* Sign In Link */}
      <motion.p variants={slideUp} className="text-center text-dark-600 mt-8">
        Already have an account?{' '}
        <Link 
          to="/login" 
          className="font-semibold text-primary-600 hover:text-primary-700 transition-colors"
        >
          Sign In
        </Link>
      </motion.p>
    </motion.div>
  );
};

export default RegisterForm;