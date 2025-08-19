import { BotContext } from '@/types';
import { CommandMetadata, CommandCategory, UserRole } from '@/types';

// Utilities commands
export const utilityCommands: Array<{
  metadata: CommandMetadata;
  handler: (ctx: BotContext) => Promise<void>;
}> = [
  {
    metadata: {
      name: 'shorten',
      aliases: ['shorturl'],
      category: CommandCategory.UTILITIES,
      description: 'Shorten URL',
      usage: '/shorten <url>',
      examples: ['/shorten https://example.com'],
      cooldown: 10,
      roles: [UserRole.USER, UserRole.ADMIN, UserRole.OWNER],
    },
    handler: async (ctx: BotContext) => {
      await ctx.reply(ctx.t('shorten.success'));
    },
  },
  {
    metadata: {
      name: 'expand',
      aliases: ['longurl'],
      category: CommandCategory.UTILITIES,
      description: 'Expand shortened URL',
      usage: '/expand <short_url>',
      examples: ['/expand https://bit.ly/abc123'],
      cooldown: 10,
      roles: [UserRole.USER, UserRole.ADMIN, UserRole.OWNER],
    },
    handler: async (ctx: BotContext) => {
      await ctx.reply(ctx.t('expand.success'));
    },
  },
  {
    metadata: {
      name: 'wiki',
      aliases: ['wikipedia'],
      category: CommandCategory.UTILITIES,
      description: 'Search Wikipedia',
      usage: '/wiki <query>',
      examples: ['/wiki Albert Einstein'],
      cooldown: 10,
      roles: [UserRole.USER, UserRole.ADMIN, UserRole.OWNER],
    },
    handler: async (ctx: BotContext) => {
      await ctx.reply(ctx.t('wiki.success'));
    },
  },
  {
    metadata: {
      name: 'define',
      aliases: ['dictionary'],
      category: CommandCategory.UTILITIES,
      description: 'Get word definition',
      usage: '/define <word>',
      examples: ['/define hello'],
      cooldown: 10,
      roles: [UserRole.USER, UserRole.ADMIN, UserRole.OWNER],
    },
    handler: async (ctx: BotContext) => {
      await ctx.reply(ctx.t('define.success'));
    },
  },
  {
    metadata: {
      name: 'remind',
      aliases: ['reminder'],
      category: CommandCategory.UTILITIES,
      description: 'Set reminder',
      usage: '/remind <time> <message>',
      examples: ['/remind 10m Take a break', '/remind 1h Meeting'],
      cooldown: 10,
      roles: [UserRole.USER, UserRole.ADMIN, UserRole.OWNER],
    },
    handler: async (ctx: BotContext) => {
      await ctx.reply(ctx.t('remind.success'));
    },
  },
  {
    metadata: {
      name: 'todo',
      aliases: ['task'],
      category: CommandCategory.UTILITIES,
      description: 'Manage todo list',
      usage: '/todo <add|list|done|delete> [item]',
      examples: ['/todo add Buy groceries', '/todo list'],
      cooldown: 5,
      roles: [UserRole.USER, UserRole.ADMIN, UserRole.OWNER],
    },
    handler: async (ctx: BotContext) => {
      await ctx.reply(ctx.t('todo.success'));
    },
  },
  {
    metadata: {
      name: 'poll',
      aliases: ['vote'],
      category: CommandCategory.UTILITIES,
      description: 'Create poll',
      usage: '/poll <question> | <option1> | <option2> ...',
      examples: ['/poll What\'s for lunch? | Pizza | Burger | Salad'],
      cooldown: 30,
      roles: [UserRole.USER, UserRole.ADMIN, UserRole.OWNER],
    },
    handler: async (ctx: BotContext) => {
      await ctx.reply(ctx.t('poll.success'));
    },
  },
  {
    metadata: {
      name: 'quiz',
      aliases: ['question'],
      category: CommandCategory.UTILITIES,
      description: 'Start quiz',
      usage: '/quiz [category]',
      examples: ['/quiz', '/quiz general'],
      cooldown: 60,
      roles: [UserRole.USER, UserRole.ADMIN, UserRole.OWNER],
    },
    handler: async (ctx: BotContext) => {
      await ctx.reply(ctx.t('quiz.success'));
    },
  },
];