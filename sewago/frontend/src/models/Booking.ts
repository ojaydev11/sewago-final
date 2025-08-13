
export type PaymentMethod = 'COD' | 'ESEWA';
export type PaymentStatus = 'PendingCollection' | 'Paid' | 'Refunded';
export type BookingStatus = 'Requested' | 'Accepted' | 'InProgress' | 'Completed' | 'Cancelled';

export interface Booking {
  _id: string;
  serviceId: string;
  userId: string;
  providerId?: string;
  
  // Service details
  serviceName: string;
  servicePrice: number;
  
  // Customer details
  customerName: string;
  customerEmail: string;
  customerPhone: string;
  
  // Location
  address: string;
  landmark?: string;
  city: 'Kathmandu' | 'Lalitpur' | 'Bhaktapur';
  
  // Scheduling
  scheduledDate: string;
  scheduledTime: string;
  
  // Payment
  paymentMethod: PaymentMethod;
  paymentStatus: PaymentStatus;
  totalAmount: number;
  
  // Status
  status: BookingStatus;
  
  // Notes
  specialInstructions?: string;
  
  // Timestamps
  createdAt: string;
  updatedAt: string;
}

export interface BookingFormData {
  serviceName: string;
  servicePrice: number;
  customerName: string;
  customerEmail: string;
  customerPhone: string;
  address: string;
  landmark?: string;
  city: 'Kathmandu' | 'Lalitpur' | 'Bhaktapur';
  scheduledDate: string;
  scheduledTime: string;
  paymentMethod: PaymentMethod;
  specialInstructions?: string;
}
