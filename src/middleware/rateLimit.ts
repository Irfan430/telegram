import { BotContext } from '@/types';
import { rateLimiter, RateLimitType } from '@/core/rateLimiter';
import { RateLimitError } from '@/types';

// Rate limiting middleware
export const rateLimit = async (ctx: BotContext, next: () => Promise<void>) => {
  if (!ctx.from?.id || !ctx.chat?.id) {
    await next();
    return;
  }

  try {
    // Check multiple rate limits
    const checks = [
      {
        type: RateLimitType.GLOBAL,
        key: 'global',
        points: 1,
      },
      {
        type: RateLimitType.PER_USER,
        key: rateLimiter.getUserKey(ctx.from.id),
        points: 1,
      },
      {
        type: RateLimitType.PER_CHAT,
        key: rateLimiter.getChatKey(ctx.chat.id),
        points: 1,
      },
    ];

    // Add command-specific rate limit if it's a command
    if (ctx.message?.text?.startsWith('/')) {
      const command = ctx.message.text.split(' ')[0].substring(1);
      checks.push({
        type: RateLimitType.PER_COMMAND,
        key: rateLimiter.getCommandKey(command),
        points: 1,
      });
    }

    // Check all rate limits
    const result = await rateLimiter.checkMultipleRateLimits(checks);

    if (!result.allowed) {
      throw new RateLimitError(result.retryAfter);
    }

    await next();
  } catch (error) {
    if (error instanceof RateLimitError) {
      // Send rate limit message
      const message = `⏰ Rate limit exceeded. Try again in ${error.retryAfter} seconds.`;
      await ctx.reply(message);
      return;
    }
    throw error;
  }
};