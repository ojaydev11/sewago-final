import { NextRequest, NextResponse } from 'next/server';
import { PrismaClient } from '@prisma/client';

const prisma = new PrismaClient();

export async function GET(request: NextRequest) {
  try {
    // Fetch live counters from PublicMetric collection
    const metrics = await prisma.publicMetric.findMany({
      where: {
        key: {
          in: ['jobs_completed', 'avg_response_time', 'satisfaction_percentage']
        }
      }
    });

    // Transform to expected format
    const counters = {
      jobsCompleted: 0,
      avgResponseTime: '30 min',
      satisfactionPercentage: 98
    };

    metrics.forEach(metric => {
      switch (metric.key) {
        case 'jobs_completed':
          counters.jobsCompleted = parseInt(metric.value) || 0;
          break;
        case 'avg_response_time':
          counters.avgResponseTime = metric.value || '30 min';
          break;
        case 'satisfaction_percentage':
          counters.satisfactionPercentage = parseInt(metric.value) || 98;
          break;
      }
    });

    return NextResponse.json(counters);
  } catch (error) {
    console.error('Error fetching metrics:', error);
    return NextResponse.json(
      { error: 'Failed to fetch metrics' },
      { status: 500 }
    );
  }
}
