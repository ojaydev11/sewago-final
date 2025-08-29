'use client';

import React, { useState } from 'react';
import { Button } from '@/components/ui/button';
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from '@/components/ui/card';
import { Input } from '@/components/ui/input';
import { Label } from '@/components/ui/label';
import { Textarea } from '@/components/ui/textarea';
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from '@/components/ui/select';
import { Badge } from '@/components/ui/badge';
import { Progress } from '@/components/ui/progress';
import { Alert, AlertDescription } from '@/components/ui/alert';
import { 
  Upload, 
  FileText, 
  CheckCircle, 
  AlertCircle, 
  Clock, 
  Shield, 
  Award,
  UserCheck,
  Building,
  GraduationCap,
  Briefcase,
  Phone,
  Mail,
  MapPin
} from 'lucide-react';

interface VerificationFormData {
  verificationType: 'basic' | 'enhanced' | 'premium';
  documents: Array<{
    type: 'id_proof' | 'address_proof' | 'certification' | 'insurance' | 'background_check' | 'other';
    file: File;
    filename: string;
  }>;
  backgroundCheck: {
    criminalRecord: boolean;
    criminalRecordDetails?: string;
    employmentHistory: boolean;
    employmentHistoryDetails?: string;
    references: Array<{
      name: string;
      phone: string;
      email: string;
      relationship: string;
    }>;
  };
  skillsVerification: {
    certifications: Array<{
      name: string;
      issuingAuthority: string;
      issueDate: string;
      expiryDate?: string;
    }>;
    experienceYears: number;
    previousEmployers: Array<{
      name: string;
      position: string;
      duration: string;
    }>;
  };
}

const initialFormData: VerificationFormData = {
  verificationType: 'basic',
  documents: [],
  backgroundCheck: {
    criminalRecord: false,
    employmentHistory: false,
    references: [
      { name: '', phone: '', email: '', relationship: '' },
      { name: '', phone: '', email: '', relationship: '' }
    ],
  },
  skillsVerification: {
    certifications: [],
    experienceYears: 0,
    previousEmployers: [],
  },
};

export default function ProviderVerificationForm() {
  const [formData, setFormData] = useState<VerificationFormData>(initialFormData);
  const [currentStep, setCurrentStep] = useState(1);
  const [isSubmitting, setIsSubmitting] = useState(false);
  const [submitStatus, setSubmitStatus] = useState<'idle' | 'success' | 'error'>('idle');
  const [errorMessage, setErrorMessage] = useState('');

  const totalSteps = 5;
  const progress = (currentStep / totalSteps) * 100;

  const handleFileUpload = (type: string, file: File) => {
    setFormData(prev => ({
      ...prev,
      documents: [...prev.documents.filter(d => d.type !== type), {
        type: type as any,
        file,
        filename: file.name,
      }],
    }));
  };

  const handleInputChange = (section: keyof VerificationFormData, field: string, value: any) => {
    setFormData(prev => ({
      ...prev,
      [section]: {
<<<<<<< HEAD
        ...prev[section],
=======
        ...(prev[section] as Record<string, any>),
>>>>>>> d7ae416fad47e198a4cbb3bc4d0928f6cb7c7245
        [field]: value,
      },
    }));
  };

  const handleArrayInputChange = (section: keyof VerificationFormData, arrayField: string, index: number, field: string, value: any) => {
    setFormData(prev => ({
      ...prev,
      [section]: {
<<<<<<< HEAD
        ...prev[section],
        [arrayField]: prev[section][arrayField as keyof any].map((item: any, i: number) =>
=======
        ...(prev[section] as Record<string, any>),
        [arrayField]: (prev[section] as Record<string, any>)[arrayField].map((item: any, i: number) =>
>>>>>>> d7ae416fad47e198a4cbb3bc4d0928f6cb7c7245
          i === index ? { ...item, [field]: value } : item
        ),
      },
    }));
  };

  const addArrayItem = (section: keyof VerificationFormData, arrayField: string, template: any) => {
    setFormData(prev => ({
      ...prev,
      [section]: {
<<<<<<< HEAD
        ...prev[section],
        [arrayField]: [...prev[section][arrayField as keyof any], template],
=======
        ...(prev[section] as Record<string, any>),
        [arrayField]: [...(prev[section] as Record<string, any>)[arrayField], template],
>>>>>>> d7ae416fad47e198a4cbb3bc4d0928f6cb7c7245
      },
    }));
  };

  const removeArrayItem = (section: keyof VerificationFormData, arrayField: string, index: number) => {
    setFormData(prev => ({
      ...prev,
      [section]: {
<<<<<<< HEAD
        ...prev[section],
        [arrayField]: prev[section][arrayField as keyof any].filter((_: any, i: number) => i !== index),
=======
        ...(prev[section] as Record<string, any>),
        [arrayField]: (prev[section] as Record<string, any>)[arrayField].filter((_: any, i: number) => i !== index),
>>>>>>> d7ae416fad47e198a4cbb3bc4d0928f6cb7c7245
      },
    }));
  };

  const handleSubmit = async () => {
    setIsSubmitting(true);
    setErrorMessage('');

    try {
      // Convert files to base64 or upload to storage service
      const documents = await Promise.all(
        formData.documents.map(async (doc) => {
          const base64 = await fileToBase64(doc.file);
          return {
            type: doc.type,
            url: base64, // In production, upload to cloud storage
            filename: doc.filename,
          };
        })
      );

      const response = await fetch('/api/verification', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({
          verificationType: formData.verificationType,
          documents,
          backgroundCheck: formData.backgroundCheck,
          skillsVerification: formData.skillsVerification,
        }),
      });

      if (!response.ok) {
        const error = await response.json();
        throw new Error(error.error || 'Failed to submit verification');
      }

      setSubmitStatus('success');
    } catch (error) {
      setSubmitStatus('error');
      setErrorMessage(error instanceof Error ? error.message : 'An error occurred');
    } finally {
      setIsSubmitting(false);
    }
  };

  const fileToBase64 = (file: File): Promise<string> => {
    return new Promise((resolve, reject) => {
      const reader = new FileReader();
      reader.readAsDataURL(file);
      reader.onload = () => resolve(reader.result as string);
      reader.onerror = error => reject(error);
    });
  };

  const renderStep1 = () => (
    <Card>
      <CardHeader>
        <CardTitle className="flex items-center gap-2">
          <Shield className="h-5 w-5" />
          Verification Type Selection
        </CardTitle>
        <CardDescription>
          Choose the level of verification that best suits your needs
        </CardDescription>
      </CardHeader>
      <CardContent className="space-y-6">
        <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
          {[
            {
              type: 'basic',
              title: 'Basic Verification',
              description: 'Essential verification for new providers',
              features: ['ID verification', 'Address verification', 'Basic background check'],
              price: 'Free',
              duration: '5-7 days',
            },
            {
              type: 'enhanced',
              title: 'Enhanced Verification',
              description: 'Comprehensive verification with references',
              features: ['All basic features', 'Reference verification', 'Employment history', 'Skills verification'],
              price: 'Rs 500',
              duration: '3-5 days',
            },
            {
              type: 'premium',
              title: 'Premium Verification',
              description: 'Complete verification with priority processing',
              features: ['All enhanced features', 'Priority processing', 'Detailed background check', 'Certification verification'],
              price: 'Rs 1000',
              duration: '2-3 days',
            },
          ].map((option) => (
            <Card
              key={option.type}
              className={`cursor-pointer transition-all ${
                formData.verificationType === option.type
                  ? 'ring-2 ring-blue-500 bg-blue-50'
                  : 'hover:shadow-md'
              }`}
              onClick={() => setFormData(prev => ({ ...prev, verificationType: option.type as any }))}
            >
              <CardContent className="p-4">
                <div className="text-center">
                  <h3 className="font-semibold text-lg mb-2">{option.title}</h3>
                  <p className="text-sm text-gray-600 mb-3">{option.description}</p>
                  <div className="text-2xl font-bold text-blue-600 mb-3">{option.price}</div>
                  <div className="text-sm text-gray-500 mb-4">Duration: {option.duration}</div>
                  <ul className="text-sm text-gray-600 space-y-1">
                    {option.features.map((feature, index) => (
                      <li key={index} className="flex items-center gap-2">
                        <CheckCircle className="h-3 w-3 text-green-500" />
                        {feature}
                      </li>
                    ))}
                  </ul>
                </div>
              </CardContent>
            </Card>
          ))}
        </div>
      </CardContent>
    </Card>
  );

  const renderStep2 = () => (
    <Card>
      <CardHeader>
        <CardTitle className="flex items-center gap-2">
          <FileText className="h-5 w-5" />
          Document Upload
        </CardTitle>
        <CardDescription>
          Upload required documents for verification
        </CardDescription>
      </CardHeader>
      <CardContent className="space-y-6">
        {[
          { type: 'id_proof', label: 'ID Proof', required: true, description: 'Government-issued ID (Passport, Citizenship, Driver\'s License)' },
          { type: 'address_proof', label: 'Address Proof', required: true, description: 'Utility bill, bank statement, or rental agreement' },
          { type: 'certification', label: 'Professional Certifications', required: false, description: 'Relevant professional certifications or licenses' },
          { type: 'insurance', label: 'Insurance Documents', required: false, description: 'Professional liability or business insurance' },
          { type: 'background_check', label: 'Background Check', required: formData.verificationType !== 'basic', description: 'Police clearance or background check certificate' },
        ].map((docType) => {
          const existingDoc = formData.documents.find(d => d.type === docType.type);
          const isRequired = docType.required || formData.verificationType !== 'basic';
          
          return (
            <div key={docType.type} className="space-y-3">
              <div className="flex items-center gap-2">
                <Label className="font-medium">
                  {docType.label}
                  {isRequired && <span className="text-red-500 ml-1">*</span>}
                </Label>
                {existingDoc && (
                  <Badge variant="secondary" className="text-xs">
                    <CheckCircle className="h-3 w-3 mr-1" />
                    Uploaded
                  </Badge>
                )}
              </div>
              <p className="text-sm text-gray-600">{docType.description}</p>
              
              {!existingDoc ? (
                <div className="border-2 border-dashed border-gray-300 rounded-lg p-6 text-center">
                  <Upload className="h-8 w-8 text-gray-400 mx-auto mb-2" />
                  <Label htmlFor={`file-${docType.type}`} className="cursor-pointer text-blue-600 hover:text-blue-700">
                    Click to upload {docType.label}
                  </Label>
                  <Input
                    id={`file-${docType.type}`}
                    type="file"
                    accept=".pdf,.jpg,.jpeg,.png,.doc,.docx"
                    className="hidden"
                    onChange={(e) => {
                      const file = e.target.files?.[0];
                      if (file) handleFileUpload(docType.type, file);
                    }}
                  />
                </div>
              ) : (
                <div className="flex items-center justify-between p-3 bg-gray-50 rounded-lg">
                  <div className="flex items-center gap-2">
                    <FileText className="h-4 w-4 text-gray-500" />
                    <span className="text-sm font-medium">{existingDoc.filename}</span>
                  </div>
                  <Button
                    variant="outline"
                    size="sm"
                    onClick={() => setFormData(prev => ({
                      ...prev,
                      documents: prev.documents.filter(d => d.type !== docType.type)
                    }))}
                  >
                    Remove
                  </Button>
                </div>
              )}
            </div>
          );
        })}
      </CardContent>
    </Card>
  );

  const renderStep3 = () => (
    <Card>
      <CardHeader>
        <CardTitle className="flex items-center gap-2">
          <UserCheck className="h-5 w-5" />
          Personal Information Verification
        </CardTitle>
        <CardDescription>
          Confirm your personal information for verification
        </CardDescription>
      </CardHeader>
      <CardContent className="space-y-6">
        <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
          <div className="space-y-2">
            <Label>Full Name</Label>
            <Input placeholder="Enter your full name" />
          </div>
          <div className="space-y-2">
            <Label>Phone Number</Label>
            <Input placeholder="Enter your phone number" />
          </div>
          <div className="space-y-2">
            <Label>Email Address</Label>
            <Input placeholder="Enter your email address" />
          </div>
          <div className="space-y-2">
            <Label>District</Label>
            <Input placeholder="Enter your district" />
          </div>
        </div>
        
        <div className="space-y-2">
          <Label>Full Address</Label>
          <Textarea placeholder="Enter your complete address" rows={3} />
        </div>
      </CardContent>
    </Card>
  );

  const renderStep4 = () => (
    <Card>
      <CardHeader>
        <CardTitle className="flex items-center gap-2">
          <Building className="h-5 w-5" />
          Background Check & References
        </CardTitle>
        <CardDescription>
          Provide background information and references
        </CardDescription>
      </CardHeader>
      <CardContent className="space-y-6">
        <div className="space-y-4">
          <div className="flex items-center gap-2">
            <input
              type="checkbox"
              id="criminalRecord"
              checked={formData.backgroundCheck.criminalRecord}
              onChange={(e) => handleInputChange('backgroundCheck', 'criminalRecord', e.target.checked)}
            />
            <Label htmlFor="criminalRecord">I have no criminal record</Label>
          </div>
          
          {!formData.backgroundCheck.criminalRecord && (
            <div className="space-y-2">
              <Label>Please provide details about any criminal record</Label>
              <Textarea
                placeholder="Provide details about any criminal record..."
                rows={3}
                value={formData.backgroundCheck.criminalRecordDetails || ''}
                onChange={(e) => handleInputChange('backgroundCheck', 'criminalRecordDetails', e.target.value)}
              />
            </div>
          )}
        </div>

        <div className="space-y-4">
          <div className="flex items-center gap-2">
            <input
              type="checkbox"
              id="employmentHistory"
              checked={formData.backgroundCheck.employmentHistory}
              onChange={(e) => handleInputChange('backgroundCheck', 'employmentHistory', e.target.checked)}
            />
            <Label htmlFor="employmentHistory">I can provide employment history</Label>
          </div>
          
          {!formData.backgroundCheck.employmentHistory && (
            <div className="space-y-2">
              <Label>Please explain why you cannot provide employment history</Label>
              <Textarea
                placeholder="Explain your situation..."
                rows={3}
                value={formData.backgroundCheck.employmentHistoryDetails || ''}
                onChange={(e) => handleInputChange('backgroundCheck', 'employmentHistoryDetails', e.target.value)}
              />
            </div>
          )}
        </div>

        <div className="space-y-4">
          <div className="flex items-center justify-between">
            <Label className="text-lg font-medium">References</Label>
            <Button
              type="button"
              variant="outline"
              size="sm"
              onClick={() => addArrayItem('backgroundCheck', 'references', { name: '', phone: '', email: '', relationship: '' })}
            >
              Add Reference
            </Button>
          </div>
          
          {formData.backgroundCheck.references.map((reference, index) => (
            <div key={index} className="p-4 border rounded-lg space-y-3">
              <div className="flex items-center justify-between">
                <h4 className="font-medium">Reference {index + 1}</h4>
                {formData.backgroundCheck.references.length > 2 && (
                  <Button
                    type="button"
                    variant="outline"
                    size="sm"
                    onClick={() => removeArrayItem('backgroundCheck', 'references', index)}
                  >
                    Remove
                  </Button>
                )}
              </div>
              
              <div className="grid grid-cols-1 md:grid-cols-2 gap-3">
                <div className="space-y-2">
                  <Label>Name</Label>
                  <Input
                    placeholder="Full name"
                    value={reference.name}
                    onChange={(e) => handleArrayInputChange('backgroundCheck', 'references', index, 'name', e.target.value)}
                  />
                </div>
                <div className="space-y-2">
                  <Label>Phone</Label>
                  <Input
                    placeholder="Phone number"
                    value={reference.phone}
                    onChange={(e) => handleArrayInputChange('backgroundCheck', 'references', index, 'phone', e.target.value)}
                  />
                </div>
                <div className="space-y-2">
                  <Label>Email</Label>
                  <Input
                    placeholder="Email address"
                    value={reference.email}
                    onChange={(e) => handleArrayInputChange('backgroundCheck', 'references', index, 'email', e.target.value)}
                  />
                </div>
                <div className="space-y-2">
                  <Label>Relationship</Label>
                  <Input
                    placeholder="e.g., Former employer, colleague"
                    value={reference.relationship}
                    onChange={(e) => handleArrayInputChange('backgroundCheck', 'references', index, 'relationship', e.target.value)}
                  />
                </div>
              </div>
            </div>
          ))}
        </div>
      </CardContent>
    </Card>
  );

  const renderStep5 = () => (
    <Card>
      <CardHeader>
        <CardTitle className="flex items-center gap-2">
          <GraduationCap className="h-5 w-5" />
          Skills & Experience Verification
        </CardTitle>
        <CardDescription>
          Provide information about your skills, certifications, and experience
        </CardDescription>
      </CardHeader>
      <CardContent className="space-y-6">
        <div className="space-y-4">
          <div className="space-y-2">
            <Label>Years of Experience</Label>
            <Select
              value={formData.skillsVerification.experienceYears.toString()}
              onValueChange={(value) => handleInputChange('skillsVerification', 'experienceYears', parseInt(value))}
            >
              <SelectTrigger>
                <SelectValue />
              </SelectTrigger>
              <SelectContent>
                {Array.from({ length: 21 }, (_, i) => (
                  <SelectItem key={i} value={i.toString()}>
                    {i} {i === 1 ? 'year' : 'years'}
                  </SelectItem>
                ))}
              </SelectContent>
            </Select>
          </div>
        </div>

        <div className="space-y-4">
          <div className="flex items-center justify-between">
            <Label className="text-lg font-medium">Professional Certifications</Label>
            <Button
              type="button"
              variant="outline"
              size="sm"
              onClick={() => addArrayItem('skillsVerification', 'certifications', {
                name: '',
                issuingAuthority: '',
                issueDate: '',
                expiryDate: '',
              })}
            >
              Add Certification
            </Button>
          </div>
          
          {formData.skillsVerification.certifications.map((cert, index) => (
            <div key={index} className="p-4 border rounded-lg space-y-3">
              <div className="flex items-center justify-between">
                <h4 className="font-medium">Certification {index + 1}</h4>
                <Button
                  type="button"
                  variant="outline"
                  size="sm"
                  onClick={() => removeArrayItem('skillsVerification', 'certifications', index)}
                >
                  Remove
                </Button>
              </div>
              
              <div className="grid grid-cols-1 md:grid-cols-2 gap-3">
                <div className="space-y-2">
                  <Label>Certification Name</Label>
                  <Input
                    placeholder="e.g., Professional Plumber License"
                    value={cert.name}
                    onChange={(e) => handleArrayInputChange('skillsVerification', 'certifications', index, 'name', e.target.value)}
                  />
                </div>
                <div className="space-y-2">
                  <Label>Issuing Authority</Label>
                  <Input
                    placeholder="e.g., Government of Nepal"
                    value={cert.issuingAuthority}
                    onChange={(e) => handleArrayInputChange('skillsVerification', 'certifications', index, 'issuingAuthority', e.target.value)}
                  />
                </div>
                <div className="space-y-2">
                  <Label>Issue Date</Label>
                  <Input
                    type="date"
                    value={cert.issueDate}
                    onChange={(e) => handleArrayInputChange('skillsVerification', 'certifications', index, 'issueDate', e.target.value)}
                  />
                </div>
                <div className="space-y-2">
                  <Label>Expiry Date (Optional)</Label>
                  <Input
                    type="date"
                    value={cert.expiryDate || ''}
                    onChange={(e) => handleArrayInputChange('skillsVerification', 'certifications', index, 'expiryDate', e.target.value)}
                  />
                </div>
              </div>
            </div>
          ))}
        </div>

        <div className="space-y-4">
          <div className="flex items-center justify-between">
            <Label className="text-lg font-medium">Previous Employment</Label>
            <Button
              type="button"
              variant="outline"
              size="sm"
              onClick={() => addArrayItem('skillsVerification', 'previousEmployers', {
                name: '',
                position: '',
                duration: '',
              })}
            >
              Add Employer
            </Button>
          </div>
          
          {formData.skillsVerification.previousEmployers.map((employer, index) => (
            <div key={index} className="p-4 border rounded-lg space-y-3">
              <div className="flex items-center justify-between">
                <h4 className="font-medium">Employer {index + 1}</h4>
                <Button
                  type="button"
                  variant="outline"
                  size="sm"
                  onClick={() => removeArrayItem('skillsVerification', 'previousEmployers', index)}
                >
                  Remove
                </Button>
              </div>
              
              <div className="grid grid-cols-1 md:grid-cols-3 gap-3">
                <div className="space-y-2">
                  <Label>Company Name</Label>
                  <Input
                    placeholder="Company name"
                    value={employer.name}
                    onChange={(e) => handleArrayInputChange('skillsVerification', 'previousEmployers', index, 'name', e.target.value)}
                  />
                </div>
                <div className="space-y-2">
                  <Label>Position</Label>
                  <Input
                    placeholder="Your position"
                    value={employer.position}
                    onChange={(e) => handleArrayInputChange('skillsVerification', 'previousEmployers', index, 'position', e.target.value)}
                  />
                </div>
                <div className="space-y-2">
                  <Label>Duration</Label>
                  <Input
                    placeholder="e.g., 2 years"
                    value={employer.duration}
                    onChange={(e) => handleArrayInputChange('skillsVerification', 'previousEmployers', index, 'duration', e.target.value)}
                  />
                </div>
              </div>
            </div>
          ))}
        </div>
      </CardContent>
    </Card>
  );

  const renderStepContent = () => {
    switch (currentStep) {
      case 1: return renderStep1();
      case 2: return renderStep2();
      case 3: return renderStep3();
      case 4: return renderStep4();
      case 5: return renderStep5();
      default: return null;
    }
  };

  const canProceedToNext = () => {
    switch (currentStep) {
      case 1: return formData.verificationType;
      case 2: return formData.documents.length >= 2; // At least ID and address proof
      case 3: return true; // Personal info is basic
      case 4: return formData.backgroundCheck.references.every(ref => ref.name && ref.phone && ref.email && ref.relationship);
      case 5: return true;
      default: return false;
    }
  };

  const canSubmit = () => {
    return currentStep === totalSteps && canProceedToNext();
  };

  if (submitStatus === 'success') {
    return (
      <Card className="max-w-2xl mx-auto">
        <CardContent className="p-8 text-center">
          <CheckCircle className="h-16 w-16 text-green-500 mx-auto mb-4" />
          <h2 className="text-2xl font-bold text-gray-900 mb-2">Verification Submitted!</h2>
          <p className="text-gray-600 mb-6">
            Your verification request has been submitted successfully. Our team will review your information and get back to you within the estimated timeframe.
          </p>
          <div className="bg-blue-50 p-4 rounded-lg">
            <h3 className="font-semibold text-blue-900 mb-2">What happens next?</h3>
            <ul className="text-sm text-blue-800 space-y-1 text-left">
              <li>• Our verification team will review your documents</li>
              <li>• We'll conduct background checks and reference verification</li>
              <li>• You'll receive updates on your verification status</li>
              <li>• Once approved, you'll be able to accept bookings</li>
            </ul>
          </div>
        </CardContent>
      </Card>
    );
  }

  return (
    <div className="max-w-4xl mx-auto space-y-6">
      {/* Progress Bar */}
      <Card>
        <CardContent className="p-6">
          <div className="flex items-center justify-between mb-4">
            <h2 className="text-lg font-semibold">Verification Progress</h2>
            <span className="text-sm text-gray-600">Step {currentStep} of {totalSteps}</span>
          </div>
          <Progress value={progress} className="mb-2" />
          <div className="flex justify-between text-xs text-gray-500">
            <span>Verification Type</span>
            <span>Documents</span>
            <span>Personal Info</span>
            <span>Background</span>
            <span>Skills</span>
          </div>
        </CardContent>
      </Card>

      {/* Step Content */}
      {renderStepContent()}

      {/* Error Alert */}
      {submitStatus === 'error' && (
        <Alert variant="destructive">
          <AlertCircle className="h-4 w-4" />
          <AlertDescription>{errorMessage}</AlertDescription>
        </Alert>
      )}

      {/* Navigation Buttons */}
      <div className="flex justify-between">
        <Button
          variant="outline"
          onClick={() => setCurrentStep(prev => Math.max(1, prev - 1))}
          disabled={currentStep === 1}
        >
          Previous
        </Button>
        
        <div className="flex gap-2">
          {currentStep < totalSteps ? (
            <Button
              onClick={() => setCurrentStep(prev => prev + 1)}
              disabled={!canProceedToNext()}
            >
              Next
            </Button>
          ) : (
            <Button
              onClick={handleSubmit}
              disabled={!canSubmit() || isSubmitting}
            >
              {isSubmitting ? 'Submitting...' : 'Submit Verification'}
            </Button>
          )}
        </div>
      </div>
    </div>
  );
}
