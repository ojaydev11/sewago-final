
import { SLA_CONFIG } from '@/config/flags';

export interface SLAMetrics {
  averageAcceptTime: number;
  onTimePercentage: number;
  totalJobs: number;
  lateJobs: number;
  autoReassignments: number;
}

export interface BookingSLA {
  bookingId: string;
  acceptDeadline: Date;
  estimatedArrival: Date;
  actualArrival?: Date;
  status: 'pending' | 'accepted' | 'in_progress' | 'completed' | 'late' | 'reassigned';
  assignedProvider: string;
  reassignmentCount: number;
  alerts: {
    type: 'accept_timeout' | 'late_arrival' | 'overdue';
    sentAt: Date;
    acknowledged: boolean;
  }[];
}

export class SLAManager {
  /**
   * Create SLA tracking for new booking
   */
  static createBookingSLA(bookingId: string, providerId: string, estimatedStart: Date): BookingSLA {
    const now = new Date();
    const acceptDeadline = new Date(now.getTime() + SLA_CONFIG.PROVIDER_ACCEPT_TIMEOUT_MINUTES * 60 * 1000);
    
    return {
      bookingId,
      acceptDeadline,
      estimatedArrival: estimatedStart,
      status: 'pending',
      assignedProvider: providerId,
      reassignmentCount: 0,
      alerts: []
    };
  }

  /**
   * Check if booking needs auto-reassignment
   */
  static shouldAutoReassign(sla: BookingSLA): boolean {
    const now = new Date();
    return (
      sla.status === 'pending' &&
      now > sla.acceptDeadline &&
      sla.reassignmentCount < SLA_CONFIG.AUTO_REASSIGN_ATTEMPTS
    );
  }

  /**
   * Check if job is running late
   */
  static isJobLate(sla: BookingSLA): boolean {
    const now = new Date();
    const lateThreshold = new Date(
      sla.estimatedArrival.getTime() + SLA_CONFIG.LATE_THRESHOLD_MINUTES * 60 * 1000
    );
    
    return (
      sla.status === 'in_progress' &&
      now > lateThreshold &&
      !sla.actualArrival
    );
  }

  /**
   * Calculate SLA metrics for provider/city
   */
  static calculateSLAMetrics(bookings: BookingSLA[]): SLAMetrics {
    const completedBookings = bookings.filter(b => b.status === 'completed');
    const totalJobs = bookings.length;
    
    const totalAcceptTime = 0;
    let onTimeJobs = 0;
    let lateJobs = 0;
    const autoReassignments = bookings.filter(b => b.reassignmentCount > 0).length;

    completedBookings.forEach(booking => {
      // Calculate accept time (simplified - would need actual accept timestamp)
      if (booking.actualArrival && booking.estimatedArrival) {
        const arrivalDiff = booking.actualArrival.getTime() - booking.estimatedArrival.getTime();
        const lateThreshold = SLA_CONFIG.LATE_THRESHOLD_MINUTES * 60 * 1000;
        
        if (arrivalDiff <= lateThreshold) {
          onTimeJobs++;
        } else {
          lateJobs++;
        }
      }
    });

    const averageAcceptTime = totalAcceptTime / Math.max(completedBookings.length, 1);
    const onTimePercentage = (onTimeJobs / Math.max(completedBookings.length, 1)) * 100;

    return {
      averageAcceptTime,
      onTimePercentage,
      totalJobs,
      lateJobs,
      autoReassignments
    };
  }

  /**
   * Generate SLA alert
   */
  static generateAlert(
    sla: BookingSLA, 
    type: 'accept_timeout' | 'late_arrival' | 'overdue'
  ): void {
    sla.alerts.push({
      type,
      sentAt: new Date(),
      acknowledged: false
    });
  }

  /**
   * Update booking status
   */
  static updateBookingStatus(
    sla: BookingSLA, 
    status: BookingSLA['status'],
    actualArrival?: Date
  ): BookingSLA {
    sla.status = status;
    if (actualArrival) {
      sla.actualArrival = actualArrival;
    }
    return sla;
  }

  /**
   * Reassign booking to new provider
   */
  static reassignBooking(sla: BookingSLA, newProviderId: string): BookingSLA {
    sla.assignedProvider = newProviderId;
    sla.reassignmentCount++;
    sla.status = 'pending';
    
    // Extend accept deadline
    const now = new Date();
    sla.acceptDeadline = new Date(now.getTime() + SLA_CONFIG.PROVIDER_ACCEPT_TIMEOUT_MINUTES * 60 * 1000);
    
    return sla;
  }
}
