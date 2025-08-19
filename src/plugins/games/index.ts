import { BotContext } from '@/types';
import { CommandMetadata, CommandCategory, UserRole } from '@/types';

// Games & Social commands
export const gameCommands: Array<{
  metadata: CommandMetadata;
  handler: (ctx: BotContext) => Promise<void>;
}> = [
  {
    metadata: {
      name: 'rpg',
      aliases: ['game'],
      category: CommandCategory.GAMES,
      description: 'RPG game commands',
      usage: '/rpg <start|status|attack|heal>',
      examples: ['/rpg start', '/rpg status'],
      cooldown: 30,
      roles: [UserRole.USER, UserRole.ADMIN, UserRole.OWNER],
    },
    handler: async (ctx: BotContext) => {
      await ctx.reply(ctx.t('rpg.success'));
    },
  },
  {
    metadata: {
      name: 'tictactoe',
      aliases: ['ttt'],
      category: CommandCategory.GAMES,
      description: 'Play Tic-tac-toe',
      usage: '/tictactoe <@user>',
      examples: ['/tictactoe @username'],
      cooldown: 10,
      roles: [UserRole.USER, UserRole.ADMIN, UserRole.OWNER],
    },
    handler: async (ctx: BotContext) => {
      await ctx.reply(ctx.t('tictactoe.success'));
    },
  },
  {
    metadata: {
      name: 'chess',
      aliases: ['chessgame'],
      category: CommandCategory.GAMES,
      description: 'Play chess',
      usage: '/chess <@user>',
      examples: ['/chess @username'],
      cooldown: 10,
      roles: [UserRole.USER, UserRole.ADMIN, UserRole.OWNER],
    },
    handler: async (ctx: BotContext) => {
      await ctx.reply(ctx.t('chess.success'));
    },
  },
  {
    metadata: {
      name: 'trivia',
      aliases: ['quiz'],
      category: CommandCategory.GAMES,
      description: 'Play trivia',
      usage: '/trivia [category]',
      examples: ['/trivia', '/trivia science'],
      cooldown: 60,
      roles: [UserRole.USER, UserRole.ADMIN, UserRole.OWNER],
    },
    handler: async (ctx: BotContext) => {
      await ctx.reply(ctx.t('trivia.success'));
    },
  },
  {
    metadata: {
      name: 'leaderboard',
      aliases: ['lb', 'top'],
      category: CommandCategory.GAMES,
      description: 'Show leaderboard',
      usage: '/leaderboard [game]',
      examples: ['/leaderboard', '/leaderboard rpg'],
      cooldown: 30,
      roles: [UserRole.USER, UserRole.ADMIN, UserRole.OWNER],
    },
    handler: async (ctx: BotContext) => {
      await ctx.reply(ctx.t('leaderboard.success'));
    },
  },
];