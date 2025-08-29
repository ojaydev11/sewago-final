'use client';

<<<<<<< HEAD
import { useState, useEffect } from 'react';
import { useParams, useRouter } from 'next/navigation';
import { useSession } from 'next-auth/react';
=======
import { useState, useEffect, useCallback } from 'react';
import { useParams, useRouter } from 'next/navigation';
import { useSafeLocalStorage } from '@/hooks/useClientOnly';
// Mock session hook - replace with actual backend integration
const useSession = () => ({ data: { user: { id: 'mock-user-id', name: 'Mock User', email: 'mock@example.com' } } });
>>>>>>> d7ae416fad47e198a4cbb3bc4d0928f6cb7c7245
import { Button } from '@/components/ui/button';
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from '@/components/ui/card';
import { Badge } from '@/components/ui/badge';
import { ArrowLeft, CheckCircle, Clock, MapPin, Shield, Zap } from 'lucide-react';
import { toast } from 'sonner';
import QuoteForm, { QuoteData } from '@/components/booking/QuoteForm';
import { getServiceBySlug } from '@/lib/services';
import { Label } from '@/components/ui/label';
import { formatNPR } from '@/lib/currency';
<<<<<<< HEAD
import { useCallback } from 'react';
=======
import { UserIcon } from 'lucide-react';
>>>>>>> d7ae416fad47e198a4cbb3bc4d0928f6cb7c7245

// Force dynamic rendering to prevent build-time pre-rendering
export const dynamic = 'force-dynamic';

interface ServiceData {
  name: string;
  basePrice: number;
  category: string;
  shortDesc: string;
}

<<<<<<< HEAD
export default function BookingPage() {
  const params = useParams();
  const router = useRouter();
  const { data: session } = useSession();
=======
export default function ServiceBookingPage() {
  const params = useParams();
  const router = useRouter();
  const { data: session } = useSession();
  const slug = params?.slug as string;
  
  // State variables
>>>>>>> d7ae416fad47e198a4cbb3bc4d0928f6cb7c7245
  const [currentStep, setCurrentStep] = useState(1);
  const [isSubmitting, setIsSubmitting] = useState(false);
  const [quoteData, setQuoteData] = useState<QuoteData | null>(null);
  const [serviceData, setServiceData] = useState<ServiceData | null>(null);
  const [isLoading, setIsLoading] = useState(true);
  const [loadError, setLoadError] = useState<string | null>(null);
<<<<<<< HEAD

  const slug = params.slug as string;

  // Load service data with timeout and localStorage persistence
  useEffect(() => {
    const loadService = async () => {
      try {
        // Check localStorage first for instant render
        const cached = localStorage.getItem(`service_${slug}`);
        if (cached) {
          const service = JSON.parse(cached);
          setServiceData(service);
=======
  const [isClient, setIsClient] = useState(false);
  
  // Use safe hooks
  const [cachedService, setCachedService] = useSafeLocalStorage<any>(`service_${slug}`, null);
  const [savedStep, setSavedStep] = useSafeLocalStorage<number>(`booking_step_${slug}`, 1);
  const [savedQuote, setSavedQuote] = useSafeLocalStorage<any>(`booking_quote_${slug}`, null);

  // Load service data
  useEffect(() => {
    setIsClient(true);
    if (!slug) return;
    
    const loadService = async () => {
      try {
        // Check cached data first for instant render
        if (cachedService) {
          setServiceData(cachedService);
>>>>>>> d7ae416fad47e198a4cbb3bc4d0928f6cb7c7245
          setIsLoading(false);
        }

        // Fetch fresh data with 5s timeout
        const timeoutPromise = new Promise((_, reject) => 
          setTimeout(() => reject(new Error('Request timeout')), 5000)
        );
        
        const fetchPromise = getServiceBySlug(slug);
        const service = await Promise.race([fetchPromise, timeoutPromise]);
        
<<<<<<< HEAD
        if (service) {
          const serviceData = {
            name: service.name,
            basePrice: service.basePrice,
            category: service.category,
            shortDesc: service.shortDesc
          };
          setServiceData(serviceData);
          localStorage.setItem(`service_${slug}`, JSON.stringify(serviceData));
=======
        if (service && typeof service === 'object' && 'name' in service) {
          const serviceData = {
            name: (service as any).name || '',
            basePrice: (service as any).basePrice || 0,
            category: (service as any).category || '',
            shortDesc: (service as any).shortDesc || ''
          };
          setServiceData(serviceData);
          setCachedService(serviceData);
>>>>>>> d7ae416fad47e198a4cbb3bc4d0928f6cb7c7245
          setIsLoading(false);
        }
      } catch (error) {
        console.error('Error loading service:', error);
        setLoadError(error instanceof Error ? error.message : 'Failed to load service');
        setIsLoading(false);
      }
    };
    loadService();
<<<<<<< HEAD
  }, [slug]);

  // Persist step and quote data to localStorage
  useEffect(() => {
    if (currentStep > 1) {
      localStorage.setItem(`booking_step_${slug}`, currentStep.toString());
    }
  }, [currentStep, slug]);

  useEffect(() => {
    if (quoteData) {
      localStorage.setItem(`booking_quote_${slug}`, JSON.stringify(quoteData));
    }
  }, [quoteData, slug]);

  // Restore from localStorage on mount
  useEffect(() => {
    const savedStep = localStorage.getItem(`booking_step_${slug}`);
    const savedQuote = localStorage.getItem(`booking_quote_${slug}`);
    
    if (savedStep) {
      setCurrentStep(parseInt(savedStep));
    }
    if (savedQuote) {
      setQuoteData(JSON.parse(savedQuote));
    }
  }, [slug]);

  const handleQuoteUpdate = useCallback(async (quote: QuoteData) => {
=======
  }, [slug, cachedService, setCachedService]);

  // Persist step and quote data
  useEffect(() => {
    if (currentStep > 1) {
      setSavedStep(currentStep);
    }
  }, [currentStep, setSavedStep]);

  useEffect(() => {
    if (quoteData) {
      setSavedQuote(quoteData);
    }
  }, [quoteData, setSavedQuote]);

  // Restore from saved data on mount
  useEffect(() => {
    if (savedStep > 1) {
      setCurrentStep(savedStep);
    }
    if (savedQuote) {
      setQuoteData(savedQuote);
    }
  }, [savedStep, savedQuote]);

  const handleQuoteUpdate = useCallback(async (quote: QuoteData) => {
    if (!serviceData) return;
    
>>>>>>> d7ae416fad47e198a4cbb3bc4d0928f6cb7c7245
    try {
      // Call server to get authoritative quote
      const res = await fetch('/api/quote', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({
          serviceSlug: slug,
<<<<<<< HEAD
          serviceName: serviceData?.name ?? '',
          basePrice: serviceData?.basePrice ?? 0,
=======
          serviceName: serviceData.name,
          basePrice: serviceData.basePrice,
>>>>>>> d7ae416fad47e198a4cbb3bc4d0928f6cb7c7245
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

<<<<<<< HEAD
  // Redirect if not authenticated
  if (!session?.user) {
    router.push(`/auth/login?callbackUrl=/services/${slug}/book`);
    return null;
=======
  // Check if user is authenticated
  if (!session?.user) {
    return (
      <div className="min-h-screen bg-gray-50 flex items-center justify-center">
        <div className="text-center">
          <div className="text-gray-400 mb-4">
            <UserIcon className="w-16 h-16 mx-auto" />
          </div>
          <h3 className="text-lg font-medium text-gray-900 mb-2">Authentication Required</h3>
          <p className="text-gray-600 mb-4">Please log in to book this service.</p>
          <button
            onClick={() => router.push('/auth/login')}
            className="px-6 py-3 bg-blue-600 text-white rounded-lg hover:bg-blue-700 transition-colors"
          >
            Log In
          </button>
        </div>
      </div>
    );
>>>>>>> d7ae416fad47e198a4cbb3bc4d0928f6cb7c7245
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
<<<<<<< HEAD
        const { booking } = await response.json();
=======
        await response.json(); // Just consume the response
>>>>>>> d7ae416fad47e198a4cbb3bc4d0928f6cb7c7245
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

  if (isLoading && !serviceData) {
    return (
      <div className="min-h-screen bg-gray-50 py-8">
        <div className="container mx-auto px-4 max-w-6xl">
          {/* Header Skeleton */}
          <div className="text-center mb-8">
            <div className="h-12 w-96 bg-gray-200 rounded-lg mx-auto mb-4 animate-pulse"></div>
            <div className="h-6 w-80 bg-gray-200 rounded mx-auto animate-pulse"></div>
          </div>

          {/* Progress Steps Skeleton */}
          <div className="flex items-center justify-center mb-8">
            <div className="flex items-center space-x-4">
              {[1, 2, 3].map((step) => (
                <div key={step} className="flex items-center text-gray-400">
                  <div className="w-8 h-8 rounded-full border-2 border-gray-300 bg-gray-200 animate-pulse"></div>
                  <span className="ml-2 font-medium w-20 h-4 bg-gray-200 rounded animate-pulse"></span>
                  {step < 3 && <div className="w-16 h-0.5 bg-gray-300 ml-4"></div>}
                </div>
              ))}
            </div>
          </div>

          {/* Content Skeleton */}
          <div className="grid grid-cols-1 lg:grid-cols-3 gap-8">
            <div className="lg:col-span-2">
              <div className="space-y-6">
                {[1, 2, 3, 4].map((i) => (
                  <div key={i} className="space-y-4">
                    <div className="h-4 w-24 bg-gray-200 rounded animate-pulse"></div>
                    <div className="h-10 w-full bg-gray-200 rounded animate-pulse"></div>
                  </div>
                ))}
                <div className="h-12 w-full bg-gray-200 rounded animate-pulse"></div>
              </div>
            </div>
            
            {/* Service Info Sidebar Skeleton */}
            <div className="space-y-6">
              <div className="bg-white rounded-lg shadow-md p-6">
                <div className="h-6 w-32 bg-gray-200 rounded mb-4 animate-pulse"></div>
                <div className="h-4 w-full bg-gray-200 rounded mb-4 animate-pulse"></div>
                <div className="space-y-3">
                  <div className="flex justify-between">
                    <div className="h-4 w-20 bg-gray-200 rounded animate-pulse"></div>
                    <div className="h-6 w-24 bg-gray-200 rounded animate-pulse"></div>
                  </div>
                  {[1, 2, 3].map((i) => (
                    <div key={i} className="flex items-center gap-2">
                      <div className="w-4 h-4 bg-gray-200 rounded animate-pulse"></div>
                      <div className="h-4 w-40 bg-gray-200 rounded animate-pulse"></div>
                    </div>
                  ))}
                </div>
              </div>
              <div className="h-12 w-full bg-gray-200 rounded animate-pulse"></div>
            </div>
          </div>
        </div>
      </div>
    );
  }

  // Error state - render minimal above-the-fold summary
  if (loadError && !serviceData) {
    return (
      <div className="min-h-screen bg-gray-50 py-8">
        <div className="container mx-auto px-4 max-w-6xl">
          <div className="text-center mb-8">
            <h1 className="text-3xl font-bold text-gray-900 mb-4">
              Service Unavailable
            </h1>
            <p className="text-gray-600 mb-6">
              We're having trouble loading this service. Please try again later.
            </p>
            <button 
<<<<<<< HEAD
              onClick={() => window.location.reload()}
=======
              onClick={() => {
                if (isClient) {
                  window.location.reload();
                }
              }}
>>>>>>> d7ae416fad47e198a4cbb3bc4d0928f6cb7c7245
              className="bg-primary text-white px-6 py-3 rounded-lg hover:bg-primary/90 transition-colors"
            >
              Retry
            </button>
          </div>
        </div>
      </div>
    );
  }

<<<<<<< HEAD
=======
  // Ensure serviceData is available before rendering
  if (!serviceData) {
    return (
      <div className="min-h-screen bg-gray-50 flex items-center justify-center">
        <div className="text-center">
          <div className="text-gray-400 mb-4">
            <Clock className="w-16 h-16 mx-auto" />
          </div>
          <h3 className="text-lg font-medium text-gray-900 mb-2">Loading service...</h3>
          <p className="text-gray-600">Please wait while we load the service details.</p>
        </div>
      </div>
    );
  }

>>>>>>> d7ae416fad47e198a4cbb3bc4d0928f6cb7c7245
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
