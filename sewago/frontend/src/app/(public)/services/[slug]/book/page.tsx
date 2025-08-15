'use client';

import { useState, useEffect } from 'react';
import { useParams, useRouter } from 'next/navigation';
import { useSession } from 'next-auth/react';
import { Button } from '@/components/ui/button';
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from '@/components/ui/card';
import { Badge } from '@/components/ui/badge';
import { ArrowLeft, CheckCircle, Clock, MapPin, Shield, Zap } from 'lucide-react';
import { toast } from 'sonner';
import QuoteForm, { QuoteData } from '@/components/booking/QuoteForm';
import { getServiceBySlug } from '@/lib/services';
import { Label } from '@/components/ui/label';
import { formatNPR } from '@/lib/currency';
import { useCallback } from 'react';

// Force dynamic rendering to prevent build-time pre-rendering
export const dynamic = 'force-dynamic';

interface ServiceData {
  name: string;
  basePrice: number;
  category: string;
  shortDesc: string;
}

export default function BookingPage() {
  const params = useParams();
  const router = useRouter();
  const { data: session } = useSession();
  const [currentStep, setCurrentStep] = useState(1);
  const [isSubmitting, setIsSubmitting] = useState(false);
  const [quoteData, setQuoteData] = useState<QuoteData | null>(null);
  const [serviceData, setServiceData] = useState<ServiceData | null>(null);

  const slug = params.slug as string;

  // Load service data
  useEffect(() => {
    const loadService = async () => {
      try {
        const service = await getServiceBySlug(slug);
        if (service) {
          setServiceData({
            name: service.name,
            basePrice: service.basePrice,
            category: service.category,
            shortDesc: service.shortDesc
          });
        }
      } catch (error) {
        console.error('Error loading service:', error);
      }
    };
    loadService();
  }, [slug]);

  const handleQuoteUpdate = useCallback(async (quote: QuoteData) => {
    try {
      // Call server to get authoritative quote
      const res = await fetch('/api/quote', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({
          serviceSlug: slug,
          serviceName: serviceData?.name ?? '',
          basePrice: serviceData?.basePrice ?? 0,
          isExpress: quote.isExpress,
          hasWarranty: quote.hasWarranty,
          city: 'Kathmandu',
          extraBlocks: quote.breakdown?.extraBlocks ?? 0
        })
      });
      if (res.ok) {
        const data = await res.json();
        const server = data.quote;
        setQuoteData({
          ...quote,
          totalPrice: server.total,
          breakdown: {
            ...quote.breakdown,
            expressSurcharge: server.expressSurcharge,
            warrantyFee: server.warrantyFee,
            bookingFee: server.bookingFee,
            coinsCap: server.coinsCap,
            total: server.total
          }
        });
      } else {
        setQuoteData(quote);
      }
    } catch {
      setQuoteData(quote);
    }
  }, [slug, serviceData]);

  // Redirect if not authenticated
  if (!session?.user) {
    router.push(`/auth/login?callbackUrl=/services/${slug}/book`);
    return null;
  }

  const handleSubmit = async () => {
    if (!quoteData || !serviceData) return;

    setIsSubmitting(true);
    
    try {
      const response = await fetch('/api/bookings', {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
        },
        body: JSON.stringify({
          serviceSlug: slug,
          serviceName: serviceData.name,
          customerName: quoteData.customerName,
          phone: quoteData.phone,
          address: quoteData.address,
          area: quoteData.area,
          preferredTime: quoteData.preferredTime,
          notes: quoteData.notes,
          isExpress: quoteData.isExpress,
          hasWarranty: quoteData.hasWarranty,
          totalPrice: quoteData.totalPrice,
          priceBreakdown: quoteData.breakdown
        }),
      });

      if (response.ok) {
        const { booking } = await response.json();
        toast.success('Booking created successfully!');
        setCurrentStep(3); // Show confirmation
      } else {
        const error = await response.json();
        toast.error(error.message || 'Failed to create booking');
      }
    } catch (error) {
      console.error('Error creating booking:', error);
      toast.error('Failed to create booking. Please try again.');
    } finally {
      setIsSubmitting(false);
    }
  };

  const canSubmit = !!(
    quoteData &&
    quoteData.customerName?.trim() &&
    quoteData.phone?.trim() &&
    quoteData.address?.trim() &&
    quoteData.area?.trim()
  );

  if (!serviceData) {
    return (
      <div className="min-h-screen bg-gray-50 flex items-center justify-center">
        <div className="text-center">
          <div className="animate-spin rounded-full h-12 w-12 border-b-2 border-primary mx-auto mb-4"></div>
          <p className="text-gray-600">Loading service details...</p>
        </div>
      </div>
    );
  }

  return (
    <div className="min-h-screen bg-gray-50 py-8">
      <div className="container mx-auto px-4 max-w-6xl">
        {/* Header */}
        <div className="text-center mb-8">
          <h1 className="text-3xl font-bold text-gray-900 mb-2">
            Book {serviceData.name}
          </h1>
          <p className="text-gray-600">
            Complete your booking in just a few simple steps
          </p>
        </div>

        {/* Progress Steps */}
        <div className="flex items-center justify-center mb-8">
          <div className="flex items-center space-x-4">
            <div className={`flex items-center ${currentStep >= 1 ? 'text-primary' : 'text-gray-400'}`}>
              <div className={`w-8 h-8 rounded-full border-2 flex items-center justify-center ${
                currentStep >= 1 ? 'border-primary bg-primary text-white' : 'border-gray-300'
              }`}>
                1
              </div>
              <span className="ml-2 font-medium">Get Quote</span>
            </div>
            
            <div className="w-16 h-0.5 bg-gray-300"></div>
            
            <div className={`flex items-center ${currentStep >= 2 ? 'text-primary' : 'text-gray-400'}`}>
              <div className={`w-8 h-8 rounded-full border-2 flex items-center justify-center ${
                currentStep >= 2 ? 'border-primary bg-primary text-white' : 'border-gray-300'
              }`}>
                2
              </div>
              <span className="ml-2 font-medium">Review & Pay</span>
            </div>

            <div className="w-16 h-0.5 bg-gray-300"></div>
            
            <div className={`flex items-center ${currentStep >= 3 ? 'text-primary' : 'text-gray-400'}`}>
              <div className={`w-8 h-8 rounded-full border-2 flex items-center justify-center ${
                currentStep >= 3 ? 'border-primary bg-primary text-white' : 'border-gray-300'
              }`}>
                3
              </div>
              <span className="ml-2 font-medium">Confirmation</span>
            </div>
          </div>
        </div>

        {/* Step 1: Quote Form */}
        {currentStep === 1 && (
          <div className="grid grid-cols-1 lg:grid-cols-3 gap-8">
            <div className="lg:col-span-2">
              <QuoteForm
                serviceSlug={slug}
                serviceName={serviceData.name}
                basePrice={serviceData.basePrice}
                onQuoteUpdate={handleQuoteUpdate}
              />
            </div>
            
            {/* Service Info Sidebar */}
            <div className="space-y-6">
              <Card>
                <CardHeader>
                  <CardTitle className="text-lg">{serviceData.name}</CardTitle>
                  <CardDescription>{serviceData.shortDesc}</CardDescription>
                </CardHeader>
                <CardContent className="space-y-4">
                                     <div className="flex items-center justify-between">
                     <span className="text-gray-600">Base Price:</span>
                     <span className="font-semibold text-lg text-primary">
                       {formatNPR(serviceData.basePrice)}
                     </span>
                   </div>
                  
                  <div className="space-y-3">
                    <div className="flex items-center gap-2 text-sm text-gray-600">
                      <Clock className="h-4 w-4" />
                      <span>30-60 min arrival window</span>
                    </div>
                    <div className="flex items-center gap-2 text-sm text-gray-600">
                      <Shield className="h-4 w-4" />
                      <span>Verified providers</span>
                    </div>
                    <div className="flex items-center gap-2 text-sm text-gray-600">
                      <Zap className="h-4 w-4" />
                      <span>Express option available</span>
                    </div>
                  </div>
                </CardContent>
              </Card>

              {/* Next Step Button */}
              <Button 
                onClick={() => setCurrentStep(2)}
                disabled={!canSubmit}
                className="w-full bg-primary hover:bg-primary/90"
                size="lg"
              >
                Continue to Review
              </Button>
            </div>
          </div>
        )}

        {/* Step 2: Review & Payment */}
        {currentStep === 2 && quoteData && (
          <div className="grid grid-cols-1 lg:grid-cols-3 gap-8">
            <div className="lg:col-span-2">
              <Card>
                <CardHeader>
                  <CardTitle>Review Your Booking</CardTitle>
                  <CardDescription>
                    Please review your details before confirming
                  </CardDescription>
                </CardHeader>
                <CardContent className="space-y-6">
                  {/* Customer Details */}
                  <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                    <div>
                      <Label className="text-sm font-medium text-gray-700">Name</Label>
                      <p className="text-gray-900">{quoteData.customerName}</p>
                    </div>
                    <div>
                      <Label className="text-sm font-medium text-gray-700">Phone</Label>
                      <p className="text-gray-900">{quoteData.phone}</p>
                    </div>
                  </div>

                  <div>
                    <Label className="text-sm font-medium text-gray-700">Address</Label>
                    <p className="text-gray-900">{quoteData.address}</p>
                    <p className="text-gray-600 text-sm">{quoteData.area}</p>
                  </div>

                  <div>
                    <Label className="text-sm font-medium text-gray-700">Preferred Time</Label>
                    <p className="text-gray-900">{quoteData.preferredTime}</p>
                  </div>

                  {quoteData.notes && (
                    <div>
                      <Label className="text-sm font-medium text-gray-700">Notes</Label>
                      <p className="text-gray-900">{quoteData.notes}</p>
                    </div>
                  )}

                  {/* Service Options */}
                  <div className="space-y-2">
                    <Label className="text-sm font-medium text-gray-700">Service Options</Label>
                    <div className="flex gap-2">
                      {quoteData.isExpress && (
                        <Badge variant="secondary" className="bg-orange-100 text-orange-800">
                          <Zap className="h-3 w-3 mr-1" />
                          Express
                        </Badge>
                      )}
                      {quoteData.hasWarranty && (
                        <Badge variant="secondary" className="bg-blue-100 text-blue-800">
                          <Shield className="h-3 w-3 mr-1" />
                          Warranty
                        </Badge>
                      )}
                    </div>
                  </div>

                  {/* Price Breakdown */}
                  <div className="bg-gray-50 p-4 rounded-lg space-y-3">
                    <h4 className="font-medium text-gray-900">Price Breakdown</h4>
                    <div className="space-y-2 text-sm">
                                             <div className="flex justify-between">
                         <span>Base Price (30 min):</span>
                         <span>{formatNPR(quoteData.breakdown.basePrice)}</span>
                       </div>
                       
                       {quoteData.isExpress && (
                         <div className="flex justify-between text-orange-600">
                           <span>Express Surcharge:</span>
                           <span>+{formatNPR(quoteData.breakdown.expressSurcharge)}</span>
                         </div>
                       )}
                       
                       {quoteData.hasWarranty && (
                         <div className="flex justify-between text-blue-600">
                           <span>Warranty Fee:</span>
                           <span>+{formatNPR(quoteData.breakdown.warrantyFee)}</span>
                         </div>
                       )}
                       
                       <div className="flex justify-between text-gray-600">
                         <span>Booking Fee:</span>
                         <span>{formatNPR(quoteData.breakdown.bookingFee)}</span>
                       </div>
                       
                       <div className="flex justify-between text-green-600">
                         <span>Coins Cap (≤10%):</span>
                         <span>-{formatNPR(quoteData.breakdown.coinsCap)}</span>
                       </div>
                       
                       <div className="border-t pt-2">
                         <div className="flex justify-between font-semibold text-lg">
                           <span>Total:</span>
                           <span className="text-primary">{formatNPR(quoteData.totalPrice)}</span>
                         </div>
                       </div>
                    </div>
                  </div>

                  {/* Payment Methods */}
                  <div className="text-center">
                    <p className="text-sm text-gray-600 mb-3">Payment Methods:</p>
                    <div className="flex justify-center gap-4">
                      <Badge variant="outline" className="px-3 py-1">
                        💰 Cash on Delivery
                      </Badge>
                      <Badge variant="outline" className="px-3 py-1">
                        📱 eSewa
                      </Badge>
                      <Badge variant="outline" className="px-3 py-1">
                        🏦 Khalti
                      </Badge>
                    </div>
                  </div>

                  {/* Navigation */}
                  <div className="flex justify-between pt-4">
                    <Button variant="outline" onClick={() => setCurrentStep(1)}>
                      <ArrowLeft className="h-4 w-4 mr-2" />
                      Back to Quote
                    </Button>
                    <Button 
                      onClick={handleSubmit}
                      disabled={isSubmitting}
                      className="bg-primary hover:bg-primary/90"
                      size="lg"
                    >
                      {isSubmitting ? 'Creating Booking...' : 'Confirm & Pay'}
                    </Button>
                  </div>
                </CardContent>
              </Card>
            </div>

            {/* Service Summary Sidebar */}
            <div>
              <Card>
                <CardHeader>
                  <CardTitle>Service Summary</CardTitle>
                </CardHeader>
                <CardContent className="space-y-4">
                  <div className="text-center">
                    <h3 className="text-lg font-semibold text-gray-900">{serviceData.name}</h3>
                    <p className="text-sm text-gray-600">{serviceData.category}</p>
                  </div>
                  
                  <div className="space-y-2 text-sm">
                    <div className="flex justify-between">
                      <span>Service:</span>
                      <span>{serviceData.name}</span>
                    </div>
                    <div className="flex justify-between">
                      <span>Category:</span>
                      <span>{serviceData.category}</span>
                    </div>
                    <div className="flex justify-between">
                      <span>Time Window:</span>
                      <span>{quoteData.preferredTime}</span>
                    </div>
                  </div>
                </CardContent>
              </Card>
            </div>
          </div>
        )}

        {/* Step 3: Confirmation */}
        {currentStep === 3 && (
          <div className="max-w-2xl mx-auto">
            <Card className="text-center">
              <CardHeader>
                <div className="mx-auto w-16 h-16 bg-green-100 rounded-full flex items-center justify-center mb-4">
                  <CheckCircle className="h-8 w-8 text-green-600" />
                </div>
                <CardTitle className="text-2xl text-green-600">Booking Confirmed!</CardTitle>
                <CardDescription>
                  Your {serviceData?.name} service has been booked successfully
                </CardDescription>
              </CardHeader>
              <CardContent className="space-y-6">
                <div className="bg-gray-50 p-4 rounded-lg">
                  <h4 className="font-medium text-gray-900 mb-2">What's Next?</h4>
                  <ul className="text-sm text-gray-600 space-y-1">
                    <li>• You'll receive a confirmation SMS</li>
                    <li>• Our team will assign a verified provider</li>
                    <li>• Provider will arrive within your time window</li>
                    <li>• Pay only after service completion</li>
                  </ul>
                </div>

                <div className="flex flex-col sm:flex-row gap-4 justify-center">
                  <Button 
                    onClick={() => router.push('/dashboard')}
                    className="bg-primary hover:bg-primary/90"
                  >
                    View Dashboard
                  </Button>
                  <Button 
                    variant="outline"
                    onClick={() => router.push('/services')}
                  >
                    Book Another Service
                  </Button>
                </div>
              </CardContent>
            </Card>
          </div>
        )}
      </div>
    </div>
  );
}
