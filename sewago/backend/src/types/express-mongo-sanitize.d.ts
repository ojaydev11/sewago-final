declare module "express-mongo-sanitize" {
  import type { RequestHandler } from "express";
  const mongoSanitize: (options?: { allowDots?: boolean; replaceWith?: string }) => RequestHandler;
  export default mongoSanitize;
}


