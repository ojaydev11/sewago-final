import type { Request } from "express";

declare module "express-serve-static-core" {
  interface Request {
    userId?: string;
    userRole?: "user" | "provider" | "admin";
  }
}

// Minimal compression module typing to satisfy TS without installing @types
declare module "compression" {
  import { RequestHandler } from "express";
  const compression: (opts?: any) => RequestHandler;
  export default compression;
}


