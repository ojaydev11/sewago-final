'use client';

import { useState } from 'react';
import { Button } from '@/components/ui/button';
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from '@/components/ui/card';
import { Badge } from '@/components/ui/badge';
import { useTranslations } from 'next-intl';
import { CreditCard, Wallet, Shield, CheckCircle, Loader2, AlertCircle } from 'lucide-react';
import { formatNPR } from '@/lib/currency';

interface PaymentComponentProps {
  amount: number;
  serviceName: string;
  onPaymentSuccess: (paymentId: string, method: string) => void;
  onPaymentError: (error: string) => void;
  className?: string;
}

export default function PaymentComponent({ 
  amount, 
  serviceName, 
  onPaymentSuccess, 
  onPaymentError, 
  className = '' 
}: PaymentComponentProps) {
  const t = useTranslations();
  const [isProcessing, setIsProcessing] = useState(false);
  const [selectedMethod, setSelectedMethod] = useState<string | null>(null);

  const paymentMethods = [
    {
      id: 'esewa',
      name: 'eSewa',
      description: 'Pay with eSewa digital wallet',
      icon: Wallet,
      color: 'from-green-500 to-green-600',
      badge: 'Popular',
      features: ['Instant payment', 'Secure', 'Widely accepted']
    },
    {
      id: 'khalti',
      name: 'Khalti',
      description: 'Pay with Khalti digital wallet',
      icon: CreditCard,
      color: 'from-purple-500 to-purple-600',
      badge: 'Fast',
      features: ['Quick transfer', 'Secure', '24/7 available']
    },
    {
      id: 'cod',
      name: 'Cash on Delivery',
      description: 'Pay after service completion',
      icon: Shield,
      color: 'from-blue-500 to-blue-600',
      badge: 'Safe',
      features: ['Pay after service', 'No upfront cost', 'Trusted method']
    }
  ];

  const handlePayment = async (method: string) => {
    setIsProcessing(true);
    setSelectedMethod(method);

    try {
      // Simulate payment processing
      await new Promise(resolve => setTimeout(resolve, 2000));
      
      if (method === 'cod') {
        // Cash on Delivery - immediate success
        onPaymentSuccess(`cod-${Date.now()}`, 'Cash on Delivery');
      } else {
        // Digital payment - simulate API call
        const response = await fetch(`/api/payments/${method}`, {
          method: 'POST',
          headers: {
            'Content-Type': 'application/json',
          },
          body: JSON.stringify({
            amount,
            serviceName,
            method,
          }),
        });

        if (response.ok) {
          const data = await response.json();
          onPaymentSuccess(data.paymentId, method);
        } else {
          throw new Error(`Payment failed: ${response.statusText}`);
        }
      }
    } catch (error) {
      console.error('Payment error:', error);
      onPaymentError(error instanceof Error ? error.message : 'Payment failed');
    } finally {
      setIsProcessing(false);
      setSelectedMethod(null);
    }
  };

  return (
    <div className={`space-y-6 ${className}`}>
      {/* Payment Summary */}
      <Card className="bg-white/5 border-white/20 text-white">
        <CardHeader>
          <CardTitle className="text-xl">Payment Summary</CardTitle>
          <CardDescription className="text-white/70">
            Complete your booking for {serviceName}
          </CardDescription>
        </CardHeader>
        <CardContent>
          <div className="space-y-3">
            <div className="flex justify-between items-center">
              <span className="text-white/80">Service Amount:</span>
              <span className="font-semibold">{formatNPR(amount)}</span>
            </div>
            <div className="flex justify-between items-center">
              <span className="text-white/80">Platform Fee:</span>
              <span className="font-semibold">{formatNPR(amount * 0.05)}</span>
            </div>
            <div className="border-t border-white/20 pt-3">
              <div className="flex justify-between items-center text-lg font-bold">
                <span>Total Amount:</span>
                <span className="text-accent">{formatNPR(amount * 1.05)}</span>
              </div>
            </div>
          </div>
        </CardContent>
      </Card>

      {/* Payment Methods */}
      <div className="space-y-4">
        <h3 className="text-lg font-semibold text-white">Choose Payment Method</h3>
        
        <div className="grid gap-4">
          {paymentMethods.map((method) => {
            const IconComponent = method.icon;
            const isSelected = selectedMethod === method.id;
<<<<<<< HEAD
            const isProcessing = isProcessing && selectedMethod === method.id;
=======
            const isMethodProcessing = isProcessing && selectedMethod === method.id;
>>>>>>> d7ae416fad47e198a4cbb3bc4d0928f6cb7c7245
            
            return (
              <Card 
                key={method.id}
                className={`bg-white/5 border-white/20 text-white cursor-pointer transition-all duration-200 hover:bg-white/10 ${
                  isSelected ? 'ring-2 ring-accent bg-white/10' : ''
                }`}
<<<<<<< HEAD
                onClick={() => !isProcessing && handlePayment(method.id)}
=======
                onClick={() => !isMethodProcessing && handlePayment(method.id)}
>>>>>>> d7ae416fad47e198a4cbb3bc4d0928f6cb7c7245
              >
                <CardContent className="p-4">
                  <div className="flex items-center justify-between">
                    <div className="flex items-center gap-4">
                      <div className={`w-12 h-12 bg-gradient-to-r ${method.color} rounded-lg flex items-center justify-center`}>
                        <IconComponent className="w-6 h-6 text-white" />
                      </div>
                      <div>
                        <div className="flex items-center gap-2 mb-1">
                          <h4 className="font-semibold text-lg">{method.name}</h4>
                          <Badge variant="secondary" className="text-xs">
                            {method.badge}
                          </Badge>
                        </div>
                        <p className="text-white/70 text-sm">{method.description}</p>
                        <div className="flex items-center gap-4 mt-2">
                          {method.features.map((feature, index) => (
                            <span key={index} className="text-white/60 text-xs flex items-center gap-1">
                              <CheckCircle className="w-3 h-3" />
                              {feature}
                            </span>
                          ))}
                        </div>
                      </div>
                    </div>
                    
                    <div className="flex items-center gap-2">
<<<<<<< HEAD
                      {isProcessing ? (
=======
                      {isMethodProcessing ? (
>>>>>>> d7ae416fad47e198a4cbb3bc4d0928f6cb7c7245
                        <Loader2 className="w-5 h-5 animate-spin text-accent" />
                      ) : (
                        <Button
                          variant="outline"
                          size="sm"
                          className="border-white/20 text-white hover:bg-white/20"
<<<<<<< HEAD
                          disabled={isProcessing}
=======
                          disabled={isMethodProcessing}
>>>>>>> d7ae416fad47e198a4cbb3bc4d0928f6cb7c7245
                        >
                          {method.id === 'cod' ? 'Select' : 'Pay'}
                        </Button>
                      )}
                    </div>
                  </div>
                </CardContent>
              </Card>
            );
          })}
        </div>
      </div>

      {/* Security Notice */}
      <Card className="bg-green-500/10 border-green-500/20">
        <CardContent className="p-4">
          <div className="flex items-start gap-3">
            <Shield className="w-5 h-5 text-green-400 mt-0.5 flex-shrink-0" />
            <div className="text-sm">
              <p className="text-green-400 font-medium mb-1">Secure Payment</p>
              <p className="text-green-300/80">
                All payments are processed through secure, encrypted channels. Your financial information is protected with bank-level security.
              </p>
            </div>
          </div>
        </CardContent>
      </Card>

      {/* Processing State */}
      {isProcessing && (
        <div className="fixed inset-0 bg-black/50 flex items-center justify-center z-50">
          <Card className="bg-white p-6 max-w-sm mx-4">
            <CardContent className="text-center space-y-4">
              <Loader2 className="w-12 h-12 animate-spin text-accent mx-auto" />
              <h3 className="text-lg font-semibold">Processing Payment</h3>
              <p className="text-gray-600">
                Please wait while we process your {selectedMethod === 'esewa' ? 'eSewa' : 
                selectedMethod === 'khalti' ? 'Khalti' : 'Cash on Delivery'} payment...
              </p>
              <p className="text-sm text-gray-500">
                Do not close this window or refresh the page.
              </p>
            </CardContent>
          </Card>
        </div>
      )}
    </div>
  );
}
