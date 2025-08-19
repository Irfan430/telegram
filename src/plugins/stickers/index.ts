import { BotContext } from '@/types';
import { CommandMetadata, CommandCategory, UserRole } from '@/types';

// Stickers & Images commands
export const stickerCommands: Array<{
  metadata: CommandMetadata;
  handler: (ctx: BotContext) => Promise<void>;
}> = [
  {
    metadata: {
      name: 'sticker',
      aliases: ['s'],
      category: CommandCategory.STICKERS,
      description: 'Create sticker from image',
      usage: '/sticker [reply to image]',
      examples: ['/sticker'],
      cooldown: 30,
      roles: [UserRole.USER, UserRole.ADMIN, UserRole.OWNER],
    },
    handler: async (ctx: BotContext) => {
      await ctx.reply(ctx.t('sticker.success'));
    },
  },
  {
    metadata: {
      name: 'toimg',
      aliases: ['toimage'],
      category: CommandCategory.STICKERS,
      description: 'Convert sticker to image',
      usage: '/toimg [reply to sticker]',
      examples: ['/toimg'],
      cooldown: 30,
      roles: [UserRole.USER, UserRole.ADMIN, UserRole.OWNER],
    },
    handler: async (ctx: BotContext) => {
      await ctx.reply(ctx.t('toimg.success'));
    },
  },
  {
    metadata: {
      name: 'bgremove',
      aliases: ['removebg', 'nobg'],
      category: CommandCategory.STICKERS,
      description: 'Remove background from image',
      usage: '/bgremove [reply to image]',
      examples: ['/bgremove'],
      cooldown: 60,
      roles: [UserRole.USER, UserRole.ADMIN, UserRole.OWNER],
    },
    handler: async (ctx: BotContext) => {
      await ctx.reply(ctx.t('bgremove.success'));
    },
  },
  {
    metadata: {
      name: 'upscale',
      aliases: ['enhance'],
      category: CommandCategory.STICKERS,
      description: 'Upscale image quality',
      usage: '/upscale [reply to image]',
      examples: ['/upscale'],
      cooldown: 120,
      roles: [UserRole.USER, UserRole.ADMIN, UserRole.OWNER],
    },
    handler: async (ctx: BotContext) => {
      await ctx.reply(ctx.t('upscale.success'));
    },
  },
  {
    metadata: {
      name: 'watermark',
      aliases: ['wm'],
      category: CommandCategory.STICKERS,
      description: 'Add watermark to image',
      usage: '/watermark <text> [reply to image]',
      examples: ['/watermark My Brand'],
      cooldown: 60,
      roles: [UserRole.USER, UserRole.ADMIN, UserRole.OWNER],
    },
    handler: async (ctx: BotContext) => {
      await ctx.reply(ctx.t('watermark.success'));
    },
  },
];