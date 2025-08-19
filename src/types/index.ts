import { Context, SessionFlavor } from 'grammy';

// User roles
export enum UserRole {
  USER = 'user',
  ADMIN = 'admin',
  OWNER = 'owner',
}

// Chat settings
export interface ChatSettings {
  prefix: string;
  language: 'bn' | 'en';
  features: {
    [key: string]: boolean;
  };
  welcomeMessage?: string;
  goodbyeMessage?: string;
  slowMode?: number;
  moderationEnabled: boolean;
}

// User profile
export interface UserProfile {
  id: number;
  username?: string;
  firstName: string;
  lastName?: string;
  role: UserRole;
  joinedAt: Date;
  lastSeen: Date;
  quota: QuotaInfo;
  badges: string[];
  settings: UserSettings;
}

// User settings
export interface UserSettings {
  language: 'bn' | 'en';
  notifications: boolean;
  privacy: {
    shareStats: boolean;
    showOnline: boolean;
  };
}

// Quota information
export interface QuotaInfo {
  daily: {
    commands: number;
    downloads: number;
    aiRequests: number;
    mediaConversions: number;
  };
  limits: {
    commands: number;
    downloads: number;
    aiRequests: number;
    mediaConversions: number;
  };
  resetTime: Date;
}

// Command metadata
export interface CommandMetadata {
  name: string;
  aliases: string[];
  category: CommandCategory;
  description: string;
  usage: string;
  examples: string[];
  cooldown: number;
  roles: UserRole[];
  hidden?: boolean;
}

// Command categories
export enum CommandCategory {
  CORE = 'core',
  MEDIA = 'media',
  AI = 'ai',
  STICKERS = 'stickers',
  UTILITIES = 'utilities',
  GAMES = 'games',
  ADMIN = 'admin',
}

// Error types
export enum ErrorType {
  VALIDATION = 'ValidationError',
  QUOTA = 'QuotaError',
  RATE_LIMIT = 'RateLimitError',
  NOT_FOUND = 'NotFoundError',
  PERMISSION = 'PermissionError',
  TEMPORARY = 'TemporaryError',
  INTERNAL = 'InternalError',
}

// Base error class
export abstract class BotError extends Error {
  abstract readonly type: ErrorType;
  abstract readonly userMessage: string;
  abstract readonly statusCode: number;
  abstract readonly retryable: boolean;

  constructor(message: string) {
    super(message);
    this.name = this.constructor.name;
  }
}

// Specific error classes
export class ValidationError extends BotError {
  readonly type = ErrorType.VALIDATION;
  readonly userMessage = 'Invalid input provided';
  readonly statusCode = 400;
  readonly retryable = false;
}

export class QuotaError extends BotError {
  readonly type = ErrorType.QUOTA;
  readonly userMessage = 'Daily quota exceeded';
  readonly statusCode = 429;
  readonly retryable = false;

  constructor(public resetTime: Date) {
    super('Quota exceeded');
    this.userMessage = `Daily quota exceeded. Resets at ${resetTime.toLocaleString()}`;
  }
}

export class RateLimitError extends BotError {
  readonly type = ErrorType.RATE_LIMIT;
  readonly userMessage = 'Rate limit exceeded';
  readonly statusCode = 429;
  readonly retryable = true;

  constructor(public retryAfter: number) {
    super('Rate limit exceeded');
    this.userMessage = `Rate limit exceeded. Try again in ${retryAfter} seconds`;
  }
}

export class NotFoundError extends BotError {
  readonly type = ErrorType.NOT_FOUND;
  readonly userMessage = 'Resource not found';
  readonly statusCode = 404;
  readonly retryable = false;
}

export class PermissionError extends BotError {
  readonly type = ErrorType.PERMISSION;
  readonly userMessage = 'Insufficient permissions';
  readonly statusCode = 403;
  readonly retryable = false;
}

export class TemporaryError extends BotError {
  readonly type = ErrorType.TEMPORARY;
  readonly userMessage = 'Temporary service unavailable';
  readonly statusCode = 503;
  readonly retryable = true;
}

export class InternalError extends BotError {
  readonly type = ErrorType.INTERNAL;
  readonly userMessage = 'Internal server error';
  readonly statusCode = 500;
  readonly retryable = true;
}

// Context extension
export interface BotContext extends Context {
  session: {
    user?: UserProfile;
    chatSettings?: ChatSettings;
    requestId: string;
    startTime: number;
  };
}

// Plugin interface
export interface Plugin {
  name: string;
  version: string;
  description: string;
  commands: CommandMetadata[];
  initialize(): Promise<void>;
  destroy(): Promise<void>;
}

// AI provider interface
export interface AIProvider {
  name: string;
  ask(prompt: string, options?: AIOptions): Promise<string>;
  summarize(content: string): Promise<string>;
  translate(text: string, targetLang: string): Promise<string>;
  generateImage(prompt: string): Promise<string>;
}

// AI options
export interface AIOptions {
  model?: string;
  temperature?: number;
  maxTokens?: number;
  systemPrompt?: string;
}

// Media processing result
export interface MediaResult {
  success: boolean;
  url?: string;
  fileId?: string;
  error?: string;
  metadata?: {
    duration?: number;
    size?: number;
    format?: string;
    resolution?: string;
  };
}

// Database models
export interface DatabaseUser {
  id: number;
  username?: string;
  first_name: string;
  last_name?: string;
  role: UserRole;
  joined_at: Date;
  last_seen: Date;
  quota_data: string; // JSON
  badges: string[];
  settings: string; // JSON
  created_at: Date;
  updated_at: Date;
}

export interface DatabaseChat {
  id: number;
  type: string;
  title?: string;
  username?: string;
  settings: string; // JSON
  created_at: Date;
  updated_at: Date;
}

export interface DatabaseCommand {
  id: number;
  user_id: number;
  chat_id: number;
  command: string;
  success: boolean;
  error?: string;
  execution_time: number;
  created_at: Date;
}

// Metrics
export interface Metrics {
  commandsTotal: number;
  commandLatency: number[];
  errorsTotal: number;
  quotaDenialsTotal: number;
  activeUsers: number;
  activeChats: number;
}

// Rate limit info
export interface RateLimitInfo {
  key: string;
  points: number;
  duration: number;
  blockDuration: number;
}

// Cache entry
export interface CacheEntry<T = any> {
  key: string;
  value: T;
  ttl: number;
  createdAt: number;
}

// Event types
export enum EventType {
  USER_JOINED = 'user_joined',
  USER_LEFT = 'user_left',
  MESSAGE_EDITED = 'message_edited',
  MESSAGE_DELETED = 'message_deleted',
  REACTION_ADDED = 'reaction_added',
  REACTION_REMOVED = 'reaction_removed',
}

// Event data
export interface EventData {
  type: EventType;
  userId: number;
  chatId: number;
  messageId?: number;
  timestamp: Date;
  metadata?: Record<string, any>;
}

// Health check result
export interface HealthCheck {
  status: 'healthy' | 'unhealthy' | 'degraded';
  timestamp: Date;
  checks: {
    database: boolean;
    redis: boolean;
    telegram: boolean;
  };
  uptime: number;
  version: string;
}

// API response wrapper
export interface APIResponse<T = any> {
  success: boolean;
  data?: T;
  error?: string;
  message?: string;
  timestamp: Date;
  requestId: string;
}