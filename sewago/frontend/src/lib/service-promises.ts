/**
 * Service Promise Policy Library
 * Defines clear commitments and late-credit policies for SewaGo services
 */

export interface ServicePromise {
  id: string;
  title: string;
  description: string;
  guarantee: string;
  icon: string;
  category: 'timing' | 'quality' | 'safety' | 'pricing';
}

export interface LateCreditPolicy {
  thresholdMinutes: number;
  creditAmount: number;
  creditType: 'percentage' | 'fixed';
  maxCredit: number;
  conditions: string[];
}

export interface ServiceGuarantee {
  serviceType: string;
  promises: ServicePromise[];
  lateCreditPolicy: LateCreditPolicy;
  qualityAssurance: string[];
  customerRights: string[];
}

/**
 * Core service promises that SewaGo guarantees
 */
export const CORE_SERVICE_PROMISES: ServicePromise[] = [
  {
    id: 'on-time-guarantee',
    title: 'On-Time Guarantee',
    description: 'We promise to arrive within your scheduled time window',
    guarantee: 'If we\'re late, you get a credit on your next service',
    icon: '⏰',
    category: 'timing'
  },
  {
    id: 'quality-assurance',
    title: 'Quality Guarantee',
    description: 'All work is guaranteed to meet professional standards',
    guarantee: 'If you\'re not satisfied, we\'ll fix it for free',
    icon: '✨',
    category: 'quality'
  },
  {
    id: 'verified-providers',
    title: 'Verified Providers',
    description: 'Every provider is background-checked and verified',
    guarantee: '100% verified professionals with insurance coverage',
    icon: '✅',
    category: 'safety'
  },
  {
    id: 'transparent-pricing',
    title: 'Transparent Pricing',
    description: 'No hidden fees or surprise charges',
    guarantee: 'What you see is what you pay - guaranteed',
    icon: '💰',
    category: 'pricing'
  },
  {
    id: 'safety-first',
    title: 'Safety First',
    description: 'All providers follow strict safety protocols',
    guarantee: 'Your safety and property protection is our priority',
    icon: '🛡️',
    category: 'safety'
  },
  {
    id: 'customer-support',
    title: '24/7 Support',
    description: 'Round-the-clock customer support available',
    guarantee: 'We\'re here whenever you need us',
    icon: '📞',
    category: 'quality'
  }
];

/**
 * Late arrival credit policy
 */
export const LATE_CREDIT_POLICY: LateCreditPolicy = {
  thresholdMinutes: 15, // Credit applies if more than 15 minutes late
  creditAmount: 10, // 10% credit
  creditType: 'percentage',
  maxCredit: 500, // Maximum Rs 500 credit
  conditions: [
    'Provider must be more than 15 minutes late',
    'Customer must report the delay within 24 hours',
    'Credit applies to next service booking',
    'Credit expires after 30 days',
    'Cannot be combined with other offers'
  ]
};

/**
 * Service-specific guarantees
 */
export const SERVICE_GUARANTEES: Record<string, ServiceGuarantee> = {
  'house-cleaning': {
    serviceType: 'House Cleaning',
    promises: [
      ...CORE_SERVICE_PROMISES,
      {
        id: 'cleaning-satisfaction',
        title: 'Clean Satisfaction',
        description: 'Your home will be spotless after our service',
        guarantee: 'If any area isn\'t clean, we\'ll re-clean it free',
        icon: '🧹',
        category: 'quality'
      }
    ],
    lateCreditPolicy: LATE_CREDIT_POLICY,
    qualityAssurance: [
      'Professional cleaning equipment and supplies',
      'Eco-friendly cleaning products available',
      'Detailed cleaning checklist completion',
      'Before/after photos for verification'
    ],
    customerRights: [
      'Right to refuse service if provider is late',
      'Right to request re-cleaning of unsatisfactory areas',
      'Right to full refund if service quality is poor',
      'Right to choose cleaning products and methods'
    ]
  },
  'electrical-work': {
    serviceType: 'Electrical Work',
    promises: [
      ...CORE_SERVICE_PROMISES,
      {
        id: 'electrical-safety',
        title: 'Electrical Safety',
        description: 'All work meets national electrical codes',
        guarantee: 'Certified electricians with safety compliance',
        icon: '⚡',
        category: 'safety'
      }
    ],
    lateCreditPolicy: LATE_CREDIT_POLICY,
    qualityAssurance: [
      'Licensed and certified electricians',
      'Compliance with safety standards',
      'Workmanship warranty on all repairs',
      'Safety testing after completion'
    ],
    customerRights: [
      'Right to see electrician\'s license',
      'Right to safety inspection report',
      'Right to warranty on all work',
      'Right to emergency service priority'
    ]
  },
  'plumbing': {
    serviceType: 'Plumbing',
    promises: [
      ...CORE_SERVICE_PROMISES,
      {
        id: 'plumbing-warranty',
        title: 'Plumbing Warranty',
        description: 'All repairs come with workmanship warranty',
        guarantee: '90-day warranty on all plumbing work',
        icon: '🔧',
        category: 'quality'
      }
    ],
    lateCreditPolicy: LATE_CREDIT_POLICY,
    qualityAssurance: [
      'Licensed plumbers with experience',
      'Quality materials and parts',
      'Leak testing after repairs',
      'Detailed work documentation'
    ],
    customerRights: [
      'Right to see plumber\'s credentials',
      'Right to material quality assurance',
      'Right to warranty documentation',
      'Right to emergency response priority'
    ]
  }
};

/**
 * Calculate late credit amount
 */
export const calculateLateCredit = (
  basePrice: number, 
  delayMinutes: number
): number => {
  if (delayMinutes <= LATE_CREDIT_POLICY.thresholdMinutes) {
    return 0;
  }

  let credit = 0;
  if (LATE_CREDIT_POLICY.creditType === 'percentage') {
    credit = (basePrice * LATE_CREDIT_POLICY.creditAmount) / 100;
  } else {
    credit = LATE_CREDIT_POLICY.creditAmount;
  }

  return Math.min(credit, LATE_CREDIT_POLICY.maxCredit);
};

/**
 * Get service promises for a specific service
 */
export const getServicePromises = (serviceSlug: string): ServicePromise[] => {
  const serviceGuarantee = SERVICE_GUARANTEES[serviceSlug];
  return serviceGuarantee ? serviceGuarantee.promises : CORE_SERVICE_PROMISES;
};

/**
 * Get late credit policy for a service
 */
export const getLateCreditPolicy = (serviceSlug: string): LateCreditPolicy => {
  const serviceGuarantee = SERVICE_GUARANTEES[serviceSlug];
  return serviceGuarantee ? serviceGuarantee.lateCreditPolicy : LATE_CREDIT_POLICY;
};

/**
 * Format promise guarantee text
 */
export const formatPromiseGuarantee = (promise: ServicePromise): string => {
  return `${promise.icon} ${promise.title}: ${promise.guarantee}`;
};

/**
 * Get all available service types
 */
export const getAvailableServiceTypes = (): string[] => {
  return Object.keys(SERVICE_GUARANTEES);
};

/**
 * Check if a service has specific guarantees
 */
export const hasServiceGuarantees = (serviceSlug: string): boolean => {
  return serviceSlug in SERVICE_GUARANTEES;
};

/**
 * Get customer rights for a service
 */
export const getCustomerRights = (serviceSlug: string): string[] => {
  const serviceGuarantee = SERVICE_GUARANTEES[serviceSlug];
  return serviceGuarantee ? serviceGuarantee.customerRights : [];
};

/**
 * Get quality assurance measures for a service
 */
export const getQualityAssurance = (serviceSlug: string): string[] => {
  const serviceGuarantee = SERVICE_GUARANTEES[serviceSlug];
  return serviceGuarantee ? serviceGuarantee.qualityAssurance : [];
};

export default {
  CORE_SERVICE_PROMISES,
  LATE_CREDIT_POLICY,
  SERVICE_GUARANTEES,
  calculateLateCredit,
  getServicePromises,
  getLateCreditPolicy,
  formatPromiseGuarantee,
  getAvailableServiceTypes,
  hasServiceGuarantees,
  getCustomerRights,
  getQualityAssurance
};
