import { BotContext } from '@/types';
import { v4 as uuidv4 } from 'uuid';
import { logger } from '@/core/logger';

// Context middleware
export const context = async (ctx: BotContext, next: () => Promise<void>) => {
  const startTime = Date.now();
  const requestId = uuidv4();

  // Initialize session
  ctx.session = {
    requestId,
    startTime,
    user: undefined,
    chatSettings: undefined,
  };

  // Add request ID to context
  ctx.requestId = requestId;

  // Log request start
  logger.debug('Request started', {
    requestId,
    updateType: ctx.update?.update_id ? 'update' : 'unknown',
    chatId: ctx.chat?.id,
    userId: ctx.from?.id,
  });

  try {
    await next();
  } finally {
    const duration = Date.now() - startTime;
    
    // Log request end
    logger.debug('Request completed', {
      requestId,
      duration,
      success: !ctx.session.error,
    });
  }
};