import { BotContext } from '@/types';
import { context } from './context';
import { logging } from './logging';
import { rateLimit } from './rateLimit';
import { quota } from './quota';
import { i18n } from './i18n';
import { metrics } from './metrics';

// Export all middleware
export const middleware = {
  context,
  logging,
  rateLimit,
  quota,
  i18n,
  metrics,
};