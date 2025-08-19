import { BotContext } from '@/types';
import { CommandMetadata, CommandCategory, UserRole } from '@/types';
import { start } from './start';
import { help } from './help';
import { lang } from './lang';
import { me } from './me';
import { settings } from './settings';
import { ping } from './ping';
import { uptime } from './uptime';
import { stats } from './stats';

// Core commands
export const coreCommands: Array<{
  metadata: CommandMetadata;
  handler: (ctx: BotContext) => Promise<void>;
}> = [
  {
    metadata: {
      name: 'start',
      aliases: [],
      category: CommandCategory.CORE,
      description: 'Start the bot and see welcome message',
      usage: '/start',
      examples: ['/start'],
      cooldown: 0,
      roles: [UserRole.USER, UserRole.ADMIN, UserRole.OWNER],
    },
    handler: start,
  },
  {
    metadata: {
      name: 'help',
      aliases: ['h', 'menu'],
      category: CommandCategory.CORE,
      description: 'Show help menu with all commands',
      usage: '/help [category|command]',
      examples: ['/help', '/help media', '/help download'],
      cooldown: 5,
      roles: [UserRole.USER, UserRole.ADMIN, UserRole.OWNER],
    },
    handler: help,
  },
  {
    metadata: {
      name: 'lang',
      aliases: ['language'],
      category: CommandCategory.CORE,
      description: 'Change bot language',
      usage: '/lang [bn|en]',
      examples: ['/lang', '/lang bn', '/lang en'],
      cooldown: 10,
      roles: [UserRole.USER, UserRole.ADMIN, UserRole.OWNER],
    },
    handler: lang,
  },
  {
    metadata: {
      name: 'me',
      aliases: ['profile'],
      category: CommandCategory.CORE,
      description: 'Show your profile and quota information',
      usage: '/me [quota]',
      examples: ['/me', '/me quota'],
      cooldown: 5,
      roles: [UserRole.USER, UserRole.ADMIN, UserRole.OWNER],
    },
    handler: me,
  },
  {
    metadata: {
      name: 'settings',
      aliases: ['config'],
      category: CommandCategory.CORE,
      description: 'Manage your settings',
      usage: '/settings',
      examples: ['/settings'],
      cooldown: 5,
      roles: [UserRole.USER, UserRole.ADMIN, UserRole.OWNER],
    },
    handler: settings,
  },
  {
    metadata: {
      name: 'ping',
      aliases: ['pong'],
      category: CommandCategory.CORE,
      description: 'Check bot latency',
      usage: '/ping',
      examples: ['/ping'],
      cooldown: 5,
      roles: [UserRole.USER, UserRole.ADMIN, UserRole.OWNER],
    },
    handler: ping,
  },
  {
    metadata: {
      name: 'uptime',
      aliases: ['status'],
      category: CommandCategory.CORE,
      description: 'Show bot uptime',
      usage: '/uptime',
      examples: ['/uptime'],
      cooldown: 10,
      roles: [UserRole.USER, UserRole.ADMIN, UserRole.OWNER],
    },
    handler: uptime,
  },
  {
    metadata: {
      name: 'stats',
      aliases: ['statistics'],
      category: CommandCategory.CORE,
      description: 'Show bot statistics',
      usage: '/stats',
      examples: ['/stats'],
      cooldown: 30,
      roles: [UserRole.ADMIN, UserRole.OWNER],
    },
    handler: stats,
  },
];