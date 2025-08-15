import { NextRequest, NextResponse } from 'next/server';
import { getServerSession } from 'next-auth';
import { authOptions } from '@/lib/auth';
import dbConnect from '@/lib/db';
import { Verification } from '@/models/Verification';
import { Provider } from '@/models/Provider';
import { User } from '@/models/User';

export async function GET(
  request: NextRequest,
  { params }: { params: Promise<{ id: string }> }
) {
  try {
    const session = await getServerSession(authOptions);
    
    if (!session || session.user.role !== 'admin') {
      return NextResponse.json(
        { error: 'Unauthorized - Admin access required' },
        { status: 401 }
      );
    }

    const { id } = await params;
    await dbConnect();

    const verification = await Verification.findById(id)
      .populate('userId', 'name email phone district')
      .populate('providerId', 'businessName services hourlyRate')
      .populate('verificationProcess.assignedTo', 'name email')
      .populate('decision.approvedBy', 'name email');

    if (!verification) {
      return NextResponse.json(
        { error: 'Verification not found' },
        { status: 404 }
      );
    }

    return NextResponse.json({ verification });

  } catch (error) {
    console.error('Error fetching verification:', error);
    return NextResponse.json(
      { error: 'Internal server error' },
      { status: 500 }
    );
  }
}

export async function PATCH(
  request: NextRequest,
  { params }: { params: Promise<{ id: string }> }
) {
  try {
    const session = await getServerSession(authOptions);
    
    if (!session || session.user.role !== 'admin') {
      return NextResponse.json(
        { error: 'Unauthorized - Admin access required' },
        { status: 401 }
      );
    }

    const { id } = await params;
    await dbConnect();
    const { action, data } = await request.json();

    const verification = await Verification.findById(id);
    if (!verification) {
      return NextResponse.json(
        { error: 'Verification not found' },
        { status: 404 }
      );
    }

    let updateData: any = {};

    switch (action) {
      case 'assign':
        updateData = {
          'verificationProcess.assignedTo': session.user.id,
          'verificationProcess.startedAt': new Date(),
          status: 'in_progress',
        };
        break;

      case 'update_status':
        updateData = {
          status: data.status,
          ...(data.status === 'in_progress' && { 'verificationProcess.startedAt': new Date() }),
          ...(data.status === 'completed' && { 'verificationProcess.completedAt': new Date() }),
        };
        break;

      case 'verify_document':
        const { documentIndex, verified, rejectionReason } = data;
        if (verification.documents[documentIndex]) {
          verification.documents[documentIndex].verified = verified;
          verification.documents[documentIndex].verifiedBy = session.user.id;
          verification.documents[documentIndex].verifiedAt = new Date();
          if (rejectionReason) {
            verification.documents[documentIndex].rejectionReason = rejectionReason;
          }
        }
        break;

      case 'verify_personal_info':
        updateData = {
          'personalInfo': data.personalInfo,
        };
        break;

      case 'verify_background_check':
        updateData = {
          'backgroundCheck.criminalRecord': data.criminalRecord,
          'backgroundCheck.employmentHistory': data.employmentHistory,
          ...(data.criminalRecordDetails && { 'backgroundCheck.criminalRecordDetails': data.criminalRecordDetails }),
          ...(data.employmentHistoryDetails && { 'backgroundCheck.employmentHistoryDetails': data.employmentHistoryDetails }),
        };
        break;

      case 'verify_reference':
        const { referenceIndex, verified: refVerified } = data;
        if (verification.backgroundCheck.references[referenceIndex]) {
          verification.backgroundCheck.references[referenceIndex].verified = refVerified;
          verification.backgroundCheck.references[referenceIndex].verifiedAt = new Date();
        }
        break;

      case 'verify_certification':
        const { certIndex, verified: certVerified } = data;
        if (verification.skillsVerification.certifications[certIndex]) {
          verification.skillsVerification.certifications[certIndex].verified = certVerified;
          verification.skillsVerification.certifications[certIndex].verifiedAt = new Date();
        }
        break;

      case 'verify_employment':
        updateData = {
          'skillsVerification.experienceVerified': data.experienceVerified,
          'skillsVerification.experienceYears': data.experienceYears,
        };
        break;

      case 'add_note':
        updateData = {
          $push: { 'verificationProcess.notes': `${new Date().toISOString()}: ${data.note} (by ${session.user.name})` },
        };
        break;

      case 'approve':
        updateData = {
          status: 'approved',
          'decision.approved': true,
          'decision.approvedBy': session.user.id,
          'decision.approvedAt': new Date(),
          'verificationProcess.completedAt': new Date(),
        };
        break;

      case 'reject':
        updateData = {
          status: 'rejected',
          'decision.approved': false,
          'decision.rejectionReason': data.reason,
          'decision.rejectionDetails': data.details,
          'decision.appealDeadline': new Date(Date.now() + 30 * 24 * 60 * 60 * 1000), // 30 days
          'verificationProcess.completedAt': new Date(),
        };
        break;

      default:
        return NextResponse.json(
          { error: 'Invalid action' },
          { status: 400 }
        );
    }

    // Update verification
    if (Object.keys(updateData).length > 0) {
      await Verification.findByIdAndUpdate(id, updateData, { new: true });
    } else {
      await verification.save();
    }

    // If approved, update provider and user verification status
    if (action === 'approve') {
      await Provider.findByIdAndUpdate(verification.providerId, {
        verificationStatus: 'approved',
        isVerified: true,
        updatedAt: new Date(),
      });

      await User.findByIdAndUpdate(verification.userId, {
        verificationStatus: 'approved',
        isVerified: true,
        updatedAt: new Date(),
      });
    }

    // If rejected, update provider and user verification status
    if (action === 'reject') {
      await Provider.findByIdAndUpdate(verification.providerId, {
        verificationStatus: 'rejected',
        isVerified: false,
        updatedAt: new Date(),
      });

      await User.findByIdAndUpdate(verification.userId, {
        verificationStatus: 'rejected',
        isVerified: false,
        updatedAt: new Date(),
      });
    }

    return NextResponse.json({
      message: `Verification ${action} completed successfully`,
    });

  } catch (error) {
    console.error('Error updating verification:', error);
    return NextResponse.json(
      { error: 'Internal server error' },
      { status: 500 }
    );
  }
}
