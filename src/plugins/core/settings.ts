import { BotContext } from '@/types';
import { InlineKeyboard } from 'grammy';

// Settings command handler
export async function settings(ctx: BotContext): Promise<void> {
  await showSettingsMenu(ctx);
}

// Show settings menu
async function showSettingsMenu(ctx: BotContext): Promise<void> {
  const title = ctx.t('settings.title');
  
  let message = `${title}\n\n`;
  message += `🌐 ${ctx.t('settings.language')}: ${ctx.language?.toUpperCase() || 'BN'}\n`;
  message += `🔔 ${ctx.t('settings.notifications')}: ${ctx.session.user?.settings?.notifications ? 'ON' : 'OFF'}\n`;
  message += `🔒 ${ctx.t('settings.privacy')}: ${ctx.session.user?.settings?.privacy?.shareStats ? 'PUBLIC' : 'PRIVATE'}\n`;

  const keyboard = new InlineKeyboard()
    .text('🌐 Language', 'settings_language')
    .text('🔔 Notifications', 'settings_notifications')
    .row()
    .text('🔒 Privacy', 'settings_privacy')
    .text(ctx.t('settings.save'), 'settings_save')
    .row()
    .text(ctx.t('common.back'), 'start');

  await ctx.reply(message, {
    reply_markup: keyboard,
  });
}