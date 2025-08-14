"use client";

import { useState } from 'react';
import { Button, Card, CardContent, CardDescription, CardHeader, CardTitle, Badge, Input, Label } from '@/components/ui';
import { CreditCard, Wallet, CheckCircle, AlertCircle, Loader2, ToggleLeft, ToggleRight } from 'lucide-react';
import { 
  PaymentMethod, 
  getAvailablePaymentMethods, 
  isTestMode, 
  createPaymentIntent, 
  processEsewaPayment, 
  processKhaltiPayment,
  getPaymentStatusColor,
  getPaymentStatusText
} from '@/lib/payments';

interface PaymentMethodsProps {
  bookingId: string;
  amount: number;
  currency?: string;
  onPaymentSuccess?: (transactionId: string) => void;
  onPaymentError?: (error: string) => void;
}

export default function PaymentMethods({
  bookingId,
  amount,
  currency = 'NPR',
  onPaymentSuccess,
  onPaymentError
}: PaymentMethodsProps) {
  const [selectedMethod, setSelectedMethod] = useState<string>('');
  const [isProcessing, setIsProcessing] = useState(false);
  const [paymentStatus, setPaymentStatus] = useState<'idle' | 'processing' | 'success' | 'error'>('idle');
  const [errorMessage, setErrorMessage] = useState<string>('');
  const [testMode, setTestMode] = useState(isTestMode);

  const availableMethods = getAvailablePaymentMethods();

  const handlePaymentMethodSelect = (methodId: string) => {
    setSelectedMethod(methodId);
    setErrorMessage('');
    setPaymentStatus('idle');
  };

  const handlePayment = async () => {
    if (!selectedMethod) {
      setErrorMessage('Please select a payment method');
      return;
    }

    try {
      setIsProcessing(true);
      setPaymentStatus('processing');
      setErrorMessage('');

      // Create payment intent
      const paymentIntent = await createPaymentIntent(
        bookingId,
        amount,
        currency,
        selectedMethod
      );

      // Process payment based on method
      let verification;
      if (selectedMethod === 'esewa') {
        // Simulate eSewa token (in real app, this would come from eSewa SDK)
        const esewaToken = `esewa_${Date.now()}`;
        verification = await processEsewaPayment(paymentIntent.id, esewaToken);
      } else if (selectedMethod === 'khalti') {
        // Simulate Khalti token (in real app, this would come from Khalti SDK)
        const khaltiToken = `khalti_${Date.now()}`;
        verification = await processKhaltiPayment(paymentIntent.id, khaltiToken);
      } else {
        // For card payments, we'd integrate with Stripe or similar
        verification = {
          success: true,
          transactionId: `CARD_${Date.now()}`,
          amount,
          status: 'succeeded',
        };
      }

      if (verification.success) {
        setPaymentStatus('success');
        onPaymentSuccess?.(verification.transactionId || '');
      } else {
        setPaymentStatus('error');
        setErrorMessage(verification.error || 'Payment failed');
        onPaymentError?.(verification.error || 'Payment failed');
      }
    } catch (error) {
      setPaymentStatus('error');
      const errorMsg = error instanceof Error ? error.message : 'Payment failed';
      setErrorMessage(errorMsg);
      onPaymentError?.(errorMsg);
    } finally {
      setIsProcessing(false);
    }
  };

  const getMethodIcon = (method: PaymentMethod) => {
    switch (method.type) {
      case 'esewa':
        return <Wallet className="h-6 w-6 text-green-600" />;
      case 'khalti':
        return <Wallet className="h-6 w-6 text-purple-600" />;
      case 'card':
        return <CreditCard className="h-6 w-6 text-blue-600" />;
      default:
        return <CreditCard className="h-6 w-6 text-gray-600" />;
    }
  };

  const getMethodDescription = (method: PaymentMethod) => {
    if (testMode && method.type !== 'card') {
      return `${method.description} (Coming Soon - Test Mode)`;
    }
    return method.description;
  };

  return (
    <div className="space-y-6">
      {/* Test Mode Toggle */}
      <div className="flex items-center justify-between p-4 bg-yellow-50 border border-yellow-200 rounded-lg">
        <div className="flex items-center gap-2">
          <AlertCircle className="h-5 w-5 text-yellow-600" />
          <span className="text-sm text-yellow-800">
            Payment Test Mode
          </span>
        </div>
        <Button
          variant="outline"
          size="sm"
          onClick={() => setTestMode(!testMode)}
          className="flex items-center gap-2"
        >
          {testMode ? (
            <>
              <ToggleRight className="h-4 w-4" />
              Enabled
            </>
          ) : (
            <>
              <ToggleLeft className="h-4 w-4" />
              Disabled
            </>
          )}
        </Button>
      </div>

      {/* Payment Amount Display */}
      <Card>
        <CardHeader>
          <CardTitle className="text-lg">Payment Summary</CardTitle>
          <CardDescription>Review your booking details and payment amount</CardDescription>
        </CardHeader>
        <CardContent>
          <div className="flex justify-between items-center py-2">
            <span className="text-gray-600">Service Amount:</span>
                            <span className="font-semibold">Rs {amount}</span>
          </div>
          <div className="flex justify-between items-center py-2">
            <span className="text-gray-600">Platform Fee:</span>
                            <span className="font-semibold">Rs 0</span>
          </div>
          <div className="border-t pt-2 mt-2">
            <div className="flex justify-between items-center">
              <span className="text-lg font-semibold">Total Amount:</span>
                              <span className="text-xl font-bold text-primary">Rs {amount}</span>
            </div>
          </div>
        </CardContent>
      </Card>

      {/* Payment Methods */}
      <Card>
        <CardHeader>
          <CardTitle className="text-lg">Choose Payment Method</CardTitle>
          <CardDescription>Select your preferred payment method to complete the booking</CardDescription>
        </CardHeader>
        <CardContent className="space-y-4">
          {availableMethods.map((method) => (
            <div
              key={method.id}
              className={`border rounded-lg p-4 cursor-pointer transition-colors ${
                selectedMethod === method.id
                  ? 'border-primary bg-primary/5'
                  : 'border-gray-200 hover:border-gray-300'
              }`}
              onClick={() => handlePaymentMethodSelect(method.id)}
            >
              <div className="flex items-center gap-3">
                <div className="flex-shrink-0">
                  {getMethodIcon(method)}
                </div>
                <div className="flex-1">
                  <div className="flex items-center gap-2">
                    <h3 className="font-medium text-gray-900">{method.name}</h3>
                    {testMode && method.type !== 'card' && (
                      <Badge variant="secondary" className="text-xs">
                        Coming Soon
                      </Badge>
                    )}
                  </div>
                  <p className="text-sm text-gray-600">
                    {getMethodDescription(method)}
                  </p>
                </div>
                <div className="flex-shrink-0">
                  <input
                    type="radio"
                    name="paymentMethod"
                    value={method.id}
                    checked={selectedMethod === method.id}
                    onChange={() => handlePaymentMethodSelect(method.id)}
                    className="h-4 w-4 text-primary border-gray-300 focus:ring-primary"
                  />
                </div>
              </div>
            </div>
          ))}

          {availableMethods.length === 0 && (
            <div className="text-center py-8 text-gray-500">
              <CreditCard className="h-12 w-12 mx-auto mb-4 text-gray-400" />
              <p>No payment methods available</p>
              <p className="text-sm">Please contact support for assistance</p>
            </div>
          )}
        </CardContent>
      </Card>

      {/* Payment Status */}
      {paymentStatus !== 'idle' && (
        <Card>
          <CardContent className="pt-6">
            <div className="flex items-center gap-3">
              {paymentStatus === 'processing' && (
                <Loader2 className="h-5 w-5 animate-spin text-blue-600" />
              )}
              {paymentStatus === 'success' && (
                <CheckCircle className="h-5 w-5 text-green-600" />
              )}
              {paymentStatus === 'error' && (
                <AlertCircle className="h-5 w-5 text-red-600" />
              )}
              
              <div className="flex-1">
                <p className={`font-medium ${getPaymentStatusColor(paymentStatus)}`}>
                  {getPaymentStatusText(paymentStatus)}
                </p>
                {paymentStatus === 'processing' && (
                  <p className="text-sm text-gray-600">Processing your payment...</p>
                )}
                {paymentStatus === 'success' && (
                  <p className="text-sm text-green-600">Payment completed successfully!</p>
                )}
                {paymentStatus === 'error' && (
                  <p className="text-sm text-red-600">{errorMessage}</p>
                )}
              </div>
            </div>
          </CardContent>
        </Card>
      )}

      {/* Error Message */}
      {errorMessage && (
        <div className="bg-red-50 border border-red-200 rounded-lg p-4">
          <div className="flex items-center gap-2 text-red-800">
            <AlertCircle className="h-5 w-5" />
            {errorMessage}
          </div>
        </div>
      )}

      {/* Payment Button */}
      <Button
        onClick={handlePayment}
        disabled={!selectedMethod || isProcessing || paymentStatus === 'success'}
        className="w-full"
        size="lg"
      >
        {isProcessing ? (
          <>
            <Loader2 className="h-4 w-4 animate-spin mr-2" />
            Processing Payment...
          </>
        ) : paymentStatus === 'success' ? (
          <>
            <CheckCircle className="h-4 w-4 mr-2" />
            Payment Successful!
          </>
        ) : (
          `Pay Rs ${amount} with ${selectedMethod ? availableMethods.find(m => m.id === selectedMethod)?.name : 'Selected Method'}`
        )}
      </Button>

      {/* Test Mode Notice */}
      {testMode && (
        <div className="text-center text-sm text-gray-500">
          <p>💡 Test Mode: Payments are simulated for development purposes</p>
          <p>No real transactions will be processed</p>
        </div>
      )}
    </div>
  );
}
