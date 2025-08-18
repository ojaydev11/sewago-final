declare global {
  interface Navigator {
    connection?: {
      effectiveType?: string;
      downlink?: number;
    };
  }
}

export {};


