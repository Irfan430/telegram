import { BotContext } from '@/types';
import { InlineKeyboard } from 'grammy';

// Start command handler
export async function start(ctx: BotContext): Promise<void> {
  const welcomeMessage = ctx.t('start.welcome');
  
  // Create inline keyboard
  const keyboard = new InlineKeyboard()
    .text(ctx.t('start.help'), 'help')
    .text(ctx.t('start.settings'), 'settings')
    .row()
    .text('📥 Media', 'help_media')
    .text('🤖 AI', 'help_ai')
    .row()
    .text('🎨 Stickers', 'help_stickers')
    .text('🔧 Utilities', 'help_utilities')
    .row()
    .text('🎮 Games', 'help_games');

  await ctx.reply(welcomeMessage, {
    reply_markup: keyboard,
    parse_mode: 'HTML',
  });
}