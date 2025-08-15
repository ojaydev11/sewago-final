'use client';

import React, { useState, useEffect } from 'react';
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from '@/components/ui/card';
import { Badge } from '@/components/ui/badge';
import { Progress } from '@/components/ui/progress';
import { Button } from '@/components/ui/button';
import { 
  Shield, 
  CheckCircle, 
  XCircle, 
  Clock, 
  AlertTriangle,
  FileText,
  UserCheck,
  Building,
  GraduationCap,
  Calendar,
  Eye
} from 'lucide-react';

interface VerificationStatusData {
  _id: string;
  status: 'pending' | 'in_progress' | 'approved' | 'rejected';
  verificationType: 'basic' | 'enhanced' | 'premium';
  personalInfo: {
    nameVerified: boolean;
    phoneVerified: boolean;
    emailVerified: boolean;
    addressVerified: boolean;
  };
  documents: Array<{
    type: string;
    filename: string;
    verified: boolean;
    rejectionReason?: string;
  }>;
  backgroundCheck: {
    criminalRecord: boolean;
    employmentHistory: boolean;
    references: Array<{
      name: string;
      verified: boolean;
    }>;
  };
  skillsVerification: {
    experienceVerified: boolean;
    experienceYears: number;
    certifications: Array<{
      name: string;
      verified: boolean;
    }>;
  };
  verificationProcess: {
    submittedAt: string;
    assignedTo?: {
      name: string;
      email: string;
    };
    startedAt?: string;
    estimatedCompletion?: string;
    priority: 'low' | 'medium' | 'high' | 'urgent';
    notes: string[];
  };
  decision?: {
    approved: boolean;
    rejectionReason?: string;
    rejectionDetails?: string;
    appealDeadline?: string;
  };
}

export default function VerificationStatus() {
  const [verification, setVerification] = useState<VerificationStatusData | null>(null);
  const [isLoading, setIsLoading] = useState(true);
  const [error, setError] = useState('');

  useEffect(() => {
    fetchVerificationStatus();
  }, []);

  const fetchVerificationStatus = async () => {
    try {
      const response = await fetch('/api/verification');
      if (!response.ok) throw new Error('Failed to fetch verification status');
      const data = await response.json();
      
      if (data.verifications && data.verifications.length > 0) {
        setVerification(data.verifications[0]); // Get the most recent verification
      }
    } catch (error) {
      setError(error instanceof Error ? error.message : 'Failed to fetch verification status');
    } finally {
      setIsLoading(false);
    }
  };

  const getStatusColor = (status: string) => {
    switch (status) {
      case 'pending': return 'bg-yellow-100 text-yellow-800';
      case 'in_progress': return 'bg-blue-100 text-blue-800';
      case 'approved': return 'bg-green-100 text-green-800';
      case 'rejected': return 'bg-red-100 text-red-800';
      default: return 'bg-gray-100 text-gray-800';
    }
  };

  const getPriorityColor = (priority: string) => {
    switch (priority) {
      case 'urgent': return 'bg-red-100 text-red-800';
      case 'high': return 'bg-orange-100 text-orange-800';
      case 'medium': return 'bg-yellow-100 text-yellow-800';
      case 'low': return 'bg-green-100 text-green-800';
      default: return 'bg-gray-100 text-gray-800';
    }
  };

  const getCompletionPercentage = () => {
    if (!verification) return 0;
    
    const totalChecks = 4;
    let completedChecks = 0;
    
    // Personal info
    if (verification.personalInfo.nameVerified && verification.personalInfo.phoneVerified && 
        verification.personalInfo.emailVerified && verification.personalInfo.addressVerified) {
      completedChecks++;
    }
    
    // Documents
    if (verification.documents.length > 0 && verification.documents.every(doc => doc.verified)) {
      completedChecks++;
    }
    
    // Background check
    if (verification.backgroundCheck.criminalRecord && verification.backgroundCheck.employmentHistory &&
        verification.backgroundCheck.references.every(ref => ref.verified)) {
      completedChecks++;
    }
    
    // Skills verification
    if (verification.skillsVerification.experienceVerified && 
        verification.skillsVerification.certifications.every(cert => cert.verified)) {
      completedChecks++;
    }
    
    return Math.round((completedChecks / totalChecks) * 100);
  };

  if (isLoading) {
    return (
      <Card className="mb-8">
        <CardContent className="p-8">
          <div className="flex items-center justify-center">
            <div className="animate-spin rounded-full h-8 w-8 border-b-2 border-blue-500"></div>
          </div>
        </CardContent>
      </Card>
    );
  }

  if (error) {
    return (
      <Card className="mb-8">
        <CardContent className="p-6">
          <div className="flex items-center gap-2 text-red-600">
            <AlertTriangle className="h-5 w-5" />
            <span>Error loading verification status: {error}</span>
          </div>
        </CardContent>
      </Card>
    );
  }

  if (!verification) {
    return (
      <Card className="mb-8">
        <CardContent className="p-6 text-center">
          <Shield className="h-12 w-12 text-gray-400 mx-auto mb-4" />
          <h3 className="text-lg font-semibold text-gray-900 mb-2">No Verification Found</h3>
          <p className="text-gray-600 mb-4">
            You haven't submitted a verification request yet. Complete the form below to get started.
          </p>
        </CardContent>
      </Card>
    );
  }

  return (
    <Card className="mb-8">
      <CardHeader>
        <div className="flex items-center justify-between">
          <div>
            <CardTitle className="flex items-center gap-2">
              <Shield className="h-5 w-5" />
              Verification Status
            </CardTitle>
            <CardDescription>
              Track your verification progress and requirements
            </CardDescription>
          </div>
          
          <div className="flex items-center gap-2">
            <Badge className={getStatusColor(verification.status)}>
              {verification.status.replace('_', ' ').toUpperCase()}
            </Badge>
            <Badge className={getPriorityColor(verification.verificationProcess.priority)}>
              {verification.verificationProcess.priority.toUpperCase()}
            </Badge>
          </div>
        </div>
      </CardHeader>
      
      <CardContent className="space-y-6">
        {/* Overall Progress */}
        <div className="space-y-3">
          <div className="flex justify-between text-sm">
            <span>Overall Progress</span>
            <span>{getCompletionPercentage()}%</span>
          </div>
          <Progress value={getCompletionPercentage()} />
        </div>

        {/* Status Overview */}
        <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
          <div>
            <h3 className="font-semibold mb-3">Verification Details</h3>
            <div className="space-y-2 text-sm">
              <div><span className="font-medium">Type:</span> {verification.verificationType}</div>
              <div><span className="font-medium">Submitted:</span> {new Date(verification.verificationProcess.submittedAt).toLocaleDateString()}</div>
              {verification.verificationProcess.estimatedCompletion && (
                <div><span className="font-medium">Est. Completion:</span> {new Date(verification.verificationProcess.estimatedCompletion).toLocaleDateString()}</div>
              )}
              {verification.verificationProcess.assignedTo && (
                <div><span className="font-medium">Assigned to:</span> {verification.verificationProcess.assignedTo.name}</div>
              )}
            </div>
          </div>
          
          <div>
            <h3 className="font-semibold mb-3">Current Status</h3>
            <div className="space-y-2 text-sm">
              {verification.status === 'approved' && (
                <div className="flex items-center gap-2 text-green-600">
                  <CheckCircle className="h-4 w-4" />
                  <span>Verification approved! You can now accept bookings.</span>
                </div>
              )}
              
              {verification.status === 'rejected' && (
                <div className="space-y-2">
                  <div className="flex items-center gap-2 text-red-600">
                    <XCircle className="h-4 w-4" />
                    <span>Verification rejected</span>
                  </div>
                  {verification.decision?.rejectionReason && (
                    <div><span className="font-medium">Reason:</span> {verification.decision.rejectionReason}</div>
                  )}
                  {verification.decision?.appealDeadline && (
                    <div><span className="font-medium">Appeal Deadline:</span> {new Date(verification.decision.appealDeadline).toLocaleDateString()}</div>
                  )}
                </div>
              )}
              
              {verification.status === 'in_progress' && (
                <div className="flex items-center gap-2 text-blue-600">
                  <Clock className="h-4 w-4" />
                  <span>Verification in progress. Our team is reviewing your information.</span>
                </div>
              )}
              
              {verification.status === 'pending' && (
                <div className="flex items-center gap-2 text-yellow-600">
                  <Clock className="h-4 w-4" />
                  <span>Verification submitted and pending review.</span>
                </div>
              )}
            </div>
          </div>
        </div>

        {/* Verification Sections Status */}
        <div className="space-y-4">
          <h3 className="font-semibold">Verification Requirements</h3>
          
          {/* Personal Information */}
          <div className="p-4 border rounded-lg">
            <div className="flex items-center gap-2 mb-3">
              <UserCheck className="h-5 w-5" />
              <h4 className="font-medium">Personal Information</h4>
            </div>
            <div className="grid grid-cols-2 md:grid-cols-4 gap-3">
              {Object.entries(verification.personalInfo).map(([key, verified]) => (
                <div key={key} className="flex items-center gap-2">
                  {verified ? (
                    <CheckCircle className="h-4 w-4 text-green-500" />
                  ) : (
                    <XCircle className="h-4 w-4 text-red-500" />
                  )}
                  <span className="text-sm capitalize">{key.replace(/([A-Z])/g, ' $1').trim()}</span>
                </div>
              ))}
            </div>
          </div>

          {/* Documents */}
          <div className="p-4 border rounded-lg">
            <div className="flex items-center gap-2 mb-3">
              <FileText className="h-5 w-5" />
              <h4 className="font-medium">Documents</h4>
            </div>
            <div className="space-y-2">
              {verification.documents.map((doc, index) => (
                <div key={index} className="flex items-center justify-between">
                  <div className="flex items-center gap-2">
                    {doc.verified ? (
                      <CheckCircle className="h-4 w-4 text-green-500" />
                    ) : (
                      <XCircle className="h-4 w-4 text-red-500" />
                    )}
                    <span className="text-sm">{doc.filename}</span>
                    <span className="text-xs text-gray-500 capitalize">({doc.type.replace('_', ' ')})</span>
                  </div>
                  {doc.rejectionReason && (
                    <span className="text-xs text-red-600">{doc.rejectionReason}</span>
                  )}
                </div>
              ))}
            </div>
          </div>

          {/* Background Check */}
          <div className="p-4 border rounded-lg">
            <div className="flex items-center gap-2 mb-3">
              <Building className="h-5 w-5" />
              <h4 className="font-medium">Background Check</h4>
            </div>
            <div className="space-y-2">
              <div className="flex items-center gap-2">
                {verification.backgroundCheck.criminalRecord ? (
                  <CheckCircle className="h-4 w-4 text-green-500" />
                ) : (
                  <XCircle className="h-4 w-4 text-red-500" />
                )}
                <span className="text-sm">Criminal Record Check</span>
              </div>
              <div className="flex items-center gap-2">
                {verification.backgroundCheck.employmentHistory ? (
                  <CheckCircle className="h-4 w-4 text-green-500" />
                ) : (
                  <XCircle className="h-4 w-4 text-red-500" />
                )}
                <span className="text-sm">Employment History</span>
              </div>
              <div className="flex items-center gap-2">
                {verification.backgroundCheck.references.every(ref => ref.verified) ? (
                  <CheckCircle className="h-4 w-4 text-green-500" />
                ) : (
                  <XCircle className="h-4 w-4 text-red-500" />
                )}
                <span className="text-sm">References ({verification.backgroundCheck.references.filter(ref => ref.verified).length}/{verification.backgroundCheck.references.length})</span>
              </div>
            </div>
          </div>

          {/* Skills Verification */}
          <div className="p-4 border rounded-lg">
            <div className="flex items-center gap-2 mb-3">
              <GraduationCap className="h-5 w-5" />
              <h4 className="font-medium">Skills & Experience</h4>
            </div>
            <div className="space-y-2">
              <div className="flex items-center gap-2">
                {verification.skillsVerification.experienceVerified ? (
                  <CheckCircle className="h-4 w-4 text-green-500" />
                ) : (
                  <XCircle className="h-4 w-4 text-red-500" />
                )}
                <span className="text-sm">Experience Verification ({verification.skillsVerification.experienceYears} years)</span>
              </div>
              <div className="flex items-center gap-2">
                {verification.skillsVerification.certifications.every(cert => cert.verified) ? (
                  <CheckCircle className="h-4 w-4 text-green-500" />
                ) : (
                  <XCircle className="h-4 w-4 text-red-500" />
                )}
                <span className="text-sm">Certifications ({verification.skillsVerification.certifications.filter(cert => cert.verified).length}/{verification.skillsVerification.certifications.length})</span>
              </div>
            </div>
          </div>
        </div>

        {/* Notes */}
        {verification.verificationProcess.notes.length > 0 && (
          <div className="space-y-3">
            <h3 className="font-semibold">Verification Notes</h3>
            <div className="space-y-2">
              {verification.verificationProcess.notes.map((note, index) => (
                <div key={index} className="p-3 bg-gray-50 rounded text-sm">
                  {note}
                </div>
              ))}
            </div>
          </div>
        )}

        {/* Actions */}
        {verification.status === 'rejected' && (
          <div className="pt-4 border-t">
            <div className="bg-red-50 p-4 rounded-lg">
              <h3 className="font-semibold text-red-900 mb-2">Verification Rejected</h3>
              <p className="text-red-700 text-sm mb-3">
                Your verification was rejected. Please review the feedback and resubmit with corrected information.
              </p>
              <Button variant="outline" size="sm">
                Resubmit Verification
              </Button>
            </div>
          </div>
        )}
      </CardContent>
    </Card>
  );
}
