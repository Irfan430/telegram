import { BotContext } from '@/types';
import { CommandMetadata, CommandCategory, UserRole } from '@/types';
import { ask } from './ask';
import { summarize } from './summarize';
import { translate } from './translate';
import { ocr } from './ocr';
import { tts } from './tts';
import { stt } from './stt';

// AI commands
export const aiCommands: Array<{
  metadata: CommandMetadata;
  handler: (ctx: BotContext) => Promise<void>;
}> = [
  {
    metadata: {
      name: 'ask',
      aliases: ['ai', 'chat'],
      category: CommandCategory.AI,
      description: 'Ask AI assistant a question',
      usage: '/ask <question>',
      examples: ['/ask What is the capital of France?'],
      cooldown: 10,
      roles: [UserRole.USER, UserRole.ADMIN, UserRole.OWNER],
    },
    handler: ask,
  },
  {
    metadata: {
      name: 'summarize',
      aliases: ['sum'],
      category: CommandCategory.AI,
      description: 'Summarize text or URL content',
      usage: '/summarize <text|url>',
      examples: ['/summarize https://example.com/article'],
      cooldown: 30,
      roles: [UserRole.USER, UserRole.ADMIN, UserRole.OWNER],
    },
    handler: summarize,
  },
  {
    metadata: {
      name: 'translate',
      aliases: ['trans'],
      category: CommandCategory.AI,
      description: 'Translate text to another language',
      usage: '/translate <text> [target_lang]',
      examples: ['/translate Hello world', '/translate Bonjour en'],
      cooldown: 15,
      roles: [UserRole.USER, UserRole.ADMIN, UserRole.OWNER],
    },
    handler: translate,
  },
  {
    metadata: {
      name: 'ocr',
      aliases: ['text'],
      category: CommandCategory.AI,
      description: 'Extract text from image (reply to image)',
      usage: '/ocr (reply to image)',
      examples: ['/ocr (reply to image)'],
      cooldown: 20,
      roles: [UserRole.USER, UserRole.ADMIN, UserRole.OWNER],
    },
    handler: ocr,
  },
  {
    metadata: {
      name: 'tts',
      aliases: ['speak'],
      category: CommandCategory.AI,
      description: 'Convert text to speech',
      usage: '/tts <text>',
      examples: ['/tts Hello world'],
      cooldown: 20,
      roles: [UserRole.USER, UserRole.ADMIN, UserRole.OWNER],
    },
    handler: tts,
  },
  {
    metadata: {
      name: 'stt',
      aliases: ['listen'],
      category: CommandCategory.AI,
      description: 'Convert speech to text (reply to voice)',
      usage: '/stt (reply to voice message)',
      examples: ['/stt (reply to voice message)'],
      cooldown: 20,
      roles: [UserRole.USER, UserRole.ADMIN, UserRole.OWNER],
    },
    handler: stt,
  },
];