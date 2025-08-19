import { BotContext } from '@/types';
import { CommandMetadata, CommandCategory, UserRole } from '@/types';
import { download } from './download';
import { convert } from './convert';
import { yt } from './yt';

// Media commands
export const mediaCommands: Array<{
  metadata: CommandMetadata;
  handler: (ctx: BotContext) => Promise<void>;
}> = [
  {
    metadata: {
      name: 'download',
      aliases: ['dl'],
      category: CommandCategory.MEDIA,
      description: 'Download media from URL',
      usage: '/download <url>',
      examples: ['/download https://example.com/video.mp4'],
      cooldown: 30,
      roles: [UserRole.USER, UserRole.ADMIN, UserRole.OWNER],
    },
    handler: download,
  },
  {
    metadata: {
      name: 'convert',
      aliases: ['conv'],
      category: CommandCategory.MEDIA,
      description: 'Convert media format',
      usage: '/convert <audio|video|image> <url>',
      examples: ['/convert audio https://example.com/video.mp4'],
      cooldown: 60,
      roles: [UserRole.USER, UserRole.ADMIN, UserRole.OWNER],
    },
    handler: convert,
  },
  {
    metadata: {
      name: 'yt',
      aliases: ['youtube'],
      category: CommandCategory.MEDIA,
      description: 'Search and download from YouTube',
      usage: '/yt <query>',
      examples: ['/yt funny cat videos'],
      cooldown: 30,
      roles: [UserRole.USER, UserRole.ADMIN, UserRole.OWNER],
    },
    handler: yt,
  },
];