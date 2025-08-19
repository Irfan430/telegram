import pino from 'pino';
import { config } from '@/config/app';

// Custom log levels
const logLevels = {
  fatal: 60,
  error: 50,
  warn: 40,
  info: 30,
  debug: 20,
  trace: 10,
};

// Custom serializers
const serializers = {
  err: pino.stdSerializers.err,
  req: (req: any) => ({
    id: req.id,
    method: req.method,
    url: req.url,
    headers: req.headers,
  }),
  res: (res: any) => ({
    statusCode: res.statusCode,
    headers: res.headers,
  }),
};

// Create logger instance
export const logger = pino({
  level: config.logging.level,
  prettyPrint: config.logging.pretty ? {
    colorize: true,
    translateTime: 'SYS:standard',
    ignore: 'pid,hostname',
  } : false,
  serializers,
  base: {
    service: 'hypergiga-tg-bot',
    version: process.env.npm_package_version || '1.0.0',
  },
  timestamp: pino.stdTimeFunctions.isoTime,
  formatters: {
    level: (label) => {
      return { level: label };
    },
    log: (object) => {
      return object;
    },
  },
});

// Context logger factory
export class ContextLogger {
  private baseLogger: pino.Logger;

  constructor(private context: {
    requestId: string;
    userId?: number;
    chatId?: number;
    command?: string;
    shardId?: number;
  }) {
    this.baseLogger = logger.child({
      requestId: context.requestId,
      userId: context.userId,
      chatId: context.chatId,
      command: context.command,
      shardId: context.shardId,
    });
  }

  info(message: string, data?: Record<string, any>): void {
    this.baseLogger.info(data || {}, message);
  }

  error(message: string, error?: Error, data?: Record<string, any>): void {
    this.baseLogger.error({ err: error, ...data }, message);
  }

  warn(message: string, data?: Record<string, any>): void {
    this.baseLogger.warn(data || {}, message);
  }

  debug(message: string, data?: Record<string, any>): void {
    this.baseLogger.debug(data || {}, message);
  }

  trace(message: string, data?: Record<string, any>): void {
    this.baseLogger.trace(data || {}, message);
  }

  fatal(message: string, error?: Error, data?: Record<string, any>): void {
    this.baseLogger.fatal({ err: error, ...data }, message);
  }
}

// Create context logger
export const createContextLogger = (context: {
  requestId: string;
  userId?: number;
  chatId?: number;
  command?: string;
  shardId?: number;
}): ContextLogger => {
  return new ContextLogger(context);
};

// Redact sensitive information
export const redactSensitiveData = (data: any): any => {
  if (typeof data !== 'object' || data === null) {
    return data;
  }

  const redacted = { ...data };
  const sensitiveKeys = ['token', 'password', 'secret', 'key', 'api_key', 'auth'];

  for (const key of Object.keys(redacted)) {
    if (sensitiveKeys.some(sensitive => key.toLowerCase().includes(sensitive))) {
      redacted[key] = '[REDACTED]';
    } else if (typeof redacted[key] === 'object') {
      redacted[key] = redactSensitiveData(redacted[key]);
    }
  }

  return redacted;
};

// Log middleware for Express
export const logMiddleware = (req: any, res: any, next: any) => {
  const startTime = Date.now();
  const requestId = req.headers['x-request-id'] || `req_${Date.now()}_${Math.random().toString(36).substr(2, 9)}`;

  req.id = requestId;
  req.startTime = startTime;

  const logData = {
    requestId,
    method: req.method,
    url: req.url,
    userAgent: req.get('User-Agent'),
    ip: req.ip,
  };

  logger.info(logData, 'Incoming request');

  res.on('finish', () => {
    const duration = Date.now() - startTime;
    const logData = {
      requestId,
      method: req.method,
      url: req.url,
      statusCode: res.statusCode,
      duration,
    };

    if (res.statusCode >= 400) {
      logger.warn(logData, 'Request completed with error');
    } else {
      logger.info(logData, 'Request completed');
    }
  });

  next();
};

// Export default logger instance
export default logger;