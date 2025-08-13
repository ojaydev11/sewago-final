'use client';

import { useState, useEffect } from 'react';
import { useSession } from 'next-auth/react';
import { useRouter, useSearchParams } from 'next/navigation';
import Link from 'next/link';
import { Button } from '@/components/ui/button';
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from '@/components/ui/card';
import { Badge } from '@/components/ui/badge';
import { Tabs, TabsContent, TabsList, TabsTrigger } from '@/components/ui/tabs';
import { 
  Calendar,
  Clock,
  MapPin,
  User,
  Phone,
  Mail,
  Plus,
  RefreshCw,
  CheckCircle,
  XCircle,
  AlertCircle,
  Loader2
} from 'lucide-react';
import { format } from 'date-fns';

// Force dynamic rendering to prevent build-time prerendering
export const dynamic = 'force-dynamic';

interface Booking {
  _id: string;
  serviceId: {
    _id: string;
    name: string;
    category: string;
    basePrice: number;
  };
  date: string;
  timeSlot: string;
  address: string;
  notes: string;
  status: 'pending' | 'confirmed' | 'completed' | 'cancelled';
  createdAt: string;
  providerId?: {
    _id: string;
    name: string;
    email: string;
    phone: string;
  };
}

export default function DashboardPage() {
  return (
    <div className="min-h-screen flex items-center justify-center">
      <div className="text-center">
        <div className="animate-spin rounded-full h-32 w-32 border-b-2 border-primary mx-auto"></div>
        <p className="mt-4 text-gray-600">Loading dashboard...</p>
      </div>
    </div>
  );
}
