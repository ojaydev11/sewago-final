import { prisma } from './db';

export type TransparencyAction = 
  | 'LOCATION_UPDATE'
  | 'STATUS_CHANGE'
  | 'PRICE_UPDATE'
  | 'PROGRESS_UPDATE'
  | 'QUALITY_CHECK'
  | 'COMPLETION'
  | 'CUSTOMER_APPROVAL'
  | 'ISSUE_REPORTED'
  | 'PHOTO_UPLOADED'
  | 'MILESTONE_REACHED';

export type EntityType = 'booking' | 'provider' | 'pricing' | 'location';

interface LogEntry {
  entityType: EntityType;
  entityId: string;
  action: TransparencyAction;
  data: Record<string, any>;
  userId?: string;
  providerId?: string;
  userAgent?: string;
  ipAddress?: string;
  sessionId?: string;
}

interface TransparencyLoggerOptions {
  enableEncryption?: boolean;
  enableGDPRCompliance?: boolean;
  retentionDays?: number;
  enableRealTimeNotification?: boolean;
}

class TransparencyLogger {
  private options: TransparencyLoggerOptions;

  constructor(options: TransparencyLoggerOptions = {}) {
    this.options = {
      enableEncryption: true,
      enableGDPRCompliance: true,
      retentionDays: 365,
      enableRealTimeNotification: true,
      ...options
    };
  }

  /**
   * Log a transparency action
   */
  async log(entry: LogEntry): Promise<string> {
    try {
      // Validate required fields
      if (!entry.entityType || !entry.entityId || !entry.action) {
        throw new Error('Entity type, entity ID, and action are required');
      }

      // Encrypt sensitive data if enabled
      let processedData = entry.data;
      if (this.options.enableEncryption) {
        processedData = this.encryptSensitiveData(entry.data);
      }

      // Create log entry
      const logEntry = await prisma.transparencyLog.create({
        data: {
          entityType: entry.entityType,
          entityId: entry.entityId,
          action: entry.action,
          data: processedData,
          userId: entry.userId,
          providerId: entry.providerId,
          userAgent: entry.userAgent,
          ipAddress: entry.ipAddress ? this.hashIP(entry.ipAddress) : null,
          sessionId: entry.sessionId
        }
      });

      // Send real-time notification if enabled
      if (this.options.enableRealTimeNotification) {
        await this.sendRealTimeNotification(entry);
      }

      return logEntry.id;
    } catch (error) {
      console.error('Failed to log transparency action:', error);
      throw new Error('Transparency logging failed');
    }
  }

  /**
   * Get transparency logs for an entity
   */
  async getLogs(
    entityType: EntityType,
    entityId: string,
    options: {
      limit?: number;
      offset?: number;
      actions?: TransparencyAction[];
      startDate?: Date;
      endDate?: Date;
    } = {}
  ) {
    try {
      const {
        limit = 100,
        offset = 0,
        actions,
        startDate,
        endDate
      } = options;

      const whereClause: any = {
        entityType,
        entityId
      };

      if (actions && actions.length > 0) {
        whereClause.action = { in: actions };
      }

      if (startDate || endDate) {
        whereClause.timestamp = {};
        if (startDate) whereClause.timestamp.gte = startDate;
        if (endDate) whereClause.timestamp.lte = endDate;
      }

      const logs = await prisma.transparencyLog.findMany({
        where: whereClause,
        orderBy: { timestamp: 'desc' },
        take: limit,
        skip: offset,
        include: {
          user: {
            select: { name: true, email: true }
          },
          provider: {
            select: { name: true, phone: true }
          }
        }
      });

      // Decrypt sensitive data if needed
      return logs.map(log => ({
        ...log,
        data: this.options.enableEncryption 
          ? this.decryptSensitiveData(log.data as Record<string, any>)
          : log.data
      }));
    } catch (error) {
      console.error('Failed to retrieve transparency logs:', error);
      throw new Error('Failed to retrieve logs');
    }
  }

  /**
   * Get audit trail for a specific time period
   */
  async getAuditTrail(
    startDate: Date,
    endDate: Date,
    options: {
      entityTypes?: EntityType[];
      actions?: TransparencyAction[];
      userId?: string;
      providerId?: string;
    } = {}
  ) {
    try {
      const whereClause: any = {
        timestamp: {
          gte: startDate,
          lte: endDate
        }
      };

      if (options.entityTypes && options.entityTypes.length > 0) {
        whereClause.entityType = { in: options.entityTypes };
      }

      if (options.actions && options.actions.length > 0) {
        whereClause.action = { in: options.actions };
      }

      if (options.userId) {
        whereClause.userId = options.userId;
      }

      if (options.providerId) {
        whereClause.providerId = options.providerId;
      }

      const logs = await prisma.transparencyLog.findMany({
        where: whereClause,
        orderBy: { timestamp: 'desc' },
        include: {
          user: {
            select: { name: true, email: true }
          },
          provider: {
            select: { name: true, phone: true }
          }
        }
      });

      return this.processAuditTrail(logs);
    } catch (error) {
      console.error('Failed to generate audit trail:', error);
      throw new Error('Audit trail generation failed');
    }
  }

  /**
   * Clean up old logs based on retention policy
   */
  async cleanup(): Promise<number> {
    if (!this.options.retentionDays) return 0;

    try {
      const cutoffDate = new Date();
      cutoffDate.setDate(cutoffDate.getDate() - this.options.retentionDays);

      const result = await prisma.transparencyLog.deleteMany({
        where: {
          timestamp: {
            lt: cutoffDate
          }
        }
      });

      console.log(`Cleaned up ${result.count} transparency log entries older than ${this.options.retentionDays} days`);
      return result.count;
    } catch (error) {
      console.error('Failed to cleanup transparency logs:', error);
      throw new Error('Log cleanup failed');
    }
  }

  /**
   * Get transparency statistics
   */
  async getStats(
    startDate: Date,
    endDate: Date
  ): Promise<{
    totalLogs: number;
    actionBreakdown: Record<TransparencyAction, number>;
    entityBreakdown: Record<EntityType, number>;
    mostActiveUsers: Array<{ userId: string; userName: string; count: number }>;
    mostActiveProviders: Array<{ providerId: string; providerName: string; count: number }>;
  }> {
    try {
      const logs = await prisma.transparencyLog.findMany({
        where: {
          timestamp: {
            gte: startDate,
            lte: endDate
          }
        },
        include: {
          user: {
            select: { name: true }
          },
          provider: {
            select: { name: true }
          }
        }
      });

      const stats = {
        totalLogs: logs.length,
        actionBreakdown: {} as Record<TransparencyAction, number>,
        entityBreakdown: {} as Record<EntityType, number>,
        mostActiveUsers: [] as Array<{ userId: string; userName: string; count: number }>,
        mostActiveProviders: [] as Array<{ providerId: string; providerName: string; count: number }>
      };

      // Calculate action breakdown
      logs.forEach(log => {
        stats.actionBreakdown[log.action] = (stats.actionBreakdown[log.action] || 0) + 1;
        stats.entityBreakdown[log.entityType as EntityType] = (stats.entityBreakdown[log.entityType as EntityType] || 0) + 1;
      });

      // Calculate most active users
      const userCounts: Record<string, { name: string; count: number }> = {};
      logs.forEach(log => {
        if (log.userId) {
          if (!userCounts[log.userId]) {
            userCounts[log.userId] = { name: log.user?.name || 'Unknown', count: 0 };
          }
          userCounts[log.userId].count++;
        }
      });

      stats.mostActiveUsers = Object.entries(userCounts)
        .map(([userId, data]) => ({ userId, userName: data.name, count: data.count }))
        .sort((a, b) => b.count - a.count)
        .slice(0, 10);

      // Calculate most active providers
      const providerCounts: Record<string, { name: string; count: number }> = {};
      logs.forEach(log => {
        if (log.providerId) {
          if (!providerCounts[log.providerId]) {
            providerCounts[log.providerId] = { name: log.provider?.name || 'Unknown', count: 0 };
          }
          providerCounts[log.providerId].count++;
        }
      });

      stats.mostActiveProviders = Object.entries(providerCounts)
        .map(([providerId, data]) => ({ providerId, providerName: data.name, count: data.count }))
        .sort((a, b) => b.count - a.count)
        .slice(0, 10);

      return stats;
    } catch (error) {
      console.error('Failed to generate transparency statistics:', error);
      throw new Error('Statistics generation failed');
    }
  }

  /**
   * Privacy-compliant data export for users (GDPR)
   */
  async exportUserData(userId: string): Promise<any[]> {
    if (!this.options.enableGDPRCompliance) {
      throw new Error('GDPR compliance not enabled');
    }

    try {
      const logs = await prisma.transparencyLog.findMany({
        where: { userId },
        orderBy: { timestamp: 'desc' },
        include: {
          provider: {
            select: { name: true }
          }
        }
      });

      return logs.map(log => ({
        id: log.id,
        action: log.action,
        entityType: log.entityType,
        timestamp: log.timestamp,
        data: this.anonymizeExportData(log.data as Record<string, any>),
        provider: log.provider?.name || null
      }));
    } catch (error) {
      console.error('Failed to export user transparency data:', error);
      throw new Error('Data export failed');
    }
  }

  /**
   * Delete user transparency data (GDPR right to be forgotten)
   */
  async deleteUserData(userId: string): Promise<number> {
    if (!this.options.enableGDPRCompliance) {
      throw new Error('GDPR compliance not enabled');
    }

    try {
      // Instead of deleting, anonymize the data to maintain audit integrity
      const result = await prisma.transparencyLog.updateMany({
        where: { userId },
        data: {
          userId: null,
          userAgent: null,
          ipAddress: null,
          sessionId: null,
          data: this.anonymizeLogData({})
        }
      });

      return result.count;
    } catch (error) {
      console.error('Failed to delete user transparency data:', error);
      throw new Error('Data deletion failed');
    }
  }

  private encryptSensitiveData(data: Record<string, any>): Record<string, any> {
    // In production, use proper encryption
    const sensitiveFields = ['location', 'personalInfo', 'paymentData'];
    const encrypted = { ...data };
    
    sensitiveFields.forEach(field => {
      if (encrypted[field]) {
        // Simplified encryption - use proper crypto library in production
        encrypted[field] = Buffer.from(JSON.stringify(encrypted[field])).toString('base64');
      }
    });

    return encrypted;
  }

  private decryptSensitiveData(data: Record<string, any>): Record<string, any> {
    // In production, use proper decryption
    const sensitiveFields = ['location', 'personalInfo', 'paymentData'];
    const decrypted = { ...data };
    
    sensitiveFields.forEach(field => {
      if (decrypted[field] && typeof decrypted[field] === 'string') {
        try {
          decrypted[field] = JSON.parse(Buffer.from(decrypted[field], 'base64').toString());
        } catch {
          // Keep original if decryption fails
        }
      }
    });

    return decrypted;
  }

  private hashIP(ip: string): string {
    // In production, use proper hashing
    return Buffer.from(ip).toString('base64').slice(0, 16);
  }

  private async sendRealTimeNotification(entry: LogEntry): Promise<void> {
    // In production, integrate with WebSocket or notification system
    console.log(`Transparency notification: ${entry.action} on ${entry.entityType} ${entry.entityId}`);
  }

  private processAuditTrail(logs: any[]): any[] {
    return logs.map(log => ({
      id: log.id,
      entityType: log.entityType,
      entityId: log.entityId,
      action: log.action,
      timestamp: log.timestamp,
      actor: log.user?.name || log.provider?.name || 'System',
      actorType: log.userId ? 'user' : log.providerId ? 'provider' : 'system',
      summary: this.generateActionSummary(log)
    }));
  }

  private generateActionSummary(log: any): string {
    const actorName = log.user?.name || log.provider?.name || 'System';
    const entityType = log.entityType;
    const action = log.action;

    switch (action) {
      case 'LOCATION_UPDATE':
        return `${actorName} updated location for ${entityType}`;
      case 'STATUS_CHANGE':
        return `${actorName} changed status for ${entityType}`;
      case 'PROGRESS_UPDATE':
        return `${actorName} updated progress for ${entityType}`;
      case 'QUALITY_CHECK':
        return `Quality check performed on ${entityType} by ${actorName}`;
      case 'CUSTOMER_APPROVAL':
        return `Customer approval given for ${entityType}`;
      default:
        return `${action} performed on ${entityType} by ${actorName}`;
    }
  }

  private anonymizeExportData(data: Record<string, any>): Record<string, any> {
    const anonymized = { ...data };
    
    // Remove or hash sensitive information
    if (anonymized.personalInfo) {
      delete anonymized.personalInfo;
    }
    
    if (anonymized.location) {
      // Keep general area but remove precise coordinates
      if (anonymized.location.lat && anonymized.location.lng) {
        anonymized.location = {
          area: 'Service Area',
          city: anonymized.location.city || 'Unknown'
        };
      }
    }

    return anonymized;
  }

  private anonymizeLogData(data: Record<string, any>): Record<string, any> {
    return {
      ...data,
      anonymized: true,
      originalDataRemoved: new Date().toISOString()
    };
  }
}

// Create singleton instance
export const transparencyLogger = new TransparencyLogger({
  enableEncryption: process.env.NODE_ENV === 'production',
  enableGDPRCompliance: true,
  retentionDays: parseInt(process.env.TRANSPARENCY_LOG_RETENTION_DAYS || '365'),
  enableRealTimeNotification: true
});

// Convenience functions
export const logTransparencyAction = (entry: LogEntry) => transparencyLogger.log(entry);
export const getTransparencyLogs = (entityType: EntityType, entityId: string, options?: any) => 
  transparencyLogger.getLogs(entityType, entityId, options);
export const getAuditTrail = (startDate: Date, endDate: Date, options?: any) => 
  transparencyLogger.getAuditTrail(startDate, endDate, options);
export const cleanupTransparencyLogs = () => transparencyLogger.cleanup();
export const getTransparencyStats = (startDate: Date, endDate: Date) => 
  transparencyLogger.getStats(startDate, endDate);