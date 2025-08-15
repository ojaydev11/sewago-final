'use client';

import { useState, useEffect } from 'react';
import { CheckCircleIcon, ClockIcon, StarIcon } from '@heroicons/react/24/outline';

interface CounterData {
  jobsCompleted: number;
  avgResponseM: number;
  satisfaction: number;
}

export function CounterBar() {
  const [counters, setCounters] = useState<CounterData | null>(null);
  const [loading, setLoading] = useState(true);
  const [lastSuccessfulFetch, setLastSuccessfulFetch] = useState<CounterData | null>(null);

    const fetchCounters = async () => {
    try {
      const response = await fetch('/api/counters');

      if (!response.ok) {
        throw new Error('Failed to fetch counters');
      }

      const result = await response.json();
      if (result.data) {
        setCounters(result.data);
        setLastSuccessfulFetch(result.data);
      }
    } catch (err) {
      // Silently handle errors to prevent console spam
      // Keep last known good values
    } finally {
      setLoading(false);
    }
  };

  // Initial fetch
  useEffect(() => {
    fetchCounters();
  }, []);

  // Poll every 60 seconds
  useEffect(() => {
    const interval = setInterval(fetchCounters, 60000);
    return () => clearInterval(interval);
  }, []);

  if (loading) {
    return (
      <div className="bg-gradient-to-r from-blue-50 to-indigo-50 py-8">
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
          <div className="grid grid-cols-1 md:grid-cols-3 gap-6">
            {[1, 2, 3].map((i) => (
              <div key={i} className="animate-pulse">
                <div className="h-4 bg-blue-200 rounded w-24 mb-2"></div>
                <div className="h-8 bg-blue-200 rounded w-32"></div>
              </div>
            ))}
          </div>
        </div>
      </div>
    );
  }

  // Use last known good values if current fetch failed
  const displayCounters = counters || lastSuccessfulFetch;
  
  if (!displayCounters) {
    return (
      <div className="bg-gradient-to-r from-blue-50 to-indigo-50 py-8">
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
          <div className="text-center text-gray-500">
            <p>Loading trust metrics...</p>
          </div>
        </div>
      </div>
    );
  }

  return (
    <div className="bg-gradient-to-r from-blue-50 to-indigo-50 py-8">
      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
        <div className="grid grid-cols-1 md:grid-cols-3 gap-6">
          {/* Jobs Completed */}
          <div className="text-center">
            <div className="flex items-center justify-center mb-2">
              <CheckCircleIcon className="h-6 w-6 text-green-600 mr-2" />
              <span className="text-sm font-medium text-gray-600">Jobs Completed</span>
            </div>
            <div className="text-3xl font-bold text-gray-900">
              {displayCounters.jobsCompleted.toLocaleString()}
            </div>
            <p className="text-sm text-gray-500 mt-1">Successfully delivered</p>
          </div>

          {/* Average Response Time */}
          <div className="text-center">
            <div className="flex items-center justify-center mb-2">
              <ClockIcon className="h-6 w-6 text-blue-600 mr-2" />
              <span className="text-sm font-medium text-gray-600">Avg Response</span>
            </div>
            <div className="text-3xl font-bold text-gray-900">
              {displayCounters.avgResponseM}m
            </div>
            <p className="text-sm text-gray-500 mt-1">Quick service delivery</p>
          </div>

          {/* Satisfaction Rate */}
          <div className="text-center">
            <div className="flex items-center justify-center mb-2">
              <StarIcon className="h-6 w-6 text-yellow-500 mr-2" />
              <span className="text-sm font-medium text-gray-600">Satisfaction</span>
            </div>
            <div className="text-3xl font-bold text-gray-900">
              {displayCounters.satisfaction}%
            </div>
            <p className="text-sm text-gray-500 mt-1">Customer happiness</p>
          </div>
        </div>

        {/* Trust Badge */}
        <div className="text-center mt-6">
          <div className="inline-flex items-center px-4 py-2 bg-white rounded-full shadow-sm border border-gray-200">
            <CheckCircleIcon className="h-5 w-5 text-green-600 mr-2" />
            <span className="text-sm font-medium text-gray-700">
              Trusted by {Math.floor(displayCounters.jobsCompleted / 100)}+ customers
            </span>
          </div>
        </div>
      </div>
    </div>
  );
}

export default CounterBar;
