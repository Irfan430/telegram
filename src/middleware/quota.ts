import { BotContext } from '@/types';
import { quotaManager, QuotaType } from '@/core/quotaManager';
import { QuotaError } from '@/types';

// Quota middleware
export const quota = async (ctx: BotContext, next: () => Promise<void>) => {
  if (!ctx.from?.id) {
    await next();
    return;
  }

  // Only check quota for commands
  if (!ctx.message?.text?.startsWith('/')) {
    await next();
    return;
  }

  try {
    // Check command quota
    await quotaManager.consumeQuota(
      ctx.from.id,
      QuotaType.COMMANDS,
      1,
      ctx.session.user?.role || 'user'
    );

    await next();
  } catch (error) {
    if (error instanceof QuotaError) {
      // Send quota exceeded message
      const message = `📊 Daily command quota exceeded. Resets at ${error.resetTime.toLocaleString()}`;
      await ctx.reply(message);
      return;
    }
    throw error;
  }
};