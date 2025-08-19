import { BotError, ErrorType, ValidationError, QuotaError, RateLimitError, NotFoundError, PermissionError, TemporaryError, InternalError } from '@/types';
import { logger, createContextLogger } from './logger';
import { metrics } from './metrics';
import { BotContext } from '@/types';

// Error handler class
export class ErrorHandler {
  private static instance: ErrorHandler;

  private constructor() {}

  static getInstance(): ErrorHandler {
    if (!ErrorHandler.instance) {
      ErrorHandler.instance = new ErrorHandler();
    }
    return ErrorHandler.instance;
  }

  // Main error handler for Grammy
  async handle(err: any, ctx: BotContext): Promise<void> {
    const contextLogger = createContextLogger({
      requestId: ctx.session.requestId,
      userId: ctx.session.user?.id,
      chatId: ctx.chat?.id,
      command: ctx.session.command,
    });

    // Log the error
    contextLogger.error('Bot error occurred', err, {
      update: ctx.update,
      chat: ctx.chat,
      user: ctx.from,
    });

    // Track error metrics
    const errorType = this.getErrorType(err);
    metrics.trackError(errorType, ctx.session.command, ctx.session.user?.role);

    // Get user-friendly error message
    const userMessage = this.getUserMessage(err, ctx);

    // Send error message to user
    try {
      await this.sendErrorMessage(ctx, userMessage, errorType);
    } catch (sendError) {
      contextLogger.error('Failed to send error message to user', sendError);
    }
  }

  // Get error type from error object
  private getErrorType(err: any): string {
    if (err instanceof BotError) {
      return err.type;
    }

    // Map common errors to our error types
    if (err.error_code === 429) {
      return ErrorType.RATE_LIMIT;
    }
    if (err.error_code === 403) {
      return ErrorType.PERMISSION;
    }
    if (err.error_code === 404) {
      return ErrorType.NOT_FOUND;
    }
    if (err.error_code >= 500) {
      return ErrorType.TEMPORARY;
    }

    return ErrorType.INTERNAL;
  }

  // Get user-friendly error message
  private getUserMessage(err: any, ctx: BotContext): string {
    if (err instanceof BotError) {
      return err.userMessage;
    }

    // Handle Telegram API errors
    if (err.error_code) {
      return this.getTelegramErrorMessage(err.error_code, err.description);
    }

    // Handle network errors
    if (err.code === 'ECONNRESET' || err.code === 'ETIMEDOUT') {
      return 'Connection error. Please try again later.';
    }

    // Handle validation errors
    if (err.name === 'ValidationError' || err.name === 'ZodError') {
      return 'Invalid input provided. Please check your request and try again.';
    }

    // Default error message
    return 'An unexpected error occurred. Please try again later.';
  }

  // Get Telegram API error messages
  private getTelegramErrorMessage(errorCode: number, description?: string): string {
    const messages: Record<number, string> = {
      400: 'Bad request. Please check your input.',
      401: 'Unauthorized. Please contact support.',
      403: 'Forbidden. You don\'t have permission to perform this action.',
      404: 'Resource not found.',
      409: 'Conflict. The resource already exists.',
      429: 'Too many requests. Please wait a moment and try again.',
      500: 'Telegram server error. Please try again later.',
      502: 'Bad gateway. Please try again later.',
      503: 'Service unavailable. Please try again later.',
      504: 'Gateway timeout. Please try again later.',
    };

    return messages[errorCode] || description || 'Telegram API error occurred.';
  }

  // Send error message to user
  private async sendErrorMessage(ctx: BotContext, message: string, errorType: string): Promise<void> {
    const isRetryable = this.isRetryableError(errorType);
    const emoji = isRetryable ? '⚠️' : '❌';

    const errorText = `${emoji} ${message}`;

    try {
      // Try to edit the message if it exists
      if (ctx.message) {
        await ctx.api.editMessageText(ctx.chat!.id, ctx.message.message_id, errorText);
      } else {
        // Send new message
        await ctx.reply(errorText);
      }
    } catch (sendError) {
      // Fallback: try to send a new message
      try {
        await ctx.reply(errorText);
      } catch (fallbackError) {
        logger.error('Failed to send error message even with fallback', fallbackError);
      }
    }
  }

  // Check if error is retryable
  private isRetryableError(errorType: string): boolean {
    const retryableErrors = [
      ErrorType.RATE_LIMIT,
      ErrorType.TEMPORARY,
      ErrorType.INTERNAL,
    ];
    return retryableErrors.includes(errorType as ErrorType);
  }

  // Create specific error instances
  createValidationError(message?: string): ValidationError {
    return new ValidationError(message || 'Invalid input provided');
  }

  createQuotaError(resetTime: Date): QuotaError {
    return new QuotaError(resetTime);
  }

  createRateLimitError(retryAfter: number): RateLimitError {
    return new RateLimitError(retryAfter);
  }

  createNotFoundError(message?: string): NotFoundError {
    return new NotFoundError(message || 'Resource not found');
  }

  createPermissionError(message?: string): PermissionError {
    return new PermissionError(message || 'Insufficient permissions');
  }

  createTemporaryError(message?: string): TemporaryError {
    return new TemporaryError(message || 'Temporary service unavailable');
  }

  createInternalError(message?: string): InternalError {
    return new InternalError(message || 'Internal server error');
  }

  // Handle async errors with retry logic
  async withRetry<T>(
    operation: () => Promise<T>,
    maxRetries: number = 3,
    delay: number = 1000,
    context?: string
  ): Promise<T> {
    let lastError: Error;

    for (let attempt = 1; attempt <= maxRetries; attempt++) {
      try {
        return await operation();
      } catch (error) {
        lastError = error as Error;
        
        if (attempt === maxRetries) {
          logger.error(`Operation failed after ${maxRetries} attempts`, {
            context,
            error: lastError,
            attempts: attempt,
          });
          throw lastError;
        }

        // Check if error is retryable
        if (!this.isRetryableError(this.getErrorType(lastError))) {
          throw lastError;
        }

        // Wait before retry
        await this.sleep(delay * attempt);
        
        logger.warn(`Retrying operation (attempt ${attempt + 1}/${maxRetries})`, {
          context,
          error: lastError.message,
        });
      }
    }

    throw lastError!;
  }

  // Circuit breaker implementation
  private circuitBreakers = new Map<string, {
    failures: number;
    lastFailure: number;
    state: 'CLOSED' | 'OPEN' | 'HALF_OPEN';
    threshold: number;
    timeout: number;
  }>();

  async withCircuitBreaker<T>(
    key: string,
    operation: () => Promise<T>,
    threshold: number = 5,
    timeout: number = 60000
  ): Promise<T> {
    const breaker = this.getCircuitBreaker(key, threshold, timeout);
    
    if (breaker.state === 'OPEN') {
      if (Date.now() - breaker.lastFailure > timeout) {
        breaker.state = 'HALF_OPEN';
      } else {
        throw new TemporaryError('Service temporarily unavailable');
      }
    }

    try {
      const result = await operation();
      
      if (breaker.state === 'HALF_OPEN') {
        breaker.state = 'CLOSED';
        breaker.failures = 0;
      }
      
      return result;
    } catch (error) {
      breaker.failures++;
      breaker.lastFailure = Date.now();
      
      if (breaker.failures >= threshold) {
        breaker.state = 'OPEN';
      }
      
      throw error;
    }
  }

  private getCircuitBreaker(key: string, threshold: number, timeout: number) {
    if (!this.circuitBreakers.has(key)) {
      this.circuitBreakers.set(key, {
        failures: 0,
        lastFailure: 0,
        state: 'CLOSED',
        threshold,
        timeout,
      });
    }
    
    return this.circuitBreakers.get(key)!;
  }

  // Utility function for delays
  private sleep(ms: number): Promise<void> {
    return new Promise(resolve => setTimeout(resolve, ms));
  }

  // Handle unhandled promise rejections
  handleUnhandledRejection(reason: any, promise: Promise<any>): void {
    logger.error('Unhandled promise rejection', {
      reason,
      promise,
    });
    
    metrics.trackError('unhandled_promise_rejection');
  }

  // Handle uncaught exceptions
  handleUncaughtException(error: Error): void {
    logger.fatal('Uncaught exception', error);
    
    metrics.trackError('uncaught_exception');
    
    // Give time for logs to be written
    setTimeout(() => {
      process.exit(1);
    }, 1000);
  }

  // Setup global error handlers
  setupGlobalHandlers(): void {
    process.on('unhandledRejection', this.handleUnhandledRejection.bind(this));
    process.on('uncaughtException', this.handleUncaughtException.bind(this));
  }
}

// Export singleton instance
export const errorHandler = ErrorHandler.getInstance();