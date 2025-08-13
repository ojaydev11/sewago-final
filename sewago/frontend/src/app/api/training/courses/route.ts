
import { NextRequest, NextResponse } from 'next/server';
import ProviderTraining from '@/models/ProviderTraining';
import { AuditLogger } from '@/lib/audit-logger';
import { FEATURE_FLAGS } from '@/config/flags';
import { dbConnect } from '@/lib/mongodb';

// Training course content
const COURSES = {
  'basic-safety': {
    id: 'basic-safety',
    name: 'Basic Safety Protocols',
    description: 'Essential safety guidelines for all service providers',
    modules: [
      'Personal Safety Equipment',
      'Customer Safety Guidelines',
      'Emergency Procedures',
      'Risk Assessment'
    ],
    duration: 30, // minutes
    requiredScore: 80
  },
  'customer-service': {
    id: 'customer-service',
    name: 'Customer Service Excellence',
    description: 'Delivering exceptional customer experiences',
    modules: [
      'Communication Skills',
      'Professional Behavior',
      'Handling Complaints',
      'Building Trust'
    ],
    duration: 45,
    requiredScore: 85
  },
  'technical-skills': {
    id: 'technical-skills',
    name: 'Technical Service Skills',
    description: 'Advanced technical competencies by service type',
    modules: [
      'Service-Specific Techniques',
      'Quality Standards',
      'Tool Usage',
      'Problem Solving'
    ],
    duration: 60,
    requiredScore: 90
  }
};

export async function GET(request: NextRequest) {
  if (!FEATURE_FLAGS.TRAINING_HUB_ENABLED) {
    return NextResponse.json({ error: 'Training hub disabled' }, { status: 403 });
  }

  try {
    const { searchParams } = new URL(request.url);
    const providerId = searchParams.get('providerId');

    if (providerId) {
      // Get provider's training progress
      await dbConnect();
      
      const training = await ProviderTraining.findOne({ providerId }).lean();
      
      return NextResponse.json({
        success: true,
        courses: Object.values(COURSES),
        progress: training || {
          providerId,
          courses: [],
          overallCertification: 'none',
          totalPoints: 0,
          badges: []
        }
      });
    }

    // Return available courses
    return NextResponse.json({
      success: true,
      courses: Object.values(COURSES)
    });

  } catch (error) {
    console.error('Error fetching training courses:', error);
    return NextResponse.json(
      { error: 'Failed to fetch courses' },
      { status: 500 }
    );
  }
}

export async function POST(request: NextRequest) {
  if (!FEATURE_FLAGS.TRAINING_HUB_ENABLED) {
    return NextResponse.json({ error: 'Training hub disabled' }, { status: 403 });
  }

  try {
    await dbConnect();
    
    const body = await request.json();
    const { providerId, courseId, score, completedAt } = body;

    if (!providerId || !courseId || score === undefined) {
      return NextResponse.json({ error: 'Missing required fields' }, { status: 400 });
    }

    const course = COURSES[courseId as keyof typeof COURSES];
    if (!course) {
      return NextResponse.json({ error: 'Invalid course ID' }, { status: 400 });
    }

    // Determine certification level based on score
    let certificationLevel: 'bronze' | 'silver' | 'gold';
    if (score >= 95) {
      certificationLevel = 'gold';
    } else if (score >= 90) {
      certificationLevel = 'silver';
    } else {
      certificationLevel = 'bronze';
    }

    // Find or create provider training record
    let training = await ProviderTraining.findOne({ providerId });
    
    if (!training) {
      training = new ProviderTraining({
        providerId,
        courses: [],
        overallCertification: 'none',
        totalPoints: 0,
        badges: []
      });
    }

    // Add or update course completion
    const existingCourseIndex = training.courses.findIndex(c => c.courseId === courseId);
    const courseCompletion = {
      courseId,
      courseName: course.name,
      completedAt: completedAt ? new Date(completedAt) : new Date(),
      score,
      certificationLevel
    };

    if (existingCourseIndex >= 0) {
      training.courses[existingCourseIndex] = courseCompletion;
    } else {
      training.courses.push(courseCompletion);
    }

    // Calculate total points
    training.totalPoints = training.courses.reduce((total, course) => {
      const basePoints = course.score;
      const levelMultiplier = course.certificationLevel === 'gold' ? 1.2 : 
                             course.certificationLevel === 'silver' ? 1.1 : 1.0;
      return total + (basePoints * levelMultiplier);
    }, 0);

    // Update overall certification
    const avgScore = training.courses.reduce((sum, c) => sum + c.score, 0) / training.courses.length;
    const completedCourses = training.courses.length;

    if (completedCourses >= 3 && avgScore >= 95) {
      training.overallCertification = 'gold';
    } else if (completedCourses >= 2 && avgScore >= 90) {
      training.overallCertification = 'silver';
    } else if (completedCourses >= 1 && avgScore >= 80) {
      training.overallCertification = 'bronze';
    }

    // Award badges
    const newBadges = [];
    if (score === 100) newBadges.push('perfect-score');
    if (training.courses.length === Object.keys(COURSES).length) newBadges.push('all-courses-completed');
    if (training.totalPoints >= 1000) newBadges.push('high-achiever');

    training.badges = [...new Set([...training.badges, ...newBadges])];

    await training.save();

    // Log audit event
    await AuditLogger.log({
      entityType: 'provider',
      entityId: providerId,
      action: 'course_completed',
      changes: [
        { field: 'course_completion', oldValue: null, newValue: courseCompletion },
        { field: 'total_points', oldValue: training.totalPoints - courseCompletion.score, newValue: training.totalPoints }
      ],
      context: {
        userId: providerId,
        role: 'provider',
        ip: request.headers.get('x-forwarded-for') || '127.0.0.1'
      },
      metadata: { courseId, score, certificationLevel }
    });

    return NextResponse.json({
      success: true,
      training: training.toObject(),
      newBadges
    });

  } catch (error) {
    console.error('Error completing course:', error);
    return NextResponse.json(
      { error: 'Failed to complete course' },
      { status: 500 }
    );
  }
}
