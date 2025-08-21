import { Request, Response, NextFunction } from "express";
import crypto from "crypto";
import { securityAuditLog } from "./enhanced-security.js";

/**
 * Payment Security Middleware for SewaGo
 * Implements HMAC signature verification, idempotency, and fraud detection
 * for eSewa and Khalti payment webhooks.
 */

interface PaymentWebhookData {
  amount: number;
  orderId: string;
  transactionId: string;
  status: string;
  timestamp?: string;
  merchantCode?: string;
}

interface EsewaWebhookData extends PaymentWebhookData {
  oid: string;
  amt: string;
  refId: string;
  pdc: string;
  psc: string;
}

interface KhaltiWebhookData extends PaymentWebhookData {
  pidx: string;
  total_amount: number;
  transaction_id: string;
  purchase_order_id: string;
  purchase_order_name: string;
}

// Store processed transaction IDs to prevent replay attacks
const processedTransactions = new Set<string>();

// Idempotency key store (in production, use Redis or database)
const idempotencyStore = new Map<string, any>();

/**
 * eSewa webhook signature verification
 */
export const verifyEsewaSignature = (req: Request, res: Response, next: NextFunction) => {
  const signature = req.headers['esewa-signature'] as string;
  const rawBody = JSON.stringify(req.body);
  
  if (!signature) {
    securityAuditLog('payment_webhook_no_signature', { provider: 'esewa' }, req);
    return res.status(400).json({ 
      error: "Missing eSewa signature",
      code: "MISSING_SIGNATURE" 
    });
  }

  const expectedSignature = generateEsewaSignature(rawBody, process.env.ESEWA_SECRET_KEY!);
  
  if (!verifySignature(signature, expectedSignature)) {
    securityAuditLog('payment_webhook_invalid_signature', { 
      provider: 'esewa',
      providedSignature: signature,
      expectedSignature 
    }, req);
    return res.status(403).json({ 
      error: "Invalid eSewa signature",
      code: "INVALID_SIGNATURE" 
    });
  }

  next();
};

/**
 * Khalti webhook signature verification
 */
export const verifyKhaltiSignature = (req: Request, res: Response, next: NextFunction) => {
  const signature = req.headers['khalti-signature'] as string;
  const rawBody = JSON.stringify(req.body);
  
  if (!signature) {
    securityAuditLog('payment_webhook_no_signature', { provider: 'khalti' }, req);
    return res.status(400).json({ 
      error: "Missing Khalti signature",
      code: "MISSING_SIGNATURE" 
    });
  }

  const expectedSignature = generateKhaltiSignature(rawBody, process.env.KHALTI_SECRET_KEY!);
  
  if (!verifySignature(signature, expectedSignature)) {
    securityAuditLog('payment_webhook_invalid_signature', { 
      provider: 'khalti',
      providedSignature: signature,
      expectedSignature 
    }, req);
    return res.status(403).json({ 
      error: "Invalid Khalti signature",
      code: "INVALID_SIGNATURE" 
    });
  }

  next();
};

/**
 * Idempotency protection for payment webhooks
 */
export const idempotencyProtection = (req: Request, res: Response, next: NextFunction) => {
  const idempotencyKey = req.headers['idempotency-key'] as string || 
                        req.body.transactionId || 
                        req.body.transaction_id;

  if (!idempotencyKey) {
    return res.status(400).json({ 
      error: "Missing idempotency key",
      code: "MISSING_IDEMPOTENCY_KEY" 
    });
  }

  // Check if this transaction has already been processed
  if (idempotencyStore.has(idempotencyKey)) {
    const cachedResponse = idempotencyStore.get(idempotencyKey);
    securityAuditLog('payment_webhook_duplicate', { 
      idempotencyKey,
      originalResponse: cachedResponse 
    }, req);
    return res.status(200).json(cachedResponse);
  }

  // Store the idempotency key and continue
  req.idempotencyKey = idempotencyKey;
  next();
};

/**
 * Replay attack protection
 */
export const replayProtection = (req: Request, res: Response, next: NextFunction) => {
  const transactionId = req.body.transactionId || req.body.transaction_id;
  const timestamp = req.body.timestamp || req.headers['x-timestamp'];

  if (!transactionId) {
    return res.status(400).json({ 
      error: "Missing transaction ID",
      code: "MISSING_TRANSACTION_ID" 
    });
  }

  // Check for replay attacks
  if (processedTransactions.has(transactionId)) {
    securityAuditLog('payment_replay_attack', { transactionId }, req);
    return res.status(409).json({ 
      error: "Transaction already processed",
      code: "DUPLICATE_TRANSACTION" 
    });
  }

  // Timestamp validation (webhook should be processed within 5 minutes)
  if (timestamp) {
    const webhookTime = new Date(timestamp).getTime();
    const currentTime = Date.now();
    const timeDiff = currentTime - webhookTime;
    
    if (timeDiff > 5 * 60 * 1000) { // 5 minutes
      securityAuditLog('payment_webhook_expired', { 
        transactionId,
        timestamp,
        timeDiff 
      }, req);
      return res.status(400).json({ 
        error: "Webhook timestamp too old",
        code: "EXPIRED_WEBHOOK" 
      });
    }
  }

  // Mark transaction as processed
  processedTransactions.add(transactionId);
  
  // Clean up old transactions (prevent memory leak)
  if (processedTransactions.size > 10000) {
    processedTransactions.clear();
  }

  next();
};

/**
 * Payment amount validation
 */
export const validatePaymentAmount = (req: Request, res: Response, next: NextFunction) => {
  const { amount, orderId } = req.body;

  if (!amount || !orderId) {
    return res.status(400).json({ 
      error: "Missing amount or order ID",
      code: "MISSING_PAYMENT_DATA" 
    });
  }

  // In a real implementation, you would fetch the expected amount from your database
  // using the orderId and compare it with the received amount
  req.expectedAmount = amount; // This should come from your booking record
  
  if (Math.abs(amount - req.expectedAmount) > 0.01) {
    securityAuditLog('payment_amount_mismatch', { 
      orderId,
      receivedAmount: amount,
      expectedAmount: req.expectedAmount 
    }, req);
    return res.status(400).json({ 
      error: "Payment amount mismatch",
      code: "AMOUNT_MISMATCH" 
    });
  }

  next();
};

/**
 * Fraud detection middleware
 */
export const fraudDetection = (req: Request, res: Response, next: NextFunction) => {
  const { amount, orderId, transactionId } = req.body;
  const userAgent = req.headers['user-agent'];
  const ip = req.ip;

  // Fraud detection rules
  const fraudRules = [
    // High amount transactions from suspicious IPs
    {
      rule: 'high_amount_suspicious_ip',
      check: () => amount > 50000 && isSuspiciousIP(ip),
      risk: 'HIGH'
    },
    // Multiple transactions in short time
    {
      rule: 'rapid_transactions',
      check: () => checkRapidTransactions(transactionId),
      risk: 'MEDIUM'
    },
    // Suspicious user agent patterns
    {
      rule: 'suspicious_user_agent',
      check: () => userAgent && (userAgent.includes('bot') || userAgent.includes('crawler')),
      risk: 'LOW'
    }
  ];

  const triggeredRules = fraudRules.filter(rule => rule.check());

  if (triggeredRules.length > 0) {
    const highRiskRules = triggeredRules.filter(rule => rule.risk === 'HIGH');
    
    if (highRiskRules.length > 0) {
      securityAuditLog('payment_fraud_detected', { 
        orderId,
        transactionId,
        amount,
        triggeredRules: triggeredRules.map(r => r.rule),
        ip,
        userAgent 
      }, req);
      
      return res.status(403).json({ 
        error: "Transaction blocked for security reasons",
        code: "FRAUD_DETECTED" 
      });
    } else {
      // Log but allow transaction for medium/low risk
      securityAuditLog('payment_fraud_warning', { 
        orderId,
        transactionId,
        amount,
        triggeredRules: triggeredRules.map(r => r.rule),
        ip,
        userAgent 
      }, req);
    }
  }

  next();
};

/**
 * Cache webhook response for idempotency
 */
export const cacheWebhookResponse = (response: any, idempotencyKey: string) => {
  if (idempotencyKey) {
    idempotencyStore.set(idempotencyKey, response);
    
    // Clean up old entries (prevent memory leak)
    if (idempotencyStore.size > 1000) {
      const firstKey = idempotencyStore.keys().next().value;
      idempotencyStore.delete(firstKey);
    }
  }
};

// Helper functions
function generateEsewaSignature(payload: string, secretKey: string): string {
  return crypto.createHmac('sha256', secretKey).update(payload).digest('hex');
}

function generateKhaltiSignature(payload: string, secretKey: string): string {
  return crypto.createHmac('sha256', secretKey).update(payload).digest('hex');
}

function verifySignature(provided: string, expected: string): boolean {
  return crypto.timingSafeEqual(
    Buffer.from(provided, 'hex'),
    Buffer.from(expected, 'hex')
  );
}

function isSuspiciousIP(ip: string): boolean {
  // In production, this would check against threat intelligence feeds
  const suspiciousIPs = ['127.0.0.1', '0.0.0.0']; // Example list
  return suspiciousIPs.includes(ip);
}

function checkRapidTransactions(transactionId: string): boolean {
  // In production, this would check transaction frequency from database/cache
  return false; // Simplified for example
}

export default {
  verifyEsewaSignature,
  verifyKhaltiSignature,
  idempotencyProtection,
  replayProtection,
  validatePaymentAmount,
  fraudDetection,
  cacheWebhookResponse
};