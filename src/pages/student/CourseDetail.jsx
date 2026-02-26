// src/pages/student/CourseDetail.jsx
import React, { useEffect, useMemo, useState } from 'react';
import { useNavigate, useParams } from 'react-router-dom';
import { motion } from 'framer-motion';
import {
  HiArrowLeft,
  HiUsers,
  HiClock,
  HiPlay,
  HiCheckCircle,
  HiAcademicCap,
  HiBookOpen,
  HiVideoCamera,
  HiDocumentText,
  HiExternalLink,
  HiChartBar,
} from 'react-icons/hi';

import Card from '../../components/common/Card';
import Button from '../../components/common/Button';
import Loader from '../../components/common/Loader';
import { useApi } from '../../hooks/useApi';
import { studentApi } from '../../api/studentApi';
import { staggerContainer, slideUp } from '../../utils/constants';
import { cn } from '../../utils/helpers';

const StudentCourseDetail = () => {
  const { courseId } = useParams();
  const navigate = useNavigate();
  const { loading, execute } = useApi();

  const [course, setCourse] = useState(null);
  const [activeLectureId, setActiveLectureId] = useState(null);

  // ============ Fetch Course ============
  const fetchCourse = async () => {
    await execute(() => studentApi.getCourse(courseId), {
      showSuccessToast: false,
      onSuccess: (data) => {
        const courseData = data?.data || data || null;
        setCourse(courseData || null);

        if (courseData?.lectures?.length) {
          const firstLecture = courseData.lectures[0];
          setActiveLectureId(firstLecture._id || firstLecture.id);
        }
      },
      onError: () => {
        setCourse(null);
      },
    });
  };

  useEffect(() => {
    if (courseId) {
      fetchCourse();
    }
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [courseId]);

  // ============ Helpers ============

  const extractYouTubeId = (url) => {
    try {
      const u = new URL(url);
      if (u.hostname.includes('youtube.com')) {
        return u.searchParams.get('v');
      }
      if (u.hostname.includes('youtu.be')) {
        return u.pathname.replace('/', '');
      }
      return null;
    } catch {
      return null;
    }
  };

  const getLectureMediaInfo = (lecture) => {
    if (!lecture) return { type: 'none', url: null };

    // Try multiple common field names
    const rawUrl =
      lecture.videoUrl ||
      lecture.video ||
      lecture.mediaUrl ||
      lecture.fileUrl ||
      lecture.url ||
      lecture.link ||
      lecture.videoLink ||
      '';

    if (!rawUrl) return { type: 'none', url: null };

    const url = rawUrl.trim();
    const lower = url.toLowerCase();

    // YouTube links
    if (url.includes('youtube.com') || url.includes('youtu.be')) {
      const videoId = extractYouTubeId(url);
      if (!videoId) return { type: 'external', url }; // fallback as external
      const embedUrl = `https://www.youtube.com/embed/${videoId}`;
      return { type: 'youtube', url: embedUrl };
    }

    // Direct video files
    if (
      lower.endsWith('.mp4') ||
      lower.endsWith('.webm') ||
      lower.endsWith('.ogg')
    ) {
      return { type: 'html5', url };
    }

    // Any other URL – treat as generic external resource
    return { type: 'external', url };
  };

  // Build a URL for media that includes token when hitting your backend
  const buildProtectedMediaUrl = (rawUrl) => {
    if (!rawUrl) return null;

    const apiBase =
      import.meta.env.VITE_API_BASE_URL || 'http://localhost:5000/api';
    const apiOrigin = new URL(apiBase).origin; // e.g. http://localhost:5000

    try {
      // Handle relative paths and absolute URLs
      const urlObj = new URL(rawUrl, apiOrigin);

      // Only attach token for requests to our own backend
      if (urlObj.origin === apiOrigin) {
        const token = localStorage.getItem('accessToken');
        if (token) {
          urlObj.searchParams.set('token', token);
        }
      }

      return urlObj.toString();
    } catch {
      // If URL constructor fails, just return original
      return rawUrl;
    }
  };

  const getCategoryEmoji = (category) => {
    const emojis = {
      'Computer Science': '💻',
      Programming: '⌨️',
      'Web Development': '🌐',
      Database: '🗄️',
      Design: '🎨',
      Business: '📊',
      default: '📚',
    };
    return emojis[category] || emojis.default;
  };

  const getProgressColor = (progress) => {
    if (progress >= 75) return 'from-green-500 to-green-600';
    if (progress >= 50) return 'from-blue-500 to-blue-600';
    if (progress >= 25) return 'from-amber-500 to-amber-600';
    return 'from-red-500 to-red-600';
  };

  // ============ Derived State ============

  const activeLecture = useMemo(() => {
    if (!course?.lectures || !activeLectureId) return null;
    return (
      course.lectures.find(
        (lec) => lec._id === activeLectureId || lec.id === activeLectureId
      ) || course.lectures[0]
    );
  }, [course, activeLectureId]);

  const lectureStats = useMemo(() => {
    const total = course?.lectures?.length || 0;
    const completed =
      course?.lectures?.filter((lec) => lec.completed || lec.isCompleted)
        ?.length || 0;
    const percent = total > 0 ? Math.round((completed / total) * 100) : 0;
    return { total, completed, percent };
  }, [course]);

  const mediaInfo = useMemo(
    () => getLectureMediaInfo(activeLecture),
    [activeLecture]
  );

  const mediaUrl = useMemo(() => {
    if (!mediaInfo.url) return null;
    // For YouTube embed, do not modify
    if (mediaInfo.type === 'youtube') return mediaInfo.url;
    // For anything served from your backend, attach token
    return buildProtectedMediaUrl(mediaInfo.url);
  }, [mediaInfo]);

  const handleSelectLecture = (lectureId) => {
    setActiveLectureId(lectureId);
  };

  const handleBack = () => {
    navigate('/student/courses');
  };

  // ============ Loading / Empty ============
  if (loading && !course) {
    return (
      <div className="py-10">
        <Loader size="lg" text="Loading course details..." />
      </div>
    );
  }

  if (!course) {
    return (
      <div className="space-y-4">
        <Button
          variant="outline"
          icon={HiArrowLeft}
          onClick={handleBack}
          className="mb-2"
        >
          Back to My Courses
        </Button>
        <Card>
          <div className="py-10 text-center">
            <HiAcademicCap className="w-12 h-12 mx-auto mb-3 text-dark-300" />
            <p className="text-dark-600 font-medium">Course not found</p>
            <p className="text-sm text-dark-400 mt-1">
              The course you are looking for does not exist or is not available.
            </p>
          </div>
        </Card>
      </div>
    );
  }

  const { title, description, category, teacher, duration } = course;

  return (
    <motion.div
      initial="initial"
      animate="animate"
      variants={staggerContainer}
      className="space-y-6"
    >
      {/* ============ Header ============ */}
      <motion.div variants={slideUp} className="space-y-4">
        <Button
          variant="outline"
          icon={HiArrowLeft}
          onClick={handleBack}
          className="text-sm"
        >
          Back to My Courses
        </Button>

        <div className="relative overflow-hidden rounded-2xl">
          <div className="absolute inset-0 bg-gradient-to-br from-primary-600 via-primary-700 to-accent-600" />
          <div className="absolute inset-0 bg-hero-pattern opacity-10" />
          <div className="relative p-6 sm:p-8">
            <div className="flex flex-col gap-4 lg:flex-row lg:items-center lg:justify-between">
              <div className="flex gap-4">
                <div className="hidden sm:flex h-14 w-14 sm:h-16 sm:w-16 items-center justify-center rounded-2xl bg-white/10 text-3xl shadow-lg shadow-black/20">
                  {getCategoryEmoji(category)}
                </div>
                <div className="text-white">
                  <p className="inline-flex items-center gap-2 text-xs font-semibold px-3 py-1.5 rounded-full bg-white/15 border border-white/10 backdrop-blur-sm">
                    <span className="text-xs uppercase tracking-wide">
                      {category || 'Course'}
                    </span>
                  </p>
                  <h1 className="mt-3 text-2xl sm:text-3xl font-extrabold leading-tight">
                    {title}
                  </h1>
                  <p className="mt-2 text-sm sm:text-base text-white/80 line-clamp-2">
                    {description || 'No description provided.'}
                  </p>
                  <div className="mt-3 flex flex-wrap items-center gap-4 text-xs sm:text-sm text-white/80">
                    <div className="flex items-center gap-2">
                      <HiUsers className="w-4 h-4" />
                      <span>
                        Instructor:{' '}
                        <span className="font-semibold">
                          {teacher?.name || 'Not assigned'}
                        </span>
                      </span>
                    </div>
                    {duration && (
                      <div className="flex items-center gap-2">
                        <HiClock className="w-4 h-4" />
                        <span>Duration: {duration}</span>
                      </div>
                    )}
                  </div>
                </div>
              </div>

              {/* Progress summary */}
              <div className="mt-4 lg:mt-0 w-full max-w-xs glass-panel bg-white/5 border-white/10">
                <div className="p-4">
                  <div className="flex items-center justify-between">
                    <div>
                      <p className="text-xs text-white/80">Lecture Progress</p>
                      <p className="mt-1 text-2xl font-bold text-white">
                        {lectureStats.percent}%
                      </p>
                    </div>
                    <div className="flex h-10 w-10 items-center justify-center rounded-full bg-white/10">
                      <HiChartBar className="w-5 h-5 text-white" />
                    </div>
                  </div>
                  <div className="mt-3 h-2 w-full rounded-full bg-white/15 overflow-hidden">
                    <div
                      className={cn(
                        'h-full rounded-full bg-gradient-to-r',
                        getProgressColor(lectureStats.percent)
                      )}
                      style={{ width: `${lectureStats.percent}%` }}
                    />
                  </div>
                  <p className="mt-2 text-[11px] text-white/70">
                    {lectureStats.completed} of {lectureStats.total} lectures
                    completed
                  </p>
                </div>
              </div>
            </div>
          </div>
        </div>
      </motion.div>

      {/* ============ Main Content ============ */}
      <motion.div
        variants={slideUp}
        className="grid gap-4 lg:grid-cols-[minmax(0,1.4fr)_minmax(0,2fr)]"
      >
        {/* Left: Lectures list */}
        <Card className="flex flex-col max-h-[32rem]">
          <div className="border-b border-dark-100 pb-3 mb-3 flex items-center justify-between">
            <div>
              <h2 className="text-sm font-semibold text-dark-900">
                Course Content
              </h2>
              <p className="text-xs text-dark-500">
                {lectureStats.total} lectures
              </p>
            </div>
          </div>

          {course?.lectures?.length ? (
            <div className="flex-1 overflow-y-auto space-y-2 pr-1">
              {course.lectures.map((lecture, index) => {
                const id = lecture._id || lecture.id || index;
                const isActive = id === activeLectureId;
                const isCompleted = lecture.completed || lecture.isCompleted;

                return (
                  <button
                    key={id}
                    type="button"
                    onClick={() => handleSelectLecture(id)}
                    className={cn(
                      'w-full text-left rounded-xl border px-3 py-2.5 text-sm flex items-start gap-3 transition-colors',
                      isActive
                        ? 'border-primary-200 bg-primary-50'
                        : 'border-dark-100 hover:bg-dark-50'
                    )}
                  >
                    <div className="mt-1 flex h-7 w-7 items-center justify-center rounded-full bg-primary-100 text-xs font-semibold text-primary-700 flex-shrink-0">
                      {index + 1}
                    </div>
                    <div className="min-w-0 flex-1">
                      <div className="flex items-center justify-between gap-2">
                        <p className="font-medium text-dark-900 truncate">
                          {lecture.title || `Lecture ${index + 1}`}
                        </p>
                        {isCompleted && (
                          <HiCheckCircle className="w-4 h-4 text-green-500 flex-shrink-0" />
                        )}
                      </div>
                      {lecture.duration && (
                        <p className="mt-0.5 text-[11px] text-dark-400">
                          Duration: {lecture.duration}
                        </p>
                      )}
                      {lecture.description && (
                        <p className="mt-1 text-xs text-dark-500 line-clamp-2">
                          {lecture.description}
                        </p>
                      )}
                    </div>
                  </button>
                );
              })}
            </div>
          ) : (
            <div className="flex-1 flex items-center justify-center py-10">
              <div className="text-center">
                <HiBookOpen className="w-10 h-10 mx-auto mb-3 text-dark-300" />
                <p className="text-sm text-dark-500">No lectures available</p>
                <p className="text-xs text-dark-400 mt-1">
                  The instructor has not added any lectures yet.
                </p>
              </div>
            </div>
          )}
        </Card>

        {/* Right: Active lecture viewer */}
        <Card className="space-y-4">
          {!activeLecture ? (
            <div className="py-10 text-center">
              <p className="text-sm text-dark-500">
                Select a lecture from the left to start learning.
              </p>
            </div>
          ) : (
            <>
              {/* Media area */}
              <div className="relative aspect-video w-full overflow-hidden rounded-xl bg-black/90 flex items-center justify-center">
                {mediaInfo.type === 'html5' && mediaUrl && (
                  <video
                    key={mediaUrl}
                    className="h-full w-full"
                    controls
                    src={mediaUrl}
                  >
                    Your browser does not support the video tag.
                  </video>
                )}

                {mediaInfo.type === 'youtube' && mediaUrl && (
                  <iframe
                    key={mediaUrl}
                    className="h-full w-full"
                    src={mediaUrl}
                    title={activeLecture.title || 'Lecture video'}
                    frameBorder="0"
                    allow="accelerometer; autoplay; clipboard-write; encrypted-media; gyroscope; picture-in-picture"
                    allowFullScreen
                  />
                )}

                {mediaInfo.type === 'external' && mediaUrl && (
                  <div className="flex flex-col items-center justify-center text-center px-6">
                    <div className="flex h-14 w-14 items-center justify-center rounded-full bg-primary-500/20 text-primary-200 mb-3">
                      <HiVideoCamera className="w-7 h-7" />
                    </div>
                    <p className="text-sm font-medium text-slate-100">
                      External media/resource available
                    </p>
                    <p className="mt-1 text-xs text-slate-400">
                      Click the button below to open the resource in a new tab.
                    </p>
                    <Button
                      className="mt-4 text-xs px-4 py-2"
                      icon={HiExternalLink}
                      onClick={() => window.open(mediaUrl, '_blank')}
                    >
                      Open Resource
                    </Button>
                  </div>
                )}

                {mediaInfo.type === 'none' || !mediaUrl ? (
                  <div className="flex flex-col items-center justify-center text-center px-6">
                    <div className="flex h-14 w-14 items-center justify-center rounded-full bg-primary-500/20 text-primary-200 mb-3">
                      <HiVideoCamera className="w-7 h-7" />
                    </div>
                    <p className="text-sm font-medium text-slate-100">
                      No media attached to this lecture
                    </p>
                    <p className="mt-1 text-xs text-slate-400">
                      Check the lecture description or attached resources
                      below.
                    </p>
                  </div>
                ) : null}
              </div>

              {/* Lecture meta + description */}
              <div className="flex flex-col gap-3">
                <div className="flex items-start justify-between gap-3">
                  <div>
                    <h2 className="text-base sm:text-lg font-semibold text-dark-900">
                      {activeLecture.title || 'Current Lecture'}
                    </h2>
                    {activeLecture.duration && (
                      <p className="mt-1 text-xs text-dark-500 flex items-center gap-2">
                        <HiClock className="w-4 h-4" />
                        <span>Duration: {activeLecture.duration}</span>
                      </p>
                    )}
                  </div>
                </div>

                {activeLecture.description && (
                  <p className="text-sm text-dark-600">
                    {activeLecture.description}
                  </p>
                )}

                {activeLecture.resources?.length > 0 && (
                  <div className="mt-2">
                    <p className="text-xs font-semibold text-dark-500 mb-2">
                      Resources
                    </p>
                    <div className="space-y-2">
                      {activeLecture.resources.map((res, idx) => (
                        <a
                          key={idx}
                          href={res.url}
                          target="_blank"
                          rel="noopener noreferrer"
                          className="flex items-center gap-2 text-xs text-primary-700 hover:text-primary-900"
                        >
                          <HiDocumentText className="w-4 h-4" />
                          <span className="truncate">{res.title}</span>
                        </a>
                      ))}
                    </div>
                  </div>
                )}
              </div>
            </>
          )}
        </Card>
      </motion.div>
    </motion.div>
  );
};

export default StudentCourseDetail;