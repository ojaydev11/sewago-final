'use client';

import { useState, useCallback, useEffect } from 'react';
import { useSocket } from './useSocket';

type ServiceStage = 
  | 'PENDING'
  | 'CONFIRMED'
  | 'PREPARATION'
  | 'EN_ROUTE'
  | 'ARRIVED'
  | 'IN_PROGRESS'
  | 'QUALITY_CHECK'
  | 'CUSTOMER_REVIEW'
  | 'COMPLETED'
  | 'VERIFIED'
  | 'PAYMENT_PENDING'
  | 'CLOSED';

interface ServiceMilestone {
  stage: ServiceStage;
  timestamp: string;
  description: string;
  completedBy?: string;
  estimatedDuration?: number;
  actualDuration?: number;
  notes?: string;
  photos?: string[];
}

interface QualityCheckpoint {
  id: string;
  name: string;
  description: string;
  required: boolean;
  completed: boolean;
  completedAt?: string;
  photos?: string[];
  notes?: string;
  score?: number; // 1-5 rating
}

interface CustomerApproval {
  milestone: string;
  approved: boolean;
  approvedAt: string;
  comments?: string;
  rating?: number;
  photos?: string[];
}

interface ServiceIssue {
  id: string;
  type: 'QUALITY' | 'DELAY' | 'EQUIPMENT' | 'COMMUNICATION' | 'OTHER';
  severity: 'LOW' | 'MEDIUM' | 'HIGH' | 'CRITICAL';
  description: string;
  reportedAt: string;
  reportedBy: 'CUSTOMER' | 'PROVIDER' | 'SYSTEM';
  status: 'OPEN' | 'IN_PROGRESS' | 'RESOLVED' | 'CLOSED';
  resolution?: string;
  resolvedAt?: string;
}

interface ServiceProgressData {
  bookingId: string;
  currentStage: ServiceStage;
  stages: ServiceMilestone[];
  startedAt?: string;
  estimatedCompletion?: string;
  actualCompletion?: string;
  qualityChecks: QualityCheckpoint[];
  customerApprovals: CustomerApproval[];
  evidencePhotos: string[];
  notes?: string;
  issuesReported: ServiceIssue[];
  progressPercentage: number;
  nextMilestone?: ServiceMilestone;
}

export function useServiceProgress() {
  const [progressData, setProgressData] = useState<ServiceProgressData | null>(null);
  const [isLoading, setIsLoading] = useState(false);
  const [error, setError] = useState<string | null>(null);
  const [realTimeUpdates, setRealTimeUpdates] = useState(true);
  
  const { socket, isConnected } = useSocket();

  // Track service progress for a booking
  const trackProgress = useCallback(async (bookingId: string): Promise<ServiceProgressData> => {
    setIsLoading(true);
    setError(null);

    try {
      const response = await fetch(`/api/services/progress-tracking?bookingId=${bookingId}`);
      if (!response.ok) {
        throw new Error('Failed to fetch service progress');
      }

      const data: ServiceProgressData = await response.json();
      setProgressData(data);
      setIsLoading(false);

      // Subscribe to real-time updates
      if (socket && isConnected && realTimeUpdates) {
        socket.emit('subscribe_service_progress', { bookingId });
      }

      return data;
    } catch (err) {
      const errorMessage = err instanceof Error ? err.message : 'Failed to track progress';
      setError(errorMessage);
      setIsLoading(false);
      throw new Error(errorMessage);
    }
  }, [socket, isConnected, realTimeUpdates]);

  // Update progress stage
  const updateStage = useCallback(async (
    bookingId: string, 
    stage: ServiceStage, 
    notes?: string,
    photos?: File[]
  ): Promise<void> => {
    try {
      const formData = new FormData();
      formData.append('bookingId', bookingId);
      formData.append('stage', stage);
      if (notes) formData.append('notes', notes);
      
      if (photos) {
        photos.forEach((photo, index) => {
          formData.append(`photos[${index}]`, photo);
        });
      }

      const response = await fetch('/api/services/progress-tracking', {
        method: 'POST',
        body: formData
      });

      if (!response.ok) {
        throw new Error('Failed to update progress stage');
      }

      // The real-time update will handle the state update
    } catch (err) {
      const errorMessage = err instanceof Error ? err.message : 'Failed to update stage';
      setError(errorMessage);
      throw new Error(errorMessage);
    }
  }, []);

  // Complete quality checkpoint
  const completeQualityCheck = useCallback(async (
    bookingId: string,
    checkpointId: string,
    score: number,
    notes?: string,
    photos?: File[]
  ): Promise<void> => {
    try {
      const formData = new FormData();
      formData.append('bookingId', bookingId);
      formData.append('checkpointId', checkpointId);
      formData.append('score', score.toString());
      if (notes) formData.append('notes', notes);
      
      if (photos) {
        photos.forEach((photo, index) => {
          formData.append(`photos[${index}]`, photo);
        });
      }

      const response = await fetch('/api/services/quality-checks', {
        method: 'POST',
        body: formData
      });

      if (!response.ok) {
        throw new Error('Failed to complete quality check');
      }
    } catch (err) {
      const errorMessage = err instanceof Error ? err.message : 'Failed to complete quality check';
      setError(errorMessage);
      throw new Error(errorMessage);
    }
  }, []);

  // Submit customer approval
  const submitApproval = useCallback(async (
    bookingId: string,
    milestone: string,
    approved: boolean,
    comments?: string,
    rating?: number,
    photos?: File[]
  ): Promise<void> => {
    try {
      const formData = new FormData();
      formData.append('bookingId', bookingId);
      formData.append('milestone', milestone);
      formData.append('approved', approved.toString());
      if (comments) formData.append('comments', comments);
      if (rating) formData.append('rating', rating.toString());
      
      if (photos) {
        photos.forEach((photo, index) => {
          formData.append(`photos[${index}]`, photo);
        });
      }

      const response = await fetch('/api/services/customer-approval', {
        method: 'POST',
        body: formData
      });

      if (!response.ok) {
        throw new Error('Failed to submit approval');
      }
    } catch (err) {
      const errorMessage = err instanceof Error ? err.message : 'Failed to submit approval';
      setError(errorMessage);
      throw new Error(errorMessage);
    }
  }, []);

  // Report an issue
  const reportIssue = useCallback(async (
    bookingId: string,
    type: ServiceIssue['type'],
    severity: ServiceIssue['severity'],
    description: string
  ): Promise<void> => {
    try {
      const response = await fetch('/api/services/report-issue', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({
          bookingId,
          type,
          severity,
          description
        })
      });

      if (!response.ok) {
        throw new Error('Failed to report issue');
      }
    } catch (err) {
      const errorMessage = err instanceof Error ? err.message : 'Failed to report issue';
      setError(errorMessage);
      throw new Error(errorMessage);
    }
  }, []);

  // Calculate progress percentage
  const calculateProgress = useCallback((stages: ServiceMilestone[], currentStage: ServiceStage): number => {
    const stageOrder: ServiceStage[] = [
      'PENDING', 'CONFIRMED', 'PREPARATION', 'EN_ROUTE', 'ARRIVED',
      'IN_PROGRESS', 'QUALITY_CHECK', 'CUSTOMER_REVIEW', 'COMPLETED',
      'VERIFIED', 'PAYMENT_PENDING', 'CLOSED'
    ];

    const currentIndex = stageOrder.indexOf(currentStage);
    const totalStages = stageOrder.length;
    
    return Math.round(((currentIndex + 1) / totalStages) * 100);
  }, []);

  // Get estimated completion time
  const getEstimatedCompletion = useCallback((
    stages: ServiceMilestone[],
    currentStage: ServiceStage
  ): string | null => {
    const completedStages = stages.filter(s => s.timestamp);
    if (completedStages.length < 2) return null;

    // Calculate average duration per stage
    const durations = completedStages
      .map(s => s.actualDuration)
      .filter((d): d is number => d !== undefined);
    
    if (durations.length === 0) return null;

    const averageDuration = durations.reduce((sum, d) => sum + d, 0) / durations.length;
    
    const stageOrder: ServiceStage[] = [
      'PENDING', 'CONFIRMED', 'PREPARATION', 'EN_ROUTE', 'ARRIVED',
      'IN_PROGRESS', 'QUALITY_CHECK', 'CUSTOMER_REVIEW', 'COMPLETED'
    ];

    const currentIndex = stageOrder.indexOf(currentStage);
    const remainingStages = stageOrder.length - currentIndex - 1;
    
    const estimatedMinutes = remainingStages * averageDuration;
    const estimatedCompletion = new Date();
    estimatedCompletion.setMinutes(estimatedCompletion.getMinutes() + estimatedMinutes);
    
    return estimatedCompletion.toISOString();
  }, []);

  // Get stage display info
  const getStageInfo = useCallback((stage: ServiceStage) => {
    const stageInfo = {
      PENDING: { label: 'Pending Confirmation', icon: '⏳', color: 'text-yellow-600' },
      CONFIRMED: { label: 'Confirmed', icon: '✅', color: 'text-green-600' },
      PREPARATION: { label: 'Preparing', icon: '🔧', color: 'text-blue-600' },
      EN_ROUTE: { label: 'On the Way', icon: '🚗', color: 'text-purple-600' },
      ARRIVED: { label: 'Arrived', icon: '📍', color: 'text-green-600' },
      IN_PROGRESS: { label: 'In Progress', icon: '⚡', color: 'text-orange-600' },
      QUALITY_CHECK: { label: 'Quality Check', icon: '🔍', color: 'text-indigo-600' },
      CUSTOMER_REVIEW: { label: 'Customer Review', icon: '⭐', color: 'text-yellow-600' },
      COMPLETED: { label: 'Completed', icon: '✅', color: 'text-green-600' },
      VERIFIED: { label: 'Verified', icon: '✅', color: 'text-green-700' },
      PAYMENT_PENDING: { label: 'Payment Pending', icon: '💳', color: 'text-red-600' },
      CLOSED: { label: 'Closed', icon: '🔒', color: 'text-gray-600' }
    };

    return stageInfo[stage] || { label: 'Unknown', icon: '❓', color: 'text-gray-600' };
  }, []);

  // Socket event listeners for real-time updates
  useEffect(() => {
    if (!socket || !isConnected || !realTimeUpdates) return;

    const handleProgressUpdate = (data: {
      bookingId: string;
      stage: ServiceStage;
      milestone?: ServiceMilestone;
      progressPercentage: number;
    }) => {
      if (progressData && data.bookingId === progressData.bookingId) {
        setProgressData(prev => {
          if (!prev) return null;
          
          const updatedStages = data.milestone 
            ? [...prev.stages, data.milestone]
            : prev.stages;

          return {
            ...prev,
            currentStage: data.stage,
            stages: updatedStages,
            progressPercentage: data.progressPercentage,
            nextMilestone: undefined // Will be recalculated
          };
        });
      }
    };

    const handleQualityCheckUpdate = (data: {
      bookingId: string;
      checkpoint: QualityCheckpoint;
    }) => {
      if (progressData && data.bookingId === progressData.bookingId) {
        setProgressData(prev => {
          if (!prev) return null;
          
          const updatedChecks = prev.qualityChecks.map(check =>
            check.id === data.checkpoint.id ? data.checkpoint : check
          );

          return { ...prev, qualityChecks: updatedChecks };
        });
      }
    };

    const handleIssueReported = (data: {
      bookingId: string;
      issue: ServiceIssue;
    }) => {
      if (progressData && data.bookingId === progressData.bookingId) {
        setProgressData(prev => {
          if (!prev) return null;
          return {
            ...prev,
            issuesReported: [...prev.issuesReported, data.issue]
          };
        });
      }
    };

    socket.on('progress_update', handleProgressUpdate);
    socket.on('quality_check_update', handleQualityCheckUpdate);
    socket.on('issue_reported', handleIssueReported);

    return () => {
      socket.off('progress_update', handleProgressUpdate);
      socket.off('quality_check_update', handleQualityCheckUpdate);
      socket.off('issue_reported', handleIssueReported);
    };
  }, [socket, isConnected, realTimeUpdates, progressData]);

  // Toggle real-time updates
  const toggleRealTimeUpdates = useCallback((enabled: boolean) => {
    setRealTimeUpdates(enabled);
    
    if (!enabled && socket && progressData) {
      socket.emit('unsubscribe_service_progress', { bookingId: progressData.bookingId });
    } else if (enabled && socket && progressData) {
      socket.emit('subscribe_service_progress', { bookingId: progressData.bookingId });
    }
  }, [socket, progressData]);

  return {
    progressData,
    isLoading,
    error,
    realTimeUpdates,
    trackProgress,
    updateStage,
    completeQualityCheck,
    submitApproval,
    reportIssue,
    calculateProgress,
    getEstimatedCompletion,
    getStageInfo,
    toggleRealTimeUpdates,
    isConnected
  };
}