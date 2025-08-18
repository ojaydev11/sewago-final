import { NextRequest, NextResponse } from 'next/server';
import { api } from '@/lib/api';

export async function POST(request: NextRequest) {
  try {
    const body = await request.json();
    
    // Validate required fields
    if (!body.referenceId || !body.gateway) {
      return NextResponse.json(
        { success: false, message: 'Missing required fields' },
        { status: 400 }
      );
    }

    // Forward the request to backend for verification
    const response = await api.post('/payments/verify', body);

    // Add idempotency check - if already verified, return success
    if (response.data.verified) {
      return NextResponse.json({
        success: true,
        verified: true,
        bookingId: response.data.bookingId,
        message: 'Payment verified successfully',
      });
    }

    return NextResponse.json(response.data);
  } catch (error: unknown) {
    console.error('Payment verification error:', error);
    
    if (error && typeof error === 'object' && 'response' in error) {
      const axiosError = error as { response: { data?: { message?: string }; status: number } };
      if (axiosError.response?.status === 404) {
        return NextResponse.json(
          { success: false, message: 'Payment reference not found' },
          { status: 404 }
        );
      }

      return NextResponse.json(
        { success: false, message: axiosError.response.data?.message || 'Verification failed' },
        { status: axiosError.response.status }
      );
    }

    return NextResponse.json(
      { success: false, message: 'Internal server error' },
      { status: 500 }
    );
  }
}

// Handle GET requests for payment callback redirects
export async function GET(request: NextRequest) {
  const searchParams = request.nextUrl.searchParams;
  const referenceId = searchParams.get('referenceId');
  const gateway = searchParams.get('gateway');

  if (!referenceId || !gateway) {
    return NextResponse.redirect(new URL('/payment/failed?error=missing_params', request.url));
  }

  try {
    // Verify payment automatically on callback
    const verificationData: Record<string, string | null> = { referenceId, gateway };

    // Add gateway-specific parameters
    if (gateway === 'esewa') {
      verificationData.oid = searchParams.get('oid');
      verificationData.amt = searchParams.get('amt');
      verificationData.refId = searchParams.get('refId');
    } else if (gateway === 'khalti') {
      verificationData.pidx = searchParams.get('pidx');
    }

    const response = await api.post('/payments/verify', verificationData);

    if (response.data.success && response.data.verified) {
      return NextResponse.redirect(
        new URL(`/payment/success?bookingId=${response.data.bookingId}`, request.url)
      );
    } else {
      return NextResponse.redirect(new URL('/payment/failed?error=verification_failed', request.url));
    }
  } catch (error) {
    console.error('Payment callback error:', error);
    return NextResponse.redirect(new URL('/payment/failed?error=server_error', request.url));
  }
}
