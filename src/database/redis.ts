import Redis from 'ioredis';
import { config } from '@/config/app';
import { logger } from '@/core/logger';
import { metrics } from '@/core/metrics';
import { CacheEntry } from '@/types';

// Redis client
const redis = new Redis(config.redis.url, {
  password: config.redis.password,
  retryDelayOnFailover: 100,
  enableReadyCheck: false,
  maxRetriesPerRequest: 3,
  lazyConnect: true,
  keepAlive: 30000,
  family: 4,
  db: 0,
});

// Redis manager
export class RedisManager {
  private static instance: RedisManager;
  private isConnected = false;

  private constructor() {
    this.setupEventHandlers();
  }

  static getInstance(): RedisManager {
    if (!RedisManager.instance) {
      RedisManager.instance = new RedisManager();
    }
    return RedisManager.instance;
  }

  private setupEventHandlers(): void {
    redis.on('connect', () => {
      logger.debug('Redis client connected');
    });

    redis.on('ready', () => {
      this.isConnected = true;
      logger.info('Redis client ready');
    });

    redis.on('error', (error: Error) => {
      this.isConnected = false;
      logger.error('Redis client error:', error);
      metrics.trackError('redis_connection_error');
    });

    redis.on('close', () => {
      this.isConnected = false;
      logger.warn('Redis client connection closed');
    });

    redis.on('reconnecting', () => {
      logger.info('Redis client reconnecting...');
    });
  }

  async connect(): Promise<void> {
    try {
      const startTime = Date.now();
      await redis.ping();
      const duration = Date.now() - startTime;

      metrics.trackRedisOperation('connect', true, duration);
      logger.info('Redis connected successfully');
    } catch (error) {
      logger.error('Failed to connect to Redis:', error);
      metrics.trackError('redis_connection_failed');
      throw error;
    }
  }

  async disconnect(): Promise<void> {
    try {
      await redis.quit();
      this.isConnected = false;
      logger.info('Redis disconnected');
    } catch (error) {
      logger.error('Error disconnecting from Redis:', error);
      throw error;
    }
  }

  get isConnectedToRedis(): boolean {
    return this.isConnected;
  }

  async healthCheck(): Promise<boolean> {
    try {
      await redis.ping();
      return true;
    } catch (error) {
      logger.error('Redis health check failed:', error);
      return false;
    }
  }

  // Cache operations
  async get<T = any>(key: string): Promise<T | null> {
    const startTime = Date.now();
    let success = false;

    try {
      const value = await redis.get(key);
      success = true;
      return value ? JSON.parse(value) : null;
    } catch (error) {
      logger.error('Redis get error:', { key, error });
      metrics.trackError('redis_get_error');
      throw error;
    } finally {
      const duration = Date.now() - startTime;
      metrics.trackRedisOperation('get', success, duration);
    }
  }

  async set<T = any>(key: string, value: T, ttl?: number): Promise<void> {
    const startTime = Date.now();
    let success = false;

    try {
      const serialized = JSON.stringify(value);
      if (ttl) {
        await redis.setex(key, ttl, serialized);
      } else {
        await redis.set(key, serialized);
      }
      success = true;
    } catch (error) {
      logger.error('Redis set error:', { key, error });
      metrics.trackError('redis_set_error');
      throw error;
    } finally {
      const duration = Date.now() - startTime;
      metrics.trackRedisOperation('set', success, duration);
    }
  }

  async del(key: string): Promise<void> {
    const startTime = Date.now();
    let success = false;

    try {
      await redis.del(key);
      success = true;
    } catch (error) {
      logger.error('Redis del error:', { key, error });
      metrics.trackError('redis_del_error');
      throw error;
    } finally {
      const duration = Date.now() - startTime;
      metrics.trackRedisOperation('del', success, duration);
    }
  }

  async exists(key: string): Promise<boolean> {
    const startTime = Date.now();
    let success = false;

    try {
      const result = await redis.exists(key);
      success = true;
      return result === 1;
    } catch (error) {
      logger.error('Redis exists error:', { key, error });
      metrics.trackError('redis_exists_error');
      throw error;
    } finally {
      const duration = Date.now() - startTime;
      metrics.trackRedisOperation('exists', success, duration);
    }
  }

  async expire(key: string, ttl: number): Promise<void> {
    const startTime = Date.now();
    let success = false;

    try {
      await redis.expire(key, ttl);
      success = true;
    } catch (error) {
      logger.error('Redis expire error:', { key, ttl, error });
      metrics.trackError('redis_expire_error');
      throw error;
    } finally {
      const duration = Date.now() - startTime;
      metrics.trackRedisOperation('expire', success, duration);
    }
  }

  async getTTL(key: string): Promise<number> {
    const startTime = Date.now();
    let success = false;

    try {
      const ttl = await redis.ttl(key);
      success = true;
      return ttl;
    } catch (error) {
      logger.error('Redis ttl error:', { key, error });
      metrics.trackError('redis_ttl_error');
      throw error;
    } finally {
      const duration = Date.now() - startTime;
      metrics.trackRedisOperation('ttl', success, duration);
    }
  }

  // Hash operations
  async hget<T = any>(key: string, field: string): Promise<T | null> {
    const startTime = Date.now();
    let success = false;

    try {
      const value = await redis.hget(key, field);
      success = true;
      return value ? JSON.parse(value) : null;
    } catch (error) {
      logger.error('Redis hget error:', { key, field, error });
      metrics.trackError('redis_hget_error');
      throw error;
    } finally {
      const duration = Date.now() - startTime;
      metrics.trackRedisOperation('hget', success, duration);
    }
  }

  async hset<T = any>(key: string, field: string, value: T): Promise<void> {
    const startTime = Date.now();
    let success = false;

    try {
      const serialized = JSON.stringify(value);
      await redis.hset(key, field, serialized);
      success = true;
    } catch (error) {
      logger.error('Redis hset error:', { key, field, error });
      metrics.trackError('redis_hset_error');
      throw error;
    } finally {
      const duration = Date.now() - startTime;
      metrics.trackRedisOperation('hset', success, duration);
    }
  }

  async hdel(key: string, field: string): Promise<void> {
    const startTime = Date.now();
    let success = false;

    try {
      await redis.hdel(key, field);
      success = true;
    } catch (error) {
      logger.error('Redis hdel error:', { key, field, error });
      metrics.trackError('redis_hdel_error');
      throw error;
    } finally {
      const duration = Date.now() - startTime;
      metrics.trackRedisOperation('hdel', success, duration);
    }
  }

  // List operations
  async lpush(key: string, value: any): Promise<void> {
    const startTime = Date.now();
    let success = false;

    try {
      const serialized = JSON.stringify(value);
      await redis.lpush(key, serialized);
      success = true;
    } catch (error) {
      logger.error('Redis lpush error:', { key, error });
      metrics.trackError('redis_lpush_error');
      throw error;
    } finally {
      const duration = Date.now() - startTime;
      metrics.trackRedisOperation('lpush', success, duration);
    }
  }

  async rpop<T = any>(key: string): Promise<T | null> {
    const startTime = Date.now();
    let success = false;

    try {
      const value = await redis.rpop(key);
      success = true;
      return value ? JSON.parse(value) : null;
    } catch (error) {
      logger.error('Redis rpop error:', { key, error });
      metrics.trackError('redis_rpop_error');
      throw error;
    } finally {
      const duration = Date.now() - startTime;
      metrics.trackRedisOperation('rpop', success, duration);
    }
  }

  // Set operations
  async sadd(key: string, member: string): Promise<void> {
    const startTime = Date.now();
    let success = false;

    try {
      await redis.sadd(key, member);
      success = true;
    } catch (error) {
      logger.error('Redis sadd error:', { key, member, error });
      metrics.trackError('redis_sadd_error');
      throw error;
    } finally {
      const duration = Date.now() - startTime;
      metrics.trackRedisOperation('sadd', success, duration);
    }
  }

  async srem(key: string, member: string): Promise<void> {
    const startTime = Date.now();
    let success = false;

    try {
      await redis.srem(key, member);
      success = true;
    } catch (error) {
      logger.error('Redis srem error:', { key, member, error });
      metrics.trackError('redis_srem_error');
      throw error;
    } finally {
      const duration = Date.now() - startTime;
      metrics.trackRedisOperation('srem', success, duration);
    }
  }

  async smembers(key: string): Promise<string[]> {
    const startTime = Date.now();
    let success = false;

    try {
      const members = await redis.smembers(key);
      success = true;
      return members;
    } catch (error) {
      logger.error('Redis smembers error:', { key, error });
      metrics.trackError('redis_smembers_error');
      throw error;
    } finally {
      const duration = Date.now() - startTime;
      metrics.trackRedisOperation('smembers', success, duration);
    }
  }

  // Rate limiting
  async incrementRateLimit(key: string, window: number): Promise<number> {
    const startTime = Date.now();
    let success = false;

    try {
      const multi = redis.multi();
      multi.incr(key);
      multi.expire(key, window);
      const results = await multi.exec();
      success = true;
      return results?.[0]?.[1] as number || 0;
    } catch (error) {
      logger.error('Redis rate limit increment error:', { key, window, error });
      metrics.trackError('redis_rate_limit_error');
      throw error;
    } finally {
      const duration = Date.now() - startTime;
      metrics.trackRedisOperation('rate_limit', success, duration);
    }
  }

  // Cache with TTL
  async cacheGet<T = any>(key: string): Promise<T | null> {
    const entry = await this.get<CacheEntry<T>>(key);
    if (!entry) return null;

    const now = Date.now();
    if (now - entry.createdAt > entry.ttl * 1000) {
      await this.del(key);
      return null;
    }

    return entry.value;
  }

  async cacheSet<T = any>(key: string, value: T, ttl: number): Promise<void> {
    const entry: CacheEntry<T> = {
      key,
      value,
      ttl,
      createdAt: Date.now(),
    };

    await this.set(key, entry, ttl);
  }

  // Queue operations
  async enqueue(queueName: string, data: any): Promise<void> {
    await this.lpush(`queue:${queueName}`, data);
  }

  async dequeue<T = any>(queueName: string): Promise<T | null> {
    return await this.rpop<T>(`queue:${queueName}`);
  }

  // Pub/Sub operations
  async publish(channel: string, message: any): Promise<void> {
    const startTime = Date.now();
    let success = false;

    try {
      const serialized = JSON.stringify(message);
      await redis.publish(channel, serialized);
      success = true;
    } catch (error) {
      logger.error('Redis publish error:', { channel, error });
      metrics.trackError('redis_publish_error');
      throw error;
    } finally {
      const duration = Date.now() - startTime;
      metrics.trackRedisOperation('publish', success, duration);
    }
  }

  subscribe(channel: string, callback: (message: any) => void): void {
    const subscriber = redis.duplicate();
    subscriber.subscribe(channel);
    
    subscriber.on('message', (ch, message) => {
      if (ch === channel) {
        try {
          const parsed = JSON.parse(message);
          callback(parsed);
        } catch (error) {
          logger.error('Redis subscription message parse error:', error);
        }
      }
    });

    subscriber.on('error', (error) => {
      logger.error('Redis subscriber error:', error);
    });
  }
}

// Export singleton instance
export const redis = RedisManager.getInstance();