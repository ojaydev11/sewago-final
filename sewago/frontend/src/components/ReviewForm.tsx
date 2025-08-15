'use client';

import { useState } from 'react';
import { StarIcon } from '@heroicons/react/24/solid';
import { StarIcon as StarOutlineIcon } from '@heroicons/react/24/outline';
import { Button } from '@/components/ui/button';
import { Textarea } from '@/components/ui/textarea';
import { Label } from '@/components/ui/label';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import PhotoUpload from './PhotoUpload';

interface ReviewFormProps {
  bookingId: string;
  serviceName: string;
  onSubmit: (review: ReviewData) => Promise<void>;
  onCancel: () => void;
  className?: string;
}

interface ReviewData {
  rating: number;
  comment: string;
  photos: File[];
}

export default function ReviewForm({ 
  bookingId, 
  serviceName, 
  onSubmit, 
  onCancel, 
  className = '' 
}: ReviewFormProps) {
  const [rating, setRating] = useState(0);
  const [comment, setComment] = useState('');
  const [photos, setPhotos] = useState<File[]>([]);
  const [isSubmitting, setIsSubmitting] = useState(false);
  const [errors, setErrors] = useState<Record<string, string>>({});

  const handleRatingChange = (newRating: number) => {
    setRating(newRating);
    if (errors.rating) {
      setErrors(prev => ({ ...prev, rating: '' }));
    }
  };

  const handleCommentChange = (value: string) => {
    setComment(value);
    if (errors.comment) {
      setErrors(prev => ({ ...prev, comment: '' }));
    }
  };

  const handlePhotosChange = (newPhotos: File[]) => {
    setPhotos(newPhotos);
  };

  const validateForm = (): boolean => {
    const newErrors: Record<string, string> = {};

    if (rating === 0) {
      newErrors.rating = 'Please select a rating';
    }

    if (!comment.trim()) {
      newErrors.comment = 'Please write a review comment';
    } else if (comment.trim().length < 10) {
      newErrors.comment = 'Review comment must be at least 10 characters long';
    }

    setErrors(newErrors);
    return Object.keys(newErrors).length === 0;
  };

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    
    if (!validateForm()) {
      return;
    }

    setIsSubmitting(true);
    
    try {
      await onSubmit({
        rating,
        comment: comment.trim(),
        photos
      });
    } catch (error) {
      console.error('Error submitting review:', error);
    } finally {
      setIsSubmitting(false);
    }
  };

  const renderStars = () => {
    return Array.from({ length: 5 }, (_, index) => {
      const starValue = index + 1;
      const isFilled = starValue <= rating;
      
      return (
        <button
          key={starValue}
          type="button"
          onClick={() => handleRatingChange(starValue)}
          className="p-1 transition-colors hover:scale-110"
          disabled={isSubmitting}
        >
          {isFilled ? (
            <StarIcon className="h-8 w-8 text-yellow-400" />
          ) : (
            <StarOutlineIcon className="h-8 w-8 text-gray-300 hover:text-yellow-400" />
          )}
        </button>
      );
    });
  };

  const getRatingText = () => {
    const ratingTexts = {
      1: 'Poor',
      2: 'Fair',
      3: 'Good',
      4: 'Very Good',
      5: 'Excellent'
    };
    return ratingTexts[rating as keyof typeof ratingTexts] || 'Select Rating';
  };

  return (
    <Card className={className}>
      <CardHeader>
        <CardTitle className="text-xl">Write a Review</CardTitle>
        <p className="text-gray-600">
          Share your experience with {serviceName}
        </p>
      </CardHeader>
      <CardContent>
        <form onSubmit={handleSubmit} className="space-y-6">
          {/* Rating Section */}
          <div className="space-y-3">
            <Label className="text-base font-medium">Service Rating</Label>
            <div className="space-y-2">
              <div className="flex items-center space-x-2">
                {renderStars()}
              </div>
              <div className="flex items-center justify-between">
                <span className="text-sm text-gray-600">
                  {getRatingText()}
                </span>
                {rating > 0 && (
                  <span className="text-sm font-medium text-gray-900">
                    {rating}/5 stars
                  </span>
                )}
              </div>
              {errors.rating && (
                <p className="text-sm text-red-600">{errors.rating}</p>
              )}
            </div>
          </div>

          {/* Comment Section */}
          <div className="space-y-3">
            <Label htmlFor="comment" className="text-base font-medium">
              Review Comment
            </Label>
            <Textarea
              id="comment"
              placeholder="Tell us about your experience with this service..."
              value={comment}
              onChange={(e) => handleCommentChange(e.target.value)}
              rows={4}
              className="resize-none"
              disabled={isSubmitting}
            />
            <div className="flex justify-between items-center">
              <span className="text-sm text-gray-500">
                Minimum 10 characters
              </span>
              <span className={`text-sm ${
                comment.length < 10 ? 'text-red-500' : 'text-green-500'
              }`}>
                {comment.length}/10
              </span>
            </div>
            {errors.comment && (
              <p className="text-sm text-red-600">{errors.comment}</p>
            )}
          </div>

          {/* Photo Upload Section */}
          <div className="space-y-3">
            <Label className="text-base font-medium">
              Add Photos (Optional)
            </Label>
            <PhotoUpload
              onPhotosChange={handlePhotosChange}
              maxPhotos={5}
            />
            <p className="text-xs text-gray-500">
              Photos help other customers make informed decisions. 
              Maximum 5 photos, 5MB each.
            </p>
          </div>

          {/* Form Actions */}
          <div className="flex items-center justify-end space-x-3 pt-4 border-t">
            <Button
              type="button"
              variant="outline"
              onClick={onCancel}
              disabled={isSubmitting}
            >
              Cancel
            </Button>
            <Button
              type="submit"
              disabled={isSubmitting || rating === 0 || !comment.trim()}
            >
              {isSubmitting ? (
                <>
                  <div className="animate-spin rounded-full h-4 w-4 border-b-2 border-white mr-2"></div>
                  Submitting...
                </>
              ) : (
                'Submit Review'
              )}
            </Button>
          </div>
        </form>
      </CardContent>
    </Card>
  );
}
