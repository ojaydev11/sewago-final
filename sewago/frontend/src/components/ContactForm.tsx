'use client';

import { useState } from 'react';
import { useForm } from 'react-hook-form';
import { zodResolver } from '@hookform/resolvers/zod';
import { z } from 'zod';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { Textarea } from '@/components/ui/textarea';
import { Label } from '@/components/ui/label';
import { useTranslations } from 'next-intl';
import { Mail, Phone, User, MessageCircle, Loader2, CheckCircle } from 'lucide-react';

const contactFormSchema = z.object({
  firstName: z.string().min(2, 'First name must be at least 2 characters').max(50, 'First name must be less than 50 characters'),
  lastName: z.string().min(2, 'Last name must be at least 2 characters').max(50, 'Last name must be less than 50 characters'),
  email: z.string().email('Please enter a valid email address'),
  phone: z.string().min(10, 'Phone number must be at least 10 digits').max(15, 'Phone number must be less than 15 digits'),
  message: z.string().min(10, 'Message must be at least 10 characters').max(1000, 'Message must be less than 1000 characters'),
});

type ContactFormData = z.infer<typeof contactFormSchema>;

interface ContactFormProps {
  className?: string;
}

export default function ContactForm({ className = '' }: ContactFormProps) {
  const t = useTranslations();
  const [isSubmitting, setIsSubmitting] = useState(false);
  const [submitSuccess, setSubmitSuccess] = useState(false);
  const [submitError, setSubmitError] = useState<string | null>(null);

  const {
    register,
    handleSubmit,
    formState: { errors, isValid, isSubmitted },
    reset,
  } = useForm<ContactFormData>({
    resolver: zodResolver(contactFormSchema),
    mode: 'onSubmit', // Only validate after submit
  });

  const onSubmit = async (data: ContactFormData) => {
    setIsSubmitting(true);
    setSubmitError(null);

    try {
      // Simulate API call - replace with actual endpoint
      await new Promise(resolve => setTimeout(resolve, 1000));
      
      // For now, just log the data
      console.log('Contact form submitted:', data);
      
      setSubmitSuccess(true);
      reset();
      
      // Reset success message after 5 seconds
      setTimeout(() => setSubmitSuccess(false), 5000);
    } catch (error) {
      setSubmitError('Failed to send message. Please try again.');
    } finally {
      setIsSubmitting(false);
    }
  };

  if (submitSuccess) {
    return (
      <div className={`${className} text-center p-8 bg-green-50 rounded-lg border border-green-200`}>
        <CheckCircle className="w-16 h-16 text-green-500 mx-auto mb-4" />
        <h3 className="text-xl font-semibold text-green-800 mb-2">Message Sent Successfully!</h3>
        <p className="text-green-600">Thank you for contacting us. We'll get back to you within 24 hours.</p>
        <Button 
          onClick={() => setSubmitSuccess(false)} 
          variant="outline" 
          className="mt-4"
        >
          Send Another Message
        </Button>
      </div>
    );
  }

  return (
    <form onSubmit={handleSubmit(onSubmit)} className={`space-y-6 ${className}`}>
      {/* Success/Error Messages */}
      {submitError && (
        <div className="p-4 bg-red-50 border border-red-200 rounded-lg">
          <p className="text-red-600 text-sm">{submitError}</p>
        </div>
      )}

      {/* Name Fields */}
      <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
        <div className="space-y-2">
          <Label htmlFor="firstName" className="text-white font-medium flex items-center gap-2">
            <User className="w-4 h-4" />
            {t('contact.form.firstName')}
          </Label>
          <Input
            id="firstName"
            {...register('firstName')}
            placeholder="Enter your first name"
            className={`bg-white/10 border-white/20 text-white placeholder:text-white/50 focus:border-accent focus:ring-accent ${
              errors.firstName ? 'border-red-400 focus:border-red-400 focus:ring-red-400' : ''
            }`}
            aria-invalid={errors.firstName ? 'true' : 'false'}
            aria-describedby={errors.firstName ? 'firstName-error' : undefined}
          />
          {isSubmitted && errors.firstName && (
            <p id="firstName-error" className="text-red-400 text-sm" role="alert" aria-live="polite">
              {errors.firstName.message}
            </p>
          )}
        </div>

        <div className="space-y-2">
          <Label htmlFor="lastName" className="text-white font-medium flex items-center gap-2">
            <User className="w-4 h-4" />
            {t('contact.form.lastName')}
          </Label>
          <Input
            id="lastName"
            {...register('lastName')}
            placeholder="Enter your last name"
            className={`bg-white/10 border-white/20 text-white placeholder:text-white/50 focus:border-accent focus:ring-accent ${
              errors.lastName ? 'border-red-400 focus:border-red-400 focus:ring-red-400' : ''
            }`}
            aria-invalid={errors.lastName ? 'true' : 'false'}
            aria-describedby={errors.lastName ? 'lastName-error' : undefined}
          />
          {isSubmitted && errors.lastName && (
            <p id="lastName-error" className="text-red-400 text-sm" role="alert" aria-live="polite">
              {errors.lastName.message}
            </p>
          )}
        </div>
      </div>

      {/* Email Field */}
      <div className="space-y-2">
        <Label htmlFor="email" className="text-white font-medium flex items-center gap-2">
          <Mail className="w-4 h-4" />
          {t('contact.form.email')}
        </Label>
        <Input
          id="email"
          type="email"
          {...register('email')}
          placeholder="Enter your email address"
          className={`bg-white/10 border-white/20 text-white placeholder:text-white/50 focus:border-accent focus:ring-accent ${
            errors.email ? 'border-red-400 focus:border-red-400 focus:ring-red-400' : ''
          }`}
          aria-invalid={errors.email ? 'true' : 'false'}
          aria-describedby={errors.email ? 'email-error' : undefined}
        />
        {isSubmitted && errors.email && (
          <p id="email-error" className="text-red-400 text-sm" role="alert" aria-live="polite">
            {errors.email.message}
          </p>
        )}
      </div>

      {/* Phone Field */}
      <div className="space-y-2">
        <Label htmlFor="phone" className="text-white font-medium flex items-center gap-2">
          <Phone className="w-4 h-4" />
          {t('contact.form.phone')}
        </Label>
        <Input
          id="phone"
          type="tel"
          {...register('phone')}
          placeholder="Enter your phone number"
          className={`bg-white/10 border-white/20 text-white placeholder:text-white/50 focus:border-accent focus:ring-accent ${
            errors.phone ? 'border-red-400 focus:border-red-400 focus:ring-red-400' : ''
          }`}
          aria-invalid={errors.phone ? 'true' : 'false'}
          aria-describedby={errors.phone ? 'phone-error' : undefined}
        />
        {isSubmitted && errors.phone && (
          <p id="phone-error" className="text-red-400 text-sm" role="alert" aria-live="polite">
            {errors.phone.message}
          </p>
        )}
      </div>

      {/* Message Field */}
      <div className="space-y-2">
        <Label htmlFor="message" className="text-white font-medium flex items-center gap-2">
          <MessageCircle className="w-4 h-4" />
          {t('contact.form.message')}
        </Label>
        <Textarea
          id="message"
          rows={4}
          {...register('message')}
          placeholder="Tell us how we can help you"
          className={`bg-white/10 border-white/20 text-white placeholder:text-white/50 focus:border-accent focus:ring-accent resize-none ${
            errors.message ? 'border-red-400 focus:border-red-400 focus:ring-red-400' : ''
          }`}
          aria-invalid={errors.message ? 'true' : 'false'}
          aria-describedby={errors.message ? 'message-error' : undefined}
        />
        {isSubmitted && errors.message && (
          <p id="message-error" className="text-red-400 text-sm" role="alert" aria-live="polite">
            {errors.message.message}
          </p>
        )}
      </div>

      {/* Submit Button */}
      <Button
        type="submit"
        disabled={!isValid || isSubmitting}
        className="w-full bg-gradient-to-r from-accent to-primary hover:from-accent/90 hover:to-primary/90 disabled:opacity-50 disabled:cursor-not-allowed transition-all duration-300"
        aria-describedby="submit-status"
      >
        {isSubmitting ? (
          <>
            <Loader2 className="w-4 h-4 mr-2 animate-spin" />
            Sending...
          </>
        ) : (
          <>
            <Mail className="w-4 h-4 mr-2" />
            {t('contact.form.sendMessage')}
          </>
        )}
      </Button>

      {/* Submit Status */}
      <div id="submit-status" className="sr-only" aria-live="polite">
        {isSubmitting ? 'Sending message...' : isValid ? 'Form is valid and ready to submit' : 'Form has validation errors'}
      </div>
    </form>
  );
}
