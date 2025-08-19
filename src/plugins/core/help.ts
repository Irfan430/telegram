import { BotContext } from '@/types';
import { InlineKeyboard } from 'grammy';
import { commandRegistry } from '@/core/commandRouter';
import { CommandCategory } from '@/types';

// Help command handler
export async function help(ctx: BotContext): Promise<void> {
  const args = ctx.session.args || [];
  
  if (args.length === 0) {
    // Show main help menu
    await showMainHelp(ctx);
  } else if (args.length === 1) {
    const arg = args[0].toLowerCase();
    
    if (Object.values(CommandCategory).includes(arg as CommandCategory)) {
      // Show category help
      await showCategoryHelp(ctx, arg as CommandCategory);
    } else {
      // Show specific command help
      await showCommandHelp(ctx, arg);
    }
  } else {
    await ctx.reply(ctx.t('errors.validation'));
  }
}

// Show main help menu
async function showMainHelp(ctx: BotContext): Promise<void> {
  const title = ctx.t('help.title');
  const categories = commandRegistry.getCategories();
  
  let message = `${title}\n\n`;
  message += ctx.t('help.categories.core') + '\n';
  message += ctx.t('help.categories.media') + '\n';
  message += ctx.t('help.categories.ai') + '\n';
  message += ctx.t('help.categories.stickers') + '\n';
  message += ctx.t('help.categories.utilities') + '\n';
  message += ctx.t('help.categories.games') + '\n';
  
  if (ctx.session.user?.role === 'admin' || ctx.session.user?.role === 'owner') {
    message += ctx.t('help.categories.admin') + '\n';
  }
  
  message += '\n/help <category> to see commands in that category\n';
  message += '/help <command> to see detailed help for a command';

  const keyboard = new InlineKeyboard()
    .text('🔧 Core', 'help_core')
    .text('📥 Media', 'help_media')
    .row()
    .text('🤖 AI', 'help_ai')
    .text('🎨 Stickers', 'help_stickers')
    .row()
    .text('🔧 Utilities', 'help_utilities')
    .text('🎮 Games', 'help_games');
    
  if (ctx.session.user?.role === 'admin' || ctx.session.user?.role === 'owner') {
    keyboard.row().text('👑 Admin', 'help_admin');
  }

  await ctx.reply(message, {
    reply_markup: keyboard,
    parse_mode: 'HTML',
  });
}

// Show category help
async function showCategoryHelp(ctx: BotContext, category: CommandCategory): Promise<void> {
  const commands = commandRegistry.getByCategory(category);
  
  if (commands.length === 0) {
    await ctx.reply(ctx.t('errors.notFound'));
    return;
  }
  
  const categoryNames: Record<CommandCategory, string> = {
    [CommandCategory.CORE]: ctx.t('help.categories.core'),
    [CommandCategory.MEDIA]: ctx.t('help.categories.media'),
    [CommandCategory.AI]: ctx.t('help.categories.ai'),
    [CommandCategory.STICKERS]: ctx.t('help.categories.stickers'),
    [CommandCategory.UTILITIES]: ctx.t('help.categories.utilities'),
    [CommandCategory.GAMES]: ctx.t('help.categories.games'),
    [CommandCategory.ADMIN]: ctx.t('help.categories.admin'),
  };
  
  let message = `${categoryNames[category]}\n\n`;
  
  // Group commands by first letter for better organization
  const groupedCommands = new Map<string, typeof commands>();
  
  for (const command of commands) {
    const firstLetter = command.name.charAt(0).toUpperCase();
    if (!groupedCommands.has(firstLetter)) {
      groupedCommands.set(firstLetter, []);
    }
    groupedCommands.get(firstLetter)!.push(command);
  }
  
  for (const [letter, cmds] of groupedCommands) {
    message += `<b>${letter}</b>\n`;
    for (const cmd of cmds) {
      message += `• /${cmd.name} - ${cmd.description}\n`;
    }
    message += '\n';
  }
  
  message += `\nUse /help <command> for detailed information`;

  const keyboard = new InlineKeyboard()
    .text(ctx.t('help.back'), 'help_main')
    .text(ctx.t('help.home'), 'start');

  await ctx.reply(message, {
    reply_markup: keyboard,
    parse_mode: 'HTML',
  });
}

// Show specific command help
async function showCommandHelp(ctx: BotContext, commandName: string): Promise<void> {
  const command = commandRegistry.get(commandName);
  
  if (!command) {
    await ctx.reply(ctx.t('errors.notFound', { command: commandName }));
    return;
  }
  
  const { metadata } = command;
  
  let message = `<b>/${metadata.name}</b>\n\n`;
  message += `${metadata.description}\n\n`;
  message += `<b>${ctx.t('help.usage')}</b>\n<code>${metadata.usage}</code>\n\n`;
  
  if (metadata.examples.length > 0) {
    message += `<b>${ctx.t('help.examples')}</b>\n`;
    for (const example of metadata.examples) {
      message += `<code>${example}</code>\n`;
    }
    message += '\n';
  }
  
  message += `<b>${ctx.t('help.cooldown')}</b> ${metadata.cooldown}s\n`;
  message += `<b>${ctx.t('help.roles')}</b> ${metadata.roles.join(', ')}`;
  
  if (metadata.aliases.length > 0) {
    message += `\n<b>Aliases:</b> ${metadata.aliases.map(alias => `/${alias}`).join(', ')}`;
  }

  const keyboard = new InlineKeyboard()
    .text(ctx.t('help.back'), `help_${metadata.category}`)
    .text(ctx.t('help.home'), 'start');

  await ctx.reply(message, {
    reply_markup: keyboard,
    parse_mode: 'HTML',
  });
}