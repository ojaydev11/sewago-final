'use client';

import { useState, useEffect } from 'react';

// Force dynamic rendering to prevent build-time pre-rendering
export const dynamic = 'force-dynamic';
import { useSession } from 'next-auth/react';
import { useRouter } from 'next/navigation';
import { Button } from '@/components/ui/button';
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from '@/components/ui/card';
import { Input } from '@/components/ui/input';
import { Label } from '@/components/ui/label';
import { Textarea } from '@/components/ui/textarea';
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from '@/components/ui/select';
import { Badge } from '@/components/ui/badge';
import { 
  Briefcase, 
  MapPin, 
  User, 
  Clock, 
  CheckCircle,
  AlertCircle,
  Plus,
  X
} from 'lucide-react';
import { toast } from 'sonner';

interface OnboardingFormData {
  skills: string[];
  districts: string[];
  bio: string;
  hourlyRate: number;
  experience: string;
  certifications: string[];
  availability: {
    monday: { start: string; end: string; available: boolean };
    tuesday: { start: string; end: string; available: boolean };
    wednesday: { start: string; end: string; available: boolean };
    thursday: { start: string; end: string; available: boolean };
    friday: { start: string; end: string; available: boolean };
    saturday: { start: string; end: string; available: boolean };
    sunday: { start: string; end: string; available: boolean };
  };
}

const availableSkills = [
  'House Cleaning', 'Deep Cleaning', 'Carpet Cleaning', 'Window Cleaning',
  'Electrical Work', 'Plumbing', 'HVAC', 'Appliance Repair',
  'Gardening', 'Landscaping', 'Tree Trimming', 'Lawn Care',
  'Painting', 'Interior Painting', 'Exterior Painting', 'Wallpaper',
  'Moving & Packing', 'Furniture Assembly', 'Handyman Services',
  'Pet Care', 'Elderly Care', 'Child Care', 'Cooking'
];

const nepaliDistricts = [
  'Kathmandu', 'Lalitpur', 'Bhaktapur', 'Kirtipur', 'Madhyapur Thimi',
  'Banepa', 'Panauti', 'Dhulikhel', 'Kavrepalanchok', 'Nuwakot',
  'Dhading', 'Gorkha', 'Lamjung', 'Tanahun', 'Syangja',
  'Kaski', 'Manang', 'Mustang', 'Myagdi', 'Baglung',
  'Parbat', 'Gulmi', 'Palpa', 'Nawalparasi', 'Rupandehi',
  'Kapilvastu', 'Arghakhanchi', 'Pyuthan', 'Rolpa', 'Rukum',
  'Salyan', 'Dang', 'Banke', 'Bardiya', 'Surkhet',
  'Dailekh', 'Jajarkot', 'Kalikot', 'Mugu', 'Humla',
  'Jumla', 'Dolpa', 'Rukum', 'Salyan', 'Dang'
];

const experienceLevels = [
  { value: 'beginner', label: 'Beginner (0-2 years)' },
  { value: 'intermediate', label: 'Intermediate (2-5 years)' },
  { value: 'experienced', label: 'Experienced (5-10 years)' },
  { value: 'expert', label: 'Expert (10+ years)' }
];

export default function ProviderOnboardingPage() {
  return (
    <div className="min-h-screen bg-gray-50 py-8">
      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
        <div className="bg-white shadow rounded-lg p-8">
          <h1 className="text-2xl font-bold text-gray-900 mb-4">Provider Onboarding</h1>
          <p className="text-gray-600">
            Provider onboarding functionality is temporarily disabled during build. Please check back later.
          </p>
        </div>
      </div>
    </div>
  );
}
