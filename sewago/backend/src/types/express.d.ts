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
    }
  }
}

export {};
