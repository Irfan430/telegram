import { BotContext } from '@/types';
import { i18n } from '@/i18n';

// Bot start time
const botStartTime = Date.now();

// Uptime command handler
export async function uptime(ctx: BotContext): Promise<void> {
  try {
    const currentTime = Date.now();
    const uptimeMs = currentTime - botStartTime;
    const uptimeSeconds = Math.floor(uptimeMs / 1000);
    
    const formattedUptime = i18n.formatDuration(uptimeSeconds, ctx.language);
    
    await ctx.reply(ctx.t('uptime.response', { uptime: formattedUptime }));
  } catch (error) {
    ctx.logger?.error('Error in uptime command', error);
    await ctx.reply(ctx.t('errors.internal'));
  }
}