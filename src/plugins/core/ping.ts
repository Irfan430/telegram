import { BotContext } from '@/types';

// Ping command handler
export async function ping(ctx: BotContext): Promise<void> {
  const startTime = Date.now();
  
  try {
    // Send a test message to measure latency
    const message = await ctx.reply('🏓 Pinging...');
    
    const endTime = Date.now();
    const latency = endTime - startTime;
    
    // Edit the message with the result
    await ctx.api.editMessageText(
      ctx.chat!.id,
      message.message_id,
      ctx.t('ping.response', { latency })
    );
  } catch (error) {
    ctx.logger?.error('Error in ping command', error);
    await ctx.reply(ctx.t('errors.internal'));
  }
}