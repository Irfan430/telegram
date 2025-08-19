import { config } from '@/config/app';
import { logger } from './logger';
import { metrics } from './metrics';
import { database } from '@/database/connection';
import { redis } from '@/database/redis';
import { QuotaError, QuotaInfo, UserRole } from '@/types';
import { runMigrations } from '@/database/connection';

// Quota types
export enum QuotaType {
  COMMANDS = 'commands',
  DOWNLOADS = 'downloads',
  AI_REQUESTS = 'ai_requests',
  MEDIA_CONVERSIONS = 'media_conversions',
}

// Quota manager class
export class QuotaManager {
  private static instance: QuotaManager;
  private defaultQuotas: Record<QuotaType, number>;
  private roleMultipliers: Record<UserRole, number>;

  private constructor() {
    this.defaultQuotas = {
      [QuotaType.COMMANDS]: 1000,
      [QuotaType.DOWNLOADS]: 50,
      [QuotaType.AI_REQUESTS]: 100,
      [QuotaType.MEDIA_CONVERSIONS]: 20,
    };

    this.roleMultipliers = {
      [UserRole.USER]: 1,
      [UserRole.ADMIN]: 2,
      [UserRole.OWNER]: 5,
    };
  }

  static getInstance(): QuotaManager {
    if (!QuotaManager.instance) {
      QuotaManager.instance = new QuotaManager();
    }
    return QuotaManager.instance;
  }

  async initialize(): Promise<void> {
    try {
      // Run migrations to ensure quota table exists
      await runMigrations();
      
      // Load default quotas from config
      this.loadDefaultQuotas();
      
      // Start quota reset scheduler
      this.startQuotaResetScheduler();
      
      logger.info('Quota manager initialized');
    } catch (error) {
      logger.error('Failed to initialize quota manager:', error);
      throw error;
    }
  }

  private loadDefaultQuotas(): void {
    try {
      const configQuotas = config.quotas.default;
      if (configQuotas) {
        this.defaultQuotas = {
          [QuotaType.COMMANDS]: configQuotas.daily_commands || 1000,
          [QuotaType.DOWNLOADS]: configQuotas.daily_downloads || 50,
          [QuotaType.AI_REQUESTS]: configQuotas.daily_ai_requests || 100,
          [QuotaType.MEDIA_CONVERSIONS]: configQuotas.daily_media_conversions || 20,
        };
      }
    } catch (error) {
      logger.warn('Failed to load default quotas from config, using defaults:', error);
    }
  }

  private startQuotaResetScheduler(): void {
    // Reset quotas daily at midnight UTC
    const resetTime = new Date();
    resetTime.setUTCHours(24, 0, 0, 0);
    
    const now = new Date();
    const timeUntilReset = resetTime.getTime() - now.getTime();
    
    // Schedule first reset
    setTimeout(() => {
      this.resetAllQuotas();
      // Then schedule daily resets
      setInterval(() => {
        this.resetAllQuotas();
      }, 24 * 60 * 60 * 1000); // 24 hours
    }, timeUntilReset);
    
    logger.info(`Quota reset scheduled for ${resetTime.toISOString()}`);
  }

  // Get user's quota information
  async getUserQuota(userId: number, role: UserRole = UserRole.USER): Promise<QuotaInfo> {
    try {
      // Get quota limits based on role
      const limits = this.getQuotaLimits(role);
      
      // Get current usage from database
      const usage = await this.getCurrentUsage(userId);
      
      // Calculate reset time (next midnight UTC)
      const resetTime = this.getNextResetTime();
      
      return {
        daily: usage,
        limits,
        resetTime,
      };
    } catch (error) {
      logger.error('Error getting user quota:', error);
      throw error;
    }
  }

  // Check if user has quota available
  async checkQuota(
    userId: number,
    quotaType: QuotaType,
    role: UserRole = UserRole.USER
  ): Promise<{ allowed: boolean; remaining: number; resetTime: Date }> {
    try {
      const quota = await this.getUserQuota(userId, role);
      const used = quota.daily[quotaType] || 0;
      const limit = quota.limits[quotaType] || 0;
      const remaining = Math.max(0, limit - used);
      const allowed = remaining > 0;

      if (!allowed) {
        metrics.trackQuotaDenial(quotaType, role);
      }

      return {
        allowed,
        remaining,
        resetTime: quota.resetTime,
      };
    } catch (error) {
      logger.error('Error checking quota:', error);
      throw error;
    }
  }

  // Consume quota
  async consumeQuota(
    userId: number,
    quotaType: QuotaType,
    amount: number = 1,
    role: UserRole = UserRole.USER
  ): Promise<void> {
    try {
      // Check if quota is available
      const check = await this.checkQuota(userId, quotaType, role);
      
      if (!check.allowed) {
        throw new QuotaError(check.resetTime);
      }

      if (check.remaining < amount) {
        throw new QuotaError(check.resetTime);
      }

      // Increment usage
      await this.incrementUsage(userId, quotaType, amount);
      
      logger.debug('Quota consumed', {
        userId,
        quotaType,
        amount,
        remaining: check.remaining - amount,
      });
    } catch (error) {
      if (error instanceof QuotaError) {
        throw error;
      }
      logger.error('Error consuming quota:', error);
      throw error;
    }
  }

  // Get quota limits for a role
  private getQuotaLimits(role: UserRole): Record<QuotaType, number> {
    const multiplier = this.roleMultipliers[role] || 1;
    
    return {
      [QuotaType.COMMANDS]: this.defaultQuotas[QuotaType.COMMANDS] * multiplier,
      [QuotaType.DOWNLOADS]: this.defaultQuotas[QuotaType.DOWNLOADS] * multiplier,
      [QuotaType.AI_REQUESTS]: this.defaultQuotas[QuotaType.AI_REQUESTS] * multiplier,
      [QuotaType.MEDIA_CONVERSIONS]: this.defaultQuotas[QuotaType.MEDIA_CONVERSIONS] * multiplier,
    };
  }

  // Get current usage from database
  private async getCurrentUsage(userId: number): Promise<Record<QuotaType, number>> {
    try {
      const today = new Date();
      today.setUTCHours(0, 0, 0, 0);
      
      const query = `
        SELECT quota_type, used
        FROM quotas
        WHERE user_id = $1 AND reset_at >= $2
      `;
      
      const results = await database.query(query, [userId, today]);
      
      const usage: Record<QuotaType, number> = {
        [QuotaType.COMMANDS]: 0,
        [QuotaType.DOWNLOADS]: 0,
        [QuotaType.AI_REQUESTS]: 0,
        [QuotaType.MEDIA_CONVERSIONS]: 0,
      };
      
      for (const row of results) {
        if (row.quota_type in usage) {
          usage[row.quota_type as QuotaType] = row.used;
        }
      }
      
      return usage;
    } catch (error) {
      logger.error('Error getting current usage:', error);
      throw error;
    }
  }

  // Increment usage in database
  private async incrementUsage(userId: number, quotaType: QuotaType, amount: number): Promise<void> {
    try {
      const resetTime = this.getNextResetTime();
      
      const query = `
        INSERT INTO quotas (user_id, quota_type, used, limit_value, reset_at)
        VALUES ($1, $2, $3, $4, $5)
        ON CONFLICT (user_id, quota_type)
        DO UPDATE SET
          used = quotas.used + $3,
          updated_at = NOW()
        WHERE quotas.reset_at >= $5
      `;
      
      const limit = this.defaultQuotas[quotaType];
      await database.query(query, [userId, quotaType, amount, limit, resetTime]);
    } catch (error) {
      logger.error('Error incrementing usage:', error);
      throw error;
    }
  }

  // Get next reset time (midnight UTC)
  private getNextResetTime(): Date {
    const now = new Date();
    const resetTime = new Date(now);
    resetTime.setUTCHours(24, 0, 0, 0);
    return resetTime;
  }

  // Reset all quotas
  private async resetAllQuotas(): Promise<void> {
    try {
      logger.info('Starting quota reset...');
      
      const resetTime = this.getNextResetTime();
      
      // Update reset time for all quotas
      const query = `
        UPDATE quotas
        SET reset_at = $1, updated_at = NOW()
        WHERE reset_at < $1
      `;
      
      await database.query(query, [resetTime]);
      
      logger.info('Quota reset completed');
    } catch (error) {
      logger.error('Error resetting quotas:', error);
    }
  }

  // Get quota statistics
  async getQuotaStats(): Promise<{
    totalUsers: number;
    activeUsers: number;
    quotaExhaustions: Record<QuotaType, number>;
  }> {
    try {
      const today = new Date();
      today.setUTCHours(0, 0, 0, 0);
      
      // Get total users
      const totalUsersQuery = 'SELECT COUNT(*) as count FROM users';
      const totalUsersResult = await database.queryOne(totalUsersQuery);
      const totalUsers = totalUsersResult?.count || 0;
      
      // Get active users (users with quota usage today)
      const activeUsersQuery = `
        SELECT COUNT(DISTINCT user_id) as count
        FROM quotas
        WHERE reset_at >= $1
      `;
      const activeUsersResult = await database.queryOne(activeUsersQuery, [today]);
      const activeUsers = activeUsersResult?.count || 0;
      
      // Get quota exhaustions
      const exhaustionsQuery = `
        SELECT quota_type, COUNT(*) as count
        FROM quotas
        WHERE reset_at >= $1 AND used >= limit_value
        GROUP BY quota_type
      `;
      const exhaustionsResult = await database.query(exhaustionsQuery, [today]);
      
      const quotaExhaustions: Record<QuotaType, number> = {
        [QuotaType.COMMANDS]: 0,
        [QuotaType.DOWNLOADS]: 0,
        [QuotaType.AI_REQUESTS]: 0,
        [QuotaType.MEDIA_CONVERSIONS]: 0,
      };
      
      for (const row of exhaustionsResult) {
        if (row.quota_type in quotaExhaustions) {
          quotaExhaustions[row.quota_type as QuotaType] = row.count;
        }
      }
      
      return {
        totalUsers,
        activeUsers,
        quotaExhaustions,
      };
    } catch (error) {
      logger.error('Error getting quota stats:', error);
      throw error;
    }
  }

  // Reset user's quota (admin function)
  async resetUserQuota(userId: number, quotaType?: QuotaType): Promise<void> {
    try {
      const resetTime = this.getNextResetTime();
      
      if (quotaType) {
        // Reset specific quota type
        const query = `
          UPDATE quotas
          SET used = 0, reset_at = $1, updated_at = NOW()
          WHERE user_id = $2 AND quota_type = $3
        `;
        await database.query(query, [resetTime, userId, quotaType]);
      } else {
        // Reset all quota types
        const query = `
          UPDATE quotas
          SET used = 0, reset_at = $1, updated_at = NOW()
          WHERE user_id = $2
        `;
        await database.query(query, [resetTime, userId]);
      }
      
      logger.info('User quota reset', { userId, quotaType });
    } catch (error) {
      logger.error('Error resetting user quota:', error);
      throw error;
    }
  }

  // Increase user's quota (admin function)
  async increaseUserQuota(
    userId: number,
    quotaType: QuotaType,
    amount: number
  ): Promise<void> {
    try {
      const query = `
        UPDATE quotas
        SET limit_value = limit_value + $1, updated_at = NOW()
        WHERE user_id = $2 AND quota_type = $3
      `;
      
      await database.query(query, [amount, userId, quotaType]);
      
      logger.info('User quota increased', { userId, quotaType, amount });
    } catch (error) {
      logger.error('Error increasing user quota:', error);
      throw error;
    }
  }

  // Get quota usage for a specific user
  async getUserQuotaUsage(userId: number): Promise<Record<QuotaType, { used: number; limit: number; remaining: number }>> {
    try {
      const quota = await this.getUserQuota(userId);
      
      const usage: Record<QuotaType, { used: number; limit: number; remaining: number }> = {
        [QuotaType.COMMANDS]: {
          used: quota.daily[QuotaType.COMMANDS],
          limit: quota.limits[QuotaType.COMMANDS],
          remaining: Math.max(0, quota.limits[QuotaType.COMMANDS] - quota.daily[QuotaType.COMMANDS]),
        },
        [QuotaType.DOWNLOADS]: {
          used: quota.daily[QuotaType.DOWNLOADS],
          limit: quota.limits[QuotaType.DOWNLOADS],
          remaining: Math.max(0, quota.limits[QuotaType.DOWNLOADS] - quota.daily[QuotaType.DOWNLOADS]),
        },
        [QuotaType.AI_REQUESTS]: {
          used: quota.daily[QuotaType.AI_REQUESTS],
          limit: quota.limits[QuotaType.AI_REQUESTS],
          remaining: Math.max(0, quota.limits[QuotaType.AI_REQUESTS] - quota.daily[QuotaType.AI_REQUESTS]),
        },
        [QuotaType.MEDIA_CONVERSIONS]: {
          used: quota.daily[QuotaType.MEDIA_CONVERSIONS],
          limit: quota.limits[QuotaType.MEDIA_CONVERSIONS],
          remaining: Math.max(0, quota.limits[QuotaType.MEDIA_CONVERSIONS] - quota.daily[QuotaType.MEDIA_CONVERSIONS]),
        },
      };
      
      return usage;
    } catch (error) {
      logger.error('Error getting user quota usage:', error);
      throw error;
    }
  }
}

// Export singleton instance
export const quotaManager = QuotaManager.getInstance();