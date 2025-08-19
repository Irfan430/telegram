import { z } from 'zod';

const configSchema = z.object({
  telegram: z.object({
    token: z.string().min(1, 'Telegram bot token is required'),
    webhookUrl: z.string().url().optional(),
    webhookSecret: z.string().optional(),
  }),
  database: z.object({
    url: z.string().url('Database URL must be a valid URL'),
  }),
  redis: z.object({
    url: z.string().url('Redis URL must be a valid URL'),
    password: z.string().optional(),
  }),
  server: z.object({
    port: z.coerce.number().int().positive().default(3000),
    host: z.string().default('0.0.0.0'),
    env: z.enum(['development', 'production', 'test']).default('production'),
  }),
  logging: z.object({
    level: z.enum(['fatal', 'error', 'warn', 'info', 'debug', 'trace']).default('info'),
    pretty: z.coerce.boolean().default(false),
  }),
  tracing: z.object({
    enabled: z.coerce.boolean().default(false),
    endpoint: z.string().url().optional(),
    headers: z.string().optional(),
    serviceName: z.string().default('hypergiga-tg-bot'),
  }),
  quotas: z.object({
    default: z.string().transform((str) => {
      try {
        return JSON.parse(str);
      } catch {
        return {
          daily_commands: 1000,
          daily_downloads: 50,
          daily_ai_requests: 100,
          daily_media_conversions: 20,
        };
      }
    }),
  }),
  rateLimit: z.object({
    global: z.coerce.number().int().positive().default(1000),
    perUser: z.coerce.number().int().positive().default(100),
    perCommand: z.coerce.number().int().positive().default(10),
  }),
  media: z.object({
    apiBase: z.string().url().optional(),
    puppeteerSkipDownload: z.coerce.boolean().default(true),
    puppeteerExecutablePath: z.string().default('/usr/bin/chromium'),
    ffmpegPath: z.string().default('/usr/bin/ffmpeg'),
  }),
  ai: z.object({
    provider: z.enum(['openai', 'local', 'anthropic']).default('openai'),
    openaiApiKey: z.string().optional(),
    openaiModel: z.string().default('gpt-3.5-turbo'),
    fallbackProvider: z.string().default('local'),
  }),
  security: z.object({
    jwtSecret: z.string().min(32, 'JWT secret must be at least 32 characters'),
    encryptionKey: z.string().length(32, 'Encryption key must be exactly 32 characters'),
    corsOrigin: z.string().url().optional(),
  }),
  upload: z.object({
    maxFileSize: z.coerce.number().int().positive().default(52428800),
    maxImageSize: z.coerce.number().int().positive().default(10485760),
    maxVideoSize: z.coerce.number().int().positive().default(104857600),
  }),
  cache: z.object({
    ttl: z.coerce.number().int().positive().default(3600),
    maxSize: z.coerce.number().int().positive().default(1000),
  }),
  monitoring: z.object({
    metricsPort: z.coerce.number().int().positive().default(9090),
    healthCheckInterval: z.coerce.number().int().positive().default(30000),
  }),
  development: z.object({
    debug: z.coerce.boolean().default(false),
    enableSwagger: z.coerce.boolean().default(false),
  }),
});

export const config = configSchema.parse({
  telegram: {
    token: process.env.TELEGRAM_BOT_TOKEN,
    webhookUrl: process.env.TELEGRAM_WEBHOOK_URL,
    webhookSecret: process.env.TELEGRAM_WEBHOOK_SECRET,
  },
  database: {
    url: process.env.DATABASE_URL,
  },
  redis: {
    url: process.env.REDIS_URL,
    password: process.env.REDIS_PASSWORD,
  },
  server: {
    port: process.env.PORT,
    host: process.env.HOST,
    env: process.env.NODE_ENV,
  },
  logging: {
    level: process.env.LOG_LEVEL,
    pretty: process.env.LOG_PRETTY,
  },
  tracing: {
    enabled: process.env.FEATURE_TRACING,
    endpoint: process.env.OTEL_EXPORTER_OTLP_ENDPOINT,
    headers: process.env.OTEL_EXPORTER_OTLP_HEADERS,
    serviceName: process.env.OTEL_SERVICE_NAME,
  },
  quotas: {
    default: process.env.QUOTAS_DEFAULT,
  },
  rateLimit: {
    global: process.env.RATE_LIMIT_GLOBAL,
    perUser: process.env.RATE_LIMIT_PER_USER,
    perCommand: process.env.RATE_LIMIT_PER_COMMAND,
  },
  media: {
    apiBase: process.env.MEDIA_API_BASE,
    puppeteerSkipDownload: process.env.PUPPETEER_SKIP_CHROMIUM_DOWNLOAD,
    puppeteerExecutablePath: process.env.PUPPETEER_EXECUTABLE_PATH,
    ffmpegPath: process.env.FFMPEG_PATH,
  },
  ai: {
    provider: process.env.AI_PROVIDER,
    openaiApiKey: process.env.OPENAI_API_KEY,
    openaiModel: process.env.OPENAI_MODEL,
    fallbackProvider: process.env.AI_FALLBACK_PROVIDER,
  },
  security: {
    jwtSecret: process.env.JWT_SECRET || 'default-jwt-secret-32-chars-long-key',
    encryptionKey: process.env.ENCRYPTION_KEY || 'default-encryption-key-32-chars',
    corsOrigin: process.env.CORS_ORIGIN,
  },
  upload: {
    maxFileSize: process.env.MAX_FILE_SIZE,
    maxImageSize: process.env.MAX_IMAGE_SIZE,
    maxVideoSize: process.env.MAX_VIDEO_SIZE,
  },
  cache: {
    ttl: process.env.CACHE_TTL,
    maxSize: process.env.CACHE_MAX_SIZE,
  },
  monitoring: {
    metricsPort: process.env.METRICS_PORT,
    healthCheckInterval: process.env.HEALTH_CHECK_INTERVAL,
  },
  development: {
    debug: process.env.DEBUG,
    enableSwagger: process.env.ENABLE_SWAGGER,
  },
});