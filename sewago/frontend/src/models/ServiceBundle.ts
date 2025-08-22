export interface ServiceBundle {
  id: string;
  name: string;
  description: string;
  services: BundleService[];
  originalPrice: number;
  discountedPrice: number;
  discountPercentage: number;
  category: string;
  tags: string[];
  isActive: boolean;
  createdAt: Date;
  updatedAt: Date;
}

export interface BundleService {
  serviceId: string;
  serviceName: string;
  serviceCategory: string;
  estimatedDuration: number; // in minutes
  individualPrice: number;
  isRequired: boolean; // if false, customer can remove from bundle
}

export interface ServiceBundleOrder {
  id: string;
  bundleId: string;
  customerId: string;
  services: BundleServiceOrder[];
  totalAmount: number;
  discountAmount: number;
  finalAmount: number;
  status: 'pending' | 'confirmed' | 'in_progress' | 'completed' | 'cancelled';
  scheduledDate: Date;
  customerLocation: {
    address: string;
    latitude: number;
    longitude: number;
  };
  specialInstructions?: string;
  createdAt: Date;
  updatedAt: Date;
}

export interface BundleServiceOrder {
  serviceId: string;
  serviceName: string;
  serviceCategory: string;
  estimatedDuration: number;
  individualPrice: number;
  providerId?: string;
  status: 'pending' | 'assigned' | 'in_progress' | 'completed';
  actualDuration?: number;
  actualPrice?: number;
  notes?: string;
}

// Sample service bundles data
export const sampleServiceBundles: ServiceBundle[] = [
  {
    id: 'bundle-001',
    name: 'Move-in Package',
    description: 'Complete home setup package including plumbing, electrical, and cleaning services',
    services: [
      {
        serviceId: 'service-001',
        serviceName: 'Plumbing Check & Fix',
        serviceCategory: 'plumbing',
        estimatedDuration: 120,
        individualPrice: 2500,
        isRequired: true
      },
      {
        serviceId: 'service-002',
        serviceName: 'Electrical Safety Check',
        serviceCategory: 'electrical',
        estimatedDuration: 90,
        individualPrice: 2000,
        isRequired: true
      },
      {
        serviceId: 'service-003',
        serviceName: 'Deep Home Cleaning',
        serviceCategory: 'cleaning',
        estimatedDuration: 180,
        individualPrice: 3000,
        isRequired: true
      }
    ],
    originalPrice: 7500,
    discountedPrice: 6000,
    discountPercentage: 20,
    category: 'home_setup',
    tags: ['move-in', 'home', 'complete', 'bundle'],
    isActive: true,
    createdAt: new Date(),
    updatedAt: new Date()
  },
  {
    id: 'bundle-002',
    name: 'Office Maintenance',
    description: 'Regular office maintenance including cleaning, electrical, and minor repairs',
    services: [
      {
        serviceId: 'service-004',
        serviceName: 'Office Cleaning',
        serviceCategory: 'cleaning',
        estimatedDuration: 120,
        individualPrice: 2000,
        isRequired: true
      },
      {
        serviceId: 'service-005',
        serviceName: 'Electrical Maintenance',
        serviceCategory: 'electrical',
        estimatedDuration: 60,
        individualPrice: 1500,
        isRequired: true
      },
      {
        serviceId: 'service-006',
        serviceName: 'Minor Repairs',
        serviceCategory: 'handyman',
        estimatedDuration: 90,
        individualPrice: 1800,
        isRequired: false
      }
    ],
    originalPrice: 5300,
    discountedPrice: 4500,
    discountPercentage: 15,
    category: 'office_maintenance',
    tags: ['office', 'maintenance', 'regular', 'business'],
    isActive: true,
    createdAt: new Date(),
    updatedAt: new Date()
  },
  {
    id: 'bundle-003',
    name: 'Emergency Response',
    description: 'Quick response package for urgent plumbing and electrical issues',
    services: [
      {
        serviceId: 'service-007',
        serviceName: 'Emergency Plumbing',
        serviceCategory: 'plumbing',
        estimatedDuration: 60,
        individualPrice: 3500,
        isRequired: true
      },
      {
        serviceId: 'service-008',
        serviceName: 'Emergency Electrical',
        serviceCategory: 'electrical',
        estimatedDuration: 45,
        individualPrice: 3000,
        isRequired: true
      }
    ],
    originalPrice: 6500,
    discountedPrice: 5500,
    discountPercentage: 15,
    category: 'emergency',
    tags: ['emergency', 'urgent', 'quick', 'response'],
    isActive: true,
    createdAt: new Date(),
    updatedAt: new Date()
  }
];