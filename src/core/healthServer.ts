import express from 'express';
import cors from 'cors';
import helmet from 'helmet';
import compression from 'compression';
import { config } from '@/config/app';
import { logger, logMiddleware } from './logger';
import { metrics } from './metrics';
import { database } from '@/database/connection';
import { redis } from '@/database/redis';
import { HealthCheck } from '@/types';

// Health server class
export class HealthServer {
  private static instance: HealthServer;
  private app: express.Application;
  private server: any;
  private startTime: number;

  private constructor() {
    this.app = express();
    this.startTime = Date.now();
    this.setupMiddleware();
    this.setupRoutes();
  }

  static getInstance(): HealthServer {
    if (!HealthServer.instance) {
      HealthServer.instance = new HealthServer();
    }
    return HealthServer.instance;
  }

  private setupMiddleware(): void {
    // Security middleware
    this.app.use(helmet({
      contentSecurityPolicy: false,
      crossOriginEmbedderPolicy: false,
    }));

    // CORS
    this.app.use(cors({
      origin: config.security.corsOrigin || '*',
      methods: ['GET', 'POST'],
      allowedHeaders: ['Content-Type', 'Authorization'],
    }));

    // Compression
    this.app.use(compression());

    // Logging
    this.app.use(logMiddleware);

    // Body parsing
    this.app.use(express.json({ limit: '1mb' }));
    this.app.use(express.urlencoded({ extended: true, limit: '1mb' }));
  }

  private setupRoutes(): void {
    // Health check endpoint
    this.app.get('/healthz', async (req, res) => {
      try {
        const health = await this.getHealthStatus();
        const statusCode = health.status === 'healthy' ? 200 : 503;
        
        res.status(statusCode).json(health);
      } catch (error) {
        logger.error('Health check error:', error);
        res.status(503).json({
          status: 'unhealthy',
          timestamp: new Date(),
          error: 'Health check failed',
        });
      }
    });

    // Readiness check endpoint
    this.app.get('/readyz', async (req, res) => {
      try {
        const health = await this.getHealthStatus();
        const isReady = health.checks.database && health.checks.redis;
        const statusCode = isReady ? 200 : 503;
        
        res.status(statusCode).json({
          status: isReady ? 'ready' : 'not_ready',
          timestamp: new Date(),
          checks: health.checks,
        });
      } catch (error) {
        logger.error('Readiness check error:', error);
        res.status(503).json({
          status: 'not_ready',
          timestamp: new Date(),
          error: 'Readiness check failed',
        });
      }
    });

    // Metrics endpoint
    this.app.get('/metrics', async (req, res) => {
      try {
        const metricsData = await metrics.getMetrics();
        res.set('Content-Type', 'text/plain');
        res.send(metricsData);
      } catch (error) {
        logger.error('Metrics endpoint error:', error);
        res.status(500).json({
          error: 'Failed to retrieve metrics',
          timestamp: new Date(),
        });
      }
    });

    // Info endpoint
    this.app.get('/info', (req, res) => {
      res.json({
        name: 'HyperGiga TG Bot',
        version: process.env.npm_package_version || '1.0.0',
        environment: config.server.env,
        uptime: process.uptime(),
        memory: process.memoryUsage(),
        pid: process.pid,
        nodeVersion: process.version,
        platform: process.platform,
        arch: process.arch,
      });
    });

    // Root endpoint
    this.app.get('/', (req, res) => {
      res.json({
        message: 'HyperGiga TG Bot API',
        version: process.env.npm_package_version || '1.0.0',
        endpoints: {
          health: '/healthz',
          readiness: '/readyz',
          metrics: '/metrics',
          info: '/info',
        },
      });
    });

    // 404 handler
    this.app.use('*', (req, res) => {
      res.status(404).json({
        error: 'Endpoint not found',
        path: req.originalUrl,
        timestamp: new Date(),
      });
    });

    // Error handler
    this.app.use((error: any, req: express.Request, res: express.Response, next: express.NextFunction) => {
      logger.error('Express error:', error);
      
      res.status(500).json({
        error: 'Internal server error',
        timestamp: new Date(),
        requestId: req.id,
      });
    });
  }

  private async getHealthStatus(): Promise<HealthCheck> {
    const checks = {
      database: await database.healthCheck(),
      redis: await redis.healthCheck(),
      telegram: true, // We assume Telegram is working if we're running
    };

    const status = Object.values(checks).every(check => check) ? 'healthy' : 'unhealthy';
    const uptime = (Date.now() - this.startTime) / 1000;

    return {
      status,
      timestamp: new Date(),
      checks,
      uptime,
      version: process.env.npm_package_version || '1.0.0',
    };
  }

  async start(): Promise<void> {
    return new Promise((resolve, reject) => {
      try {
        this.server = this.app.listen(config.monitoring.metricsPort, config.server.host, () => {
          logger.info(`Health server started on ${config.server.host}:${config.monitoring.metricsPort}`);
          resolve();
        });

        this.server.on('error', (error: Error) => {
          logger.error('Health server error:', error);
          reject(error);
        });
      } catch (error) {
        logger.error('Failed to start health server:', error);
        reject(error);
      }
    });
  }

  async close(): Promise<void> {
    return new Promise((resolve, reject) => {
      if (!this.server) {
        resolve();
        return;
      }

      this.server.close((error?: Error) => {
        if (error) {
          logger.error('Error closing health server:', error);
          reject(error);
        } else {
          logger.info('Health server closed');
          resolve();
        }
      });
    });
  }

  // Get server info
  getServerInfo() {
    return {
      port: config.monitoring.metricsPort,
      host: config.server.host,
      isRunning: !!this.server,
    };
  }
}

// Export singleton instance
export const healthServer = HealthServer.getInstance();