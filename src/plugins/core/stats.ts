import { BotContext } from '@/types';
import { metrics } from '@/core/metrics';
import { quotaManager } from '@/core/quotaManager';
import { i18n } from '@/i18n';

// Stats command handler
export async function stats(ctx: BotContext): Promise<void> {
  try {
    // Get quota statistics
    const quotaStats = await quotaManager.getQuotaStats();
    
    // Get system information
    const memUsage = process.memoryUsage();
    const uptime = process.uptime();
    
    let message = `${ctx.t('stats.title')}\n\n`;
    message += `${ctx.t('stats.users', { count: quotaStats.totalUsers })}\n`;
    message += `${ctx.t('stats.chats', { count: quotaStats.activeChats })}\n`;
    message += `${ctx.t('stats.commands', { count: 'N/A' })}\n`; // Would get from metrics
    message += `${ctx.t('stats.uptime', { uptime: i18n.formatDuration(uptime, ctx.language) })}\n\n`;
    
    // Memory usage
    message += `💾 Memory Usage:\n`;
    message += `• RSS: ${(memUsage.rss / 1024 / 1024).toFixed(2)} MB\n`;
    message += `• Heap: ${(memUsage.heapUsed / 1024 / 1024).toFixed(2)} MB\n`;
    message += `• External: ${(memUsage.external / 1024 / 1024).toFixed(2)} MB\n\n`;
    
    // Quota statistics
    message += `📊 Quota Statistics:\n`;
    message += `• Active Users: ${quotaStats.activeUsers}\n`;
    message += `• Command Exhaustions: ${quotaStats.quotaExhaustions.commands}\n`;
    message += `• Download Exhaustions: ${quotaStats.quotaExhaustions.downloads}\n`;
    message += `• AI Request Exhaustions: ${quotaStats.quotaExhaustions.ai_requests}\n`;
    message += `• Media Conversion Exhaustions: ${quotaStats.quotaExhaustions.media_conversions}`;

    await ctx.reply(message);
  } catch (error) {
    ctx.logger?.error('Error in stats command', error);
    await ctx.reply(ctx.t('errors.internal'));
  }
}