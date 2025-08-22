declare global {
  namespace Express {
    interface Request {
      userId?: string;
      userRole?: "user" | "provider" | "admin";
      user?: {
        id: string;
        role: "user" | "provider" | "admin";
      };
      requestId?: string;
      session?: any; // Express session support
      idempotencyKey?: string; // Payment idempotency
      expectedAmount?: number; // Payment validation
    }
  }
}

export {};
