'use client';

import { useState } from 'react';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { Button } from '@/components/ui/button';
import { Badge } from '@/components/ui/badge';
import ReviewForm from '@/components/ReviewForm';
import PhotoGallery from '@/components/PhotoGallery';
import PhotoUpload from '@/components/PhotoUpload';

// Force dynamic rendering to prevent prerendering issues
export const dynamic = 'force-dynamic';

export default function ReviewSystemDemo() {
  const [showReviewForm, setShowReviewForm] = useState(false);
  const [submittedReview, setSubmittedReview] = useState<any>(null);
  const [demoPhotos] = useState([
    'https://images.unsplash.com/photo-1556909114-f6e7ad7d3136?w=400&h=400&fit=crop',
    'https://images.unsplash.com/photo-1581578731548-c64695e69564?w=400&h=400&fit=crop',
    'https://images.unsplash.com/photo-1558618666-fcd25c85cd64?w=400&h=400&fit=crop',
  ]);

  const handleReviewSubmit = async (reviewData: any) => {
    // Simulate API call
    await new Promise(resolve => setTimeout(resolve, 1000));
    
    setSubmittedReview({
      ...reviewData,
      id: 'demo-review-001',
      createdAt: new Date().toISOString(),
      photos: demoPhotos.slice(0, reviewData.photos.length)
    });
    setShowReviewForm(false);
  };

  const handlePhotoUpload = (photos: File[]) => {
    console.log('Photos selected:', photos);
  };

  return (
    <div className="min-h-screen bg-gray-50 py-8">
      <div className="max-w-6xl mx-auto px-4 sm:px-6 lg:px-8">
        {/* Header */}
        <div className="text-center mb-8">
          <h1 className="text-4xl font-bold text-gray-900 mb-4">
            SewaGo Photo Review System Demo
          </h1>
          <p className="text-lg text-gray-600 max-w-3xl mx-auto">
            Experience the new photo-enabled review system with drag-and-drop uploads, 
            real-time previews, and beautiful photo galleries.
          </p>
        </div>

        <div className="grid grid-cols-1 lg:grid-cols-2 gap-8">
          {/* Left Column - Review Form Demo */}
          <div className="space-y-6">
            <Card>
              <CardHeader>
                <CardTitle className="flex items-center justify-between">
                  <span>Review Submission</span>
                  <Badge variant="secondary">Interactive Demo</Badge>
                </CardTitle>
              </CardHeader>
              <CardContent>
                {!showReviewForm ? (
                  <div className="text-center py-8">
                    <p className="text-gray-600 mb-4">
                      Click the button below to see the review form in action
                    </p>
                    <Button onClick={() => setShowReviewForm(true)}>
                      Show Review Form
                    </Button>
                  </div>
                ) : (
                  <ReviewForm
                    bookingId="demo-booking-001"
                    serviceName="House Cleaning Service"
                    onSubmit={handleReviewSubmit}
                    onCancel={() => setShowReviewForm(false)}
                  />
                )}
              </CardContent>
            </Card>

            {/* Photo Upload Demo */}
            <Card>
              <CardHeader>
                <CardTitle>Photo Upload Component</CardTitle>
              </CardHeader>
              <CardContent>
                <PhotoUpload
                  onPhotosChange={handlePhotoUpload}
                  maxPhotos={5}
                />
              </CardContent>
            </Card>
          </div>

          {/* Right Column - Results & Gallery */}
          <div className="space-y-6">
            {/* Submitted Review Display */}
            {submittedReview && (
              <Card>
                <CardHeader>
                  <CardTitle className="flex items-center justify-between">
                    <span>Submitted Review</span>
                    <Badge variant="outline">Demo Result</Badge>
                  </CardTitle>
                </CardHeader>
                <CardContent>
                  <div className="space-y-4">
                    <div className="flex items-center space-x-2">
                      <span className="text-sm font-medium">Rating:</span>
                      <div className="flex space-x-1">
                        {Array.from({ length: 5 }, (_, i) => (
                          <span
                            key={i}
                            className={`text-lg ${
                              i < submittedReview.rating
                                ? 'text-yellow-400'
                                : 'text-gray-300'
                            }`}
                          >
                            ★
                          </span>
                        ))}
                      </div>
                    </div>
                    
                    <div>
                      <span className="text-sm font-medium">Comment:</span>
                      <p className="text-sm text-gray-600 mt-1">
                        {submittedReview.comment}
                      </p>
                    </div>

                    <div>
                      <span className="text-sm font-medium">Photos:</span>
                      <p className="text-sm text-gray-600 mt-1">
                        {submittedReview.photos.length} photo(s) uploaded
                      </p>
                    </div>

                    <div className="pt-4">
                      <Button
                        variant="outline"
                        onClick={() => setSubmittedReview(null)}
                        size="sm"
                      >
                        Reset Demo
                      </Button>
                    </div>
                  </div>
                </CardContent>
              </Card>
            )}

            {/* Photo Gallery Demo */}
            <Card>
              <CardHeader>
                <CardTitle>Photo Gallery Component</CardTitle>
              </CardHeader>
              <CardContent>
                <PhotoGallery
                  photos={demoPhotos}
                  maxPhotos={3}
                />
              </CardContent>
            </Card>

            {/* Features Overview */}
            <Card>
              <CardHeader>
                <CardTitle>System Features</CardTitle>
              </CardHeader>
              <CardContent>
                <div className="space-y-3">
                  <div className="flex items-center space-x-2">
                    <div className="w-2 h-2 bg-green-500 rounded-full"></div>
                    <span className="text-sm">Drag & Drop Photo Upload</span>
                  </div>
                  <div className="flex items-center space-x-2">
                    <div className="w-2 h-2 bg-green-500 rounded-full"></div>
                    <span className="text-sm">Real-time Photo Previews</span>
                  </div>
                  <div className="flex items-center space-x-2">
                    <div className="w-2 h-2 bg-green-500 rounded-full"></div>
                    <span className="text-sm">Interactive Star Rating</span>
                  </div>
                  <div className="flex items-center space-x-2">
                    <div className="w-2 h-2 bg-green-500 rounded-full"></div>
                    <span className="text-sm">Lightbox Photo Gallery</span>
                  </div>
                  <div className="flex items-center space-x-2">
                    <div className="w-2 h-2 bg-green-500 rounded-full"></div>
                    <span className="text-sm">Cloud Storage Integration</span>
                  </div>
                  <div className="flex items-center space-x-2">
                    <div className="w-2 h-2 bg-green-500 rounded-full"></div>
                    <span className="text-sm">Mobile-First Design</span>
                  </div>
                </div>
              </CardContent>
            </Card>
          </div>
        </div>

        {/* Bottom Section - Technical Details */}
        <div className="mt-12">
          <Card>
            <CardHeader>
              <CardTitle>Technical Implementation</CardTitle>
            </CardHeader>
            <CardContent>
              <div className="grid grid-cols-1 md:grid-cols-3 gap-6">
                <div>
                  <h4 className="font-medium text-gray-900 mb-2">Frontend Components</h4>
                  <ul className="text-sm text-gray-600 space-y-1">
                    <li>• PhotoUpload with drag & drop</li>
                    <li>• PhotoGallery with lightbox</li>
                    <li>• ReviewForm with validation</li>
                    <li>• Real-time previews</li>
                  </ul>
                </div>
                
                <div>
                  <h4 className="font-medium text-gray-900 mb-2">Backend Services</h4>
                  <ul className="text-sm text-gray-600 space-y-1">
                    <li>• CloudStorageService (AWS S3)</li>
                    <li>• Pre-signed URL generation</li>
                    <li>• File validation & security</li>
                    <li>• Upload/download APIs</li>
                  </ul>
                </div>
                
                <div>
                  <h4 className="font-medium text-gray-900 mb-2">Integration Points</h4>
                  <ul className="text-sm text-gray-600 space-y-1">
                    <li>• WebSocket real-time updates</li>
                    <li>• Notification system</li>
                    <li>• Admin dashboard</li>
                    <li>• Provider tracking</li>
                  </ul>
                </div>
              </div>
            </CardContent>
          </Card>
        </div>
      </div>
    </div>
  );
}
