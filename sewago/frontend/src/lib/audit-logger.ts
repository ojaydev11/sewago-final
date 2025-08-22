
import AuditLog, { IAuditLog } from '@/models/AuditLog';
import { FEATURE_FLAGS } from '@/config/flags';

export interface AuditContext {
  userId: string;
  role: 'user' | 'provider' | 'admin' | 'system';
  email?: string;
  ip?: string;
  userAgent?: string;
  reason?: string;
}

export class AuditLogger {
  /**
   * Log an audit event
   */
  static async log(params: {
    entityType: IAuditLog['entityType'];
    entityId: string;
    action: string;
    changes: { field: string; oldValue: any; newValue: any }[];
    context: AuditContext;
    metadata?: Record<string, any>;
  }): Promise<void> {
    if (!FEATURE_FLAGS.AUDIT_LOGS_ENABLED) {
      return;
    }

    try {
      const auditLog = new AuditLog({
        entityType: params.entityType,
        entityId: params.entityId,
        action: params.action,
        performedBy: {
          userId: params.context.userId,
          role: params.context.role,
          email: params.context.email
        },
        changes: params.changes,
        metadata: {
          ip: params.context.ip,
          userAgent: params.context.userAgent,
          reason: params.context.reason,
          ...params.metadata
        }
      });

      await auditLog.save();
    } catch (error) {
      console.error('Failed to log audit event:', error);
      // Don't throw - audit logging should not break the main flow
    }
  }

  /**
   * Log booking status change
   */
  static async logBookingChange(
    bookingId: string,
    action: string,
    oldStatus: string,
    newStatus: string,
    context: AuditContext
  ): Promise<void> {
    await this.log({
      entityType: 'booking',
      entityId: bookingId,
      action,
      changes: [
        {
          field: 'status',
          oldValue: oldStatus,
          newValue: newStatus
        }
      ],
      context
    });
  }

  /**
   * Log risk assessment
   */
  static async logRiskAssessment(
    bookingId: string,
    riskScore: number,
    gateActions: any,
    context: AuditContext
  ): Promise<void> {
    await this.log({
      entityType: 'risk',
      entityId: bookingId,
      action: 'risk_assessment_completed',
      changes: [
        {
          field: 'risk_score',
          oldValue: null,
          newValue: riskScore
        },
        {
          field: 'gate_actions',
          oldValue: null,
          newValue: gateActions
        }
      ],
      context,
      metadata: { riskScore }
    });
  }

  /**
   * Log admin action
   */
  static async logAdminAction(
    entityType: IAuditLog['entityType'],
    entityId: string,
    action: string,
    changes: { field: string; oldValue: any; newValue: any }[],
    context: AuditContext & { reason: string }
  ): Promise<void> {
    await this.log({
      entityType,
      entityId,
      action: `admin_${action}`,
      changes,
      context
    });
  }

  /**
   * Log support ticket action
   */
  static async logSupportAction(
    ticketId: string,
    action: string,
    changes: { field: string; oldValue: any; newValue: any }[],
    context: AuditContext
  ): Promise<void> {
    await this.log({
      entityType: 'support',
      entityId: ticketId,
      action,
      changes,
      context
    });
  }

  /**
   * Get audit trail for entity
   */
  static async getAuditTrail(
    entityType: IAuditLog['entityType'],
    entityId: string,
    limit: number = 50
  ): Promise<IAuditLog[]> {
    try {
      return await AuditLog.find({
        entityType,
        entityId
      })
      .sort({ createdAt: -1 })
      .limit(limit)
      .lean();
    } catch (error) {
      console.error('Failed to fetch audit trail:', error);
      return [];
    }
  }
}

export const auditLogger = AuditLogger;