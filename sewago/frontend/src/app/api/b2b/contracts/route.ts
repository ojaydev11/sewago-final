import { NextRequest, NextResponse } from 'next/server';
import { PrismaClient } from '@prisma/client';
import { z } from 'zod';

const prisma = new PrismaClient();

const contractSchema = z.object({
  companyName: z.string().min(1, 'Company name is required'),
  contactPerson: z.string().min(1, 'Contact person is required'),
  email: z.string().email('Valid email is required'),
  phone: z.string().min(10, 'Valid phone number is required'),
  contractType: z.enum(['STANDARD', 'ENTERPRISE', 'GOVERNMENT', 'NONPROFIT', 'STARTUP', 'CUSTOM']),
  startDate: z.string().transform(str => new Date(str)),
  endDate: z.string().transform(str => new Date(str)).optional(),
  monthlyValue: z.number().positive('Monthly value must be positive'),
  servicesIncluded: z.array(z.string()).min(1, 'At least one service must be included'),
  specialTerms: z.object({
    paymentTerms: z.string().optional(),
    deliveryTerms: z.string().optional(),
    qualityGuarantees: z.array(z.string()).optional(),
    escalationProcess: z.string().optional(),
    reportingRequirements: z.string().optional(),
  }).optional(),
  discountRate: z.number().min(0).max(50).default(0), // Max 50% discount
  paymentTerms: z.enum(['NET_15', 'NET_30', 'NET_45', 'NET_60', 'ADVANCE']).default('NET_30'),
  autoRenewal: z.boolean().default(false),
  dedicatedManager: z.string().optional(),
  priorityLevel: z.enum(['STANDARD', 'HIGH', 'PREMIUM', 'ENTERPRISE']).default('STANDARD'),
  billingCycle: z.enum(['MONTHLY', 'QUARTERLY', 'ANNUALLY', 'CUSTOM']).default('MONTHLY'),
  creditLimit: z.number().positive().optional(),
  customPricing: z.object({
    serviceRates: z.record(z.string(), z.number()).optional(),
    volumeDiscounts: z.array(z.object({
      threshold: z.number(),
      discountPercentage: z.number(),
    })).optional(),
    emergencyRates: z.object({
      multiplier: z.number(),
      minimumCharge: z.number(),
    }).optional(),
  }).optional(),
  slaTerms: z.object({
    responseTime: z.number().positive(), // in minutes
    completionTime: z.number().positive(), // in hours
    qualityScore: z.number().min(1).max(5), // minimum quality score
    availabilityHours: z.string().optional(), // e.g., "24/7" or "9-5"
    penalties: z.object({
      lateCompletion: z.number().optional(),
      qualityBreach: z.number().optional(),
      unavailability: z.number().optional(),
    }).optional(),
    escalationMatrix: z.array(z.object({
      level: z.number(),
      contactRole: z.string(),
      timeframe: z.number(), // in minutes
    })).optional(),
  }),
  complianceReqs: z.object({
    backgroundChecks: z.boolean().default(false),
    insurance: z.object({
      liability: z.number().optional(),
      professional: z.number().optional(),
    }).optional(),
    certifications: z.array(z.string()).optional(),
    dataProtection: z.object({
      gdprCompliance: z.boolean().default(false),
      dataRetention: z.string().optional(),
      accessLogs: z.boolean().default(false),
    }).optional(),
    auditRequirements: z.object({
      frequency: z.enum(['MONTHLY', 'QUARTERLY', 'ANNUALLY']).optional(),
      scope: z.array(z.string()).optional(),
      reportFormat: z.string().optional(),
    }).optional(),
  }).optional(),
});

// GET /api/b2b/contracts - Get B2B contracts
export async function GET(request: NextRequest) {
  try {
    const url = new URL(request.url);
    const status = url.searchParams.get('status');
    const contractType = url.searchParams.get('contractType');
    const companyName = url.searchParams.get('companyName');
    const includeMetrics = url.searchParams.get('includeMetrics') !== 'false';

    const whereClause: any = {};
    if (status) whereClause.status = status;
    if (contractType) whereClause.contractType = contractType;
    if (companyName) whereClause.companyName = { contains: companyName, mode: 'insensitive' };

    const contracts = await prisma.b2BContract.findMany({
      where: whereClause,
      include: {
        bookings: includeMetrics ? {
          select: {
            id: true,
            status: true,
            total: true,
            createdAt: true,
            completedAt: true,
          }
        } : false,
      },
      orderBy: { createdAt: 'desc' },
    });

    // Calculate metrics for each contract if requested
    let contractsWithMetrics = contracts;
    if (includeMetrics) {
      contractsWithMetrics = contracts.map(contract => {
        const bookings = contract.bookings || [];
        const completedBookings = bookings.filter(b => b.status === 'COMPLETED');
        
        const metrics = {
          totalBookings: bookings.length,
          completedBookings: completedBookings.length,
          totalRevenue: completedBookings.reduce((sum, b) => sum + b.total, 0),
          averageOrderValue: completedBookings.length > 0 
            ? completedBookings.reduce((sum, b) => sum + b.total, 0) / completedBookings.length 
            : 0,
          completionRate: bookings.length > 0 
            ? (completedBookings.length / bookings.length) * 100 
            : 0,
          monthlyUsage: calculateMonthlyUsage(bookings),
          creditUtilization: contract.creditLimit 
            ? (contract.usedCredit / contract.creditLimit) * 100 
            : 0,
        };

        return { ...contract, metrics };
      });
    }

    // Calculate portfolio summary
    const summary = {
      totalContracts: contracts.length,
      statusBreakdown: {
        ACTIVE: contracts.filter(c => c.status === 'ACTIVE').length,
        DRAFT: contracts.filter(c => c.status === 'DRAFT').length,
        PENDING_APPROVAL: contracts.filter(c => c.status === 'PENDING_APPROVAL').length,
        EXPIRED: contracts.filter(c => c.status === 'EXPIRED').length,
        CANCELLED: contracts.filter(c => c.status === 'CANCELLED').length,
        RENEWAL_PENDING: contracts.filter(c => c.status === 'RENEWAL_PENDING').length,
        SUSPENDED: contracts.filter(c => c.status === 'SUSPENDED').length,
      },
      totalMonthlyValue: contracts
        .filter(c => c.status === 'ACTIVE')
        .reduce((sum, c) => sum + c.monthlyValue, 0),
      averageContractValue: contracts.length > 0 
        ? contracts.reduce((sum, c) => sum + c.monthlyValue, 0) / contracts.length 
        : 0,
      topContracts: contractsWithMetrics
        .sort((a, b) => b.monthlyValue - a.monthlyValue)
        .slice(0, 5),
    };

    return NextResponse.json({
      contracts: contractsWithMetrics,
      summary,
    });
  } catch (error) {
    console.error('B2B contracts error:', error);
    return NextResponse.json(
      { error: 'Failed to fetch B2B contracts' },
      { status: 500 }
    );
  } finally {
    await prisma.$disconnect();
  }
}

// POST /api/b2b/contracts - Create new B2B contract
export async function POST(request: NextRequest) {
  try {
    const body = await request.json();
    
    // Validate contract data
    const validatedData = contractSchema.parse(body);

    // Check if company already has an active contract
    const existingContract = await prisma.b2BContract.findFirst({
      where: {
        companyName: validatedData.companyName,
        status: { in: ['ACTIVE', 'PENDING_APPROVAL'] },
      },
    });

    if (existingContract) {
      return NextResponse.json(
        { error: 'Company already has an active or pending contract' },
        { status: 400 }
      );
    }

    // Generate contract terms based on contract type and company size
    const generatedTerms = generateContractTerms(validatedData);

    // Create the contract
    const contract = await prisma.b2BContract.create({
      data: {
        ...validatedData,
        ...generatedTerms,
        status: 'DRAFT',
      },
    });

    // Generate onboarding checklist
    const onboardingChecklist = generateOnboardingChecklist(contract);

    // Calculate pricing breakdown
    const pricingBreakdown = calculatePricingBreakdown(contract);

    return NextResponse.json({
      contract,
      onboardingChecklist,
      pricingBreakdown,
    });
  } catch (error) {
    console.error('Create B2B contract error:', error);
    
    if (error instanceof z.ZodError) {
      return NextResponse.json(
        { error: 'Validation error', details: error.errors },
        { status: 400 }
      );
    }

    return NextResponse.json(
      { error: 'Failed to create B2B contract' },
      { status: 500 }
    );
  } finally {
    await prisma.$disconnect();
  }
}

// PUT /api/b2b/contracts - Update B2B contract
export async function PUT(request: NextRequest) {
  try {
    const body = await request.json();
    const { contractId, ...updateData } = body;

    if (!contractId) {
      return NextResponse.json(
        { error: 'Contract ID is required' },
        { status: 400 }
      );
    }

    // Find existing contract
    const existingContract = await prisma.b2BContract.findUnique({
      where: { id: contractId },
    });

    if (!existingContract) {
      return NextResponse.json(
        { error: 'Contract not found' },
        { status: 404 }
      );
    }

    // Check if contract can be updated
    if (existingContract.status === 'CANCELLED' || existingContract.status === 'EXPIRED') {
      return NextResponse.json(
        { error: 'Cannot update cancelled or expired contracts' },
        { status: 400 }
      );
    }

    // Update contract
    const updatedContract = await prisma.b2BContract.update({
      where: { id: contractId },
      data: {
        ...updateData,
        updatedAt: new Date(),
      },
    });

    // Log the update for audit trail
    await logContractUpdate(contractId, updateData, existingContract);

    return NextResponse.json(updatedContract);
  } catch (error) {
    console.error('Update B2B contract error:', error);
    return NextResponse.json(
      { error: 'Failed to update B2B contract' },
      { status: 500 }
    );
  } finally {
    await prisma.$disconnect();
  }
}

// DELETE /api/b2b/contracts - Cancel B2B contract
export async function DELETE(request: NextRequest) {
  try {
    const url = new URL(request.url);
    const contractId = url.searchParams.get('contractId');
    const reason = url.searchParams.get('reason') || 'No reason provided';

    if (!contractId) {
      return NextResponse.json(
        { error: 'Contract ID is required' },
        { status: 400 }
      );
    }

    // Find contract
    const contract = await prisma.b2BContract.findUnique({
      where: { id: contractId },
      include: {
        bookings: {
          where: {
            status: { in: ['PENDING_CONFIRMATION', 'CONFIRMED', 'IN_PROGRESS'] },
          },
        },
      },
    });

    if (!contract) {
      return NextResponse.json(
        { error: 'Contract not found' },
        { status: 404 }
      );
    }

    // Check for active bookings
    if (contract.bookings.length > 0) {
      return NextResponse.json(
        { 
          error: 'Cannot cancel contract with active bookings',
          activeBookings: contract.bookings.length,
        },
        { status: 400 }
      );
    }

    // Cancel contract
    const cancelledContract = await prisma.b2BContract.update({
      where: { id: contractId },
      data: {
        status: 'CANCELLED',
        updatedAt: new Date(),
      },
    });

    // Log cancellation
    await logContractCancellation(contractId, reason);

    return NextResponse.json({
      message: 'Contract cancelled successfully',
      contract: cancelledContract,
    });
  } catch (error) {
    console.error('Cancel B2B contract error:', error);
    return NextResponse.json(
      { error: 'Failed to cancel B2B contract' },
      { status: 500 }
    );
  } finally {
    await prisma.$disconnect();
  }
}

// Helper function to generate contract terms based on type
function generateContractTerms(contractData: any) {
  const terms: any = {};

  // Set credit limit based on contract type and monthly value
  const creditMultipliers = {
    STANDARD: 2,
    ENTERPRISE: 3,
    GOVERNMENT: 2.5,
    NONPROFIT: 1.5,
    STARTUP: 1.5,
    CUSTOM: 2,
  };

  if (!contractData.creditLimit) {
    const multiplier = creditMultipliers[contractData.contractType as keyof typeof creditMultipliers] || 2;
    terms.creditLimit = contractData.monthlyValue * multiplier;
  }

  // Set dedicated manager for premium contracts
  if (contractData.contractType === 'ENTERPRISE' || contractData.monthlyValue > 10000000) {
    terms.dedicatedManager = terms.dedicatedManager || 'Enterprise Account Manager';
    terms.priorityLevel = 'ENTERPRISE';
  }

  // Set compliance requirements based on contract type
  if (contractData.contractType === 'GOVERNMENT') {
    terms.complianceReqs = {
      ...contractData.complianceReqs,
      backgroundChecks: true,
      insurance: {
        liability: 500000000, // NPR 5M
        professional: 100000000, // NPR 1M
      },
      auditRequirements: {
        frequency: 'QUARTERLY',
        scope: ['service-quality', 'compliance', 'security'],
        reportFormat: 'Government Standard Format',
      },
    };
  }

  // Set SLA terms based on priority level
  if (!contractData.slaTerms) {
    const slaDefaults = {
      STANDARD: { responseTime: 60, completionTime: 24, qualityScore: 4.0 },
      HIGH: { responseTime: 30, completionTime: 12, qualityScore: 4.2 },
      PREMIUM: { responseTime: 15, completionTime: 8, qualityScore: 4.5 },
      ENTERPRISE: { responseTime: 10, completionTime: 4, qualityScore: 4.7 },
    };

    const sla = slaDefaults[contractData.priorityLevel as keyof typeof slaDefaults] || slaDefaults.STANDARD;
    terms.slaTerms = {
      ...sla,
      availabilityHours: contractData.contractType === 'ENTERPRISE' ? '24/7' : '9-17',
      penalties: {
        lateCompletion: Math.floor(contractData.monthlyValue * 0.01), // 1% of monthly value
        qualityBreach: Math.floor(contractData.monthlyValue * 0.02), // 2% of monthly value
        unavailability: Math.floor(contractData.monthlyValue * 0.005), // 0.5% of monthly value
      },
    };
  }

  return terms;
}

// Helper function to generate onboarding checklist
function generateOnboardingChecklist(contract: any) {
  const checklist = [
    {
      category: 'Legal & Compliance',
      items: [
        { task: 'Review and sign contract', completed: false, assignee: 'Client' },
        { task: 'Verify company registration documents', completed: false, assignee: 'SewaGo' },
        { task: 'Set up billing and payment processes', completed: false, assignee: 'Finance Team' },
      ],
    },
    {
      category: 'Technical Setup',
      items: [
        { task: 'Create enterprise portal access', completed: false, assignee: 'Tech Team' },
        { task: 'Configure service preferences', completed: false, assignee: 'Account Manager' },
        { task: 'Set up reporting dashboards', completed: false, assignee: 'Tech Team' },
      ],
    },
    {
      category: 'Service Configuration',
      items: [
        { task: 'Map service locations and coverage areas', completed: false, assignee: 'Operations' },
        { task: 'Configure preferred providers and backup options', completed: false, assignee: 'Operations' },
        { task: 'Set up quality standards and SLA monitoring', completed: false, assignee: 'Quality Team' },
      ],
    },
  ];

  // Add specialized items based on contract type
  if (contract.contractType === 'GOVERNMENT') {
    checklist[0].items.push(
      { task: 'Complete government vendor registration', completed: false, assignee: 'Compliance Team' },
      { task: 'Set up audit and reporting procedures', completed: false, assignee: 'Compliance Team' }
    );
  }

  if (contract.contractType === 'ENTERPRISE') {
    checklist[1].items.push(
      { task: 'Set up SSO integration', completed: false, assignee: 'Tech Team' },
      { task: 'Configure API access for client systems', completed: false, assignee: 'Tech Team' }
    );
  }

  return checklist;
}

// Helper function to calculate pricing breakdown
function calculatePricingBreakdown(contract: any) {
  const baseValue = contract.monthlyValue;
  const discountAmount = Math.floor(baseValue * (contract.discountRate / 100));
  const netValue = baseValue - discountAmount;

  // Platform fees (typically absorbed in B2B pricing)
  const platformFee = 0; // No additional platform fee for B2B clients

  // Volume discount tiers
  const volumeDiscounts = [];
  if (contract.customPricing?.volumeDiscounts) {
    volumeDiscounts.push(...contract.customPricing.volumeDiscounts);
  } else {
    // Default volume discounts based on contract value
    if (baseValue > 5000000) { // NPR 50K+
      volumeDiscounts.push({ threshold: 10000000, discountPercentage: 5 }); // NPR 100K+ gets 5%
      volumeDiscounts.push({ threshold: 20000000, discountPercentage: 10 }); // NPR 200K+ gets 10%
    }
  }

  // Calculate potential savings with volume
  const potentialSavings = volumeDiscounts.map(discount => ({
    threshold: discount.threshold,
    discountPercentage: discount.discountPercentage,
    monthlySavings: Math.floor(discount.threshold * (discount.discountPercentage / 100)),
  }));

  return {
    baseValue,
    discountAmount,
    netValue,
    platformFee,
    effectiveRate: contract.discountRate,
    volumeDiscounts,
    potentialSavings,
    paymentTerms: contract.paymentTerms,
    billingCycle: contract.billingCycle,
  };
}

// Helper function to calculate monthly usage
function calculateMonthlyUsage(bookings: any[]) {
  const monthlyData = new Map();
  
  bookings.forEach(booking => {
    const monthKey = booking.createdAt.toISOString().substring(0, 7);
    if (!monthlyData.has(monthKey)) {
      monthlyData.set(monthKey, { bookings: 0, revenue: 0 });
    }
    
    const monthData = monthlyData.get(monthKey);
    monthData.bookings++;
    if (booking.status === 'COMPLETED') {
      monthData.revenue += booking.total;
    }
  });

  return Array.from(monthlyData.entries()).map(([month, data]) => ({
    month,
    ...data,
  })).sort((a, b) => a.month.localeCompare(b.month));
}

// Helper function to log contract updates
async function logContractUpdate(contractId: string, updateData: any, originalData: any) {
  // In a real implementation, this would create audit log entries
  console.log('Contract update logged:', {
    contractId,
    timestamp: new Date().toISOString(),
    changes: Object.keys(updateData),
    originalStatus: originalData.status,
    newStatus: updateData.status,
  });
}

// Helper function to log contract cancellation
async function logContractCancellation(contractId: string, reason: string) {
  // In a real implementation, this would create audit log entries
  console.log('Contract cancellation logged:', {
    contractId,
    timestamp: new Date().toISOString(),
    reason,
  });
}