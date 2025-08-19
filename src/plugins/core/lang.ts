import { BotContext } from '@/types';
import { InlineKeyboard } from 'grammy';
import { Language } from '@/i18n';

// Language command handler
export async function lang(ctx: BotContext): Promise<void> {
  const args = ctx.session.args || [];
  
  if (args.length === 0) {
    // Show language selection
    await showLanguageSelection(ctx);
  } else if (args.length === 1) {
    const lang = args[0].toLowerCase() as Language;
    
    if (lang === 'bn' || lang === 'en') {
      await changeLanguage(ctx, lang);
    } else {
      await ctx.reply(ctx.t('errors.validation'));
    }
  } else {
    await ctx.reply(ctx.t('errors.validation'));
  }
}

// Show language selection
async function showLanguageSelection(ctx: BotContext): Promise<void> {
  const currentLang = ctx.language || 'bn';
  const message = ctx.t('lang.current', { lang: currentLang.toUpperCase() }) + '\n\n' + ctx.t('lang.options');

  const keyboard = new InlineKeyboard()
    .text('🇧🇩 বাংলা', 'lang_bn')
    .text('🇺🇸 English', 'lang_en')
    .row()
    .text(ctx.t('common.cancel'), 'cancel');

  await ctx.reply(message, {
    reply_markup: keyboard,
  });
}

// Change language
async function changeLanguage(ctx: BotContext, lang: Language): Promise<void> {
  try {
    // Update user settings in database
    if (ctx.from?.id) {
      // This would typically update the user's language preference in the database
      // For now, we'll just update the session
      if (ctx.session.user) {
        ctx.session.user.settings.language = lang;
      }
    }
    
    // Update chat settings if in a group
    if (ctx.chat?.id && ctx.chat.type !== 'private') {
      // This would typically update the chat's language preference in the database
      if (ctx.session.chatSettings) {
        ctx.session.chatSettings.language = lang;
      }
    }
    
    const message = ctx.t('lang.changed', { lang: lang.toUpperCase() });
    await ctx.reply(message);
  } catch (error) {
    ctx.logger?.error('Error changing language', error);
    await ctx.reply(ctx.t('errors.internal'));
  }
}