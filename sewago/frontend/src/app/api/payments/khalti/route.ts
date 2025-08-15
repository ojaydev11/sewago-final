import { NextResponse } from 'next/server';

export const runtime = 'nodejs';

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

export async function POST(req: Request): Promise<NextResponse<PaymentResponse>> {
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

    // Simulate Khalti payment processing
    const transactionId = `KHALTI_${Date.now()}_${Math.random().toString(36).substr(2, 9)}`;
    
    // Simulate payment success (85% success rate for demo)
    const isSuccess = Math.random() > 0.15;
    
    if (isSuccess) {
      // Simulate successful payment
      console.log(`[Khalti] Payment successful for booking ${body.bookingId}: ${transactionId}`);
      
      return NextResponse.json({
        success: true,
        transactionId,
        message: 'Payment initiated successfully',
        redirectUrl: `https://khalti.com/checkout/ebPPQnQzgMHEp76oAE6xow?public_key=test_public_key_${transactionId}&amount=${body.amount}&product_identity=${body.bookingId}&customer_info=${body.customerName}`
      });
    } else {
      // Simulate payment failure
      console.log(`[Khalti] Payment failed for booking ${body.bookingId}: ${transactionId}`);
      
      return NextResponse.json({
        success: false,
        transactionId,
        message: 'Payment failed. Please try again.',
        error: 'PAYMENT_FAILED'
      }, { status: 400 });
    }
    
  } catch (error) {
    console.error('[Khalti] Payment error:', error);
    
    return NextResponse.json({
      success: false,
      message: 'Internal server error',
      error: 'INTERNAL_ERROR'
    }, { status: 500 });
  }
}

// Handle payment verification
export async function GET(req: Request): Promise<NextResponse<PaymentResponse>> {
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
    console.error('[Khalti] Verification error:', error);
    
    return NextResponse.json({
      success: false,
      message: 'Internal server error',
      error: 'INTERNAL_ERROR'
    }, { status: 500 });
  }
}
