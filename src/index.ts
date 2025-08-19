#!/usr/bin/env node

import 'dotenv/config';
import { Bot } from 'grammy';
import { run } from '@grammyjs/runner';
import { config } from '@/config/app';
import { logger } from '@/core/logger';
import { database } from '@/database/connection';
import { redis } from '@/database/redis';
import { metrics } from '@/core/metrics';
import { tracing } from '@/core/tracing';
import { errorHandler } from '@/core/errorHandler';
import { commandRouter } from '@/core/commandRouter';
import { middleware } from '@/middleware';
import { healthServer } from '@/core/healthServer';
import { quotaManager } from '@/core/quotaManager';
import { rateLimiter } from '@/core/rateLimiter';
import { i18n } from '@/i18n';

class HyperGigaBot {
  private bot: Bot;
  private isShuttingDown = false;

  constructor() {
    this.bot = new Bot(config.telegram.token);
    this.setupBot();
  }

  private setupBot(): void {
    // Setup middleware
    this.bot.use(middleware.context);
    this.bot.use(middleware.logging);
    this.bot.use(middleware.rateLimit);
    this.bot.use(middleware.quota);
    this.bot.use(middleware.i18n);
    this.bot.use(middleware.metrics);

    // Setup command router
    this.bot.use(commandRouter);

    // Setup error handler
    this.bot.catch(errorHandler.handle);

    // Setup graceful shutdown
    this.setupGracefulShutdown();
  }

  private setupGracefulShutdown(): void {
    const shutdown = async (signal: string) => {
      if (this.isShuttingDown) return;
      this.isShuttingDown = true;

      logger.info(`Received ${signal}, shutting down gracefully...`);

      try {
        // Stop accepting new updates
        await this.bot.stop(signal);
        
        // Close database connections
        await database.end();
        await redis.disconnect();
        
        // Stop health server
        await healthServer.close();
        
        logger.info('Graceful shutdown completed');
        process.exit(0);
      } catch (error) {
        logger.error('Error during shutdown:', error);
        process.exit(1);
      }
    };

    process.on('SIGTERM', () => shutdown('SIGTERM'));
    process.on('SIGINT', () => shutdown('SIGINT'));
  }

  async start(): Promise<void> {
    try {
      // Initialize services
      await this.initializeServices();
      
      // Start health server
      await healthServer.start();
      
      // Start bot
      logger.info('Starting HyperGiga TG Bot...');
      await run(this.bot);
      
      logger.info('HyperGiga TG Bot is running!');
    } catch (error) {
      logger.error('Failed to start bot:', error);
      process.exit(1);
    }
  }

  private async initializeServices(): Promise<void> {
    // Initialize database
    await database.connect();
    logger.info('Database connected');

    // Initialize Redis
    await redis.connect();
    logger.info('Redis connected');

    // Initialize tracing if enabled
    if (config.tracing.enabled) {
      await tracing.initialize();
      logger.info('Tracing initialized');
    }

    // Initialize i18n
    await i18n.initialize();
    logger.info('i18n initialized');

    // Initialize quota manager
    await quotaManager.initialize();
    logger.info('Quota manager initialized');

    // Initialize rate limiter
    await rateLimiter.initialize();
    logger.info('Rate limiter initialized');

    // Initialize metrics
    metrics.initialize();
    logger.info('Metrics initialized');
  }
}

// Start the bot
const bot = new HyperGigaBot();
bot.start().catch((error) => {
  logger.error('Fatal error:', error);
  process.exit(1);
});