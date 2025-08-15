'use client';

import React, { useState, useEffect } from 'react';
import { Button } from '@/components/ui/button';
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from '@/components/ui/card';
import { Badge } from '@/components/ui/badge';
import { Progress } from '@/components/ui/progress';
import { Alert, AlertDescription } from '@/components/ui/alert';
import { 
  Shield, 
  CheckCircle, 
  XCircle, 
  Clock, 
  AlertTriangle,
  Eye,
  FileText,
  UserCheck,
  Building,
  GraduationCap,
  Calendar,
  Phone,
  Mail,
  MapPin,
  Star,
  TrendingUp,
  Users,
  FileCheck
} from 'lucide-react';
import { Label } from '@/components/ui/label';
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from '@/components/ui/select';

interface Verification {
  _id: string;
  providerId: {
    _id: string;
    businessName: string;
    services: string[];
    hourlyRate: number;
  };
  userId: {
    _id: string;
    name: string;
    email: string;
    phone: string;
    district: string;
  };
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
      phone: string;
      email: string;
      relationship: string;
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
      _id: string;
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
    approvedBy?: {
      _id: string;
      name: string;
      email: string;
    };
    approvedAt?: string;
    rejectionReason?: string;
    rejectionDetails?: string;
    appealDeadline?: string;
  };
  createdAt: string;
  updatedAt: string;
}

export default function AdminVerificationDashboard() {
  const [verifications, setVerifications] = useState<Verification[]>([]);
  const [selectedVerification, setSelectedVerification] = useState<Verification | null>(null);
  const [isLoading, setIsLoading] = useState(true);
  const [error, setError] = useState('');
  const [filter, setFilter] = useState<'all' | 'pending' | 'in_progress' | 'approved' | 'rejected'>('all');
  const [priority, setPriority] = useState<'all' | 'low' | 'medium' | 'high' | 'urgent'>('all');

  useEffect(() => {
    fetchVerifications();
  }, []);

  const fetchVerifications = async () => {
    try {
      const response = await fetch('/api/verification');
      if (!response.ok) throw new Error('Failed to fetch verifications');
      const data = await response.json();
      setVerifications(data.verifications);
    } catch (error) {
      setError(error instanceof Error ? error.message : 'Failed to fetch verifications');
    } finally {
      setIsLoading(false);
    }
  };

  const handleVerificationAction = async (verificationId: string, action: string, data?: any) => {
    try {
      const response = await fetch(`/api/admin/verification/${verificationId}`, {
        method: 'PATCH',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ action, data }),
      });

      if (!response.ok) throw new Error('Failed to update verification');
      
      // Refresh verifications
      await fetchVerifications();
      
      // Close detail view if verification was approved/rejected
      if (['approve', 'reject'].includes(action)) {
        setSelectedVerification(null);
      }
    } catch (error) {
      setError(error instanceof Error ? error.message : 'Failed to update verification');
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

  const getCompletionPercentage = (verification: Verification) => {
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

  const filteredVerifications = verifications.filter(verification => {
    const matchesFilter = filter === 'all' || verification.status === filter;
    const matchesPriority = priority === 'all' || verification.verificationProcess.priority === priority;
    return matchesFilter && matchesPriority;
  });

  const stats = {
    total: verifications.length,
    pending: verifications.filter(v => v.status === 'pending').length,
    inProgress: verifications.filter(v => v.status === 'in_progress').length,
    approved: verifications.filter(v => v.status === 'approved').length,
    rejected: verifications.filter(v => v.status === 'rejected').length,
  };

  if (isLoading) {
    return (
      <div className="flex items-center justify-center h-64">
        <div className="animate-spin rounded-full h-12 w-12 border-b-2 border-blue-500"></div>
      </div>
    );
  }

  if (error) {
    return (
      <Alert variant="destructive">
        <AlertTriangle className="h-4 w-4" />
        <AlertDescription>{error}</AlertDescription>
      </Alert>
    );
  }

  return (
    <div className="space-y-6">
      {/* Stats Overview */}
      <div className="grid grid-cols-1 md:grid-cols-5 gap-4">
        <Card>
          <CardContent className="p-4">
            <div className="flex items-center gap-2">
              <Shield className="h-5 w-5 text-blue-500" />
              <div>
                <div className="text-2xl font-bold">{stats.total}</div>
                <div className="text-sm text-gray-600">Total</div>
              </div>
            </div>
          </CardContent>
        </Card>
        
        <Card>
          <CardContent className="p-4">
            <div className="flex items-center gap-2">
              <Clock className="h-5 w-5 text-yellow-500" />
              <div>
                <div className="text-2xl font-bold">{stats.pending}</div>
                <div className="text-sm text-gray-600">Pending</div>
              </div>
            </div>
          </CardContent>
        </Card>
        
        <Card>
          <CardContent className="p-4">
            <div className="flex items-center gap-2">
              <TrendingUp className="h-5 w-5 text-blue-500" />
              <div>
                <div className="text-2xl font-bold">{stats.inProgress}</div>
                <div className="text-sm text-gray-600">In Progress</div>
              </div>
            </div>
          </CardContent>
        </Card>
        
        <Card>
          <CardContent className="p-4">
            <div className="flex items-center gap-2">
              <CheckCircle className="h-5 w-5 text-green-500" />
              <div>
                <div className="text-2xl font-bold">{stats.approved}</div>
                <div className="text-sm text-gray-600">Approved</div>
              </div>
            </div>
          </CardContent>
        </Card>
        
        <Card>
          <CardContent className="p-4">
            <div className="flex items-center gap-2">
              <XCircle className="h-5 w-5 text-red-500" />
              <div>
                <div className="text-2xl font-bold">{stats.rejected}</div>
                <div className="text-sm text-gray-600">Rejected</div>
              </div>
            </div>
          </CardContent>
        </Card>
      </div>

      {/* Filters */}
      <Card>
        <CardContent className="p-4">
          <div className="flex flex-wrap gap-4">
            <div className="space-y-2">
              <Label className="text-sm font-medium">Status</Label>
              <Select value={filter} onValueChange={(value: any) => setFilter(value)}>
                <SelectTrigger className="w-32">
                  <SelectValue />
                </SelectTrigger>
                <SelectContent>
                  <SelectItem value="all">All</SelectItem>
                  <SelectItem value="pending">Pending</SelectItem>
                  <SelectItem value="in_progress">In Progress</SelectItem>
                  <SelectItem value="approved">Approved</SelectItem>
                  <SelectItem value="rejected">Rejected</SelectItem>
                </SelectContent>
              </Select>
            </div>
            
            <div className="space-y-2">
              <Label className="text-sm font-medium">Priority</Label>
              <Select value={priority} onValueChange={(value: any) => setPriority(value)}>
                <SelectTrigger className="w-32">
                  <SelectValue />
                </SelectTrigger>
                <SelectContent>
                  <SelectItem value="all">All</SelectItem>
                  <SelectItem value="urgent">Urgent</SelectItem>
                  <SelectItem value="high">High</SelectItem>
                  <SelectItem value="medium">Medium</SelectItem>
                  <SelectItem value="low">Low</SelectItem>
                </SelectContent>
              </Select>
            </div>
          </div>
        </CardContent>
      </Card>

      {/* Verifications List */}
      <div className="space-y-4">
        {filteredVerifications.map((verification) => (
          <Card key={verification._id} className="hover:shadow-md transition-shadow">
            <CardContent className="p-6">
              <div className="flex items-center justify-between mb-4">
                <div className="flex items-center gap-4">
                  <div>
                    <h3 className="font-semibold text-lg">{verification.userId.name}</h3>
                    <p className="text-sm text-gray-600">{verification.providerId.businessName}</p>
                  </div>
                  <Badge className={getStatusColor(verification.status)}>
                    {verification.status.replace('_', ' ').toUpperCase()}
                  </Badge>
                  <Badge className={getPriorityColor(verification.verificationProcess.priority)}>
                    {verification.verificationProcess.priority.toUpperCase()}
                  </Badge>
                </div>
                
                <div className="flex items-center gap-2">
                  <Button
                    variant="outline"
                    size="sm"
                    onClick={() => setSelectedVerification(verification)}
                  >
                    <Eye className="h-4 w-4 mr-2" />
                    Review
                  </Button>
                  
                  {verification.status === 'pending' && (
                    <Button
                      size="sm"
                      onClick={() => handleVerificationAction(verification._id, 'assign')}
                    >
                      Assign to Me
                    </Button>
                  )}
                </div>
              </div>
              
              <div className="grid grid-cols-1 md:grid-cols-3 gap-4 mb-4">
                <div className="space-y-2">
                  <div className="flex items-center gap-2 text-sm text-gray-600">
                    <Mail className="h-4 w-4" />
                    {verification.userId.email}
                  </div>
                  <div className="flex items-center gap-2 text-sm text-gray-600">
                    <Phone className="h-4 w-4" />
                    {verification.userId.phone}
                  </div>
                  <div className="flex items-center gap-2 text-sm text-gray-600">
                    <MapPin className="h-4 w-4" />
                    {verification.userId.district}
                  </div>
                </div>
                
                <div className="space-y-2">
                  <div className="text-sm">
                    <span className="font-medium">Type:</span> {verification.verificationType}
                  </div>
                  <div className="text-sm">
                    <span className="font-medium">Services:</span> {verification.providerId.services.join(', ')}
                  </div>
                  <div className="text-sm">
                    <span className="font-medium">Rate:</span> Rs {verification.providerId.hourlyRate}/hr
                  </div>
                </div>
                
                <div className="space-y-2">
                  <div className="text-sm">
                    <span className="font-medium">Submitted:</span> {new Date(verification.verificationProcess.submittedAt).toLocaleDateString()}
                  </div>
                  {verification.verificationProcess.estimatedCompletion && (
                    <div className="text-sm">
                      <span className="font-medium">Est. Completion:</span> {new Date(verification.verificationProcess.estimatedCompletion).toLocaleDateString()}
                    </div>
                  )}
                  {verification.verificationProcess.assignedTo && (
                    <div className="text-sm">
                      <span className="font-medium">Assigned to:</span> {verification.verificationProcess.assignedTo.name}
                    </div>
                  )}
                </div>
              </div>
              
              {/* Progress Bar */}
              <div className="space-y-2">
                <div className="flex justify-between text-sm">
                  <span>Verification Progress</span>
                  <span>{getCompletionPercentage(verification)}%</span>
                </div>
                <Progress value={getCompletionPercentage(verification)} />
              </div>
            </CardContent>
          </Card>
        ))}
      </div>

      {/* Verification Detail Modal */}
      {selectedVerification && (
        <div className="fixed inset-0 bg-black/50 flex items-center justify-center z-50 p-4">
          <Card className="max-w-4xl w-full max-h-[90vh] overflow-y-auto">
            <CardHeader>
              <div className="flex items-center justify-between">
                <div>
                  <CardTitle>Verification Details - {selectedVerification.userId.name}</CardTitle>
                  <CardDescription>{selectedVerification.providerId.businessName}</CardDescription>
                </div>
                <Button
                  variant="outline"
                  onClick={() => setSelectedVerification(null)}
                >
                  Close
                </Button>
              </div>
            </CardHeader>
            
            <CardContent className="space-y-6">
              {/* Provider Information */}
              <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
                <div>
                  <h3 className="font-semibold mb-3">Provider Information</h3>
                  <div className="space-y-2 text-sm">
                    <div><span className="font-medium">Name:</span> {selectedVerification.userId.name}</div>
                    <div><span className="font-medium">Email:</span> {selectedVerification.userId.email}</div>
                    <div><span className="font-medium">Phone:</span> {selectedVerification.userId.phone}</div>
                    <div><span className="font-medium">District:</span> {selectedVerification.userId.district}</div>
                    <div><span className="font-medium">Business:</span> {selectedVerification.providerId.businessName}</div>
                    <div><span className="font-medium">Services:</span> {selectedVerification.providerId.services.join(', ')}</div>
                    <div><span className="font-medium">Hourly Rate:</span> Rs {selectedVerification.providerId.hourlyRate}</div>
                  </div>
                </div>
                
                <div>
                  <h3 className="font-semibold mb-3">Verification Status</h3>
                  <div className="space-y-2 text-sm">
                    <div><span className="font-medium">Status:</span> 
                      <Badge className={`ml-2 ${getStatusColor(selectedVerification.status)}`}>
                        {selectedVerification.status.replace('_', ' ').toUpperCase()}
                      </Badge>
                    </div>
                    <div><span className="font-medium">Type:</span> {selectedVerification.verificationType}</div>
                    <div><span className="font-medium">Priority:</span> 
                      <Badge className={`ml-2 ${getPriorityColor(selectedVerification.verificationProcess.priority)}`}>
                        {selectedVerification.verificationProcess.priority.toUpperCase()}
                      </Badge>
                    </div>
                    <div><span className="font-medium">Submitted:</span> {new Date(selectedVerification.verificationProcess.submittedAt).toLocaleDateString()}</div>
                    {selectedVerification.verificationProcess.estimatedCompletion && (
                      <div><span className="font-medium">Est. Completion:</span> {new Date(selectedVerification.verificationProcess.estimatedCompletion).toLocaleDateString()}</div>
                    )}
                  </div>
                </div>
              </div>

              {/* Verification Sections */}
              <div className="space-y-6">
                {/* Personal Information */}
                <div>
                  <h3 className="font-semibold mb-3 flex items-center gap-2">
                    <UserCheck className="h-5 w-5" />
                    Personal Information Verification
                  </h3>
                  <div className="grid grid-cols-2 md:grid-cols-4 gap-4">
                    {Object.entries(selectedVerification.personalInfo).map(([key, verified]) => (
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
                <div>
                  <h3 className="font-semibold mb-3 flex items-center gap-2">
                    <FileText className="h-5 w-5" />
                    Document Verification
                  </h3>
                  <div className="space-y-3">
                    {selectedVerification.documents.map((doc, index) => (
                      <div key={index} className="flex items-center justify-between p-3 border rounded-lg">
                        <div className="flex items-center gap-3">
                          <FileText className="h-4 w-4 text-gray-500" />
                          <div>
                            <div className="font-medium">{doc.filename}</div>
                            <div className="text-sm text-gray-600 capitalize">{doc.type.replace('_', ' ')}</div>
                          </div>
                        </div>
                        
                        <div className="flex items-center gap-2">
                          {doc.verified ? (
                            <Badge variant="secondary" className="bg-green-100 text-green-800">
                              <CheckCircle className="h-3 w-3 mr-1" />
                              Verified
                            </Badge>
                          ) : (
                            <div className="flex gap-2">
                              <Button
                                size="sm"
                                onClick={() => handleVerificationAction(selectedVerification._id, 'verify_document', {
                                  documentIndex: index,
                                  verified: true,
                                })}
                              >
                                Verify
                              </Button>
                              <Button
                                variant="outline"
                                size="sm"
                                onClick={() => {
                                  const reason = prompt('Rejection reason:');
                                  if (reason) {
                                    handleVerificationAction(selectedVerification._id, 'verify_document', {
                                      documentIndex: index,
                                      verified: false,
                                      rejectionReason: reason,
                                    });
                                  }
                                }}
                              >
                                Reject
                              </Button>
                            </div>
                          )}
                        </div>
                      </div>
                    ))}
                  </div>
                </div>

                {/* Background Check */}
                <div>
                  <h3 className="font-semibold mb-3 flex items-center gap-2">
                    <Building className="h-5 w-5" />
                    Background Check
                  </h3>
                  <div className="space-y-4">
                    <div className="flex items-center gap-2">
                      <span className="text-sm">Criminal Record:</span>
                      {selectedVerification.backgroundCheck.criminalRecord ? (
                        <CheckCircle className="h-4 w-4 text-green-500" />
                      ) : (
                        <XCircle className="h-4 w-4 text-red-500" />
                      )}
                    </div>
                    
                    <div className="flex items-center gap-2">
                      <span className="text-sm">Employment History:</span>
                      {selectedVerification.backgroundCheck.employmentHistory ? (
                        <CheckCircle className="h-4 w-4 text-green-500" />
                      ) : (
                        <XCircle className="h-4 w-4 text-red-500" />
                      )}
                    </div>
                    
                    <div>
                      <h4 className="font-medium mb-2">References</h4>
                      <div className="space-y-2">
                        {selectedVerification.backgroundCheck.references.map((ref, index) => (
                          <div key={index} className="flex items-center justify-between p-2 border rounded">
                            <div className="text-sm">
                              <div>{ref.name} - {ref.relationship}</div>
                              <div className="text-gray-600">{ref.phone} • {ref.email}</div>
                            </div>
                            
                            {!ref.verified && (
                              <Button
                                size="sm"
                                onClick={() => handleVerificationAction(selectedVerification._id, 'verify_reference', {
                                  referenceIndex: index,
                                  verified: true,
                                })}
                              >
                                Verify
                              </Button>
                            )}
                          </div>
                        ))}
                      </div>
                    </div>
                  </div>
                </div>

                {/* Skills Verification */}
                <div>
                  <h3 className="font-semibold mb-3 flex items-center gap-2">
                    <GraduationCap className="h-5 w-5" />
                    Skills & Experience Verification
                  </h3>
                  <div className="space-y-4">
                    <div className="flex items-center gap-2">
                      <span className="text-sm">Experience Verified:</span>
                      {selectedVerification.skillsVerification.experienceVerified ? (
                        <CheckCircle className="h-4 w-4 text-green-500" />
                      ) : (
                        <XCircle className="h-4 w-4 text-red-500" />
                      )}
                    </div>
                    
                    <div className="text-sm">
                      <span className="font-medium">Years of Experience:</span> {selectedVerification.skillsVerification.experienceYears}
                    </div>
                    
                    <div>
                      <h4 className="font-medium mb-2">Certifications</h4>
                      <div className="space-y-2">
                        {selectedVerification.skillsVerification.certifications.map((cert, index) => (
                          <div key={index} className="flex items-center justify-between p-2 border rounded">
                            <span className="text-sm">{cert.name}</span>
                            
                            {!cert.verified && (
                              <Button
                                size="sm"
                                onClick={() => handleVerificationAction(selectedVerification._id, 'verify_certification', {
                                  certIndex: index,
                                  verified: true,
                                })}
                              >
                                Verify
                              </Button>
                            )}
                          </div>
                        ))}
                      </div>
                    </div>
                  </div>
                </div>

                {/* Notes */}
                <div>
                  <h3 className="font-semibold mb-3">Verification Notes</h3>
                  <div className="space-y-2">
                    {selectedVerification.verificationProcess.notes.map((note, index) => (
                      <div key={index} className="p-2 bg-gray-50 rounded text-sm">
                        {note}
                      </div>
                    ))}
                  </div>
                  
                  <div className="mt-3">
                    <Button
                      variant="outline"
                      size="sm"
                      onClick={() => {
                        const note = prompt('Add a note:');
                        if (note) {
                          handleVerificationAction(selectedVerification._id, 'add_note', { note });
                        }
                      }}
                    >
                      Add Note
                    </Button>
                  </div>
                </div>

                {/* Final Decision */}
                {selectedVerification.status === 'pending' || selectedVerification.status === 'in_progress' ? (
                  <div className="flex gap-3 pt-4 border-t">
                    <Button
                      onClick={() => handleVerificationAction(selectedVerification._id, 'approve')}
                      className="flex-1"
                    >
                      <CheckCircle className="h-4 w-4 mr-2" />
                      Approve Verification
                    </Button>
                    
                    <Button
                      variant="destructive"
                      onClick={() => {
                        const reason = prompt('Rejection reason:');
                        const details = prompt('Rejection details:');
                        if (reason && details) {
                          handleVerificationAction(selectedVerification._id, 'reject', { reason, details });
                        }
                      }}
                      className="flex-1"
                    >
                      <XCircle className="h-4 w-4 mr-2" />
                      Reject Verification
                    </Button>
                  </div>
                ) : (
                  <div className="pt-4 border-t">
                    <h3 className="font-semibold mb-3">Decision</h3>
                    {selectedVerification.decision?.approved ? (
                      <div className="flex items-center gap-2 text-green-600">
                        <CheckCircle className="h-5 w-5" />
                        <span>Approved by {selectedVerification.decision.approvedBy?.name} on {selectedVerification.decision.approvedAt ? new Date(selectedVerification.decision.approvedAt).toLocaleDateString() : 'Unknown date'}</span>
                      </div>
                    ) : (
                      <div className="space-y-2">
                        <div className="flex items-center gap-2 text-red-600">
                          <XCircle className="h-5 w-5" />
                          <span>Rejected by {selectedVerification.decision?.approvedBy?.name} on {selectedVerification.decision?.approvedAt ? new Date(selectedVerification.decision.approvedAt).toLocaleDateString() : 'Unknown date'}</span>
                        </div>
                        <div className="text-sm">
                          <div><span className="font-medium">Reason:</span> {selectedVerification.decision?.rejectionReason}</div>
                          <div><span className="font-medium">Details:</span> {selectedVerification.decision?.rejectionDetails}</div>
                          {selectedVerification.decision?.appealDeadline && (
                            <div><span className="font-medium">Appeal Deadline:</span> {new Date(selectedVerification.decision.appealDeadline).toLocaleDateString()}</div>
                          )}
                        </div>
                      </div>
                    )}
                  </div>
                )}
              </div>
            </CardContent>
          </Card>
        </div>
      )}
    </div>
  );
}
