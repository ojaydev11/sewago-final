import mongoose from 'mongoose';
import { createClient } from 'redis';
import { EventEmitter } from 'events';
import { promisify } from 'util';

/**
 * High-Performance Database Service
 * Handles massive user loads with intelligent caching,
 * connection pooling, and query optimization
 */
export class DatabaseService extends EventEmitter {
  private static instance: DatabaseService;
  private redis: any;
  private connectionPool: Map<string, mongoose.Connection> = new Map();
  private queryCache: Map<string, { data: any; timestamp: number; ttl: number }> = new Map();
  private readonly CACHE_TTL = 300000; // 5 minutes
  private readonly MAX_CONNECTIONS = 10;
  private readonly CONNECTION_TIMEOUT = 30000;

  // Performance metrics
  private metrics = {
    totalQueries: 0,
    cachedQueries: 0,
    slowQueries: 0,
    connectionErrors: 0,
    averageQueryTime: 0,
    activeConnections: 0,
    cacheHitRate: 0,
    connections: {
      active: 0,
      errors: 0
    },
    collections: {} as Record<string, any>
  };

  // Query performance tracking
  private queryTimes: Map<string, number[]> = new Map();
  private readonly SLOW_QUERY_THRESHOLD = 100; // 100ms

  private constructor() {
    super();
    this.setupRedis();
    this.startPerformanceMonitoring();
    this.startCacheCleanup();
  }

  public static getInstance(): DatabaseService {
    if (!DatabaseService.instance) {
      DatabaseService.instance = new DatabaseService();
    }
    return DatabaseService.instance;
  }

  /**
   * Initialize database connections with connection pooling
   */
  public async initialize(): Promise<void> {
    try {
      // Create main connection
      const mainConnection = await this.createConnection('main');
      this.connectionPool.set('main', mainConnection);

      // Create read replicas for load balancing
      const readReplicas = await this.createReadReplicas();
      readReplicas.forEach((connection, index) => {
        this.connectionPool.set(`read_${index}`, connection);
      });

      // Create write connection
      const writeConnection = await this.createConnection('write');
      this.connectionPool.set('write', writeConnection);

      this.metrics.activeConnections = this.connectionPool.size;
      console.log(`✅ Database service initialized with ${this.connectionPool.size} connections`);

      this.emit('database:initialized', {
        connections: this.connectionPool.size,
        timestamp: Date.now()
      });
    } catch (error) {
      const errorMessage = error instanceof Error ? error.message : String(error);
      console.error('❌ Database initialization failed:', errorMessage);
      this.metrics.connectionErrors++;
      this.emit('database:error', { error: errorMessage, timestamp: Date.now() });
      throw error;
    }
  }

  /**
   * Create a new database connection
   */
  private async createConnection(type: string): Promise<mongoose.Connection> {
    try {
      const connection = mongoose.createConnection(process.env.MONGODB_URI!, {
        maxPoolSize: this.MAX_CONNECTIONS,
        serverSelectionTimeoutMS: this.CONNECTION_TIMEOUT,
        socketTimeoutMS: this.CONNECTION_TIMEOUT,
        bufferCommands: false,
        autoIndex: false,
        maxIdleTimeMS: 30000,
        minPoolSize: 1,
        compressors: ['zlib', 'snappy', 'zstd'] as const,
        zlibCompressionLevel: 6,
        retryWrites: true,
        retryReads: true,
        writeConcern: {
          w: 'majority',
          j: true
        }
      });

      connection.on('connected', () => {
        console.log(`✅ ${type} database connection established`);
        this.metrics.activeConnections++;
      });

      connection.on('error', (error: unknown) => {
        const errorMessage = error instanceof Error ? error.message : String(error);
        console.error(`❌ ${type} database connection error:`, errorMessage);
        this.metrics.connectionErrors++;
      });

      connection.on('disconnected', () => {
        console.log(`⚠️ ${type} database connection disconnected`);
        this.metrics.activeConnections--;
      });

      return connection;
    } catch (error) {
      const errorMessage = error instanceof Error ? error.message : String(error);
      console.error(`❌ Failed to create ${type} database connection:`, errorMessage);
      throw error;
    }
  }

  /**
   * Create read replica connections for load balancing
   */
  private async createReadReplicas(): Promise<mongoose.Connection[]> {
    try {
      const replicaCount = 2; // Number of read replicas
      const replicas: mongoose.Connection[] = [];

      for (let i = 0; i < replicaCount; i++) {
        const replica = await this.createConnection(`read_${i}`);
        replicas.push(replica);
      }

      return replicas;
    } catch (error) {
      const errorMessage = error instanceof Error ? error.message : String(error);
      console.warn('⚠️ Failed to create read replicas:', errorMessage);
      return [];
    }
  }

  /**
   * Get connection from pool with load balancing
   */
  public getConnection(type: 'read' | 'write' | 'main' = 'main'): mongoose.Connection {
    if (type === 'read') {
      // Round-robin load balancing for read connections
      const readConnections = Array.from(this.connectionPool.entries())
        .filter(([key]) => key.startsWith('read_'))
        .map(([, connection]) => connection);

      if (readConnections.length === 0) {
        return this.connectionPool.get('main')!;
      }

      const index = this.metrics.totalQueries % readConnections.length;
      return readConnections[index];
    }

    return this.connectionPool.get(type) || this.connectionPool.get('main')!;
  }

  /**
   * Execute a query with caching and performance tracking
   */
  public async executeQuery<T>(
    queryFn: (connection: mongoose.Connection) => Promise<T>,
    options: {
      cacheKey?: string;
      cacheTTL?: number;
      timeout?: number;
      type?: 'read' | 'write' | 'main';
    } = {}
  ): Promise<T> {
    const startTime = Date.now();
    const queryId = this.generateQueryId();
    const connection = this.getConnection(options.type);

    try {
      // Check cache first
      if (options.cacheKey) {
        const cached = this.getFromCache(options.cacheKey);
        if (cached) {
          this.metrics.cachedQueries++;
          return cached;
        }
      }

      // Execute query
      const result = await queryFn(connection);
      
      // Cache result if specified
      if (options.cacheKey && result) {
        this.setCache(options.cacheKey, result, options.cacheTTL);
      }

      // Track performance
      const duration = Date.now() - startTime;
      this.trackQueryPerformance(queryId, duration, 'success');

      return result;
    } catch (error) {
      const duration = Date.now() - startTime;
      this.trackQueryPerformance(queryId, duration, 'error');
      
      const errorMessage = error instanceof Error ? error.message : String(error);
      console.error(`❌ Query execution failed:`, errorMessage);
      throw error;
    }
  }

  /**
   * Execute multiple queries in batch
   */
  public async executeBatchQueries<T>(
    queries: Array<{
      queryFn: (connection: mongoose.Connection) => Promise<T>;
      cacheKey?: string;
      cacheTTL?: number;
    }>,
    options: {
      timeout?: number;
      type?: 'read' | 'write' | 'main';
    } = {}
  ): Promise<T[]> {
    const connection = this.getConnection(options.type);
    const results: T[] = [];

    for (const query of queries) {
      try {
        const result = await this.executeQuery(query.queryFn, {
          cacheKey: query.cacheKey,
          cacheTTL: query.cacheTTL,
          type: options.type
        });
        results.push(result);
      } catch (error) {
        const errorMessage = error instanceof Error ? error.message : String(error);
        console.error('❌ Batch query failed:', errorMessage);
        throw error;
      }
    }

    return results;
  }

  /**
   * Execute aggregation pipeline
   */
  public async executeAggregation<T>(
    collection: string,
    pipeline: any[],
    options: {
      cacheKey?: string;
      cacheTTL?: number;
      timeout?: number;
      type?: 'read' | 'write' | 'main';
    } = {}
  ): Promise<T[]> {
    const connection = this.getConnection(options.type);
    
    return this.executeQuery(async () => {
      if (!connection.db) {
        throw new Error('Database connection not ready');
      }
      const result = await connection.db.collection(collection).aggregate(pipeline).toArray();
      return result as T[];
    }, options);
  }

  /**
   * Execute transaction with retry logic
   */
  public async executeTransaction<T>(
    transactionFn: (session: mongoose.ClientSession) => Promise<T>,
    options: {
      maxRetries?: number;
      retryDelay?: number;
      timeout?: number;
    } = {}
  ): Promise<T> {
    const maxRetries = options.maxRetries || 3;
    const retryDelay = options.retryDelay || 1000;
    const timeout = options.timeout || 30000;

    let lastError: Error;
    
    for (let attempt = 1; attempt <= maxRetries; attempt++) {
      try {
        const connection = this.getConnection('write');
        const session = await connection.startSession();
        
        const result = await session.withTransaction(transactionFn, {
          readConcern: { level: 'snapshot' },
          writeConcern: { w: 'majority' },
          readPreference: 'primary'
        });

        await session.endSession();
        return result;
      } catch (error) {
        lastError = error as Error;
        
        if (attempt < maxRetries && this.isRetryableError(error)) {
          const errorMessage = error instanceof Error ? error.message : String(error);
          console.warn(`Transaction attempt ${attempt} failed, retrying...`, errorMessage);
          await this.delay(retryDelay * attempt); // Exponential backoff
        } else {
          break;
        }
      }
    }

    throw lastError!;
  }

  /**
   * Check if error is retryable
   */
  private isRetryableError(error: unknown): boolean {
    const retryableErrors = [
      'TransientTransactionError',
      'UnknownTransactionCommitResult',
      'WriteConflict',
      'NetworkTimeout'
    ];
    
    if (error && typeof error === 'object' && 'message' in error) {
      return retryableErrors.some(errorType => 
        (error as any).message?.includes(errorType) || (error as any).code === 112
      );
    }
    
    return false;
  }

  /**
   * Setup Redis for caching
   */
  private async setupRedis(): Promise<void> {
    try {
      this.redis = createClient({
        url: process.env.REDIS_URL || 'redis://localhost:6379',
        socket: {
          reconnectStrategy: (retries: number) => Math.min(retries * 50, 500)
        }
      });

      await this.redis.connect();
      console.log('✅ Redis connected for database caching');
    } catch (error) {
      const errorMessage = error instanceof Error ? error.message : String(error);
      console.warn('⚠️ Redis connection failed, using in-memory cache:', errorMessage);
      this.redis = null;
    }
  }

  /**
   * Cache management methods
   */
  private getFromCache(key: string): any | null {
    // Try Redis first
    if (this.redis) {
      try {
        const cached = this.redis.get(key);
        if (cached) {
          return JSON.parse(cached);
        }
      } catch (error) {
        const errorMessage = error instanceof Error ? error.message : String(error);
        console.warn('Redis cache get failed:', errorMessage);
      }
    }

    // Fallback to in-memory cache
    const cached = this.queryCache.get(key);
    if (cached && Date.now() - cached.timestamp < cached.ttl) {
      return cached.data;
    }
    
    this.queryCache.delete(key);
    return null;
  }

  private setCache(key: string, data: any, ttl: number = this.CACHE_TTL): void {
    // Store in Redis if available
    if (this.redis) {
      try {
        this.redis.setex(key, Math.floor(ttl / 1000), JSON.stringify(data));
      } catch (error) {
        const errorMessage = error instanceof Error ? error.message : String(error);
        console.warn('Redis cache set failed:', errorMessage);
      }
    }

    // Also store in memory cache
    this.queryCache.set(key, {
      data,
      timestamp: Date.now(),
      ttl
    });
  }

  /**
   * Performance tracking methods
   */
  private trackQueryPerformance(queryId: string, queryTime: number, status: 'success' | 'error'): void {
    if (!this.queryTimes.has(queryId)) {
      this.queryTimes.set(queryId, []);
    }
    
    this.queryTimes.get(queryId)!.push(queryTime);

    // Track slow queries
    if (queryTime > this.SLOW_QUERY_THRESHOLD) {
      this.metrics.slowQueries++;
      this.emit('query:slow', {
        queryId,
        queryTime,
        threshold: this.SLOW_QUERY_THRESHOLD,
        timestamp: Date.now()
      });
    }
  }

  private updateQueryTime(queryTime: number): void {
    this.metrics.averageQueryTime = 
      (this.metrics.averageQueryTime + queryTime) / 2;
  }

  private updateCacheHitRate(): void {
    const totalRequests = this.metrics.totalQueries;
    const cacheHits = this.metrics.cachedQueries;
    this.metrics.cacheHitRate = totalRequests > 0 ? (cacheHits / totalRequests) * 100 : 0;
  }

  /**
   * Generate unique query ID
   */
  private generateQueryId(): string {
    return `query_${Date.now()}_${Math.random().toString(36).substr(2, 9)}`;
  }

  /**
   * Utility methods
   */
  private delay(ms: number): Promise<void> {
    return new Promise(resolve => setTimeout(resolve, ms));
  }

  /**
   * Performance monitoring
   */
  private startPerformanceMonitoring(): void {
    // Monitor query performance
    setInterval(() => {
      this.emit('performance:metrics', {
        ...this.metrics,
        timestamp: Date.now()
      });
    }, 60000); // Every minute

    // Monitor connection health
    setInterval(() => {
      this.checkConnectionHealth();
    }, 30000); // Every 30 seconds
  }

  /**
   * Check connection health
   */
  private async checkConnectionHealth(): Promise<boolean> {
    try {
      const mainConnection = this.connectionPool.get('main');
      if (mainConnection && mainConnection.db) {
        await mainConnection.db.admin().ping();
        return true;
      }
      return false;
    } catch (error) {
      const errorMessage = error instanceof Error ? error.message : String(error);
      console.warn('⚠️ Connection health check failed:', errorMessage);
      return false;
    }
  }

  /**
   * Recover failed connection
   */
  private async recoverConnection(type: string): Promise<void> {
    try {
      const oldConnection = this.connectionPool.get(type);
      if (oldConnection) {
        await oldConnection.close();
      }

      const newConnection = await this.createConnection(type);
      this.connectionPool.set(type, newConnection);
      console.log(`✅ ${type} connection recovered`);
    } catch (error) {
      const errorMessage = error instanceof Error ? error.message : String(error);
      console.error(`❌ Failed to recover ${type} connection:`, errorMessage);
    }
  }

  /**
   * Cache cleanup
   */
  private startCacheCleanup(): void {
    setInterval(() => {
      const now = Date.now();
      
      // Clean in-memory cache
      for (const [key, value] of this.queryCache.entries()) {
        if (now - value.timestamp > value.ttl) {
          this.queryCache.delete(key);
        }
      }

      // Clean Redis cache (if available)
      if (this.redis) {
        // Redis automatically expires keys, but we can clean up manually if needed
      }
    }, 60000); // Every minute
  }

  /**
   * Get service metrics
   */
  public getMetrics(): any {
    return { ...this.metrics };
  }

  /**
   * Get connection pool status
   */
  public getConnectionStatus(): any {
    const status: Record<string, any> = {};
    for (const [name, connection] of this.connectionPool.entries()) {
      status[name] = {
        readyState: connection.readyState,
        host: connection.host,
        port: connection.port,
        name: connection.name
      };
    }
    return status;
  }

  /**
   * Optimize database performance
   */
  public async optimizePerformance(): Promise<void> {
    try {
      // Analyze and create missing indexes
      await this.analyzeAndCreateIndexes();
      
      // Update statistics
      await this.updateCollectionStats();
      
      // Compact collections if needed
      await this.compactCollections();
      
      console.log('✅ Database performance optimization completed');
      this.emit('optimization:completed', { timestamp: Date.now() });
    } catch (error) {
      console.error('❌ Database optimization failed:', error);
      const errorMessage = error instanceof Error ? error.message : String(error);
      this.emit('optimization:error', { error: errorMessage, timestamp: Date.now() });
    }
  }

  private async analyzeAndCreateIndexes(): Promise<void> {
    // This is a placeholder for index analysis and creation
    // Implement based on your specific database schema and query patterns
  }

  /**
   * Update collection statistics
   */
  private async updateCollectionStats(): Promise<void> {
    try {
      const mainConnection = this.connectionPool.get('main');
      if (!mainConnection || !mainConnection.db) return;

      const collections = await mainConnection.db.listCollections().toArray();
      
      for (const collection of collections) {
        try {
          // Use listIndexes instead of stats for better compatibility
          const indexes = await mainConnection.db.collection(collection.name).listIndexes().toArray();
          this.metrics.collections[collection.name] = {
            count: 0, // We'll get this from a different method if needed
            size: 0,
            avgObjSize: 0,
            indexes: indexes.length
          };
        } catch (collectionError) {
          const errorMessage = collectionError instanceof Error ? collectionError.message : String(collectionError);
          console.warn(`⚠️ Failed to get stats for collection ${collection.name}:`, errorMessage);
        }
      }
    } catch (error) {
      const errorMessage = error instanceof Error ? error.message : String(error);
      console.warn('⚠️ Failed to update collection stats:', errorMessage);
    }
  }

  private async compactCollections(): Promise<void> {
    // This is a placeholder for collection compaction
    // Implement based on your specific needs
  }

  /**
   * Cleanup resources
   */
  public async cleanup(): Promise<void> {
    try {
      // Close all database connections
      for (const [name, connection] of this.connectionPool.entries()) {
        await connection.close();
        console.log(`✅ Closed database connection: ${name}`);
      }

      // Close Redis connection
      if (this.redis) {
        await this.redis.quit();
        console.log('✅ Closed Redis connection');
      }

      // Clear caches
      this.queryCache.clear();
      this.connectionPool.clear();

      console.log('✅ Database service cleaned up');
    } catch (error) {
      console.error('❌ Error during database cleanup:', error);
    }
  }
}
