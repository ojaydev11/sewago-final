
import { RISK_CONFIG } from '@/config/flags';
<<<<<<< HEAD
import { UAParser } from 'ua-parser-js';
=======
>>>>>>> d7ae416fad47e198a4cbb3bc4d0928f6cb7c7245

export interface RiskFactors {
  repeatCancellations: number;
  deviceFingerprint: string;
  ipCityMismatch: boolean;
  throwawayEmail: boolean;
  bookingVelocity: number;
  blacklistedPhone: boolean;
  suspiciousPatterns: string[];
}

export interface RiskAssessmentResult {
  score: number;
  factors: RiskFactors;
  gateActions: {
    otpRequired: boolean;
    expressSlotsSuppressed: boolean;
    manualReviewRequired: boolean;
  };
  recommendations: string[];
}

// Blacklisted domains and patterns
const THROWAWAY_EMAIL_DOMAINS = [
  '10minutemail.com', 'guerrillamail.com', 'mailinator.com', 
  'tempmail.org', 'disposablemail.com', 'throwaway.email'
];

const SUSPICIOUS_PATTERNS = {
  RAPID_BOOKING: 'rapid_booking_pattern',
  MULTIPLE_DEVICES: 'multiple_device_fingerprints',
  VPN_USAGE: 'vpn_or_proxy_detected',
  FAKE_EMAIL: 'suspicious_email_pattern',
  PHONE_MISMATCH: 'phone_city_mismatch'
};

export class RiskEngine {
  /**
   * Calculate comprehensive risk score for a booking request
   */
  static async assessBookingRisk(params: {
    userId: string;
    userAgent: string;
    ip: string;
    email: string;
    phone: string;
    city: string;
    userHistory?: {
      totalBookings: number;
      cancelledBookings: number;
      noShows: number;
      recentBookings: number;
    };
  }): Promise<RiskAssessmentResult> {
    const factors: RiskFactors = {
      repeatCancellations: 0,
      deviceFingerprint: '',
      ipCityMismatch: false,
      throwawayEmail: false,
      bookingVelocity: 0,
      blacklistedPhone: false,
      suspiciousPatterns: []
    };

    let riskScore = 0;

    // 1. Device fingerprinting
<<<<<<< HEAD
    factors.deviceFingerprint = this.generateDeviceFingerprint(params.userAgent, params.ip);
=======
    factors.deviceFingerprint = await this.generateDeviceFingerprint(params.userAgent, params.ip);
>>>>>>> d7ae416fad47e198a4cbb3bc4d0928f6cb7c7245

    // 2. Check for throwaway email
    factors.throwawayEmail = this.isThrowawayEmail(params.email);
    if (factors.throwawayEmail) {
      riskScore += 25;
      factors.suspiciousPatterns.push(SUSPICIOUS_PATTERNS.FAKE_EMAIL);
    }

    // 3. User history analysis
    if (params.userHistory) {
      const cancellationRate = params.userHistory.cancelledBookings / Math.max(params.userHistory.totalBookings, 1);
      factors.repeatCancellations = params.userHistory.cancelledBookings;
      
      if (cancellationRate > 0.3) {
        riskScore += 30;
      }
      
      if (params.userHistory.noShows > 2) {
        riskScore += 20;
      }

      // Booking velocity check
      factors.bookingVelocity = params.userHistory.recentBookings;
      if (params.userHistory.recentBookings > RISK_CONFIG.RATE_LIMIT_BOOKINGS_PER_HOUR) {
        riskScore += 35;
        factors.suspiciousPatterns.push(SUSPICIOUS_PATTERNS.RAPID_BOOKING);
      }
    }

    // 4. IP/City mismatch detection (simplified)
    factors.ipCityMismatch = await this.checkIPCityMismatch(params.ip, params.city);
    if (factors.ipCityMismatch) {
      riskScore += 15;
      factors.suspiciousPatterns.push(SUSPICIOUS_PATTERNS.VPN_USAGE);
    }

    // 5. Phone blacklist check
    factors.blacklistedPhone = await this.isPhoneBlacklisted(params.phone);
    if (factors.blacklistedPhone) {
      riskScore += 40;
    }

    // 6. Email pattern analysis
    if (this.hasSuspiciousEmailPattern(params.email)) {
      riskScore += 10;
      factors.suspiciousPatterns.push(SUSPICIOUS_PATTERNS.FAKE_EMAIL);
    }

    // Cap risk score at 100
    riskScore = Math.min(riskScore, 100);

    // Determine gate actions
    const gateActions = {
      otpRequired: riskScore >= RISK_CONFIG.HIGH_RISK_THRESHOLD,
      expressSlotsSuppressed: riskScore >= RISK_CONFIG.MEDIUM_RISK_THRESHOLD,
      manualReviewRequired: riskScore >= 85
    };

    // Generate recommendations
    const recommendations = this.generateRecommendations(riskScore, factors);

    return {
      score: riskScore,
      factors,
      gateActions,
      recommendations
    };
  }

<<<<<<< HEAD
  private static generateDeviceFingerprint(userAgent: string, ip: string): string {
    const parser = new UAParser(userAgent);
    const browser = parser.getBrowser();
    const os = parser.getOS();
    
    return Buffer.from(`${browser.name}-${browser.version}-${os.name}-${ip.split('.').slice(0, 3).join('.')}`).toString('base64');
=======
  private static async generateDeviceFingerprint(userAgent: string, ip: string): Promise<string> {
    try {
      const { UAParser } = await import('ua-parser-js');
      const parser = new UAParser(userAgent);
      const browser = parser.getBrowser();
      const os = parser.getOS();
      
      return Buffer.from(`${browser.name}-${browser.version}-${os.name}-${ip.split('.').slice(0, 3).join('.')}`).toString('base64');
    } catch (error) {
      // Fallback if UAParser fails to load
      console.warn('Failed to load UAParser, using fallback fingerprint');
      return Buffer.from(`unknown-${ip.split('.').slice(0, 3).join('.')}`).toString('base64');
    }
>>>>>>> d7ae416fad47e198a4cbb3bc4d0928f6cb7c7245
  }

  private static isThrowawayEmail(email: string): boolean {
    const domain = email.split('@')[1]?.toLowerCase();
    return THROWAWAY_EMAIL_DOMAINS.includes(domain);
  }

  private static async checkIPCityMismatch(ip: string, expectedCity: string): Promise<boolean> {
    // Simplified implementation - in production, use IP geolocation API
    // For now, return false to avoid external dependencies
    return false;
  }

  private static async isPhoneBlacklisted(phone: string): Promise<boolean> {
    // Simplified implementation - check against blacklist database
    const blacklistedPatterns = ['+9779999999999', '+9771111111111'];
    return blacklistedPatterns.includes(phone);
  }

  private static hasSuspiciousEmailPattern(email: string): boolean {
    const suspiciousPatterns = [
      /^[a-z]+\d{4,}@/,  // letters followed by many numbers
      /test\d+@/,        // test emails
      /fake\d*@/,        // fake emails
      /^\d+@/            // starts with numbers only
    ];
    
    return suspiciousPatterns.some(pattern => pattern.test(email.toLowerCase()));
  }

  private static generateRecommendations(score: number, factors: RiskFactors): string[] {
    const recommendations: string[] = [];

    if (score >= 75) {
      recommendations.push('High risk - require additional verification');
      recommendations.push('Manual review recommended');
    } else if (score >= 50) {
      recommendations.push('Medium risk - monitor closely');
      recommendations.push('Consider additional verification steps');
    }

    if (factors.throwawayEmail) {
      recommendations.push('Request permanent email address');
    }

    if (factors.repeatCancellations > 3) {
      recommendations.push('Review cancellation history with customer');
    }

    if (factors.bookingVelocity > RISK_CONFIG.RATE_LIMIT_BOOKINGS_PER_HOUR) {
      recommendations.push('Rate limit exceeded - implement cooling-off period');
    }

    return recommendations;
  }
}
