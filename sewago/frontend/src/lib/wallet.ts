
export interface WalletEntry {
  id: string;
  userId: string;
  type: 'loyalty' | 'referral' | 'resolution' | 'promotion' | 'deduction';
  amount: number; // in paisa
  description: string;
  relatedBookingId?: string;
  relatedPromotionId?: string;
  createdAt: Date;
  expiresAt?: Date;
}

export interface WalletBalance {
  total: number;
  breakdown: {
    loyalty: number;
    referral: number;
    resolution: number;
    promotion: number;
  };
}

export class WalletService {
  private entries: WalletEntry[] = [];

  async getBalance(userId: string): Promise<WalletBalance> {
    const userEntries = this.entries.filter(e => 
      e.userId === userId && 
      (!e.expiresAt || e.expiresAt > new Date())
    );

    const breakdown = {
      loyalty: 0,
      referral: 0,
      resolution: 0,
      promotion: 0
    };

    let total = 0;

    for (const entry of userEntries) {
      total += entry.amount;
      
      if (entry.type === 'deduction') continue;
      
      if (entry.type in breakdown) {
        breakdown[entry.type as keyof typeof breakdown] += entry.amount;
      }
    }

    return {
      total: Math.max(0, total),
      breakdown
    };
  }

  async getHistory(
    userId: string, 
    filters?: {
      type?: WalletEntry['type'];
      fromDate?: Date;
      toDate?: Date;
      limit?: number;
    }
  ): Promise<WalletEntry[]> {
    let userEntries = this.entries.filter(e => e.userId === userId);

    if (filters?.type) {
      userEntries = userEntries.filter(e => e.type === filters.type);
    }

    if (filters?.fromDate) {
      userEntries = userEntries.filter(e => e.createdAt >= filters.fromDate!);
    }

    if (filters?.toDate) {
      userEntries = userEntries.filter(e => e.createdAt <= filters.toDate!);
    }

    userEntries.sort((a, b) => b.createdAt.getTime() - a.createdAt.getTime());

    if (filters?.limit) {
      userEntries = userEntries.slice(0, filters.limit);
    }

    return userEntries;
  }

  async addCredits(
    userId: string,
    type: 'loyalty' | 'referral' | 'resolution' | 'promotion',
    amount: number,
    description: string,
    relatedBookingId?: string,
    relatedPromotionId?: string,
    expiresAt?: Date
  ): Promise<WalletEntry> {
    const entry: WalletEntry = {
      id: `wallet_${Date.now()}_${Math.random().toString(36).substr(2, 9)}`,
      userId,
      type,
      amount,
      description,
      relatedBookingId,
      relatedPromotionId,
      createdAt: new Date(),
      expiresAt
    };

    this.entries.push(entry);
    return entry;
  }

  async deductCredits(
    userId: string,
    amount: number,
    description: string,
    relatedBookingId?: string
  ): Promise<{ success: boolean; deductedAmount: number; entries: WalletEntry[] }> {
    const balance = await this.getBalance(userId);
    
    if (balance.total < amount) {
      return {
        success: false,
        deductedAmount: 0,
        entries: []
      };
    }

    const deductionAmount = Math.min(amount, balance.total);
    
    const deductionEntry: WalletEntry = {
      id: `wallet_${Date.now()}_${Math.random().toString(36).substr(2, 9)}`,
      userId,
      type: 'deduction',
      amount: -deductionAmount,
      description,
      relatedBookingId,
      createdAt: new Date()
    };

    this.entries.push(deductionEntry);

    return {
      success: true,
      deductedAmount: deductionAmount,
      entries: [deductionEntry]
    };
  }

  async exportHistory(userId: string): Promise<string> {
    const history = await this.getHistory(userId);
    
    const csvHeader = 'Date,Type,Amount,Description,Related Booking,Status\n';
    const csvRows = history.map(entry => {
      const amount = (entry.amount / 100).toFixed(2); // Convert paisa to NPR
      const status = entry.expiresAt && entry.expiresAt < new Date() ? 'Expired' : 'Active';
      return `${entry.createdAt.toISOString()},${entry.type},${amount},${entry.description},${entry.relatedBookingId || ''},${status}`;
    }).join('\n');

    return csvHeader + csvRows;
  }

  // Automatic credit rules
  async processLoyaltyCredits(userId: string, bookingAmount: number, bookingId: string) {
    // 1% loyalty credits for completed bookings
    const loyaltyAmount = Math.round(bookingAmount * 0.01);
    
    await this.addCredits(
      userId,
      'loyalty',
      loyaltyAmount,
      `Loyalty credits for booking ${bookingId}`,
      bookingId,
      undefined,
      new Date(Date.now() + 365 * 24 * 60 * 60 * 1000) // 1 year expiry
    );
  }

  async processReferralCredits(referrerId: string, refereeId: string, bookingAmount: number) {
    // Referrer gets 10% of referee's first booking
    const referrerAmount = Math.round(bookingAmount * 0.10);
    // Referee gets 5% bonus
    const refereeAmount = Math.round(bookingAmount * 0.05);

    await this.addCredits(
      referrerId,
      'referral',
      referrerAmount,
      `Referral reward for bringing new customer`,
      undefined,
      undefined,
      new Date(Date.now() + 180 * 24 * 60 * 60 * 1000) // 6 months expiry
    );

    await this.addCredits(
      refereeId,
      'referral',
      refereeAmount,
      `Welcome bonus for joining through referral`,
      undefined,
      undefined,
      new Date(Date.now() + 90 * 24 * 60 * 60 * 1000) // 3 months expiry
    );
  }
}

export const walletService = new WalletService();
