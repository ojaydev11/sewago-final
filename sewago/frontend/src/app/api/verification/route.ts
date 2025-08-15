import { NextRequest, NextResponse } from 'next/server';
import { getServerSession } from 'next-auth';
import { authOptions } from '@/lib/auth';
import dbConnect from '@/lib/db';
import { Verification } from '@/models/Verification';
import { Provider } from '@/models/Provider';
import { User } from '@/models/User';

export async function POST(request: NextRequest) {
  try {
    const session = await getServerSession(authOptions);
    
    if (!session || session.user.role !== 'provider') {
      return NextResponse.json(
        { error: 'Unauthorized - Provider access required' },
        { status: 401 }
      );
    }

    await dbConnect();
    const { verificationType, documents, backgroundCheck, skillsVerification } = await request.json();

    // Validate required fields
    if (!verificationType || !documents || !backgroundCheck || !skillsVerification) {
      return NextResponse.json(
        { error: 'Missing required verification information' },
        { status: 400 }
      );
    }

    // Check if verification already exists
    const existingVerification = await Verification.findOne({ 
      userId: session.user.id,
      status: { $in: ['pending', 'in_progress'] }
    });

    if (existingVerification) {
      return NextResponse.json(
        { error: 'Verification already in progress' },
        { status: 409 }
      );
    }

    // Get provider profile
    const provider = await Provider.findOne({ userId: session.user.id });
    if (!provider) {
      return NextResponse.json(
        { error: 'Provider profile not found' },
        { status: 404 }
      );
    }

    // Create verification record
    const verification = new Verification({
      providerId: provider._id,
      userId: session.user.id,
      verificationType,
      documents: documents.map((doc: any) => ({
        type: doc.type,
        url: doc.url,
        filename: doc.filename,
        uploadedAt: new Date(),
      })),
      backgroundCheck: {
        criminalRecord: backgroundCheck.criminalRecord,
        criminalRecordDetails: backgroundCheck.criminalRecordDetails,
        employmentHistory: backgroundCheck.employmentHistory,
        employmentHistoryDetails: backgroundCheck.employmentHistoryDetails,
        references: backgroundCheck.references.map((ref: any) => ({
          name: ref.name,
          phone: ref.phone,
          email: ref.email,
          relationship: ref.relationship,
        })),
      },
      skillsVerification: {
        certifications: skillsVerification.certifications.map((cert: any) => ({
          name: cert.name,
          issuingAuthority: cert.issuingAuthority,
          issueDate: new Date(cert.issueDate),
          expiryDate: cert.expiryDate ? new Date(cert.expiryDate) : undefined,
        })),
        experienceYears: skillsVerification.experienceYears,
        previousEmployers: skillsVerification.previousEmployers.map((emp: any) => ({
          name: emp.name,
          position: emp.position,
          duration: emp.duration,
        })),
      },
      verificationProcess: {
        submittedAt: new Date(),
        priority: verificationType === 'premium' ? 'high' : 'medium',
        estimatedCompletion: new Date(Date.now() + (verificationType === 'premium' ? 3 : 7) * 24 * 60 * 60 * 1000), // 3 or 7 days
      },
    });

    await verification.save();

    // Update provider verification status
    await Provider.findByIdAndUpdate(provider._id, {
      verificationStatus: 'pending',
      updatedAt: new Date(),
    });

    // Update user verification status
    await User.findByIdAndUpdate(session.user.id, {
      verificationStatus: 'pending',
      updatedAt: new Date(),
    });

    return NextResponse.json({
      message: 'Verification submitted successfully',
      verificationId: verification._id,
      estimatedCompletion: verification.verificationProcess.estimatedCompletion,
    });

  } catch (error) {
    console.error('Error submitting verification:', error);
    return NextResponse.json(
      { error: 'Internal server error' },
      { status: 500 }
    );
  }
}

export async function GET(request: NextRequest) {
  try {
    const session = await getServerSession(authOptions);
    
    if (!session) {
      return NextResponse.json(
        { error: 'Unauthorized' },
        { status: 401 }
      );
    }

    await dbConnect();
    const { searchParams } = new URL(request.url);
    const status = searchParams.get('status');
    const type = searchParams.get('type');

    const query: any = {};
    
    if (session.user.role === 'provider') {
      query.userId = session.user.id;
    } else if (session.user.role === 'admin') {
      if (status) query.status = status;
      if (type) query.verificationType = type;
    } else {
      return NextResponse.json(
        { error: 'Insufficient permissions' },
        { status: 403 }
      );
    }

    const verifications = await Verification.find(query)
      .populate('userId', 'name email phone')
      .populate('providerId', 'businessName services')
      .populate('verificationProcess.assignedTo', 'name email')
      .sort({ 'verificationProcess.priority': -1, createdAt: -1 });

    return NextResponse.json({ verifications });

  } catch (error) {
    console.error('Error fetching verifications:', error);
    return NextResponse.json(
      { error: 'Internal server error' },
      { status: 500 }
    );
  }
}
