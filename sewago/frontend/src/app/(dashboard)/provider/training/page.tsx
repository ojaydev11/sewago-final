
'use client';

import { useState, useEffect } from 'react';

import Link from 'next/link';
import { 
  AcademicCapIcon,
  StarIcon,
  ClockIcon,
  CheckCircleIcon,
  TrophyIcon,
  PlayIcon
} from '@heroicons/react/24/outline';
import { Button } from '@/components/ui/button';
import { FEATURE_FLAGS } from '@/lib/feature-flags';

interface Course {
  id: string;
  name: string;
  description: string;
  modules: string[];
  duration: number;
  requiredScore: number;
}

interface CourseProgress {
  courseId: string;
  courseName: string;
  completedAt: Date;
  score: number;
  certificationLevel: 'bronze' | 'silver' | 'gold';
}

interface TrainingData {
  providerId: string;
  courses: CourseProgress[];
  overallCertification: 'bronze' | 'silver' | 'gold' | 'none';
  totalPoints: number;
  badges: string[];
}

export default function ProviderTraining() {
  const [courses, setCourses] = useState<Course[]>([]);
  const [trainingData, setTrainingData] = useState<TrainingData | null>(null);
  const [loading, setLoading] = useState(true);
  const [selectedCourse, setSelectedCourse] = useState<Course | null>(null);
  const [session, setSession] = useState<any>(null);

  useEffect(() => {
    // Only fetch session if auth is enabled
    if (FEATURE_FLAGS.AUTH_ENABLED) {
      const fetchSession = async () => {
        try {
          const response = await fetch('/api/auth/session');
          if (response.ok) {
            const sessionData = await response.json();
            setSession(sessionData);
            if (sessionData?.user?.id) {
              fetchTrainingData(sessionData.user.id);
            }
          }
        } catch (error) {
          console.error('Failed to fetch session:', error);
        }
      };
      fetchSession();
    }
  }, []);

  const fetchTrainingData = async (userId: string) => {
    try {
      const response = await fetch(`/api/training/courses?providerId=${userId}`);
      if (response.ok) {
        const data = await response.json();
        setCourses(data.courses);
        setTrainingData(data.progress);
      }
    } catch (error) {
      console.error('Failed to fetch training data:', error);
    } finally {
      setLoading(false);
    }
  };

  if (!FEATURE_FLAGS.TRAINING_HUB_ENABLED) {
    return (
      <div className="min-h-screen bg-gray-50 flex items-center justify-center">
        <div className="text-center">
          <h1 className="text-2xl font-bold text-gray-900 mb-4">Training Hub</h1>
          <p className="text-gray-600">Training hub is currently unavailable.</p>
        </div>
      </div>
    );
  }

  if (!FEATURE_FLAGS.AUTH_ENABLED) {
    return (
      <div className="min-h-screen bg-gray-50 flex items-center justify-center">
        <div className="text-center">
          <h1 className="text-2xl font-bold text-gray-900 mb-4">Authentication Required</h1>
          <p className="text-gray-600">Authentication is currently disabled.</p>
        </div>
      </div>
    );
  }

  if (!session) {
    return (
      <div className="min-h-screen bg-gray-50 flex items-center justify-center">
        <div className="text-center">
          <h1 className="text-2xl font-bold text-gray-900 mb-4">Access Required</h1>
          <p className="text-gray-600 mb-6">Please log in to access the training hub.</p>
          <Link href="/account/login">
            <Button className="bg-blue-600 hover:bg-blue-700">
              Login
            </Button>
          </Link>
        </div>
      </div>
    );
  }

  if (loading) {
    return (
      <div className="min-h-screen bg-gray-50 flex items-center justify-center">
        <div className="text-center">
          <div className="animate-spin rounded-full h-12 w-12 border-b-2 border-blue-600 mx-auto mb-4"></div>
          <p className="text-gray-600">Loading training data...</p>
        </div>
      </div>
    );
  }

  const getCertificationColor = (level: string) => {
    switch (level) {
      case 'gold': return 'text-yellow-600 bg-yellow-100';
      case 'silver': return 'text-gray-600 bg-gray-100';
      case 'bronze': return 'text-orange-600 bg-orange-100';
      default: return 'text-gray-600 bg-gray-100';
    }
  };

  const getCourseStatus = (courseId: string) => {
    const completion = trainingData?.courses.find(c => c.courseId === courseId);
    return completion ? 'completed' : 'available';
  };

  return (
    <div className="min-h-screen bg-gray-50">
      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-8">
        {/* Header */}
        <div className="mb-8">
          <h1 className="text-3xl font-bold text-gray-900 mb-2">
            Provider Training Hub
          </h1>
          <p className="text-gray-600">
            Enhance your skills and earn certifications to improve your service quality
          </p>
        </div>

        {/* Certification Status */}
        {trainingData && (
          <div className="bg-white rounded-lg shadow-sm p-6 mb-8">
            <div className="flex items-center justify-between mb-4">
              <h2 className="text-xl font-semibold text-gray-900">Your Certification Status</h2>
              <div className={`px-3 py-1 rounded-full text-sm font-medium ${getCertificationColor(trainingData.overallCertification)}`}>
                {trainingData.overallCertification.charAt(0).toUpperCase() + trainingData.overallCertification.slice(1)} Level
              </div>
            </div>
            
            <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
              <div className="text-center">
                <div className="text-2xl font-bold text-blue-600">{trainingData.courses.length}</div>
                <div className="text-sm text-gray-600">Courses Completed</div>
              </div>
              <div className="text-center">
                <div className="text-2xl font-bold text-green-600">{Math.round(trainingData.totalPoints)}</div>
                <div className="text-sm text-gray-600">Total Points</div>
              </div>
              <div className="text-center">
                <div className="text-2xl font-bold text-purple-600">{trainingData.badges.length}</div>
                <div className="text-sm text-gray-600">Badges Earned</div>
              </div>
            </div>

            {/* Badges */}
            {trainingData.badges.length > 0 && (
              <div className="mt-6">
                <h3 className="text-sm font-medium text-gray-700 mb-2">Earned Badges</h3>
                <div className="flex flex-wrap gap-2">
                  {trainingData.badges.map((badge) => (
                    <span
                      key={badge}
                      className="inline-flex items-center px-2 py-1 rounded-full text-xs font-medium bg-yellow-100 text-yellow-800"
                    >
                      <TrophyIcon className="w-3 h-3 mr-1" />
                      {badge.replace(/-/g, ' ').replace(/\b\w/g, l => l.toUpperCase())}
                    </span>
                  ))}
                </div>
              </div>
            )}
          </div>
        )}

        {/* Available Courses */}
        <div className="bg-white rounded-lg shadow-sm">
          <div className="p-6 border-b border-gray-200">
            <h2 className="text-xl font-semibold text-gray-900">Available Courses</h2>
          </div>
          
          <div className="divide-y divide-gray-200">
            {courses.map((course) => {
              const status = getCourseStatus(course.id);
              const completion = trainingData?.courses.find(c => c.courseId === course.id);
              
              return (
                <div key={course.id} className="p-6">
                  <div className="flex items-start justify-between">
                    <div className="flex-1">
                      <div className="flex items-center gap-3 mb-2">
                        <h3 className="text-lg font-medium text-gray-900">{course.name}</h3>
                        {status === 'completed' && (
                          <div className="flex items-center gap-1">
                            <CheckCircleIcon className="w-5 h-5 text-green-600" />
                            <span className={`px-2 py-1 rounded-full text-xs font-medium ${getCertificationColor(completion!.certificationLevel)}`}>
                              {completion!.certificationLevel} ({completion!.score}%)
                            </span>
                          </div>
                        )}
                      </div>
                      
                      <p className="text-gray-600 mb-3">{course.description}</p>
                      
                      <div className="flex items-center gap-4 text-sm text-gray-500 mb-3">
                        <div className="flex items-center gap-1">
                          <ClockIcon className="w-4 h-4" />
                          {course.duration} minutes
                        </div>
                        <div className="flex items-center gap-1">
                          <StarIcon className="w-4 h-4" />
                          {course.requiredScore}% required to pass
                        </div>
                      </div>
                      
                      <div className="text-sm text-gray-600">
                        <strong>Modules:</strong> {course.modules.join(', ')}
                      </div>
                    </div>
                    
                    <div className="ml-6">
                      {status === 'completed' ? (
                        <Button
                          variant="outline"
                          onClick={() => setSelectedCourse(course)}
                          className="border-green-600 text-green-600 hover:bg-green-50"
                        >
                          Review Course
                        </Button>
                      ) : (
                        <Button
                          onClick={() => setSelectedCourse(course)}
                          className="bg-blue-600 hover:bg-blue-700"
                        >
                          <PlayIcon className="w-4 h-4 mr-2" />
                          Start Course
                        </Button>
                      )}
                    </div>
                  </div>
                </div>
              );
            })}
          </div>
        </div>

        {/* Course Modal */}
        {selectedCourse && (
          <CourseModal
            course={selectedCourse}
            providerId={session.user.id}
            onClose={() => setSelectedCourse(null)}
            onComplete={() => fetchTrainingData(session.user.id)}
          />
        )}
      </div>
    </div>
  );
}

function CourseModal({ 
  course, 
  providerId, 
  onClose, 
  onComplete 
}: { 
  course: Course; 
  providerId: string;
  onClose: () => void; 
  onComplete: () => void;
}) {
  const [currentModule, setCurrentModule] = useState(0);
  const [quizScore, setQuizScore] = useState<number | null>(null);
  const [isSubmitting, setIsSubmitting] = useState(false);

  const handleStartQuiz = () => {
    // Simulate quiz - in real implementation, this would be a proper quiz interface
    const score = Math.floor(Math.random() * 30) + 70; // Random score between 70-100
    setQuizScore(score);
  };

  const handleCompleteEtCourse = async () => {
    if (quizScore === null) return;
    
    setIsSubmitting(true);
    try {
      const response = await fetch('/api/training/courses', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({
          providerId,
          courseId: course.id,
          score: quizScore
        })
      });

      if (response.ok) {
        onComplete();
        onClose();
      }
    } catch (error) {
      console.error('Failed to complete course:', error);
    } finally {
      setIsSubmitting(false);
    }
  };

  return (
    <div className="fixed inset-0 bg-black bg-opacity-50 flex items-center justify-center p-4 z-50">
      <div className="bg-white rounded-lg max-w-2xl w-full max-h-screen overflow-y-auto">
        <div className="p-6">
          <div className="flex justify-between items-center mb-6">
            <h2 className="text-xl font-bold">{course.name}</h2>
            <button
              onClick={onClose}
              className="text-gray-400 hover:text-gray-600"
            >
              ×
            </button>
          </div>
          
          {/* Course Content */}
          <div className="mb-6">
            <div className="flex items-center justify-between mb-4">
              <h3 className="text-lg font-medium">Course Modules</h3>
              <span className="text-sm text-gray-500">
                {currentModule + 1} of {course.modules.length}
              </span>
            </div>
            
            <div className="bg-gray-50 rounded-lg p-4 mb-4">
              <h4 className="font-medium mb-2">{course.modules[currentModule]}</h4>
              <p className="text-gray-600 text-sm">
                This module covers important concepts and best practices for {course.modules[currentModule].toLowerCase()}.
                Please review the content carefully before proceeding to the next module.
              </p>
            </div>
            
            <div className="flex justify-between">
              <Button
                variant="outline"
                onClick={() => setCurrentModule(Math.max(0, currentModule - 1))}
                disabled={currentModule === 0}
              >
                Previous Module
              </Button>
              
              {currentModule < course.modules.length - 1 ? (
                <Button
                  onClick={() => setCurrentModule(currentModule + 1)}
                  className="bg-blue-600 hover:bg-blue-700"
                >
                  Next Module
                </Button>
              ) : (
                <Button
                  onClick={handleStartQuiz}
                  disabled={quizScore !== null}
                  className="bg-green-600 hover:bg-green-700"
                >
                  {quizScore !== null ? 'Quiz Completed' : 'Take Quiz'}
                </Button>
              )}
            </div>
          </div>
          
          {/* Quiz Results */}
          {quizScore !== null && (
            <div className="bg-blue-50 rounded-lg p-4 mb-6">
              <h3 className="text-lg font-medium mb-2">Quiz Results</h3>
              <div className="flex items-center justify-between">
                <div>
                  <div className="text-2xl font-bold text-blue-600">{quizScore}%</div>
                  <div className="text-sm text-gray-600">
                    {quizScore >= course.requiredScore ? 'Passed!' : 'Failed - Please retake'}
                  </div>
                </div>
                
                {quizScore >= course.requiredScore && (
                  <Button
                    onClick={handleCompleteEtCourse}
                    disabled={isSubmitting}
                    className="bg-green-600 hover:bg-green-700"
                  >
                    {isSubmitting ? 'Completing...' : 'Complete Course'}
                  </Button>
                )}
              </div>
            </div>
          )}
        </div>
      </div>
    </div>
  );
}
