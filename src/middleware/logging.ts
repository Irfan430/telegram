import { BotContext } from '@/types';
import { createContextLogger } from '@/core/logger';

// Logging middleware
export const logging = async (ctx: BotContext, next: () => Promise<void>) => {
  const contextLogger = createContextLogger({
    requestId: ctx.session.requestId,
    userId: ctx.from?.id,
    chatId: ctx.chat?.id,
    command: ctx.message?.text?.split(' ')[0],
  });

  // Add logger to context
  ctx.logger = contextLogger;

  // Log incoming message
  if (ctx.message?.text) {
    contextLogger.info('Incoming message', {
      text: ctx.message.text,
      chatType: ctx.chat?.type,
      isCommand: ctx.message.text.startsWith('/'),
    });
  }

  try {
    await next();
  } catch (error) {
    // Log error
    contextLogger.error('Middleware error', error);
    throw error;
  }
};