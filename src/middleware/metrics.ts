import { BotContext } from '@/types';
import { metrics } from '@/core/metrics';

// Metrics middleware
export const metrics = async (ctx: BotContext, next: () => Promise<void>) => {
  const startTime = Date.now();
  let success = false;
  let command = 'unknown';
  let category = 'unknown';

  try {
    // Extract command information
    if (ctx.message?.text?.startsWith('/')) {
      command = ctx.message.text.split(' ')[0].substring(1);
      
      // Determine category based on command
      if (['start', 'help', 'lang', 'me', 'settings', 'ping', 'uptime', 'stats'].includes(command)) {
        category = 'core';
      } else if (['download', 'convert', 'yt'].includes(command)) {
        category = 'media';
      } else if (['ask', 'summarize', 'translate', 'ocr', 'tts', 'stt'].includes(command)) {
        category = 'ai';
      } else if (['sticker', 'toimg', 'bgremove', 'upscale', 'watermark'].includes(command)) {
        category = 'stickers';
      } else if (['shorten', 'expand', 'wiki', 'define', 'remind', 'todo', 'poll', 'quiz'].includes(command)) {
        category = 'utilities';
      } else if (['rpg', 'tictactoe', 'chess', 'trivia', 'leaderboard'].includes(command)) {
        category = 'games';
      } else if (['mod', 'warn', 'mute', 'ban', 'purge', 'slowmode', 'welcome', 'goodbye'].includes(command)) {
        category = 'admin';
      }
    }

    await next();
    success = true;
  } catch (error) {
    success = false;
    throw error;
  } finally {
    const duration = Date.now() - startTime;
    const userRole = ctx.session.user?.role || 'user';

    // Track command metrics
    metrics.trackCommand(command, category, success, userRole, duration);
  }
};