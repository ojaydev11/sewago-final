import { NextResponse } from 'next/server';

export const runtime = 'nodejs';

// Force dynamic rendering to prevent build-time prerendering
export const dynamic = 'force-dynamic';

// Build-time guard to prevent server-only code from running during build
const isBuild = process.env.NEXT_PHASE === 'phase-production-build';

interface PaymentRequest {
  bookingId: string;
  amount: number;
  customerName: string;
  customerEmail: string;
  customerPhone: string;
  serviceName: string;
}

interface PaymentResponse {
  success: boolean;
  transactionId?: string;
  message: string;
  redirectUrl?: string;
  error?: string;
}

export async function POST(req: Request): Promise<Response | NextResponse<PaymentResponse>> {
  // Skip execution during build phase
  if (isBuild) {
    return new Response(null, { status: 204 });
  }

  try {
    const body: PaymentRequest = await req.json();
    
    // Validate required fields
    if (!body.bookingId || !body.amount || !body.customerName || !body.customerEmail) {
      return NextResponse.json({
        success: false,
        message: 'Missing required fields',
        error: 'INVALID_REQUEST'
      }, { status: 400 });
    }

    // Validate amount
    if (body.amount <= 0) {
      return NextResponse.json({
        success: false,
        message: 'Invalid amount',
        error: 'INVALID_AMOUNT'
      }, { status: 400 });
    }

    // Simulate eSewa payment processing
    const transactionId = `ESEWA_${Date.now()}_${Math.random().toString(36).substr(2, 9)}`;
    
    // Simulate payment success (90% success rate for demo)
    const isSuccess = Math.random() > 0.1;
    
    if (isSuccess) {
      // Simulate successful payment
      console.log(`[eSewa] Payment successful for booking ${body.bookingId}: ${transactionId}`);
      
      return NextResponse.json({
        success: true,
        transactionId,
        message: 'Payment initiated successfully',
        redirectUrl: `https://esewa.com.np/epay/main?pid=${transactionId}&amt=${body.amount}&pdc=0&psc=0&txAmt=0&tAmt=${body.amount}&scd=EPAYTEST&su=http://localhost:3000/payment/success?txn=${transactionId}&fu=http://localhost:3000/payment/failure?txn=${transactionId}`
      });
    } else {
      // Simulate payment failure
      console.log(`[eSewa] Payment failed for booking ${body.bookingId}: ${transactionId}`);
      
      return NextResponse.json({
        success: false,
        transactionId,
        message: 'Payment failed. Please try again.',
        error: 'PAYMENT_FAILED'
      }, { status: 400 });
    }
    
  } catch (error) {
    console.error('[eSewa] Payment error:', error);
    
    return NextResponse.json({
      success: false,
      message: 'Internal server error',
      error: 'INTERNAL_ERROR'
    }, { status: 500 });
  }
}

// Handle payment verification
export async function GET(req: Request): Promise<Response | NextResponse<PaymentResponse>> {
  // Skip execution during build phase
  if (isBuild) {
    return new Response(null, { status: 204 });
  }

  try {
    const { searchParams } = new URL(req.url);
    const transactionId = searchParams.get('txn');
    const status = searchParams.get('status');
    
    if (!transactionId) {
      return NextResponse.json({
        success: false,
        message: 'Transaction ID is required',
        error: 'MISSING_TXN_ID'
      }, { status: 400 });
    }
    
    // Simulate payment verification
    if (status === 'success') {
      return NextResponse.json({
        success: true,
        transactionId,
        message: 'Payment verified successfully'
      });
    } else {
      return NextResponse.json({
        success: false,
        transactionId,
        message: 'Payment verification failed',
        error: 'VERIFICATION_FAILED'
      }, { status: 400 });
    }
    
  } catch (error) {
    console.error('[eSewa] Verification error:', error);
    
    return NextResponse.json({
      success: false,
      message: 'Internal server error',
      error: 'INTERNAL_ERROR'
    }, { status: 500 });
  }
}
