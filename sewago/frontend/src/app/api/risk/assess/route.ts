
import { NextRequest, NextResponse } from 'next/server';
import { RiskEngine } from '@/lib/risk-engine';
import RiskAssessment from '@/models/RiskAssessment';
import { AuditLogger } from '@/lib/audit-logger';
import { FEATURE_FLAGS } from '@/config/flags';
import { dbConnect } from '@/lib/mongodb';

export async function POST(request: NextRequest) {
  if (!FEATURE_FLAGS.RISK_GATES_ENABLED) {
    return NextResponse.json({ error: 'Risk assessment disabled' }, { status: 403 });
  }

  try {
    await dbConnect();
    
    const body = await request.json();
    const {
      userId,
      bookingId,
      email,
      phone,
      city,
      userHistory
    } = body;

    // Get request metadata
    const userAgent = request.headers.get('user-agent') || '';
    const ip = request.headers.get('x-forwarded-for') || 
               request.headers.get('x-real-ip') || 
               '127.0.0.1';

    // Perform risk assessment
    const assessment = await RiskEngine.assessBookingRisk({
      userId,
      userAgent,
      ip,
      email,
      phone,
      city,
      userHistory
    });

    // Save assessment to database
    const riskAssessment = new RiskAssessment({
      bookingId,
      userId,
      riskScore: assessment.score,
      riskFactors: assessment.factors,
      gateActions: assessment.gateActions
    });

    await riskAssessment.save();

    // Log audit event
    await AuditLogger.logRiskAssessment(
      bookingId,
      assessment.score,
      assessment.gateActions,
      {
        userId: userId || 'anonymous',
        role: 'system',
        ip,
        userAgent
      }
    );

    return NextResponse.json({
      success: true,
      assessment: {
        score: assessment.score,
        gateActions: assessment.gateActions,
        recommendations: assessment.recommendations
      }
    });

  } catch (error) {
    console.error('Risk assessment error:', error);
    return NextResponse.json(
      { error: 'Failed to assess risk' },
      { status: 500 }
    );
  }
}

export async function GET(request: NextRequest) {
  try {
    await dbConnect();
    
    const { searchParams } = new URL(request.url);
    const bookingId = searchParams.get('bookingId');
    const userId = searchParams.get('userId');

    if (!bookingId && !userId) {
      return NextResponse.json({ error: 'bookingId or userId required' }, { status: 400 });
    }

    const query: any = {};
    if (bookingId) query.bookingId = bookingId;
    if (userId) query.userId = userId;

    const assessments = await RiskAssessment.find(query)
      .sort({ createdAt: -1 })
      .limit(10)
      .lean();

    return NextResponse.json({
      success: true,
      assessments
    });

  } catch (error) {
    console.error('Error fetching risk assessments:', error);
    return NextResponse.json(
      { error: 'Failed to fetch assessments' },
      { status: 500 }
    );
  }
}
