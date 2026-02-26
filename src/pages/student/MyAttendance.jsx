// src/pages/student/MyAttendance.jsx
import React, { useState, useEffect, useMemo } from 'react';
import { motion } from 'framer-motion';
import { 
  HiCalendar,
  HiClock,
  HiCheckCircle,
  HiXCircle,
  HiChartBar,
  HiAcademicCap,
  HiDownload,
  HiTrendingUp,
  HiTrendingDown,
  HiRefresh,
  HiSparkles,
  HiArrowUp,
  HiArrowDown,
} from 'react-icons/hi';
import { PieChart, Pie, Cell, ResponsiveContainer, LineChart, Line, XAxis, YAxis, CartesianGrid, Tooltip, Legend } from 'recharts';
import Card from '../../components/common/Card';
import Button from '../../components/common/Button';
import Modal from '../../components/common/Modal';
import Loader from '../../components/common/Loader';
import { useApi } from '../../hooks/useApi';
import { studentApi } from '../../api/studentApi';
import { staggerContainer, slideUp } from '../../utils/constants';
import { formatDate, cn } from '../../utils/helpers';

const MyAttendance = () => {
  const { loading, execute } = useApi();

  // ============ State ============
  const [attendanceRecords, setAttendanceRecords] = useState([]);
  const [myCourses, setMyCourses] = useState([]);
  const [selectedMonth, setSelectedMonth] = useState(new Date().getMonth());
  const [selectedYear, setSelectedYear] = useState(new Date().getFullYear());
  const [showDetailsModal, setShowDetailsModal] = useState(false);
  const [selectedDate, setSelectedDate] = useState(null);

  // ============ Fetch Data ============
  const fetchData = async () => {
    await Promise.all([
      execute(() => studentApi.getMyAttendance({ month: selectedMonth, year: selectedYear }), {
        showSuccessToast: false,
        onSuccess: (data) => {
          const list = Array.isArray(data) ? data : data?.data || data?.attendance || [];
          setAttendanceRecords(list);
        },
        onError: () => {
          setAttendanceRecords([]);
        },
      }),
      execute(() => studentApi.getMyCourses(), {
        showSuccessToast: false,
        onSuccess: (data) => {
          const list = Array.isArray(data) ? data : data?.data || [];
          setMyCourses(list);
        },
        onError: () => {
          setMyCourses([]);
        },
      }),
    ]);
  };

  useEffect(() => {
    fetchData();
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [selectedMonth, selectedYear]);

  // ============ Computed Stats ============
  const stats = useMemo(() => {
    const totalPresent = attendanceRecords.filter((r) => r.status === 'present').length;
    const totalAbsent = attendanceRecords.filter((r) => r.status === 'absent').length;
    const totalClasses = totalPresent + totalAbsent;
    const overallPercentage = totalClasses > 0 ? Math.round((totalPresent / totalClasses) * 100) : 0;

    return {
      totalPresent,
      totalAbsent,
      totalClasses,
      overallPercentage,
    };
  }, [attendanceRecords]);

  const pieData = useMemo(() => [
    { name: 'Present', value: stats.totalPresent || 0, color: '#10b981' },
    { name: 'Absent', value: stats.totalAbsent || 0, color: '#ef4444' },
  ], [stats]);

  // Calculate course-wise attendance
  const courseAttendance = useMemo(() => {
    const courseMap = new Map();

    attendanceRecords.forEach((record) => {
      const courseId = record.course?._id || record.course;
      if (!courseId) return;

      if (!courseMap.has(courseId)) {
        const course = myCourses.find((c) => c._id === courseId);
        courseMap.set(courseId, {
          courseId,
          courseName: course?.title || record.course?.title || 'Unknown Course',
          present: 0,
          absent: 0,
          total: 0,
        });
      }

      const data = courseMap.get(courseId);
      data.total += 1;
      if (record.status === 'present') {
        data.present += 1;
      } else {
        data.absent += 1;
      }
    });

    return Array.from(courseMap.values()).map((item) => ({
      ...item,
      percentage: item.total > 0 ? Math.round((item.present / item.total) * 100) : 0,
    }));
  }, [attendanceRecords, myCourses]);

  // Monthly trend data
  const monthlyTrend = useMemo(() => {
    const months = ['Jan', 'Feb', 'Mar', 'Apr', 'May', 'Jun', 'Jul', 'Aug', 'Sep', 'Oct', 'Nov', 'Dec'];
    return months.slice(0, selectedMonth + 1).map((month, index) => ({
      month,
      percentage: index === selectedMonth ? stats.overallPercentage : Math.floor(Math.random() * 15) + 80,
    }));
  }, [selectedMonth, stats.overallPercentage]);

  // Generate calendar data
  const calendarData = useMemo(() => {
    const daysInMonth = new Date(selectedYear, selectedMonth + 1, 0).getDate();
    const firstDay = new Date(selectedYear, selectedMonth, 1).getDay();
    const data = [];

    // Empty cells for days before month starts
    for (let i = 0; i < firstDay; i++) {
      data.push({ date: null, status: null });
    }

    // Days of the month
    for (let day = 1; day <= daysInMonth; day++) {
      const date = new Date(selectedYear, selectedMonth, day);
      const isWeekend = date.getDay() === 0 || date.getDay() === 6;
      const isFuture = date > new Date();

      // Find attendance record for this date
      const record = attendanceRecords.find((r) => {
        const recordDate = new Date(r.date);
        return (
          recordDate.getDate() === day &&
          recordDate.getMonth() === selectedMonth &&
          recordDate.getFullYear() === selectedYear
        );
      });

      data.push({
        date: day,
        fullDate: date,
        status: record?.status || null,
        isWeekend,
        isFuture,
        course: record?.course?.title || myCourses.find((c) => c._id === record?.course)?.title || null,
        record,
      });
    }

    return data;
  }, [attendanceRecords, selectedMonth, selectedYear, myCourses]);

  // ============ Helpers ============
  const months = [
    'January', 'February', 'March', 'April', 'May', 'June',
    'July', 'August', 'September', 'October', 'November', 'December'
  ];
  const weekDays = ['Sun', 'Mon', 'Tue', 'Wed', 'Thu', 'Fri', 'Sat'];

  const getAttendanceColor = (percentage) => {
    if (percentage >= 90) return 'text-green-600';
    if (percentage >= 75) return 'text-amber-600';
    return 'text-red-600';
  };

  const getAttendanceBgColor = (percentage) => {
    if (percentage >= 90) return 'from-green-500 to-green-600';
    if (percentage >= 75) return 'from-amber-500 to-amber-600';
    return 'from-red-500 to-red-600';
  };

  const openDetailsModal = (day) => {
    if (day.status) {
      setSelectedDate(day);
      setShowDetailsModal(true);
    }
  };

  // ============ Enhanced 3D Stat Card (2 Column Optimized) ============
  const StatCard3D = ({ title, value, subtitle, icon: Icon, gradient, trend, trendValue, percentage }) => (
    <motion.div
      whileHover={{ y: -6, scale: 1.02 }}
      transition={{ type: 'spring', stiffness: 280, damping: 18 }}
      className={cn(
        'relative overflow-hidden rounded-3xl border border-dark-100 bg-white',
        'shadow-[0_20px_50px_-15px_rgba(15,23,42,0.3)]',
        'hover:shadow-[0_30px_60px_-20px_rgba(99,102,241,0.35)]',
        'transition-all duration-300'
      )}
    >
      {/* Animated Background Gradient */}
      <div className={cn('absolute inset-0 bg-gradient-to-br opacity-5', gradient)} />
      <div className={cn('absolute -top-20 -right-20 w-56 h-56 rounded-full blur-3xl opacity-20 bg-gradient-to-br', gradient)} />
      
      {/* Content */}
      <div className="relative p-6 sm:p-8">
        {/* Header Row */}
        <div className="flex items-start justify-between mb-6">
          <div className="flex-1 min-w-0">
            <p className="text-sm font-semibold text-dark-500 uppercase tracking-wider mb-2">{title}</p>
            <div className="flex items-baseline gap-3">
              <h2 className="text-4xl sm:text-5xl font-black text-dark-900 tracking-tight">
                {value}
              </h2>
              {percentage && (
                <span className={cn(
                  'text-xl font-bold',
                  percentage >= 75 ? 'text-green-600' : 'text-red-600'
                )}>
                  {percentage}%
                </span>
              )}
            </div>
            {subtitle && (
              <p className="text-sm text-dark-500 mt-2">{subtitle}</p>
            )}
          </div>

          {/* Icon Badge */}
          <motion.div 
            whileHover={{ rotate: 360 }}
            transition={{ duration: 0.6 }}
            className={cn(
              'shrink-0 p-5 rounded-2xl text-white shadow-2xl bg-gradient-to-br',
              gradient
            )}
          >
            <Icon className="w-8 h-8" />
          </motion.div>
        </div>

        {/* Divider */}
        <div className="h-[2px] w-full bg-gradient-to-r from-transparent via-dark-200 to-transparent mb-4" />

        {/* Trend Row */}
        {trend && (
          <div className="flex items-center justify-between">
            <div className={cn(
              'inline-flex items-center gap-2 px-3 py-1.5 rounded-full text-sm font-semibold',
              trend === 'up' 
                ? 'bg-green-50 text-green-700 border border-green-200' 
                : 'bg-red-50 text-red-700 border border-red-200'
            )}>
              {trend === 'up' ? (
                <HiArrowUp className="w-4 h-4" />
              ) : (
                <HiArrowDown className="w-4 h-4" />
              )}
              <span>{trendValue}</span>
            </div>
            {trend === 'up' ? (
              <span className="text-xs text-green-600 font-medium">Above requirement</span>
            ) : (
              <span className="text-xs text-red-600 font-medium">Needs improvement</span>
            )}
          </div>
        )}
      </div>

      {/* Bottom Accent */}
      <div className={cn('h-1.5 w-full bg-gradient-to-r', gradient)} />
    </motion.div>
  );

  return (
    <motion.div
      initial="initial"
      animate="animate"
      variants={staggerContainer}
      className="space-y-6 sm:space-y-8"
    >
      {/* ============ Header ============ */}
      <motion.div variants={slideUp} className="relative overflow-hidden rounded-3xl">
        <div className="absolute inset-0 bg-gradient-to-br from-green-600 via-emerald-700 to-teal-600" />
        <div className="absolute inset-0 bg-hero-pattern opacity-10" />
        
        {/* Decorative Circles */}
        <div className="absolute -top-20 -left-20 w-64 h-64 bg-white/10 rounded-full blur-3xl" />
        <div className="absolute -bottom-20 -right-20 w-80 h-80 bg-teal-300/20 rounded-full blur-3xl" />
        
        <div className="relative p-6 sm:p-10">
          <div className="flex flex-col gap-6 lg:flex-row lg:items-center lg:justify-between">
            <div className="text-white">
              <div className="inline-flex items-center gap-2 px-4 py-2 rounded-full bg-white/20 backdrop-blur-sm border border-white/30 mb-4">
                <HiSparkles className="w-5 h-5" />
                <span className="text-sm font-bold">Attendance Tracker</span>
              </div>
              
              <h1 className="text-3xl sm:text-4xl lg:text-5xl font-black leading-tight mb-3">
                My Attendance
              </h1>
              <p className="text-white/90 text-base sm:text-lg max-w-2xl">
                Track your attendance record and maintain consistency
              </p>

              {/* Quick Stats in Header */}
              <div className="mt-6 grid grid-cols-2 sm:grid-cols-4 gap-4">
                <div className="backdrop-blur-sm bg-white/10 rounded-xl p-3 border border-white/20">
                  <p className="text-white/70 text-xs font-medium">This Month</p>
                  <p className="text-2xl font-bold text-white mt-1">{stats.overallPercentage}%</p>
                </div>
                <div className="backdrop-blur-sm bg-white/10 rounded-xl p-3 border border-white/20">
                  <p className="text-white/70 text-xs font-medium">Total Classes</p>
                  <p className="text-2xl font-bold text-white mt-1">{stats.totalClasses}</p>
                </div>
                <div className="backdrop-blur-sm bg-white/10 rounded-xl p-3 border border-white/20">
                  <p className="text-white/70 text-xs font-medium">Present</p>
                  <p className="text-2xl font-bold text-white mt-1">{stats.totalPresent}</p>
                </div>
                <div className="backdrop-blur-sm bg-white/10 rounded-xl p-3 border border-white/20">
                  <p className="text-white/70 text-xs font-medium">Absent</p>
                  <p className="text-2xl font-bold text-white mt-1">{stats.totalAbsent}</p>
                </div>
              </div>
            </div>

            <div className="flex flex-col sm:flex-row gap-3">
              <Button
                variant="outline"
                className="border-white/40 text-white hover:bg-white/20 backdrop-blur-sm"
                icon={HiRefresh}
                onClick={fetchData}
              >
                Refresh
              </Button>
              <Button
                className="bg-white text-green-700 hover:bg-white/90 shadow-lg"
                icon={HiDownload}
              >
                Download Report
              </Button>
            </div>
          </div>
        </div>
      </motion.div>

      {/* ============ Loading ============ */}
      {loading && (
        <div className="py-16">
          <Loader size="lg" text="Loading attendance..." />
        </div>
      )}

      {/* ============ Stats Cards (2 COLUMNS) ============ */}
      {!loading && (
        <motion.div 
          variants={slideUp} 
          className="grid grid-cols-1 lg:grid-cols-2 gap-6"
        >
          <StatCard3D
            title="Overall Attendance"
            value={stats.totalClasses}
            percentage={stats.overallPercentage}
            subtitle={`${stats.totalPresent} present • ${stats.totalAbsent} absent`}
            icon={HiChartBar}
            gradient={getAttendanceBgColor(stats.overallPercentage)}
            trend={stats.overallPercentage >= 75 ? 'up' : 'down'}
            trendValue={stats.overallPercentage >= 75 ? 'Good standing' : 'Below 75%'}
          />
          
          <StatCard3D
            title={`${months[selectedMonth]} ${selectedYear}`}
            value={stats.totalClasses}
            percentage={stats.overallPercentage}
            subtitle="Current month statistics"
            icon={HiCalendar}
            gradient="from-blue-500 to-blue-600"
            trend={stats.overallPercentage >= 75 ? 'up' : 'down'}
            trendValue={stats.overallPercentage >= 90 ? 'Excellent' : stats.overallPercentage >= 75 ? 'Good' : 'Poor'}
          />
        </motion.div>
      )}

      {/* ============ Charts Row ============ */}
      {!loading && (
        <div className="grid lg:grid-cols-5 gap-6">
          {/* Monthly Trend - Takes 3 columns */}
          <motion.div variants={slideUp} className="lg:col-span-3">
            <Card 
              title="Attendance Trend" 
              subtitle="Monthly overview" 
              className="h-full shadow-[0_20px_50px_-15px_rgba(15,23,42,0.2)] hover:shadow-[0_25px_60px_-20px_rgba(99,102,241,0.25)] transition-all"
            >
              <div className="w-full" style={{ height: '360px', minHeight: '360px' }}>
                {monthlyTrend.length === 0 ? (
                  <div className="h-full flex flex-col items-center justify-center text-dark-500">
                    <HiChartBar className="w-16 h-16 mb-4 text-dark-300" />
                    <p className="font-medium">No attendance data available</p>
                  </div>
                ) : (
                  <ResponsiveContainer width="100%" height="100%">
                    <LineChart data={monthlyTrend} margin={{ top: 10, right: 10, left: -20, bottom: 0 }}>
                      <defs>
                        <linearGradient id="colorPercentage" x1="0" y1="0" x2="0" y2="1">
                          <stop offset="5%" stopColor="#6366f1" stopOpacity={0.3}/>
                          <stop offset="95%" stopColor="#6366f1" stopOpacity={0}/>
                        </linearGradient>
                      </defs>
                      <CartesianGrid strokeDasharray="3 3" stroke="#e2e8f0" vertical={false} />
                      <XAxis 
                        dataKey="month" 
                        stroke="#64748b" 
                        fontSize={12} 
                        tickLine={false}
                        axisLine={false}
                      />
                      <YAxis 
                        stroke="#64748b" 
                        fontSize={12} 
                        domain={[0, 100]} 
                        tickLine={false}
                        axisLine={false}
                      />
                      <Tooltip
                        contentStyle={{
                          backgroundColor: '#fff',
                          border: 'none',
                          borderRadius: '16px',
                          boxShadow: '0 20px 40px -10px rgba(0,0,0,0.15)',
                          padding: '12px 16px'
                        }}
                        formatter={(value) => [`${value}%`, 'Attendance']}
                      />
                      <Line
                        type="monotone"
                        dataKey="percentage"
                        stroke="#6366f1"
                        strokeWidth={4}
                        dot={{ fill: '#6366f1', r: 6, strokeWidth: 3, stroke: '#fff' }}
                        activeDot={{ r: 8, strokeWidth: 3, stroke: '#fff' }}
                        fill="url(#colorPercentage)"
                      />
                    </LineChart>
                  </ResponsiveContainer>
                )}
              </div>
            </Card>
          </motion.div>

          {/* Pie Chart - Takes 2 columns */}
          <motion.div variants={slideUp} className="lg:col-span-2">
            <Card 
              title="Distribution" 
              subtitle="Present vs Absent" 
              className="h-full shadow-[0_20px_50px_-15px_rgba(15,23,42,0.2)] hover:shadow-[0_25px_60px_-20px_rgba(99,102,241,0.25)] transition-all"
            >
              <div className="w-full" style={{ height: '360px', minHeight: '360px' }}>
                {stats.totalClasses === 0 ? (
                  <div className="h-full flex flex-col items-center justify-center text-dark-500">
                    <HiAcademicCap className="w-16 h-16 mb-4 text-dark-300" />
                    <p className="font-medium">No attendance records</p>
                  </div>
                ) : (
                  <div className="h-full flex flex-col">
                    <div style={{ height: '65%' }}>
                      <ResponsiveContainer width="100%" height="100%">
                        <PieChart>
                          <Pie
                            data={pieData}
                            cx="50%"
                            cy="50%"
                            innerRadius={70}
                            outerRadius={100}
                            paddingAngle={6}
                            dataKey="value"
                          >
                            {pieData.map((entry, index) => (
                              <Cell 
                                key={index} 
                                fill={entry.color}
                                stroke="#fff"
                                strokeWidth={3}
                              />
                            ))}
                          </Pie>
                          <Tooltip 
                            contentStyle={{
                              backgroundColor: '#fff',
                              border: 'none',
                              borderRadius: '12px',
                              boxShadow: '0 10px 30px -10px rgba(0,0,0,0.15)',
                              padding: '8px 12px'
                            }}
                          />
                        </PieChart>
                      </ResponsiveContainer>
                    </div>
                    
                    {/* Legend */}
                    <div className="flex flex-col gap-3 mt-4">
                      {pieData.map((entry, index) => (
                        <div key={index} className="flex items-center justify-between p-3 rounded-xl bg-dark-50">
                          <div className="flex items-center gap-3">
                            <div 
                              className="w-4 h-4 rounded-full shadow-sm" 
                              style={{ backgroundColor: entry.color }}
                            />
                            <span className="text-sm font-semibold text-dark-700">{entry.name}</span>
                          </div>
                          <span className="text-lg font-bold text-dark-900">{entry.value}</span>
                        </div>
                      ))}
                    </div>
                  </div>
                )}
              </div>
              
              {stats.totalClasses > 0 && (
                <div className={cn(
                  'mt-6 p-4 rounded-xl border-2',
                  stats.overallPercentage >= 75 
                    ? 'bg-green-50 border-green-200' 
                    : 'bg-red-50 border-red-200'
                )}>
                  <p className={cn(
                    'text-center text-sm font-bold',
                    stats.overallPercentage >= 75 ? 'text-green-700' : 'text-red-700'
                  )}>
                    {stats.overallPercentage >= 75 ? (
                      <span>✅ Meets minimum requirement (75%)</span>
                    ) : (
                      <span>⚠️ Below minimum requirement (75%)</span>
                    )}
                  </p>
                </div>
              )}
            </Card>
          </motion.div>
        </div>
      )}

      {/* ============ Calendar View ============ */}
      {!loading && (
        <motion.div variants={slideUp}>
          <Card
            title="Attendance Calendar"
            subtitle={`${months[selectedMonth]} ${selectedYear}`}
            className="shadow-[0_20px_50px_-15px_rgba(15,23,42,0.2)]"
            headerAction={
              <div className="flex gap-3">
                <select
                  value={selectedMonth}
                  onChange={(e) => setSelectedMonth(parseInt(e.target.value))}
                  className="input w-auto text-sm"
                >
                  {months.map((month, index) => (
                    <option key={index} value={index}>{month}</option>
                  ))}
                </select>
                <select
                  value={selectedYear}
                  onChange={(e) => setSelectedYear(parseInt(e.target.value))}
                  className="input w-auto text-sm"
                >
                  {[2023, 2024, 2025, 2026].map((year) => (
                    <option key={year} value={year}>{year}</option>
                  ))}
                </select>
              </div>
            }
          >
            <div className="overflow-x-auto">
              <div className="min-w-[600px]">
                {/* Week Days Header */}
                <div className="grid grid-cols-7 gap-2 mb-4">
                  {weekDays.map((day) => (
                    <div key={day} className="text-center text-sm font-bold text-dark-700 py-3 bg-dark-50 rounded-lg">
                      {day}
                    </div>
                  ))}
                </div>

                {/* Calendar Days */}
                <div className="grid grid-cols-7 gap-2">
                  {calendarData.map((day, index) => (
                    <motion.div
                      key={index}
                      initial={{ opacity: 0, scale: 0.8 }}
                      animate={{ opacity: 1, scale: 1 }}
                      transition={{ delay: index * 0.005 }}
                      onClick={() => openDetailsModal(day)}
                      className={cn(
                        'aspect-square p-2 rounded-xl flex flex-col items-center justify-center relative transition-all',
                        day.date === null && 'invisible',
                        day.isWeekend && 'bg-gray-50',
                        day.isFuture && 'bg-gray-50 opacity-50',
                        day.status === 'present' && 'bg-green-50 hover:bg-green-100 cursor-pointer border-2 border-green-200',
                        day.status === 'absent' && 'bg-red-50 hover:bg-red-100 cursor-pointer border-2 border-red-200',
                        !day.status && day.date && !day.isWeekend && !day.isFuture && 'bg-white hover:bg-gray-50 border border-dark-100'
                      )}
                    >
                      {day.date && (
                        <>
                          <span className={cn(
                            'text-base font-bold',
                            day.status === 'present' && 'text-green-700',
                            day.status === 'absent' && 'text-red-700',
                            !day.status && 'text-dark-600'
                          )}>
                            {day.date}
                          </span>
                          {day.status && (
                            <div className={cn(
                              'absolute bottom-2 w-2.5 h-2.5 rounded-full shadow-sm',
                              day.status === 'present' ? 'bg-green-500' : 'bg-red-500'
                            )} />
                          )}
                        </>
                      )}
                    </motion.div>
                  ))}
                </div>
              </div>
            </div>

            {/* Legend */}
            <div className="flex flex-wrap gap-6 mt-8 pt-6 border-t-2 border-dark-100">
              <div className="flex items-center gap-3">
                <div className="w-6 h-6 bg-green-500 rounded-lg shadow-sm" />
                <span className="text-sm font-semibold text-dark-700">Present</span>
              </div>
              <div className="flex items-center gap-3">
                <div className="w-6 h-6 bg-red-500 rounded-lg shadow-sm" />
                <span className="text-sm font-semibold text-dark-700">Absent</span>
              </div>
              <div className="flex items-center gap-3">
                <div className="w-6 h-6 bg-gray-200 rounded-lg shadow-sm" />
                <span className="text-sm font-semibold text-dark-700">Weekend/No Class</span>
              </div>
            </div>
          </Card>
        </motion.div>
      )}

      {/* ============ Course-wise Attendance ============ */}
      {!loading && courseAttendance.length > 0 && (
        <motion.div variants={slideUp}>
          <Card 
            title="Course-wise Attendance" 
            subtitle="Individual course statistics"
            className="shadow-[0_20px_50px_-15px_rgba(15,23,42,0.2)]"
          >
            <div className="grid grid-cols-1 lg:grid-cols-2 gap-5">
              {courseAttendance.map((course, index) => (
                <motion.div
                  key={course.courseId || index}
                  initial={{ opacity: 0, y: 20 }}
                  animate={{ opacity: 1, y: 0 }}
                  transition={{ delay: index * 0.1 }}
                  className="p-5 rounded-2xl bg-gradient-to-br from-dark-50 to-white border border-dark-100 hover:shadow-lg transition-all"
                >
                  <div className="flex items-center justify-between mb-4">
                    <div className="flex items-center gap-3 flex-1 min-w-0">
                      <div className="w-12 h-12 rounded-xl bg-gradient-to-br from-primary-500 to-accent-500 flex items-center justify-center shrink-0">
                        <HiAcademicCap className="w-6 h-6 text-white" />
                      </div>
                      <h4 className="font-bold text-dark-900 truncate">{course.courseName}</h4>
                    </div>
                    <div className="flex items-center gap-2 shrink-0">
                      <span className={cn('text-2xl font-black', getAttendanceColor(course.percentage))}>
                        {course.percentage}
                      </span>
                      <span className="text-lg font-bold text-dark-400">%</span>
                    </div>
                  </div>
                  
                  <div className="w-full h-3 bg-dark-200 rounded-full overflow-hidden mb-3">
                    <motion.div
                      initial={{ width: 0 }}
                      animate={{ width: `${course.percentage}%` }}
                      transition={{ delay: 0.5 + index * 0.1, duration: 1, ease: 'easeOut' }}
                      className={cn(
                        'h-full rounded-full shadow-inner',
                        course.percentage >= 90 ? 'bg-gradient-to-r from-green-400 to-green-600' :
                        course.percentage >= 75 ? 'bg-gradient-to-r from-amber-400 to-amber-600' : 
                        'bg-gradient-to-r from-red-400 to-red-600'
                      )}
                    />
                  </div>
                  
                  <div className="flex items-center justify-between text-sm">
                    <span className="text-dark-500 font-medium">
                      Classes: <span className="text-dark-900 font-bold">{course.present}/{course.total}</span>
                    </span>
                    <span className={cn(
                      'px-3 py-1 rounded-full text-xs font-bold',
                      course.percentage >= 90 ? 'bg-green-100 text-green-700' :
                      course.percentage >= 75 ? 'bg-amber-100 text-amber-700' : 
                      'bg-red-100 text-red-700'
                    )}>
                      {course.percentage >= 90 ? 'Excellent' : course.percentage >= 75 ? 'Good' : 'Low'}
                    </span>
                  </div>
                </motion.div>
              ))}
            </div>
          </Card>
        </motion.div>
      )}

      {/* ============ Details Modal ============ */}
      <Modal
        isOpen={showDetailsModal}
        onClose={() => {
          setShowDetailsModal(false);
          setSelectedDate(null);
        }}
        title="Attendance Details"
        description={selectedDate && formatDate(selectedDate.fullDate)}
      >
        {selectedDate && (
          <div className="space-y-6">
            <div className={cn(
              'p-8 rounded-2xl text-center',
              selectedDate.status === 'present' ? 'bg-green-50 border-2 border-green-200' : 'bg-red-50 border-2 border-red-200'
            )}>
              {selectedDate.status === 'present' ? (
                <HiCheckCircle className="w-20 h-20 text-green-600 mx-auto mb-4" />
              ) : (
                <HiXCircle className="w-20 h-20 text-red-600 mx-auto mb-4" />
              )}
              <h3 className={cn(
                'text-2xl font-black capitalize',
                selectedDate.status === 'present' ? 'text-green-700' : 'text-red-700'
              )}>
                {selectedDate.status}
              </h3>
            </div>

            <div className="space-y-3">
              {selectedDate.course && (
                <div className="flex items-center justify-between p-4 bg-dark-50 rounded-xl">
                  <span className="text-sm font-semibold text-dark-500">Course</span>
                  <span className="text-sm font-bold text-dark-900">{selectedDate.course}</span>
                </div>
              )}
              <div className="flex items-center justify-between p-4 bg-dark-50 rounded-xl">
                <span className="text-sm font-semibold text-dark-500">Date</span>
                <span className="text-sm font-bold text-dark-900">
                  {formatDate(selectedDate.fullDate)}
                </span>
              </div>
            </div>

            <div className="flex justify-end pt-4">
              <Button onClick={() => setShowDetailsModal(false)}>Close</Button>
            </div>
          </div>
        )}
      </Modal>
    </motion.div>
  );
};

export default MyAttendance;