import { NextResponse } from 'next/server';
import { dbConnect } from '@/lib/mongodb';

export async function GET() {
  const startTime = Date.now();
  
  try {
    // Check database connection
    let dbStatus = 'disconnected';
    let dbLatency = 0;
    
    if (process.env.MONGODB_URI) {
      try {
        const startDb = Date.now();
        const connection = await dbConnect();
        const endDb = Date.now();
        
        if (connection) {
          dbStatus = 'connected';
          dbLatency = endDb - startDb;
        }
      } catch (error) {
        dbStatus = 'error';
        console.error('Database connection error:', error);
      }
    } else {
      dbStatus = 'mock';
    }

    // Check environment variables
    const envCheck = {
      MONGODB_URI: !!process.env.MONGODB_URI,
      AUTH_SECRET: !!process.env.AUTH_SECRET,
      AUTH_URL: !!process.env.AUTH_URL,
      NEXTAUTH_URL: !!process.env.NEXTAUTH_URL,
      NEXTAUTH_SECRET: !!process.env.NEXTAUTH_SECRET,
    };

    // Check feature flags
    const featureFlags = {
      booking: process.env.NEXT_PUBLIC_BOOKING_ENABLED === 'true',
      auth: process.env.NEXT_PUBLIC_AUTH_ENABLED === 'true',
      i18n: process.env.NEXT_PUBLIC_I18N_ENABLED === 'true',
      sewai: process.env.NEXT_PUBLIC_SEWAAI_ENABLED === 'true',
      quoteEstimator: process.env.NEXT_PUBLIC_QUOTE_ESTIMATOR_ENABLED === 'true',
    };

    const totalTime = Date.now() - startTime;

    const healthData = {
      status: 'healthy',
      timestamp: new Date().toISOString(),
      uptime: process.uptime(),
      environment: process.env.NODE_ENV || 'development',
      version: process.env.npm_package_version || '1.0.0',
      database: {
        status: dbStatus,
        latency: dbLatency,
        uri: process.env.MONGODB_URI ? 'configured' : 'not-configured',
      },
      environment: envCheck,
      features: featureFlags,
      performance: {
        responseTime: totalTime,
        memory: process.memoryUsage(),
      },
    };

    // Return appropriate status code
    const statusCode = dbStatus === 'connected' ? 200 : 503;
    
    return NextResponse.json(healthData, { 
      status: statusCode,
      headers: {
        'Cache-Control': 'no-cache, no-store, must-revalidate',
        'Pragma': 'no-cache',
        'Expires': '0',
      }
    });

  } catch (error) {
    console.error('Health check error:', error);
    
    return NextResponse.json({
      status: 'unhealthy',
      timestamp: new Date().toISOString(),
      error: error instanceof Error ? error.message : 'Unknown error',
      uptime: process.uptime(),
    }, { 
      status: 500,
      headers: {
        'Cache-Control': 'no-cache, no-store, must-revalidate',
      }
    });
  }
}
