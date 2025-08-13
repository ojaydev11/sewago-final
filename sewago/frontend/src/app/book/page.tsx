'use client';

import { useState, useEffect } from 'react';
import { useSearchParams, useRouter } from 'next/navigation';
import { useSession } from 'next-auth/react';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { Label } from '@/components/ui/label';
import { Textarea } from '@/components/ui/textarea';
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from '@/components/ui/card';
import { Badge } from '@/components/ui/badge';
import { Calendar } from '@/components/ui/calendar';
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from '@/components/ui/select';
import { 
  Calendar as CalendarIcon,
  Clock,
  MapPin,
  FileText,
  CheckCircle,
  ArrowLeft,
  ArrowRight,
  Loader2
} from 'lucide-react';
import { format } from 'date-fns';

// Force dynamic rendering to prevent build-time prerendering
export const dynamic = 'force-dynamic';

interface Service {
  _id: string;
  slug: string;
  name: string;
  category: string;
  basePrice: number;
}

interface BookingForm {
  serviceId: string;
  date: Date | undefined;
  timeSlot: string;
  address: string;
  notes: string;
}

const timeSlots = [
  '09:00 AM - 11:00 AM',
  '11:00 AM - 01:00 PM',
  '01:00 PM - 03:00 PM',
  '03:00 PM - 05:00 PM',
  '05:00 PM - 07:00 PM',
];

export default function BookingPage() {
  return (
    <div className="min-h-screen flex items-center justify-center">
      <div className="text-center">
        <div className="animate-spin rounded-full h-32 w-32 border-b-2 border-primary mx-auto"></div>
        <p className="mt-4 text-gray-600">Loading booking page...</p>
      </div>
    </div>
  );
}
