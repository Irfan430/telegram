import { BotContext } from '@/types';
import { logger } from './logger';
import { CommandMetadata, CommandCategory } from '@/types';
import { coreCommands } from '@/plugins/core';
import { mediaCommands } from '@/plugins/media';
import { aiCommands } from '@/plugins/ai';
import { stickerCommands } from '@/plugins/stickers';
import { utilityCommands } from '@/plugins/utilities';
import { gameCommands } from '@/plugins/games';
import { adminCommands } from '@/plugins/admin';

// Command registry
class CommandRegistry {
  private commands = new Map<string, {
    handler: (ctx: BotContext) => Promise<void>;
    metadata: CommandMetadata;
  }>();

  // Register a command
  register(metadata: CommandMetadata, handler: (ctx: BotContext) => Promise<void>): void {
    // Register main command
    this.commands.set(metadata.name, { handler, metadata });

    // Register aliases
    for (const alias of metadata.aliases) {
      this.commands.set(alias, { handler, metadata });
    }

    logger.debug('Command registered', { name: metadata.name, aliases: metadata.aliases });
  }

  // Get command handler
  get(command: string): { handler: (ctx: BotContext) => Promise<void>; metadata: CommandMetadata } | undefined {
    return this.commands.get(command);
  }

  // Get all commands
  getAll(): Map<string, { handler: (ctx: BotContext) => Promise<void>; metadata: CommandMetadata }> {
    return this.commands;
  }

  // Get commands by category
  getByCategory(category: CommandCategory): CommandMetadata[] {
    const result: CommandMetadata[] = [];
    
    for (const [_, command] of this.commands) {
      if (command.metadata.category === category && !command.metadata.hidden) {
        result.push(command.metadata);
      }
    }
    
    return result;
  }

  // Get all categories
  getCategories(): CommandCategory[] {
    const categories = new Set<CommandCategory>();
    
    for (const [_, command] of this.commands) {
      if (!command.metadata.hidden) {
        categories.add(command.metadata.category);
      }
    }
    
    return Array.from(categories);
  }
}

// Create command registry instance
const commandRegistry = new CommandRegistry();

// Register all commands
function registerCommands(): void {
  // Core commands
  coreCommands.forEach(({ metadata, handler }) => {
    commandRegistry.register(metadata, handler);
  });

  // Media commands
  mediaCommands.forEach(({ metadata, handler }) => {
    commandRegistry.register(metadata, handler);
  });

  // AI commands
  aiCommands.forEach(({ metadata, handler }) => {
    commandRegistry.register(metadata, handler);
  });

  // Sticker commands
  stickerCommands.forEach(({ metadata, handler }) => {
    commandRegistry.register(metadata, handler);
  });

  // Utility commands
  utilityCommands.forEach(({ metadata, handler }) => {
    commandRegistry.register(metadata, handler);
  });

  // Game commands
  gameCommands.forEach(({ metadata, handler }) => {
    commandRegistry.register(metadata, handler);
  });

  // Admin commands
  adminCommands.forEach(({ metadata, handler }) => {
    commandRegistry.register(metadata, handler);
  });

  logger.info(`Registered ${commandRegistry.getAll().size} commands`);
}

// Command router middleware
export const commandRouter = async (ctx: BotContext, next: () => Promise<void>) => {
  // Only handle text messages that start with /
  if (!ctx.message?.text?.startsWith('/')) {
    await next();
    return;
  }

  const commandText = ctx.message.text.split(' ')[0].substring(1);
  const args = ctx.message.text.split(' ').slice(1);

  // Get command handler
  const command = commandRegistry.get(commandText);
  
  if (!command) {
    // Command not found
    await ctx.reply(ctx.t('errors.notFound', { command: commandText }));
    return;
  }

  // Check permissions
  const userRole = ctx.session.user?.role || 'user';
  if (!command.metadata.roles.includes(userRole)) {
    await ctx.reply(ctx.t('errors.permission'));
    return;
  }

  // Add command info to context
  ctx.session.command = commandText;
  ctx.session.args = args;
  ctx.session.commandMetadata = command.metadata;

  try {
    // Execute command
    await command.handler(ctx);
  } catch (error) {
    logger.error('Command execution error', {
      command: commandText,
      error: error.message,
      userId: ctx.from?.id,
      chatId: ctx.chat?.id,
    });

    // Send error message to user
    await ctx.reply(ctx.t('errors.internal'));
  }
};

// Export command registry for use in other modules
export { commandRegistry };

// Initialize commands
registerCommands();