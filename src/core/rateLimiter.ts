import { config } from '@/config/app';
import { logger } from './logger';
import { metrics } from './metrics';
import { redis } from '@/database/redis';
import { RateLimitError, UserRole } from '@/types';

// Rate limit types
export enum RateLimitType {
  GLOBAL = 'global',
  PER_USER = 'per_user',
  PER_COMMAND = 'per_command',
  PER_CHAT = 'per_chat',
}

// Rate limit configuration
interface RateLimitConfig {
  points: number;
  duration: number;
  blockDuration: number;
}

// Rate limiter class
export class RateLimiter {
  private static instance: RateLimiter;
  private configs: Record<RateLimitType, RateLimitConfig>;

  private constructor() {
    this.configs = {
      [RateLimitType.GLOBAL]: {
        points: config.rateLimit.global,
        duration: 60, // 1 minute
        blockDuration: 300, // 5 minutes
      },
      [RateLimitType.PER_USER]: {
        points: config.rateLimit.perUser,
        duration: 60, // 1 minute
        blockDuration: 300, // 5 minutes
      },
      [RateLimitType.PER_COMMAND]: {
        points: config.rateLimit.perCommand,
        duration: 60, // 1 minute
        blockDuration: 300, // 5 minutes
      },
      [RateLimitType.PER_CHAT]: {
        points: 50, // 50 requests per minute per chat
        duration: 60, // 1 minute
        blockDuration: 300, // 5 minutes
      },
    };
  }

  static getInstance(): RateLimiter {
    if (!RateLimiter.instance) {
      RateLimiter.instance = new RateLimiter();
    }
    return RateLimiter.instance;
  }

  async initialize(): Promise<void> {
    try {
      // Test Redis connection
      await redis.ping();
      logger.info('Rate limiter initialized');
    } catch (error) {
      logger.error('Failed to initialize rate limiter:', error);
      throw error;
    }
  }

  // Check rate limit
  async checkRateLimit(
    type: RateLimitType,
    key: string,
    points: number = 1,
    userRole: UserRole = UserRole.USER
  ): Promise<{ allowed: boolean; remaining: number; retryAfter: number }> {
    try {
      const config = this.configs[type];
      const redisKey = `rate_limit:${type}:${key}`;
      
      // Get current points
      const currentPoints = await redis.incrementRateLimit(redisKey, config.duration);
      
      // Check if limit exceeded
      const allowed = currentPoints <= config.points;
      const remaining = Math.max(0, config.points - currentPoints);
      
      if (!allowed) {
        // Calculate retry after time
        const ttl = await redis.getTTL(redisKey);
        const retryAfter = ttl || config.blockDuration;
        
        // Track rate limit hit
        metrics.trackRateLimitHit(type, userRole);
        
        logger.warn('Rate limit exceeded', {
          type,
          key,
          currentPoints,
          limit: config.points,
          retryAfter,
        });
        
        return {
          allowed: false,
          remaining: 0,
          retryAfter,
        };
      }
      
      return {
        allowed: true,
        remaining,
        retryAfter: 0,
      };
    } catch (error) {
      logger.error('Error checking rate limit:', error);
      // Allow request if rate limiting fails
      return {
        allowed: true,
        remaining: 999,
        retryAfter: 0,
      };
    }
  }

  // Consume rate limit points
  async consumeRateLimit(
    type: RateLimitType,
    key: string,
    points: number = 1,
    userRole: UserRole = UserRole.USER
  ): Promise<void> {
    try {
      const result = await this.checkRateLimit(type, key, points, userRole);
      
      if (!result.allowed) {
        throw new RateLimitError(result.retryAfter);
      }
    } catch (error) {
      if (error instanceof RateLimitError) {
        throw error;
      }
      logger.error('Error consuming rate limit:', error);
      throw error;
    }
  }

  // Get rate limit info
  async getRateLimitInfo(
    type: RateLimitType,
    key: string
  ): Promise<{ current: number; limit: number; remaining: number; resetTime: number }> {
    try {
      const config = this.configs[type];
      const redisKey = `rate_limit:${type}:${key}`;
      
      const current = await redis.get(redisKey) || 0;
      const remaining = Math.max(0, config.points - current);
      const ttl = await redis.getTTL(redisKey);
      const resetTime = Date.now() + (ttl * 1000);
      
      return {
        current: parseInt(current.toString()),
        limit: config.points,
        remaining,
        resetTime,
      };
    } catch (error) {
      logger.error('Error getting rate limit info:', error);
      throw error;
    }
  }

  // Reset rate limit
  async resetRateLimit(type: RateLimitType, key: string): Promise<void> {
    try {
      const redisKey = `rate_limit:${type}:${key}`;
      await redis.del(redisKey);
      
      logger.info('Rate limit reset', { type, key });
    } catch (error) {
      logger.error('Error resetting rate limit:', error);
      throw error;
    }
  }

  // Get rate limit statistics
  async getRateLimitStats(): Promise<{
    totalKeys: number;
    blockedKeys: number;
    activeKeys: number;
  }> {
    try {
      const stats = {
        totalKeys: 0,
        blockedKeys: 0,
        activeKeys: 0,
      };
      
      // This is a simplified implementation
      // In a real scenario, you might want to scan Redis keys
      // and collect more detailed statistics
      
      return stats;
    } catch (error) {
      logger.error('Error getting rate limit stats:', error);
      throw error;
    }
  }

  // Update rate limit configuration
  updateConfig(type: RateLimitType, config: Partial<RateLimitConfig>): void {
    this.configs[type] = {
      ...this.configs[type],
      ...config,
    };
    
    logger.info('Rate limit config updated', { type, config: this.configs[type] });
  }

  // Get rate limit configuration
  getConfig(type: RateLimitType): RateLimitConfig {
    return { ...this.configs[type] };
  }

  // Check multiple rate limits
  async checkMultipleRateLimits(
    checks: Array<{
      type: RateLimitType;
      key: string;
      points?: number;
    }>,
    userRole: UserRole = UserRole.USER
  ): Promise<{ allowed: boolean; blockedType?: RateLimitType; retryAfter: number }> {
    try {
      for (const check of checks) {
        const result = await this.checkRateLimit(
          check.type,
          check.key,
          check.points || 1,
          userRole
        );
        
        if (!result.allowed) {
          return {
            allowed: false,
            blockedType: check.type,
            retryAfter: result.retryAfter,
          };
        }
      }
      
      return {
        allowed: true,
        retryAfter: 0,
      };
    } catch (error) {
      logger.error('Error checking multiple rate limits:', error);
      throw error;
    }
  }

  // Consume multiple rate limits
  async consumeMultipleRateLimits(
    checks: Array<{
      type: RateLimitType;
      key: string;
      points?: number;
    }>,
    userRole: UserRole = UserRole.USER
  ): Promise<void> {
    try {
      for (const check of checks) {
        await this.consumeRateLimit(
          check.type,
          check.key,
          check.points || 1,
          userRole
        );
      }
    } catch (error) {
      logger.error('Error consuming multiple rate limits:', error);
      throw error;
    }
  }

  // Generate rate limit key
  generateKey(type: RateLimitType, identifier: string): string {
    switch (type) {
      case RateLimitType.GLOBAL:
        return 'global';
      case RateLimitType.PER_USER:
        return `user:${identifier}`;
      case RateLimitType.PER_COMMAND:
        return `command:${identifier}`;
      case RateLimitType.PER_CHAT:
        return `chat:${identifier}`;
      default:
        return identifier;
    }
  }

  // Get rate limit key for user
  getUserKey(userId: number): string {
    return this.generateKey(RateLimitType.PER_USER, userId.toString());
  }

  // Get rate limit key for command
  getCommandKey(command: string): string {
    return this.generateKey(RateLimitType.PER_COMMAND, command);
  }

  // Get rate limit key for chat
  getChatKey(chatId: number): string {
    return this.generateKey(RateLimitType.PER_CHAT, chatId.toString());
  }

  // Check if rate limiting is enabled
  isEnabled(): boolean {
    return true; // Always enabled for now
  }

  // Get all rate limit configurations
  getAllConfigs(): Record<RateLimitType, RateLimitConfig> {
    return { ...this.configs };
  }
}

// Export singleton instance
export const rateLimiter = RateLimiter.getInstance();