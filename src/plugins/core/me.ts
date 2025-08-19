import { BotContext } from '@/types';
import { quotaManager, QuotaType } from '@/core/quotaManager';
import { i18n } from '@/i18n';

// Me command handler
export async function me(ctx: BotContext): Promise<void> {
  const args = ctx.session.args || [];
  
  if (args.length === 0) {
    // Show profile
    await showProfile(ctx);
  } else if (args.length === 1 && args[0].toLowerCase() === 'quota') {
    // Show quota information
    await showQuota(ctx);
  } else {
    await ctx.reply(ctx.t('errors.validation'));
  }
}

// Show user profile
async function showProfile(ctx: BotContext): Promise<void> {
  if (!ctx.from?.id) {
    await ctx.reply(ctx.t('errors.permission'));
    return;
  }

  try {
    // Get user information
    const username = ctx.from.username || 'N/A';
    const firstName = ctx.from.first_name || '';
    const lastName = ctx.from.last_name || '';
    const role = ctx.session.user?.role || 'user';
    const joinedAt = ctx.session.user?.joinedAt || new Date();
    const badges = ctx.session.user?.badges || [];

    let message = `${ctx.t('me.title')}\n\n`;
    message += `${ctx.t('me.username', { username: `@${username}` })}\n`;
    message += `${ctx.t('me.role', { role: role.toUpperCase() })}\n`;
    message += `${ctx.t('me.joined', { date: i18n.formatDate(joinedAt, ctx.language) })}\n`;
    
    if (badges.length > 0) {
      message += `${ctx.t('me.badges', { badges: badges.join(', ') })}\n`;
    }

    await ctx.reply(message);
  } catch (error) {
    ctx.logger?.error('Error showing profile', error);
    await ctx.reply(ctx.t('errors.internal'));
  }
}

// Show quota information
async function showQuota(ctx: BotContext): Promise<void> {
  if (!ctx.from?.id) {
    await ctx.reply(ctx.t('errors.permission'));
    return;
  }

  try {
    const role = ctx.session.user?.role || 'user';
    const quotaUsage = await quotaManager.getUserQuotaUsage(ctx.from.id);
    
    let message = `${ctx.t('me.quota.title')}\n\n`;
    
    // Commands quota
    const commands = quotaUsage[QuotaType.COMMANDS];
    message += `${ctx.t('me.quota.commands', { 
      used: commands.used, 
      limit: commands.limit 
    })}\n`;
    
    // Downloads quota
    const downloads = quotaUsage[QuotaType.DOWNLOADS];
    message += `${ctx.t('me.quota.downloads', { 
      used: downloads.used, 
      limit: downloads.limit 
    })}\n`;
    
    // AI requests quota
    const aiRequests = quotaUsage[QuotaType.AI_REQUESTS];
    message += `${ctx.t('me.quota.ai', { 
      used: aiRequests.used, 
      limit: aiRequests.limit 
    })}\n`;
    
    // Media conversions quota
    const mediaConversions = quotaUsage[QuotaType.MEDIA_CONVERSIONS];
    message += `${ctx.t('me.quota.media', { 
      used: mediaConversions.used, 
      limit: mediaConversions.limit 
    })}\n`;
    
    // Reset time
    const quota = await quotaManager.getUserQuota(ctx.from.id, role);
    message += `\n${ctx.t('me.quota.reset', { 
      time: i18n.formatTime(quota.resetTime, ctx.language) 
    })}`;

    await ctx.reply(message);
  } catch (error) {
    ctx.logger?.error('Error showing quota', error);
    await ctx.reply(ctx.t('errors.internal'));
  }
}