import { register, Counter, Histogram, Gauge, collectDefaultMetrics } from 'prom-client';
import { logger } from './logger';

// Enable default metrics
collectDefaultMetrics({ register });

// Command metrics
export const commandsTotal = new Counter({
  name: 'tg_commands_total',
  help: 'Total number of commands executed',
  labelNames: ['command', 'category', 'success', 'user_role'],
});

export const commandLatency = new Histogram({
  name: 'tg_command_latency_ms',
  help: 'Command execution latency in milliseconds',
  labelNames: ['command', 'category'],
  buckets: [10, 50, 100, 200, 500, 1000, 2000, 5000],
});

// Error metrics
export const errorsTotal = new Counter({
  name: 'tg_errors_total',
  help: 'Total number of errors',
  labelNames: ['error_type', 'command', 'user_role'],
});

export const quotaDenialsTotal = new Counter({
  name: 'tg_quota_denials_total',
  help: 'Total number of quota denials',
  labelNames: ['quota_type', 'user_role'],
});

// Rate limit metrics
export const rateLimitHitsTotal = new Counter({
  name: 'tg_rate_limit_hits_total',
  help: 'Total number of rate limit hits',
  labelNames: ['limit_type', 'user_role'],
});

// User and chat metrics
export const activeUsers = new Gauge({
  name: 'tg_active_users',
  help: 'Number of active users in the last 24 hours',
});

export const activeChats = new Gauge({
  name: 'tg_active_chats',
  help: 'Number of active chats in the last 24 hours',
});

export const totalUsers = new Gauge({
  name: 'tg_total_users',
  help: 'Total number of users',
});

export const totalChats = new Gauge({
  name: 'tg_total_chats',
  help: 'Total number of chats',
});

// Media processing metrics
export const mediaDownloadsTotal = new Counter({
  name: 'tg_media_downloads_total',
  help: 'Total number of media downloads',
  labelNames: ['media_type', 'success'],
});

export const mediaConversionsTotal = new Counter({
  name: 'tg_media_conversions_total',
  help: 'Total number of media conversions',
  labelNames: ['from_format', 'to_format', 'success'],
});

// AI request metrics
export const aiRequestsTotal = new Counter({
  name: 'tg_ai_requests_total',
  help: 'Total number of AI requests',
  labelNames: ['ai_type', 'provider', 'success'],
});

export const aiRequestLatency = new Histogram({
  name: 'tg_ai_request_latency_ms',
  help: 'AI request latency in milliseconds',
  labelNames: ['ai_type', 'provider'],
  buckets: [100, 500, 1000, 2000, 5000, 10000, 30000],
});

// Database metrics
export const databaseQueriesTotal = new Counter({
  name: 'tg_database_queries_total',
  help: 'Total number of database queries',
  labelNames: ['operation', 'table', 'success'],
});

export const databaseQueryLatency = new Histogram({
  name: 'tg_database_query_latency_ms',
  help: 'Database query latency in milliseconds',
  labelNames: ['operation', 'table'],
  buckets: [1, 5, 10, 25, 50, 100, 250, 500, 1000],
});

// Redis metrics
export const redisOperationsTotal = new Counter({
  name: 'tg_redis_operations_total',
  help: 'Total number of Redis operations',
  labelNames: ['operation', 'success'],
});

export const redisOperationLatency = new Histogram({
  name: 'tg_redis_operation_latency_ms',
  help: 'Redis operation latency in milliseconds',
  labelNames: ['operation'],
  buckets: [0.1, 0.5, 1, 2, 5, 10, 25, 50, 100],
});

// System metrics
export const memoryUsage = new Gauge({
  name: 'tg_memory_usage_bytes',
  help: 'Memory usage in bytes',
  labelNames: ['type'],
});

export const cpuUsage = new Gauge({
  name: 'tg_cpu_usage_percent',
  help: 'CPU usage percentage',
});

export const uptime = new Gauge({
  name: 'tg_uptime_seconds',
  help: 'Bot uptime in seconds',
});

// Metrics manager
export class MetricsManager {
  private static instance: MetricsManager;
  private startTime: number;

  private constructor() {
    this.startTime = Date.now();
    this.startSystemMetrics();
  }

  static getInstance(): MetricsManager {
    if (!MetricsManager.instance) {
      MetricsManager.instance = new MetricsManager();
    }
    return MetricsManager.instance;
  }

  initialize(): void {
    logger.info('Metrics manager initialized');
  }

  private startSystemMetrics(): void {
    // Update system metrics every 30 seconds
    setInterval(() => {
      this.updateSystemMetrics();
    }, 30000);
  }

  private updateSystemMetrics(): void {
    const memUsage = process.memoryUsage();
    memoryUsage.set({ type: 'rss' }, memUsage.rss);
    memoryUsage.set({ type: 'heapUsed' }, memUsage.heapUsed);
    memoryUsage.set({ type: 'heapTotal' }, memUsage.heapTotal);
    memoryUsage.set({ type: 'external' }, memUsage.external);

    const uptimeSeconds = (Date.now() - this.startTime) / 1000;
    uptime.set(uptimeSeconds);
  }

  // Command tracking
  trackCommand(command: string, category: string, success: boolean, userRole: string, duration: number): void {
    commandsTotal.inc({ command, category, success: success.toString(), user_role: userRole });
    commandLatency.observe({ command, category }, duration);
  }

  // Error tracking
  trackError(errorType: string, command?: string, userRole?: string): void {
    errorsTotal.inc({ 
      error_type: errorType, 
      command: command || 'unknown', 
      user_role: userRole || 'unknown' 
    });
  }

  // Quota tracking
  trackQuotaDenial(quotaType: string, userRole: string): void {
    quotaDenialsTotal.inc({ quota_type: quotaType, user_role: userRole });
  }

  // Rate limit tracking
  trackRateLimitHit(limitType: string, userRole: string): void {
    rateLimitHitsTotal.inc({ limit_type: limitType, user_role: userRole });
  }

  // Media tracking
  trackMediaDownload(mediaType: string, success: boolean): void {
    mediaDownloadsTotal.inc({ media_type: mediaType, success: success.toString() });
  }

  trackMediaConversion(fromFormat: string, toFormat: string, success: boolean): void {
    mediaConversionsTotal.inc({ 
      from_format: fromFormat, 
      to_format: toFormat, 
      success: success.toString() 
    });
  }

  // AI tracking
  trackAIRequest(aiType: string, provider: string, success: boolean, duration: number): void {
    aiRequestsTotal.inc({ ai_type: aiType, provider, success: success.toString() });
    aiRequestLatency.observe({ ai_type: aiType, provider }, duration);
  }

  // Database tracking
  trackDatabaseQuery(operation: string, table: string, success: boolean, duration: number): void {
    databaseQueriesTotal.inc({ operation, table, success: success.toString() });
    databaseQueryLatency.observe({ operation, table }, duration);
  }

  // Redis tracking
  trackRedisOperation(operation: string, success: boolean, duration: number): void {
    redisOperationsTotal.inc({ operation, success: success.toString() });
    redisOperationLatency.observe({ operation }, duration);
  }

  // User/Chat tracking
  updateActiveUsers(count: number): void {
    activeUsers.set(count);
  }

  updateActiveChats(count: number): void {
    activeChats.set(count);
  }

  updateTotalUsers(count: number): void {
    totalUsers.set(count);
  }

  updateTotalChats(count: number): void {
    totalChats.set(count);
  }

  // Get metrics as string
  async getMetrics(): Promise<string> {
    return await register.metrics();
  }

  // Reset metrics (useful for testing)
  resetMetrics(): void {
    register.clear();
  }
}

// Export singleton instance
export const metrics = MetricsManager.getInstance();