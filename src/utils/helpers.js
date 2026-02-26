import { format, formatDistanceToNow, parseISO } from 'date-fns';

// ============================================
// CLASSNAME UTILITY (Like tailwind-merge)
// ============================================
export const cn = (...classes) => {
  return classes.filter(Boolean).join(' ');
};

// ============================================
// DATE FORMATTING FUNCTIONS
// ============================================

// Format date to readable string
export const formatDate = (date) => {
  if (!date) return 'N/A';
  try {
    const parsedDate = typeof date === 'string' ? parseISO(date) : new Date(date);
    return format(parsedDate, 'MMM dd, yyyy');
  } catch (error) {
    return 'Invalid Date';
  }
};

// Format date with time
export const formatDateTime = (date) => {
  if (!date) return 'N/A';
  try {
    const parsedDate = typeof date === 'string' ? parseISO(date) : new Date(date);
    return format(parsedDate, 'MMM dd, yyyy • hh:mm a');
  } catch (error) {
    return 'Invalid Date';
  }
};

// Get relative time (e.g., "2 hours ago")
export const getRelativeTime = (date) => {
  if (!date) return 'N/A';
  try {
    const parsedDate = typeof date === 'string' ? parseISO(date) : new Date(date);
    return formatDistanceToNow(parsedDate, { addSuffix: true });
  } catch (error) {
    return 'N/A';
  }
};

// ============================================
// STRING UTILITIES
// ============================================

// Capitalize first letter
export const capitalize = (str) => {
  if (!str) return '';
  return str.charAt(0).toUpperCase() + str.slice(1).toLowerCase();
};

// Get initials from name
export const getInitials = (name) => {
  if (!name) return 'U';
  return name
    .split(' ')
    .map((n) => n[0])
    .join('')
    .toUpperCase()
    .slice(0, 2);
};

// Truncate text
export const truncateText = (text, length = 50) => {
  if (!text) return '';
  if (text.length <= length) return text;
  return text.slice(0, length) + '...';
};

// ============================================
// STATUS & STYLING UTILITIES
// ============================================

// Get status badge color
export const getStatusColor = (status) => {
  const s = (status || "").toLowerCase();

  const colors = {
    // ✅ correct enum values from your User.js
    approved: "badge-success",
    pending: "badge-warning",
    rejected: "badge-danger",

    // attendance
    present: "badge-success",
    absent: "badge-danger",

    // assignment
    submitted: "badge-info",
    graded: "badge-success",
    draft: "badge-secondary",
  };

  return colors[s] || "badge-info";
};

// Get status dot color for indicators
export const getStatusDotColor = (status) => {
  const colors = {
    active: 'bg-green-500',
    inactive: 'bg-red-500',
    pending: 'bg-amber-500',
    present: 'bg-green-500',
    absent: 'bg-red-500',
  };
  return colors[status?.toLowerCase()] || 'bg-blue-500';
};

// Generate random gradient
export const getRandomGradient = (index = 0) => {
  const gradients = [
    'from-primary-500 to-accent-500',
    'from-secondary-500 to-primary-500',
    'from-accent-500 to-secondary-500',
    'from-blue-500 to-purple-500',
    'from-green-500 to-teal-500',
    'from-orange-500 to-red-500',
    'from-pink-500 to-rose-500',
    'from-indigo-500 to-blue-500',
    'from-cyan-500 to-blue-500',
    'from-violet-500 to-purple-500',
  ];
  return gradients[index % gradients.length];
};

// Get grade color based on score
export const getGradeColor = (percentage) => {
  if (percentage >= 90) return 'text-green-600 bg-green-50';
  if (percentage >= 80) return 'text-blue-600 bg-blue-50';
  if (percentage >= 70) return 'text-amber-600 bg-amber-50';
  if (percentage >= 60) return 'text-orange-600 bg-orange-50';
  return 'text-red-600 bg-red-50';
};

// Get letter grade
export const getLetterGrade = (percentage) => {
  if (percentage >= 90) return 'A';
  if (percentage >= 80) return 'B';
  if (percentage >= 70) return 'C';
  if (percentage >= 60) return 'D';
  return 'F';
};

// ============================================
// VALIDATION UTILITIES
// ============================================

// Validate email
export const isValidEmail = (email) => {
  const emailRegex = /^[^\s@]+@[^\s@]+\.[^\s@]+$/;
  return emailRegex.test(email);
};

// Validate phone number
export const isValidPhone = (phone) => {
  const phoneRegex = /^[+]?[\d\s-]{10,}$/;
  return phoneRegex.test(phone);
};

// Validate password strength
export const validatePassword = (password) => {
  const minLength = password.length >= 6;
  const hasUpperCase = /[A-Z]/.test(password);
  const hasLowerCase = /[a-z]/.test(password);
  const hasNumbers = /\d/.test(password);
  const hasSpecialChar = /[!@#$%^&*(),.?":{}|<>]/.test(password);

  return {
    isValid: minLength && hasLowerCase,
    minLength,
    hasUpperCase,
    hasLowerCase,
    hasNumbers,
    hasSpecialChar,
  };
};

// ============================================
// ERROR HANDLING
// ============================================

// Get error message from API response
export const getErrorMessage = (error) => {
  if (error.response?.data?.message) {
    return error.response.data.message;
  }
  if (error.message) {
    return error.message;
  }
  return 'Something went wrong. Please try again.';
};

// ============================================
// NUMBER UTILITIES
// ============================================

// Format number with commas
export const formatNumber = (num) => {
  if (num === null || num === undefined) return '0';
  return new Intl.NumberFormat().format(num);
};

// Calculate percentage
export const calculatePercentage = (value, total) => {
  if (!total) return 0;
  return Math.round((value / total) * 100);
};

// Format currency
export const formatCurrency = (amount, currency = 'USD') => {
  return new Intl.NumberFormat('en-US', {
    style: 'currency',
    currency,
  }).format(amount);
};

// ============================================
// LOCAL STORAGE HELPERS
// ============================================

export const storage = {
  get: (key) => {
    try {
      const item = localStorage.getItem(key);
      return item ? JSON.parse(item) : null;
    } catch {
      return null;
    }
  },
  set: (key, value) => {
    try {
      localStorage.setItem(key, JSON.stringify(value));
    } catch {
      console.error('Error saving to localStorage');
    }
  },
  remove: (key) => {
    try {
      localStorage.removeItem(key);
    } catch {
      console.error('Error removing from localStorage');
    }
  },
  clear: () => {
    try {
      localStorage.clear();
    } catch {
      console.error('Error clearing localStorage');
    }
  },
};

// ============================================
// UTILITY FUNCTIONS
// ============================================

// Debounce function
export const debounce = (func, wait) => {
  let timeout;
  return (...args) => {
    clearTimeout(timeout);
    timeout = setTimeout(() => func.apply(this, args), wait);
  };
};

// Throttle function
export const throttle = (func, limit) => {
  let inThrottle;
  return (...args) => {
    if (!inThrottle) {
      func.apply(this, args);
      inThrottle = true;
      setTimeout(() => (inThrottle = false), limit);
    }
  };
};

// Generate unique ID
export const generateId = () => {
  return Math.random().toString(36).substring(2) + Date.now().toString(36);
};

// Sleep/delay function
export const sleep = (ms) => new Promise((resolve) => setTimeout(resolve, ms));

// Check if object is empty
export const isEmpty = (obj) => {
  if (!obj) return true;
  return Object.keys(obj).length === 0;
};

// Deep clone object
export const deepClone = (obj) => {
  return JSON.parse(JSON.stringify(obj));
};

// Get query params from URL
export const getQueryParams = (search) => {
  return Object.fromEntries(new URLSearchParams(search));
};

// Build query string from object
export const buildQueryString = (params) => {
  return new URLSearchParams(params).toString();
};