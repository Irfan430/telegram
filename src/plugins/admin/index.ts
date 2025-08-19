import { BotContext } from '@/types';
import { CommandMetadata, CommandCategory, UserRole } from '@/types';

// Admin commands
export const adminCommands: Array<{
  metadata: CommandMetadata;
  handler: (ctx: BotContext) => Promise<void>;
}> = [
  {
    metadata: {
      name: 'mod',
      aliases: ['moderation'],
      category: CommandCategory.ADMIN,
      description: 'Moderation settings',
      usage: '/mod <on|off|rules>',
      examples: ['/mod on', '/mod rules'],
      cooldown: 10,
      roles: [UserRole.ADMIN, UserRole.OWNER],
    },
    handler: async (ctx: BotContext) => {
      await ctx.reply(ctx.t('mod.enabled'));
    },
  },
  {
    metadata: {
      name: 'warn',
      aliases: ['warning'],
      category: CommandCategory.ADMIN,
      description: 'Warn a user',
      usage: '/warn @user [reason]',
      examples: ['/warn @username', '/warn @username Spam'],
      cooldown: 10,
      roles: [UserRole.ADMIN, UserRole.OWNER],
    },
    handler: async (ctx: BotContext) => {
      await ctx.reply(ctx.t('warn.success'));
    },
  },
  {
    metadata: {
      name: 'mute',
      aliases: ['silence'],
      category: CommandCategory.ADMIN,
      description: 'Mute a user',
      usage: '/mute @user <duration> [reason]',
      examples: ['/mute @username 10m', '/mute @username 1h Spam'],
      cooldown: 10,
      roles: [UserRole.ADMIN, UserRole.OWNER],
    },
    handler: async (ctx: BotContext) => {
      await ctx.reply(ctx.t('mute.success'));
    },
  },
  {
    metadata: {
      name: 'ban',
      aliases: ['block'],
      category: CommandCategory.ADMIN,
      description: 'Ban a user',
      usage: '/ban @user [reason]',
      examples: ['/ban @username', '/ban @username Repeated violations'],
      cooldown: 10,
      roles: [UserRole.ADMIN, UserRole.OWNER],
    },
    handler: async (ctx: BotContext) => {
      await ctx.reply(ctx.t('ban.success'));
    },
  },
  {
    metadata: {
      name: 'purge',
      aliases: ['clear'],
      category: CommandCategory.ADMIN,
      description: 'Delete messages',
      usage: '/purge [count]',
      examples: ['/purge', '/purge 10'],
      cooldown: 30,
      roles: [UserRole.ADMIN, UserRole.OWNER],
    },
    handler: async (ctx: BotContext) => {
      await ctx.reply(ctx.t('purge.success'));
    },
  },
  {
    metadata: {
      name: 'slowmode',
      aliases: ['slow'],
      category: CommandCategory.ADMIN,
      description: 'Set slow mode',
      usage: '/slowmode [seconds]',
      examples: ['/slowmode 10', '/slowmode 0'],
      cooldown: 10,
      roles: [UserRole.ADMIN, UserRole.OWNER],
    },
    handler: async (ctx: BotContext) => {
      await ctx.reply(ctx.t('slowmode.set'));
    },
  },
  {
    metadata: {
      name: 'welcome',
      aliases: ['greet'],
      category: CommandCategory.ADMIN,
      description: 'Welcome message settings',
      usage: '/welcome <on|off> [message]',
      examples: ['/welcome on', '/welcome on Welcome to our group!'],
      cooldown: 10,
      roles: [UserRole.ADMIN, UserRole.OWNER],
    },
    handler: async (ctx: BotContext) => {
      await ctx.reply(ctx.t('welcome.enabled'));
    },
  },
  {
    metadata: {
      name: 'goodbye',
      aliases: ['farewell'],
      category: CommandCategory.ADMIN,
      description: 'Goodbye message settings',
      usage: '/goodbye <on|off> [message]',
      examples: ['/goodbye on', '/goodbye on Thanks for visiting!'],
      cooldown: 10,
      roles: [UserRole.ADMIN, UserRole.OWNER],
    },
    handler: async (ctx: BotContext) => {
      await ctx.reply(ctx.t('goodbye.enabled'));
    },
  },
];