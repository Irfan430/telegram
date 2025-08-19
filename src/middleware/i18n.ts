import { BotContext } from '@/types';
import { i18n, Language } from '@/i18n';

// I18n middleware
export const i18n = async (ctx: BotContext, next: () => Promise<void>) => {
  // Get user's language preference
  let userLanguage: Language = 'bn'; // Default to Bengali

  if (ctx.session.user?.settings?.language) {
    userLanguage = ctx.session.user.settings.language;
  } else if (ctx.chat?.settings?.language) {
    userLanguage = ctx.chat.settings.language;
  }

  // Add i18n helper to context
  ctx.t = (key: string, params?: Record<string, any>) => {
    return i18n.t(key, userLanguage, params);
  };

  // Add language to context
  ctx.language = userLanguage;

  await next();
};