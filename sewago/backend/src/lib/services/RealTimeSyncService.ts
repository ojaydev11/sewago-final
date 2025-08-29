import { Server as SocketIOServer } from 'socket.io';
import { Server as HTTPServer } from 'http';
import { createAdapter } from '@socket.io/redis-adapter';
import { createClient } from 'redis';
import { EventEmitter } from 'events';
import { v4 as uuidv4 } from 'uuid';

/**
 * Real-Time Synchronization Service
 * Handles massive user connections with intelligent load balancing
 * and real-time data synchronization across all system components
 */
export class RealTimeSyncService extends EventEmitter {
  private static instance: RealTimeSyncService;
  private io!: SocketIOServer; // Use definite assignment assertion
  private redis: any;
  private pubClient: any;
  private subClient: any;
  private userSessions: Map<string, any> = new Map();
  private roomSessions: Map<string, Set<string>> = new Map();
  private aiQueue: any[] = [];
  private isProcessingAI: boolean = false;

  // Performance metrics
  private metrics = {
    activeConnections: 0,
    messagesPerSecond: 0,
    aiRequestsPerSecond: 0,
    averageResponseTime: 0,
    totalMessages: 0,
    totalAIRequests: 0
  };

  // Rate limiting and throttling
  private rateLimiters = new Map<string, { count: number; resetTime: number }>();
  private readonly RATE_LIMIT = 100; // messages per minute
  private readonly RATE_LIMIT_WINDOW = 60000; // 1 minute

  private constructor() {
    super();
    this.setupRedis();
    this.setupMetrics();
  }

  public static getInstance(): RealTimeSyncService {
    if (!RealTimeSyncService.instance) {
      RealTimeSyncService.instance = new RealTimeSyncService();
    }
    return RealTimeSyncService.instance;
  }

  /**
   * Initialize Socket.IO server with Redis adapter for scalability
   */
  public initialize(httpServer: HTTPServer): void {
    this.io = new SocketIOServer(httpServer, {
      cors: {
        origin: process.env.FRONTEND_URL || "http://localhost:3000",
        methods: ["GET", "POST"],
        credentials: true
      },
      transports: ['websocket', 'polling'],
      allowEIO3: true,
      pingTimeout: 60000,
      pingInterval: 25000,
      maxHttpBufferSize: 1e8, // 100MB
      upgradeTimeout: 10000,
      allowUpgrades: true,
      perMessageDeflate: {
        threshold: 32768,
        zlibInflateFilter: (msg: any) => msg.length > 32768
      }
    });

    // Setup Redis adapter for horizontal scaling
    this.io.adapter(createAdapter(this.pubClient, this.subClient));

    this.setupSocketHandlers();
    // Remove the setupAIService call as it doesn't exist
    this.startPerformanceMonitoring();
  }

  /**
   * Setup Redis for pub/sub and session management
   */
  private async setupRedis(): Promise<void> {
    try {
      this.redis = createClient({
        url: process.env.REDIS_URL || 'redis://localhost:6379',
        socket: {
          reconnectStrategy: (retries: number) => Math.min(retries * 50, 500)
        }
      });

      this.pubClient = this.redis.duplicate();
      this.subClient = this.redis.duplicate();

      await Promise.all([
        this.redis.connect(),
        this.pubClient.connect(),
        this.subClient.connect()
      ]);

      console.log('✅ Redis connected for real-time sync');
    } catch (error) {
      console.error('❌ Redis connection failed:', error);
      throw error;
    }
  }

  /**
   * Setup Socket.IO event handlers with intelligent routing
   */
  private setupSocketHandlers(): void {
    this.io.on('connection', (socket) => {
      this.handleConnection(socket);
    });

    // Handle Redis pub/sub for cross-server communication
    this.subClient.subscribe('system:update', (message: string) => {
      try {
        const data = JSON.parse(message);
        this.broadcastToAll(data.type, data.payload);
      } catch (error) {
        console.error('Error processing Redis message:', error);
      }
    });
  }

  /**
   * Handle new socket connection with intelligent session management
   */
  private handleConnection(socket: any): void {
    const sessionId = uuidv4();
    const connectionTime = Date.now();

    // Track connection metrics
    this.metrics.activeConnections++;
    this.emit('connection:new', { sessionId, timestamp: connectionTime });

    // Store session information
    this.userSessions.set(sessionId, {
      socketId: socket.id,
      userId: null,
      connectedAt: connectionTime,
      lastActivity: connectionTime,
      rooms: new Set(),
      preferences: {}
    });

    // Handle authentication
    socket.on('authenticate', async (data: any) => {
      try {
        const { token, userId } = data;
        if (this.validateToken(token)) {
          this.userSessions.get(sessionId)!.userId = userId;
          socket.userId = userId;
          socket.sessionId = sessionId;
          
          // Join user-specific rooms
          socket.join(`user:${userId}`);
          socket.join('authenticated');
          
          this.emit('user:authenticated', { userId, sessionId });
        }
      } catch (error) {
        socket.emit('error', { message: 'Authentication failed' });
      }
    });

    // Handle real-time updates
    socket.on('subscribe', (data: any) => {
      const { type, id, filters } = data;
      this.handleSubscription(socket, type, id, filters);
    });

    // Handle AI requests
    socket.on('ai:request', async (data: any) => {
      await this.handleAIRequest(socket, data);
    });

    // Handle real-time collaboration
    socket.on('collaborate', (data: any) => {
      this.handleCollaboration(socket, data);
    });

    // Handle disconnection
    socket.on('disconnect', () => {
      this.handleDisconnection(socket, sessionId);
    });

    // Handle rate limiting
    socket.onAny((event: string, ...args: any[]) => {
      if (!this.checkRateLimit(socket.id)) {
        socket.emit('error', { message: 'Rate limit exceeded' });
        return;
      }
      this.trackMessage(event);
    });
  }

  /**
   * Handle subscription to real-time updates
   */
  private handleSubscription(socket: any, type: string, id: string, filters: any): void {
    const roomName = `${type}:${id}`;
    
    // Create room if it doesn't exist
    if (!this.roomSessions.has(roomName)) {
      this.roomSessions.set(roomName, new Set());
    }
    
    // Add socket to room
    socket.join(roomName);
    this.roomSessions.get(roomName)!.add(socket.id);
    
    // Store subscription in user session
    const session = this.userSessions.get(socket.sessionId);
    if (session) {
      session.rooms.add(roomName);
    }

    // Send initial data
    this.sendInitialData(socket, type, id, filters);
  }

  /**
   * Handle AI requests with intelligent queuing
   */
  private async handleAIRequest(socket: any, data: any): Promise<void> {
    const requestId = uuidv4();
    const request = {
      id: requestId,
      socketId: socket.id,
      userId: socket.userId,
      data,
      timestamp: Date.now(),
      priority: data.priority || 'normal'
    };

    // Add to AI queue
    this.aiQueue.push(request);
    this.metrics.totalAIRequests++;

    // Process queue if not already processing
    if (!this.isProcessingAI) {
      this.processAIQueue();
    }

    // Acknowledge request
    socket.emit('ai:acknowledged', { requestId });
  }

  /**
   * Process AI queue with intelligent prioritization
   */
  private async processAIQueue(): Promise<void> {
    if (this.isProcessingAI || this.aiQueue.length === 0) return;

    this.isProcessingAI = true;

    while (this.aiQueue.length > 0) {
      // Sort by priority and timestamp
      this.aiQueue.sort((a, b) => {
        const priorityOrder = { high: 3, normal: 2, low: 1 };
        const aPriority = priorityOrder[a.priority as keyof typeof priorityOrder] || 2;
        const bPriority = priorityOrder[b.priority as keyof typeof priorityOrder] || 2;
        
        if (aPriority !== bPriority) return bPriority - aPriority;
        return a.timestamp - b.timestamp;
      });

      const request = this.aiQueue.shift();
      if (!request) continue;

      try {
        const result = await this.processAIRequest(request);
        
        // Send result to specific socket
        const socket = this.io.sockets.sockets.get(request.socketId);
        if (socket) {
          socket.emit('ai:response', {
            requestId: request.id,
            result,
            timestamp: Date.now()
          });
        }
      } catch (error) {
        console.error('AI request processing failed:', error);
        
        // Notify client of failure
        const socket = this.io.sockets.sockets.get(request.socketId);
        if (socket) {
          socket.emit('ai:error', {
            requestId: request.id,
            error: 'AI processing failed',
            timestamp: Date.now()
          });
        }
      }

      // Small delay to prevent overwhelming the system
      await new Promise(resolve => setTimeout(resolve, 10));
    }

    this.isProcessingAI = false;
  }

  /**
   * Process individual AI request
   */
  private async processAIRequest(request: any): Promise<any> {
    const startTime = Date.now();
    
    try {
      // Simulate AI processing (replace with actual AI service)
      const result = await this.simulateAIProcessing(request.data);
      
      // Update metrics
      const processingTime = Date.now() - startTime;
      this.updateResponseTime(processingTime);
      
      return result;
    } catch (error) {
      throw error;
    }
  }

  /**
   * Simulate AI processing (replace with actual AI service)
   */
  private async simulateAIProcessing(data: any): Promise<any> {
    // Simulate processing time
    await new Promise(resolve => setTimeout(resolve, Math.random() * 1000 + 100));
    
    // Return mock AI response
    return {
      type: 'ai_response',
      data: {
        recommendations: ['AI recommendation 1', 'AI recommendation 2'],
        insights: 'AI-generated insight',
        confidence: Math.random() * 0.5 + 0.5
      },
      timestamp: Date.now()
    };
  }

  /**
   * Handle real-time collaboration
   */
  private handleCollaboration(socket: any, data: any): void {
    const { type, roomId, payload, userId } = data;
    
    // Broadcast to room members
    socket.to(`collaboration:${roomId}`).emit('collaboration:update', {
      type,
      payload,
      userId,
      timestamp: Date.now()
    });

    // Store collaboration state in Redis
    this.redis.setex(
      `collaboration:${roomId}:${type}`,
      3600, // 1 hour TTL
      JSON.stringify({
        payload,
        userId,
        timestamp: Date.now()
      })
    );
  }

  /**
   * Send initial data for new subscriptions
   */
  private async sendInitialData(socket: any, type: string, id: string, filters: any): Promise<void> {
    try {
      // Fetch initial data based on type and filters
      const data = await this.fetchInitialData(type, id, filters);
      
      socket.emit('data:initial', {
        type,
        id,
        data,
        timestamp: Date.now()
      });
    } catch (error) {
      console.error('Error fetching initial data:', error);
      socket.emit('error', { message: 'Failed to fetch initial data' });
    }
  }

  /**
   * Fetch initial data for subscriptions
   */
  private async fetchInitialData(type: string, id: string, filters: any): Promise<any> {
    // Implement data fetching logic based on type
    switch (type) {
      case 'booking':
        return { status: 'active', lastUpdate: Date.now() };
      case 'wallet':
        return { balance: 0, lastTransaction: Date.now() };
      case 'notification':
        return { unreadCount: 0, lastNotification: Date.now() };
      default:
        return { message: 'No data available' };
    }
  }

  /**
   * Handle socket disconnection
   */
  private handleDisconnection(socket: any, sessionId: string): void {
    const session = this.userSessions.get(sessionId);
    if (session) {
      // Remove from all rooms
      session.rooms.forEach((room: string) => {
        const roomSessions = this.roomSessions.get(room);
        if (roomSessions) {
          roomSessions.delete(socket.id);
          if (roomSessions.size === 0) {
            this.roomSessions.delete(room);
          }
        }
      });

      // Clean up user sessions
      this.userSessions.delete(sessionId);
    }

    // Update metrics
    this.metrics.activeConnections--;
    this.emit('connection:closed', { sessionId, timestamp: Date.now() });
  }

  /**
   * Check rate limiting for socket
   */
  private checkRateLimit(socketId: string): boolean {
    const now = Date.now();
    const limiter = this.rateLimiters.get(socketId);

    if (!limiter || now > limiter.resetTime) {
      this.rateLimiters.set(socketId, {
        count: 1,
        resetTime: now + this.RATE_LIMIT_WINDOW
      });
      return true;
    }

    if (limiter.count >= this.RATE_LIMIT) {
      return false;
    }

    limiter.count++;
    return true;
  }

  /**
   * Track message for metrics
   */
  private trackMessage(event: string): void {
    this.metrics.totalMessages++;
    this.metrics.messagesPerSecond++;
  }

  /**
   * Update response time metrics
   */
  private updateResponseTime(responseTime: number): void {
    this.metrics.averageResponseTime = 
      (this.metrics.averageResponseTime + responseTime) / 2;
  }

  /**
   * Setup performance monitoring
   */
  private setupMetrics(): void {
    // Reset per-second metrics every second
    setInterval(() => {
      this.metrics.messagesPerSecond = 0;
      this.metrics.aiRequestsPerSecond = 0;
    }, 1000);

    // Log metrics every minute
    setInterval(() => {
      console.log('📊 Real-time Sync Metrics:', {
        activeConnections: this.metrics.activeConnections,
        totalMessages: this.metrics.totalMessages,
        totalAIRequests: this.metrics.totalAIRequests,
        averageResponseTime: `${this.metrics.averageResponseTime.toFixed(2)}ms`
      });
    }, 60000);
  }

  /**
   * Start performance monitoring
   */
  private startPerformanceMonitoring(): void {
    // Monitor memory usage
    setInterval(() => {
      const memUsage = process.memoryUsage();
      if (memUsage.heapUsed > 500 * 1024 * 1024) { // 500MB
        console.warn('⚠️ High memory usage detected');
        this.emit('performance:warning', { type: 'high_memory', usage: memUsage });
      }
    }, 30000);

    // Monitor connection health
    setInterval(() => {
      this.emit('performance:health', {
        activeConnections: this.metrics.activeConnections,
        memoryUsage: process.memoryUsage(),
        uptime: process.uptime()
      });
    }, 60000);
  }

  /**
   * Cleanup user sessions and rooms
   */
  private cleanupSessions(): void {
    // Clean up expired sessions
    const now = Date.now();
    for (const [sessionId, session] of this.userSessions.entries()) {
      if (now - session.lastActivity > 300000) { // 5 minutes
        this.userSessions.delete(sessionId);
        
        // Clean up room sessions
        session.rooms.forEach((room: string) => {
          const roomSession = this.roomSessions.get(room);
          if (roomSession) {
            roomSession.delete(sessionId);
            if (roomSession.size === 0) {
              this.roomSessions.delete(room);
            }
          }
        });
      }
    }
  }

  /**
   * Validate authentication token
   */
  private validateToken(token: string): boolean {
    // Basic token validation
    return Boolean(token && token.length > 10);
  }

  /**
   * Broadcast message to all connected clients
   */
  public broadcastToAll(event: string, data: any): void {
    this.io.emit(event, {
      ...data,
      timestamp: Date.now(),
      broadcast: true
    });
  }

  /**
   * Broadcast message to specific room
   */
  public broadcastToRoom(room: string, event: string, data: any): void {
    this.io.to(room).emit(event, {
      ...data,
      timestamp: Date.now(),
      room
    });
  }

  /**
   * Send message to specific user
   */
  public sendToUser(userId: string, event: string, data: any): void {
    this.io.to(`user:${userId}`).emit(event, {
      ...data,
      timestamp: Date.now(),
      userId
    });
  }

  /**
   * Get current system metrics
   */
  public getMetrics(): any {
    return { ...this.metrics };
  }

  /**
   * Get active connections count
   */
  public getActiveConnections(): number {
    return this.metrics.activeConnections;
  }

  /**
   * Cleanup resources
   */
  public async cleanup(): Promise<void> {
    try {
      await Promise.all([
        this.redis.quit(),
        this.pubClient.quit(),
        this.subClient.quit()
      ]);
      
      this.io.close();
      console.log('✅ Real-time sync service cleaned up');
    } catch (error) {
      console.error('❌ Error during cleanup:', error);
    }
  }
}
