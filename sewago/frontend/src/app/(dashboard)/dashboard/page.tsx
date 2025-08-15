'use client';

import { useState, useEffect } from 'react';

// Force dynamic rendering to prevent build-time pre-rendering
export const dynamic = 'force-dynamic';
import { useSession } from 'next-auth/react';
import { useRouter } from 'next/navigation';
import { Button } from '@/components/ui/button';
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from '@/components/ui/card';
import { Badge } from '@/components/ui/badge';
import { Tabs, TabsContent, TabsList, TabsTrigger } from '@/components/ui/tabs';
import { Calendar, Clock, MapPin, User, Phone, Mail, AlertCircle, CheckCircle, XCircle } from 'lucide-react';
import { format } from 'date-fns';
import { toast } from 'sonner';

interface Booking {
  _id: string;
  serviceId: {
    _id: string;
    name: string;
    slug: string;
    basePrice: number;
    category: string;
  };
  providerId?: {
    _id: string;
    name: string;
    email: string;
    phone: string;
  };
  date: string;
  timeSlot: string;
  address: string;
  notes?: string;
  status: 'pending' | 'confirmed' | 'completed' | 'cancelled';
  createdAt: string;
}

export default function DashboardPage() {
  return (
    <div className="min-h-screen bg-gray-50 py-8">
      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
        <div className="bg-white shadow rounded-lg p-8">
          <h1 className="text-2xl font-bold text-gray-900 mb-4">Dashboard</h1>
          <p className="text-gray-600">
            Dashboard functionality is temporarily disabled during build. Please check back later.
          </p>
        </div>
      </div>
    </div>
  );
}
