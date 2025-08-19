import { BotContext } from '@/types';
import { quotaManager, QuotaType } from '@/core/quotaManager';

export async function stt(ctx: BotContext): Promise<void> {
  if (!ctx.message?.reply_to_message?.voice && !ctx.message?.reply_to_message?.audio) {
    await ctx.reply(ctx.t('errors.validation'));
    return;
  }

  try {
    await quotaManager.consumeQuota(
      ctx.from!.id,
      QuotaType.AI_REQUESTS,
      1,
      ctx.session.user?.role || 'user'
    );

    const processingMsg = await ctx.reply(ctx.t('stt.processing'));
    
    // Simulate processing
    await new Promise(resolve => setTimeout(resolve, 2000));
    
    const transcribedText = 'This is simulated transcribed text from the audio. In a real implementation, this would be the actual speech-to-text conversion result.';
    
    await ctx.api.editMessageText(
      ctx.chat!.id,
      processingMsg.message_id,
      `🎤 <b>Speech-to-Text Result</b>\n\n📝 <b>Transcribed Text:</b>\n${transcribedText}`
    );
  } catch (error) {
    ctx.logger?.error('STT error', error);
    await ctx.reply(ctx.t('stt.error', { error: error.message }));
  }
}