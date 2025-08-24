/**
 * Analytics Calculator
 * Utilities for calculating performance metrics, growth rates, and business insights
 */

export interface BookingData {
  id: string;
  status: 'PENDING_CONFIRMATION' | 'CONFIRMED' | 'PROVIDER_ASSIGNED' | 'EN_ROUTE' | 'IN_PROGRESS' | 'COMPLETED' | 'CANCELED' | 'DISPUTED';
  total: number; // in paisa
  createdAt: Date;
  completedAt?: Date;
  userId: string;
  serviceId: string;
  providerId?: string;
}

export interface ReviewData {
  id: string;
  rating: number; // 1-5 scale
  createdAt: Date;
  bookingId: string;
}

export interface ProviderData {
  id: string;
  name: string;
  tier: string;
  skills: string[];
  zones: string[];
  createdAt: Date;
}

export interface UserData {
  id: string;
  createdAt: Date;
  lastActiveAt?: Date;
}

// Performance Metrics Calculations

export const calculateCompletionRate = (bookings: BookingData[]): number => {
  if (bookings.length === 0) return 0;
  const completedBookings = bookings.filter(b => b.status === 'COMPLETED').length;
  return (completedBookings / bookings.length) * 100;
};

export const calculateAverageRating = (reviews: ReviewData[]): number => {
  if (reviews.length === 0) return 0;
  const totalRating = reviews.reduce((sum, review) => sum + review.rating, 0);
  return totalRating / reviews.length;
};

export const calculateAverageOrderValue = (bookings: BookingData[]): number => {
  const completedBookings = bookings.filter(b => b.status === 'COMPLETED');
  if (completedBookings.length === 0) return 0;
  
  const totalRevenue = completedBookings.reduce((sum, booking) => sum + booking.total, 0);
  return totalRevenue / completedBookings.length;
};

export const calculateTotalRevenue = (bookings: BookingData[]): number => {
  return bookings
    .filter(b => b.status === 'COMPLETED')
    .reduce((sum, booking) => sum + booking.total, 0);
};

export const calculateConversionRate = (
  totalInteractions: number, 
  completedBookings: number
): number => {
  if (totalInteractions === 0) return 0;
  return (completedBookings / totalInteractions) * 100;
};

// Growth Rate Calculations

export const calculateGrowthRate = (
  currentValue: number, 
  previousValue: number, 
  timePeriodsCount: number = 1
): number => {
  if (previousValue === 0) return currentValue > 0 ? 100 : 0;
  return ((currentValue - previousValue) / previousValue) * 100;
};

export const calculateCompoundGrowthRate = (
  startValue: number,
  endValue: number,
  periods: number
): number => {
  if (startValue <= 0 || periods <= 0) return 0;
  return (Math.pow(endValue / startValue, 1 / periods) - 1) * 100;
};

export const calculateMonthOverMonthGrowth = (
  bookingsByMonth: Array<{ month: string; value: number }>
): Array<{ month: string; value: number; growthRate: number }> => {
  return bookingsByMonth.map((current, index) => {
    if (index === 0) {
      return { ...current, growthRate: 0 };
    }
    
    const previous = bookingsByMonth[index - 1];
    const growthRate = calculateGrowthRate(current.value, previous.value);
    
    return { ...current, growthRate };
  });
};

// Customer Analytics

export const calculateCustomerRetention = (
  users: UserData[],
  bookings: BookingData[],
  periodInDays: number = 30
): number => {
  const cutoffDate = new Date();
  cutoffDate.setDate(cutoffDate.getDate() - periodInDays);
  
  const activeUsers = users.filter(user => 
    user.lastActiveAt && user.lastActiveAt >= cutoffDate
  );
  
  const usersWithMultipleBookings = new Set();
  const userBookingCounts = new Map<string, number>();
  
  bookings
    .filter(b => b.createdAt >= cutoffDate)
    .forEach(booking => {
      const currentCount = userBookingCounts.get(booking.userId) || 0;
      userBookingCounts.set(booking.userId, currentCount + 1);
      
      if (currentCount >= 1) {
        usersWithMultipleBookings.add(booking.userId);
      }
    });
  
  const totalUniqueCustomers = userBookingCounts.size;
  if (totalUniqueCustomers === 0) return 0;
  
  return (usersWithMultipleBookings.size / totalUniqueCustomers) * 100;
};

export const calculateCustomerLifetimeValue = (
  userId: string,
  userBookings: BookingData[]
): { totalValue: number; averageOrderValue: number; bookingFrequency: number } => {
  const completedBookings = userBookings.filter(b => b.status === 'COMPLETED');
  const totalValue = completedBookings.reduce((sum, booking) => sum + booking.total, 0);
  const averageOrderValue = completedBookings.length > 0 ? totalValue / completedBookings.length : 0;
  
  // Calculate booking frequency (bookings per month)
  if (completedBookings.length < 2) {
    return { totalValue, averageOrderValue, bookingFrequency: 0 };
  }
  
  const firstBookingDate = new Date(completedBookings[0].createdAt);
  const lastBookingDate = new Date(completedBookings[completedBookings.length - 1].createdAt);
  const monthsDiff = (lastBookingDate.getTime() - firstBookingDate.getTime()) / (1000 * 60 * 60 * 24 * 30);
  
  const bookingFrequency = monthsDiff > 0 ? completedBookings.length / monthsDiff : 0;
  
  return { totalValue, averageOrderValue, bookingFrequency };
};

// Market Analysis

export const calculateMarketShare = (
  providerBookings: number,
  totalMarketBookings: number
): number => {
  if (totalMarketBookings === 0) return 0;
  return (providerBookings / totalMarketBookings) * 100;
};

export const calculateServiceCategoryPerformance = (
  bookings: BookingData[],
  services: Array<{ id: string; category: string; name: string }>
): Array<{
  category: string;
  bookingCount: number;
  revenue: number;
  averageOrderValue: number;
  conversionRate: number;
}> => {
  const categoryStats = new Map();
  
  bookings.forEach(booking => {
    const service = services.find(s => s.id === booking.serviceId);
    if (!service) return;
    
    const category = service.category;
    if (!categoryStats.has(category)) {
      categoryStats.set(category, {
        category,
        totalBookings: 0,
        completedBookings: 0,
        revenue: 0
      });
    }
    
    const stats = categoryStats.get(category);
    stats.totalBookings++;
    
    if (booking.status === 'COMPLETED') {
      stats.completedBookings++;
      stats.revenue += booking.total;
    }
  });
  
  return Array.from(categoryStats.values()).map(stats => ({
    category: stats.category,
    bookingCount: stats.completedBookings,
    revenue: stats.revenue,
    averageOrderValue: stats.completedBookings > 0 ? stats.revenue / stats.completedBookings : 0,
    conversionRate: stats.totalBookings > 0 ? (stats.completedBookings / stats.totalBookings) * 100 : 0
  }));
};

// Time-based Analysis

export const groupBookingsByPeriod = (
  bookings: BookingData[],
  period: 'daily' | 'weekly' | 'monthly'
): Array<{ period: string; bookings: BookingData[]; count: number; revenue: number }> => {
  const groups = new Map();
  
  bookings.forEach(booking => {
    const date = new Date(booking.createdAt);
    let key: string;
    
    switch (period) {
      case 'daily':
        key = date.toISOString().split('T')[0];
        break;
      case 'weekly':
        const weekStart = new Date(date);
        weekStart.setDate(date.getDate() - date.getDay());
        key = weekStart.toISOString().split('T')[0];
        break;
      case 'monthly':
        key = date.toISOString().substring(0, 7);
        break;
      default:
        key = date.toISOString().split('T')[0];
    }
    
    if (!groups.has(key)) {
      groups.set(key, {
        period: key,
        bookings: [],
        count: 0,
        revenue: 0
      });
    }
    
    const group = groups.get(key);
    group.bookings.push(booking);
    group.count++;
    
    if (booking.status === 'COMPLETED') {
      group.revenue += booking.total;
    }
  });
  
  return Array.from(groups.values()).sort((a, b) => a.period.localeCompare(b.period));
};

export const calculateSeasonalTrends = (
  bookings: BookingData[]
): Array<{ month: number; averageBookings: number; averageRevenue: number }> => {
  const monthlyData = new Map<number, Array<{ bookings: number; revenue: number }>>();
  
  // Group bookings by month across all years
  const bookingsByMonth = groupBookingsByPeriod(bookings, 'monthly');
  
  bookingsByMonth.forEach(monthData => {
    const month = new Date(monthData.period + '-01').getMonth(); // 0-11
    
    if (!monthlyData.has(month)) {
      monthlyData.set(month, []);
    }
    
    monthlyData.get(month)!.push({
      bookings: monthData.count,
      revenue: monthData.revenue
    });
  });
  
  // Calculate averages for each month
  const seasonalTrends = [];
  for (let month = 0; month < 12; month++) {
    const monthData = monthlyData.get(month) || [];
    
    if (monthData.length === 0) {
      seasonalTrends.push({ month, averageBookings: 0, averageRevenue: 0 });
      continue;
    }
    
    const totalBookings = monthData.reduce((sum, data) => sum + data.bookings, 0);
    const totalRevenue = monthData.reduce((sum, data) => sum + data.revenue, 0);
    
    seasonalTrends.push({
      month,
      averageBookings: totalBookings / monthData.length,
      averageRevenue: totalRevenue / monthData.length
    });
  }
  
  return seasonalTrends;
};

// Performance Benchmarking

export const calculatePerformanceBenchmarks = (
  providerData: {
    bookings: BookingData[];
    reviews: ReviewData[];
    responseTime: number; // in minutes
  },
  industryBenchmarks: {
    averageRating: number;
    completionRate: number;
    responseTime: number;
    averageOrderValue: number;
  }
): {
  metric: string;
  providerValue: number;
  industryBenchmark: number;
  performance: 'above' | 'at' | 'below';
  percentageDifference: number;
}[] => {
  const providerRating = calculateAverageRating(providerData.reviews);
  const providerCompletionRate = calculateCompletionRate(providerData.bookings);
  const providerAOV = calculateAverageOrderValue(providerData.bookings);
  
  const benchmarks = [
    {
      metric: 'Average Rating',
      providerValue: providerRating,
      industryBenchmark: industryBenchmarks.averageRating,
      higher_is_better: true
    },
    {
      metric: 'Completion Rate',
      providerValue: providerCompletionRate,
      industryBenchmark: industryBenchmarks.completionRate,
      higher_is_better: true
    },
    {
      metric: 'Response Time',
      providerValue: providerData.responseTime,
      industryBenchmark: industryBenchmarks.responseTime,
      higher_is_better: false // Lower response time is better
    },
    {
      metric: 'Average Order Value',
      providerValue: providerAOV,
      industryBenchmark: industryBenchmarks.averageOrderValue,
      higher_is_better: true
    }
  ];
  
  return benchmarks.map(benchmark => {
    const percentageDifference = benchmark.industryBenchmark !== 0 
      ? ((benchmark.providerValue - benchmark.industryBenchmark) / benchmark.industryBenchmark) * 100
      : 0;
    
    let performance: 'above' | 'at' | 'below';
    
    if (benchmark.higher_is_better) {
      if (percentageDifference > 5) performance = 'above';
      else if (percentageDifference < -5) performance = 'below';
      else performance = 'at';
    } else {
      // For metrics where lower is better (like response time)
      if (percentageDifference < -5) performance = 'above';
      else if (percentageDifference > 5) performance = 'below';
      else performance = 'at';
    }
    
    return {
      metric: benchmark.metric,
      providerValue: benchmark.providerValue,
      industryBenchmark: benchmark.industryBenchmark,
      performance,
      percentageDifference: Math.abs(percentageDifference)
    };
  });
};

// Predictive Analytics

export const predictFuturePerformance = (
  historicalData: Array<{ period: string; value: number }>,
  periodsAhead: number = 3
): Array<{ period: string; predictedValue: number; confidence: number }> => {
  if (historicalData.length < 3) {
    return [];
  }
  
  // Simple linear trend prediction
  const values = historicalData.map(d => d.value);
  const n = values.length;
  
  // Calculate linear regression
  const sumX = Array.from({ length: n }, (_, i) => i).reduce((sum, x) => sum + x, 0);
  const sumY = values.reduce((sum, y) => sum + y, 0);
  const sumXY = values.reduce((sum, y, i) => sum + (i * y), 0);
  const sumXX = Array.from({ length: n }, (_, i) => i).reduce((sum, x) => sum + (x * x), 0);
  
  const slope = (n * sumXY - sumX * sumY) / (n * sumXX - sumX * sumX);
  const intercept = (sumY - slope * sumX) / n;
  
  // Calculate R-squared for confidence
  const yMean = sumY / n;
  const ssTotal = values.reduce((sum, y) => sum + Math.pow(y - yMean, 2), 0);
  const ssRes = values.reduce((sum, y, i) => {
    const predicted = slope * i + intercept;
    return sum + Math.pow(y - predicted, 2);
  }, 0);
  
  const rSquared = 1 - (ssRes / ssTotal);
  const baseConfidence = Math.max(0.1, Math.min(0.9, rSquared)) * 100;
  
  // Generate predictions
  const predictions = [];
  for (let i = 1; i <= periodsAhead; i++) {
    const nextIndex = n + i - 1;
    const predictedValue = Math.max(0, slope * nextIndex + intercept);
    const confidence = Math.max(10, baseConfidence - (i * 10)); // Decreasing confidence
    
    // Generate period string (assuming monthly data)
    const lastDate = new Date(historicalData[historicalData.length - 1].period + '-01');
    const nextDate = new Date(lastDate.getFullYear(), lastDate.getMonth() + i, 1);
    const nextPeriod = nextDate.toISOString().substring(0, 7);
    
    predictions.push({
      period: nextPeriod,
      predictedValue: Math.round(predictedValue),
      confidence: Math.round(confidence)
    });
  }
  
  return predictions;
};

// Utility Functions

export const formatCurrency = (amount: number): string => {
  return new Intl.NumberFormat('ne-NP', {
    style: 'currency',
    currency: 'NPR',
    minimumFractionDigits: 0,
    maximumFractionDigits: 0
  }).format(amount / 100); // Convert from paisa to NPR
};

export const formatPercentage = (value: number, decimals: number = 1): string => {
  return `${value.toFixed(decimals)}%`;
};

export const calculatePercentile = (value: number, dataset: number[]): number => {
  const sorted = [...dataset].sort((a, b) => a - b);
  const index = sorted.findIndex(v => v >= value);
  if (index === -1) return 100;
  return (index / sorted.length) * 100;
};

export const getPerformanceCategory = (percentile: number): 'top' | 'above-average' | 'average' | 'below-average' => {
  if (percentile >= 90) return 'top';
  if (percentile >= 70) return 'above-average';
  if (percentile >= 40) return 'average';
  return 'below-average';
};