// src/pages/Home.jsx
import React from 'react';
import { Link } from 'react-router-dom';
import { motion } from 'framer-motion';
import { useAuth } from '../hooks/useAuth';
import Button from '../components/common/Button';
import {
  HiAcademicCap,
  HiUsers,
  HiClipboardList,
  HiChartBar,
  HiCheckCircle,
  HiArrowRight,
  HiPlay,
  HiStar,
  HiLightningBolt,
} from 'react-icons/hi';
import { staggerContainer, slideUp } from '../utils/constants';
import Footer from '../components/common/Footer';

const Home = () => {
  const { isAuthenticated, user, getDashboardRoute } = useAuth();

  const features = [
    {
      icon: HiAcademicCap,
      title: 'Course Management',
      description: 'Create and manage courses with ease. Upload lectures, materials, and resources.',
      color: 'from-blue-500 to-blue-600',
    },
    {
      icon: HiClipboardList,
      title: 'Assignments & Quizzes',
      description: 'Create assignments, quizzes, and track student submissions and grades.',
      color: 'from-green-500 to-green-600',
    },
    {
      icon: HiChartBar,
      title: 'Attendance Tracking',
      description: 'Mark and monitor attendance for both students and teachers.',
      color: 'from-purple-500 to-purple-600',
    },
    {
      icon: HiUsers,
      title: 'User Management',
      description: 'Manage students, teachers, and administrators with role-based access.',
      color: 'from-orange-500 to-orange-600',
    },
  ];

  const stats = [
    { value: '10K+', label: 'Active Students' },
    { value: '500+', label: 'Courses' },
    { value: '100+', label: 'Expert Teachers' },
    { value: '95%', label: 'Satisfaction Rate' },
  ];

  const testimonials = [
    {
      name: 'Sarah Johnson',
      role: 'Computer Science Student',
      image: 'https://randomuser.me/api/portraits/women/1.jpg',
      content:
        'This platform transformed my learning experience. The courses are well-structured and the instructors are amazing!',
      rating: 5,
    },
    {
      name: 'Michael Chen',
      role: 'Data Science Teacher',
      image: 'https://randomuser.me/api/portraits/men/2.jpg',
      content:
        'Managing my courses and tracking student progress has never been easier. Highly recommended for educators!',
      rating: 5,
    },
    {
      name: 'Emily Davis',
      role: 'Marketing Student',
      image: 'https://randomuser.me/api/portraits/women/3.jpg',
      content: 'The interactive assignments and real-time feedback helped me improve my skills significantly.',
      rating: 5,
    },
  ];

  /**
   * BEAUTIFUL 3D CARD
   * - true 3D tilt (rotateX/rotateY) with perspective
   * - glossy "shine" sweep
   * - gradient glow + bottom accent bar
   * - premium shadows + subtle border highlight
   */
  const Card3D = ({ children, accent = 'from-primary-500 to-accent-500', className = '' }) => (
    <div style={{ perspective: 1200 }} className="group">
      <motion.div
        whileHover={{ y: -10, rotateX: 7, rotateY: -7 }}
        whileTap={{ scale: 0.99 }}
        transition={{ type: 'spring', stiffness: 240, damping: 18 }}
        style={{ transformStyle: 'preserve-3d' }}
        className={[
          'relative overflow-hidden rounded-3xl',
          'border border-dark-100/70',
          'bg-white/80 backdrop-blur-md',
          'shadow-[0_25px_60px_-30px_rgba(15,23,42,0.35)]',
          'hover:shadow-[0_40px_90px_-45px_rgba(99,102,241,0.30)]',
          'transition-all',
          className,
        ].join(' ')}
      >
        {/* Gradient glow blob */}
        <div className={`absolute -top-24 -right-24 w-72 h-72 rounded-full blur-3xl opacity-25 bg-gradient-to-br ${accent}`} />

        {/* Subtle pattern */}
        <div className="absolute inset-0 bg-hero-pattern opacity-[0.06]" />

        {/* Inner highlight border */}
        <div className="absolute inset-0 rounded-3xl ring-1 ring-white/60 pointer-events-none" />

        {/* Glossy shine sweep */}
        <div
          className={[
            'pointer-events-none absolute -inset-y-10 left-0 w-1/2',
            'bg-gradient-to-r from-white/0 via-white/40 to-white/0',
            'rotate-12',
            '-translate-x-[160%] group-hover:translate-x-[220%]',
            'transition-transform duration-1000 ease-out',
            'opacity-60',
          ].join(' ')}
        />

        {/* Content */}
        <div className="relative z-10">{children}</div>

        {/* Bottom accent bar */}
        <div className={`absolute bottom-0 left-0 right-0 h-1.5 bg-gradient-to-r ${accent}`} />
      </motion.div>
    </div>
  );

  return (
    <div className="min-h-screen bg-white">
      {/* Navbar */}
      <motion.nav
        initial={{ y: -100 }}
        animate={{ y: 0 }}
        className={[
          'fixed w-full z-50',
          'backdrop-blur-xl bg-white/70',
          'border-b border-white/30',
          'shadow-[0_12px_30px_-18px_rgba(15,23,42,0.35)]',
        ].join(' ')}
      >
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
          <div className="flex justify-between items-center h-16">
            <Link to="/" className="flex items-center gap-2">
              <div className="relative">
                <div className="w-10 h-10 rounded-xl bg-gradient-to-br from-primary-500 to-accent-500 flex items-center justify-center shadow-lg shadow-primary-500/25">
                  <span className="text-white font-extrabold text-lg">L</span>
                </div>
                <div className="absolute -inset-2 bg-primary-500/20 blur-xl rounded-2xl -z-10" />
              </div>
              <span className="text-xl font-extrabold text-dark-900">LMS</span>
              <span className="text-xl font-light text-dark-500">System</span>
            </Link>

            <div className="flex items-center gap-3 sm:gap-4">
              {isAuthenticated ? (
                <Link to={getDashboardRoute(user?.role)}>
                  <Button icon={HiArrowRight} iconPosition="right">
                    Go to Dashboard
                  </Button>
                </Link>
              ) : (
                <>
                  <Link to="/login">
                    <Button variant="ghost">Sign In</Button>
                  </Link>
                  <Link to="/register">
                    <Button>Get Started</Button>
                  </Link>
                </>
              )}
            </div>
          </div>
        </div>
      </motion.nav>

      {/* Hero Section */}
      <section className="relative pt-28 pb-16 lg:pt-36 lg:pb-24 overflow-hidden">
        <div className="absolute inset-0 bg-gradient-to-br from-blue-700 via-violet-700 to-fuchsia-600 backdrop-blur-lg" />
        <div className="absolute inset-0 bg-hero-pattern opacity-40" />

        <div className="absolute -top-24 -left-24 w-72 h-72 bg-primary-500/15 rounded-full blur-3xl" />
        <div className="absolute -bottom-28 -right-28 w-96 h-96 bg-accent-500/15 rounded-full blur-3xl" />

        <motion.div
          animate={{ y: [0, -18, 0], rotate: [0, 6, 0] }}
          transition={{ duration: 7, repeat: Infinity, ease: 'easeInOut' }}
          className="absolute top-36 left-10 w-20 h-20 bg-primary-500/25 rounded-2xl blur-xl"
        />
        <motion.div
          animate={{ y: [0, 18, 0], rotate: [0, -6, 0] }}
          transition={{ duration: 9, repeat: Infinity, ease: 'easeInOut' }}
          className="absolute bottom-20 right-16 w-28 h-28 bg-accent-500/25 rounded-full blur-2xl"
        />

        <div className="relative max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
          <motion.div initial="initial" animate="animate" variants={staggerContainer} className="text-center max-w-4xl mx-auto">
            <motion.div
              variants={slideUp}
              className="inline-flex items-center gap-2 px-4 py-2 bg-white/70 backdrop-blur-sm border border-white/50 rounded-full text-primary-700 text-sm font-semibold shadow-[0_12px_30px_-18px_rgba(15,23,42,0.35)]"
            >
              <HiLightningBolt className="w-4 h-4" />
              #1 Learning Management Platform
            </motion.div>

            <motion.h1 variants={slideUp} className="mt-6 text-4xl sm:text-5xl lg:text-6xl font-extrabold text-yellow-50 leading-tight">
              Transform Your
              <span className="block text-gradient">Learning Experience</span>
            </motion.h1>

            <motion.p variants={slideUp} className="mt-6 text-lg sm:text-xl text-yellow-50 max-w-2xl mx-auto">
              A comprehensive Learning Management System designed for modern education. Manage courses, track progress,
              and achieve academic excellence.
            </motion.p>

            <motion.div variants={slideUp} className="mt-10 flex flex-col sm:flex-row justify-center gap-4">
              <Link to="/register" className="w-full sm:w-auto">
                <Button size="xl" icon={HiArrowRight} iconPosition="right" className="w-full sm:w-auto">
                  Start Learning Free
                </Button>
              </Link>
              <Button size="xl" variant="outline" icon={HiPlay} className="w-full sm:w-auto text-yellow-50">
                Watch Demo
              </Button>
            </motion.div>

            {/* Stats (now as premium 3D cards) */}
            <motion.div variants={slideUp} className="mt-14 grid grid-cols-2 md:grid-cols-4 gap-5">
              {stats.map((stat, index) => (
                <motion.div
                  key={index}
                  initial={{ opacity: 0, y: 14 }}
                  animate={{ opacity: 1, y: 0 }}
                  transition={{ delay: 0.45 + index * 0.08 }}
                >
                  <Card3D accent="from-primary-500 to-accent-500" className="p-4">
                    <div className="text-center">
                      <div className="text-3xl sm:text-4xl font-extrabold text-dark-900">{stat.value}</div>
                      <div className="text-dark-500 mt-1 text-sm">{stat.label}</div>
                    </div>
                  </Card3D>
                </motion.div>
              ))}
            </motion.div>
          </motion.div>
        </div>
      </section>

      {/* Features Section */}
      <section className="py-16 lg:py-24 bg-white">
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
          <motion.div
            initial={{ opacity: 0, y: 14 }}
            whileInView={{ opacity: 1, y: 0 }}
            viewport={{ once: true }}
            className="text-center max-w-3xl mx-auto mb-12"
          >
            <h2 className="text-3xl sm:text-4xl font-extrabold text-dark-900 mb-4">
              Everything You Need to <span className="text-gradient">Succeed</span>
            </h2>
            <p className="text-dark-600 text-lg">All the tools necessary for effective teaching and learning.</p>
          </motion.div>

          <div className="grid md:grid-cols-2 lg:grid-cols-4 gap-6">
            {features.map((feature, index) => (
              <motion.div
                key={index}
                initial={{ opacity: 0, y: 14 }}
                whileInView={{ opacity: 1, y: 0 }}
                viewport={{ once: true }}
                transition={{ delay: index * 0.08 }}
              >
                <Card3D accent={feature.color} className="p-6">
                  {/* Icon chip (with glow) */}
                  <div className="relative mb-5">
                    <div className={`w-14 h-14 rounded-2xl bg-gradient-to-br ${feature.color} flex items-center justify-center shadow-[0_18px_40px_-18px_rgba(0,0,0,0.45)]`}>
                      <feature.icon className="h-7 w-7 text-white" />
                    </div>
                    <div className={`absolute -inset-4 rounded-3xl blur-2xl opacity-25 bg-gradient-to-br ${feature.color}`} />
                  </div>

                  <h3 className="text-xl font-extrabold text-dark-900 mb-2">{feature.title}</h3>
                  <p className="text-dark-600 leading-relaxed">{feature.description}</p>

                  {/* tiny separator */}
                  <div className="mt-5 h-[1px] bg-gradient-to-r from-transparent via-dark-200 to-transparent" />

                  <div className="mt-4 text-sm font-semibold text-primary-700/90">
                    Learn more
                  </div>
                </Card3D>
              </motion.div>
            ))}
          </div>
        </div>
      </section>

      {/* Benefits Section */}
      <section className="py-16 lg:py-24 bg-dark-50">
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
          <div className="grid lg:grid-cols-2 gap-10 lg:gap-16 items-center">
            <motion.div initial={{ opacity: 0, x: -18 }} whileInView={{ opacity: 1, x: 0 }} viewport={{ once: true }}>
              <h2 className="text-3xl sm:text-4xl font-extrabold text-dark-900 mb-6">
                Why Choose Our <span className="text-gradient">LMS Platform?</span>
              </h2>
              <p className="text-dark-600 text-lg mb-8">
                We built an intuitive, reliable system to help educators and students achieve their goals.
              </p>

              <div className="space-y-4">
                {[
                  'Easy to use interface for all users',
                  'Real-time progress tracking and analytics',
                  'Secure and reliable platform',
                  'Mobile-friendly responsive design',
                  'Comprehensive reporting tools',
                  '24/7 support and assistance',
                ].map((benefit, index) => (
                  <motion.div
                    key={index}
                    initial={{ opacity: 0, x: -10 }}
                    whileInView={{ opacity: 1, x: 0 }}
                    viewport={{ once: true }}
                    transition={{ delay: index * 0.08 }}
                    className="flex items-center gap-3"
                  >
                    <div className="w-7 h-7 rounded-full bg-green-100 flex items-center justify-center flex-shrink-0 shadow-[0_14px_30px_-18px_rgba(34,197,94,0.9)]">
                      <HiCheckCircle className="w-4 h-4 text-green-600" />
                    </div>
                    <span className="text-dark-700">{benefit}</span>
                  </motion.div>
                ))}
              </div>

              <div className="mt-10">
                <Link to="/register">
                  <Button size="lg" icon={HiArrowRight} iconPosition="right">
                    Get Started Now
                  </Button>
                </Link>
              </div>
            </motion.div>

            {/* Right demo card (extra premium) */}
            <motion.div initial={{ opacity: 0, x: 18 }} whileInView={{ opacity: 1, x: 0 }} viewport={{ once: true }}>
              <Card3D accent="from-primary-500 to-accent-500" className="p-8">
                <div className="aspect-video bg-dark-100 rounded-2xl mb-6 flex items-center justify-center overflow-hidden relative">
                  <div className="absolute inset-0 bg-gradient-to-br from-primary-500/20 to-accent-500/20" />
                  <motion.div
                    whileHover={{ scale: 1.08 }}
                    className="relative w-20 h-20 rounded-full bg-primary-600 flex items-center justify-center cursor-pointer shadow-lg shadow-primary-500/30"
                  >
                    <HiPlay className="w-8 h-8 text-white ml-1" />
                  </motion.div>
                </div>
                <h3 className="text-xl font-extrabold text-dark-900 mb-2">See it in action</h3>
                <p className="text-dark-500">Watch a quick demo of our platform features.</p>
              </Card3D>
            </motion.div>
          </div>
        </div>
      </section>

      {/* Testimonials */}
      <section className="py-16 lg:py-24 bg-white">
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
          <motion.div
            initial={{ opacity: 0, y: 14 }}
            whileInView={{ opacity: 1, y: 0 }}
            viewport={{ once: true }}
            className="text-center max-w-3xl mx-auto mb-12"
          >
            <h2 className="text-3xl sm:text-4xl font-extrabold text-dark-900 mb-4">
              Loved by Thousands of <span className="text-gradient">Learners</span>
            </h2>
            <p className="text-dark-600 text-lg">See what our users say about their experience.</p>
          </motion.div>

          <div className="grid md:grid-cols-3 gap-6">
            {testimonials.map((t, index) => (
              <motion.div
                key={index}
                initial={{ opacity: 0, y: 14 }}
                whileInView={{ opacity: 1, y: 0 }}
                viewport={{ once: true }}
                transition={{ delay: index * 0.08 }}
              >
                <Card3D accent="from-primary-500 to-accent-500" className="p-6">
                  {/* Stars */}
                  <div className="flex gap-1 mb-4">
                    {[...Array(t.rating)].map((_, i) => (
                      <HiStar key={i} className="w-5 h-5 text-yellow-400 fill-current" />
                    ))}
                  </div>

                  {/* Quote */}
                  <div className="relative">
                    <div className="absolute -top-3 -left-1 text-6xl leading-none text-primary-200 select-none">“</div>
                    <p className="text-dark-600 mb-6 leading-relaxed relative pl-5">"{t.content}"</p>
                  </div>

                  {/* Author */}
                  <div className="flex items-center gap-3">
                    <div className="relative">
                      <img
                        src={t.image}
                        alt={t.name}
                        className="w-12 h-12 rounded-full object-cover ring-2 ring-primary-200"
                      />
                      <div className="absolute -inset-2 rounded-full bg-primary-500/15 blur-xl -z-10" />
                    </div>
                    <div>
                      <h4 className="font-semibold text-dark-900">{t.name}</h4>
                      <p className="text-sm text-dark-500">{t.role}</p>
                    </div>
                  </div>
                </Card3D>
              </motion.div>
            ))}
          </div>
        </div>
      </section>

      {/* CTA Section */}
      <section className="py-16 lg:py-24 relative overflow-hidden">
        <div className="absolute inset-0 bg-gradient-to-br from-primary-600 via-primary-700 to-accent-600" />
        <div className="absolute inset-0 bg-hero-pattern opacity-10" />
        <div className="absolute -top-20 -left-20 w-72 h-72 bg-white/10 rounded-full blur-3xl" />
        <div className="absolute -bottom-24 -right-24 w-96 h-96 bg-white/10 rounded-full blur-3xl" />

        <motion.div
          initial={{ opacity: 0, y: 14 }}
          whileInView={{ opacity: 1, y: 0 }}
          viewport={{ once: true }}
          className="relative max-w-4xl mx-auto px-4 text-center"
        >
          <div className="inline-flex items-center gap-2 px-4 py-2 bg-white/15 backdrop-blur-sm border border-white/20 rounded-full text-white/90 text-sm font-semibold">
            <HiLightningBolt className="w-4 h-4" />
            Start in minutes
          </div>

          <h2 className="mt-6 text-3xl sm:text-4xl lg:text-5xl font-extrabold text-white mb-5">
            Ready to Transform Your Learning Experience?
          </h2>
          <p className="text-lg sm:text-xl text-white/80 mb-10 max-w-2xl mx-auto">
            Join thousands of learners and educators achieving their goals with our platform.
          </p>

          <div className="flex flex-col sm:flex-row justify-center gap-4">
            <Link to="/register" className="w-full sm:w-auto">
              <Button size="xl" className="bg-white text-white hover:bg-dark-100 w-full sm:w-auto">
                Create Free Account
              </Button>
            </Link>
            <Button size="xl" variant="outline" className="border-white text-white hover:bg-white/10 w-full sm:w-auto">
              Contact Sales
            </Button>
          </div>
        </motion.div>
      </section>

      {/* Footer */}
      <Footer />
    </div>
  );
};

export default Home;