import { logger } from '@/core/logger';

// Supported languages
export type Language = 'bn' | 'en';

// Translation interface
interface Translation {
  [key: string]: string | Translation;
}

// Translations
const translations: Record<Language, Translation> = {
  bn: {
    // Common
    common: {
      back: '🔙 পিছনে',
      home: '🏠 হোম',
      cancel: '❌ বাতিল',
      save: '💾 সংরক্ষণ',
      loading: '⏳ লোড হচ্ছে...',
      error: '❌ ত্রুটি',
      success: '✅ সফল',
      notFound: '🔍 পাওয়া যায়নি',
      permission: '🚫 অনুমতি নেই',
      validation: '⚠️ ভুল ইনপুট',
      internal: '💥 অভ্যন্তরীণ ত্রুটি',
    },
    // Start
    start: {
      welcome: '🎉 <b>HyperGiga TG Bot</b> এ স্বাগতম!\n\nআমি একটি শক্তিশালী টেলিগ্রাম বট যা আপনাকে বিভিন্ন কাজে সাহায্য করতে পারে।\n\n🔧 <b>উপলব্ধ বৈশিষ্ট্য:</b>\n• 📥 মিডিয়া ডাউনলোড\n• 🤖 AI সহায়তা\n• 🎨 স্টিকার তৈরি\n• 🎮 গেমস\n• 🔧 ইউটিলিটি টুলস\n\n/help কমান্ড ব্যবহার করে আরও জানুন!',
      help: '❓ সাহায্য',
      settings: '⚙️ সেটিংস',
    },
    // Help
    help: {
      title: '📚 <b>কমান্ড সাহায্য</b>',
      categories: '📂 <b>ক্যাটাগরি:</b>',
      usage: '📖 <b>ব্যবহার:</b>',
      examples: '💡 <b>উদাহরণ:</b>',
      cooldown: '⏱️ <b>কুলডাউন:</b>',
      roles: '👥 <b>অনুমতি:</b>',
      backToCategories: '🔙 ক্যাটাগরিতে ফিরে যান',
      backToHelp: '🔙 সাহায্যে ফিরে যান',
    },
    // Language
    lang: {
      current: '🌐 <b>বর্তমান ভাষা:</b> {language}',
      select: '🌐 <b>ভাষা নির্বাচন করুন:</b>',
      changed: '✅ ভাষা পরিবর্তন করা হয়েছে: {language}',
    },
    // Me
    me: {
      profile: '👤 <b>প্রোফাইল</b>\n\n👤 <b>ব্যবহারকারী:</b> {username}\n👑 <b>ভূমিকা:</b> {role}\n📅 <b>যোগদান:</b> {joined}\n🏆 <b>ব্যাজ:</b> {badges}',
      quota: '📊 <b>কোটা ব্যবহার</b>\n\n📝 <b>কমান্ড:</b> {commands_used}/{commands_limit}\n📥 <b>ডাউনলোড:</b> {downloads_used}/{downloads_limit}\n🤖 <b>AI অনুরোধ:</b> {ai_used}/{ai_limit}\n🎨 <b>মিডিয়া রূপান্তর:</b> {media_used}/{media_limit}\n\n🔄 <b>রিসেট:</b> {reset_time}',
    },
    // Settings
    settings: {
      title: '⚙️ <b>সেটিংস</b>',
      language: '🌐 ভাষা',
      notifications: '🔔 বিজ্ঞপ্তি',
      privacy: '🔒 গোপনীয়তা',
      save: '💾 সংরক্ষণ',
    },
    // Ping
    ping: {
      response: '🏓 <b>পিং:</b> {latency}ms',
    },
    // Uptime
    uptime: {
      response: '⏱️ <b>আপটাইম:</b> {uptime}',
    },
    // Stats
    stats: {
      title: '📊 <b>বট পরিসংখ্যান</b>',
      users: '👥 <b>মোট ব্যবহারকারী:</b> {count}',
      chats: '💬 <b>সক্রিয় চ্যাট:</b> {count}',
      commands: '📝 <b>মোট কমান্ড:</b> {count}',
      uptime: '⏱️ <b>আপটাইম:</b> {uptime}',
    },
    // Download
    download: {
      processing: '📥 ডাউনলোড হচ্ছে...',
      success: '✅ ডাউনলোড সম্পন্ন!',
      error: '❌ ডাউনলোড ত্রুটি: {error}',
      unsupported: '❌ অসমর্থিত URL',
    },
    // Convert
    convert: {
      processing: '🔄 রূপান্তর হচ্ছে...',
      success: '✅ রূপান্তর সম্পন্ন!',
      error: '❌ রূপান্তর ত্রুটি: {error}',
    },
    // YouTube
    yt: {
      searching: '🔍 অনুসন্ধান হচ্ছে...',
      results: '📺 <b>YouTube ফলাফল:</b>',
      noResults: '❌ কোন ফলাফল পাওয়া যায়নি',
    },
    // AI Commands
    ask: {
      processing: '🤖 AI চিন্তা করছে...',
      error: '❌ AI ত্রুটি: {error}',
    },
    summarize: {
      processing: '📝 সারসংক্ষেপ তৈরি হচ্ছে...',
      error: '❌ সারসংক্ষেপ ত্রুটি: {error}',
    },
    translate: {
      processing: '🌐 অনুবাদ হচ্ছে...',
      error: '❌ অনুবাদ ত্রুটি: {error}',
    },
    ocr: {
      processing: '👁️ টেক্সট চিহ্নিত করা হচ্ছে...',
      error: '❌ OCR ত্রুটি: {error}',
    },
    tts: {
      processing: '🔊 অডিও তৈরি হচ্ছে...',
      error: '❌ TTS ত্রুটি: {error}',
    },
    stt: {
      processing: '🎤 টেক্সট রূপান্তর হচ্ছে...',
      error: '❌ STT ত্রুটি: {error}',
    },
    // Sticker Commands
    sticker: {
      success: '🎨 স্টিকার তৈরি হয়েছে!',
    },
    toimg: {
      success: '🖼️ ছবিতে রূপান্তরিত হয়েছে!',
    },
    bgremove: {
      success: '🎭 ব্যাকগ্রাউন্ড সরানো হয়েছে!',
    },
    upscale: {
      success: '🔍 ছবির মান উন্নত হয়েছে!',
    },
    watermark: {
      success: '💧 ওয়াটারমার্ক যোগ করা হয়েছে!',
    },
    // Utility Commands
    shorten: {
      success: '🔗 URL সংক্ষিপ্ত করা হয়েছে!',
    },
    expand: {
      success: '🔗 URL প্রসারিত করা হয়েছে!',
    },
    wiki: {
      success: '📚 উইকিপিডিয়া তথ্য পাওয়া গেছে!',
    },
    define: {
      success: '📖 শব্দের সংজ্ঞা পাওয়া গেছে!',
    },
    remind: {
      success: '⏰ রিমাইন্ডার সেট করা হয়েছে!',
    },
    todo: {
      success: '📝 টুডু তালিকা আপডেট হয়েছে!',
    },
    poll: {
      success: '🗳️ পোল তৈরি হয়েছে!',
    },
    quiz: {
      success: '🧠 কুইজ শুরু হয়েছে!',
    },
    // Game Commands
    rpg: {
      success: '⚔️ RPG গেম শুরু হয়েছে!',
    },
    tictactoe: {
      success: '⭕ টিক-ট্যাক-টো গেম শুরু হয়েছে!',
    },
    chess: {
      success: '♟️ দাবা গেম শুরু হয়েছে!',
    },
    trivia: {
      success: '🧠 ট্রিভিয়া প্রশ্ন!',
    },
    leaderboard: {
      success: '🏆 লিডারবোর্ড দেখানো হচ্ছে!',
    },
    // Admin Commands
    mod: {
      enabled: '🛡️ মডারেশন সক্রিয়!',
    },
    warn: {
      success: '⚠️ সতর্কতা দেওয়া হয়েছে!',
    },
    mute: {
      success: '🔇 ব্যবহারকারী নীরব করা হয়েছে!',
    },
    ban: {
      success: '🚫 ব্যবহারকারী নিষিদ্ধ করা হয়েছে!',
    },
    purge: {
      success: '🗑️ বার্তা মুছে ফেলা হয়েছে!',
    },
    slowmode: {
      set: '🐌 স্লো মোড সেট করা হয়েছে!',
    },
    welcome: {
      enabled: '👋 স্বাগত বার্তা সক্রিয়!',
    },
    goodbye: {
      enabled: '👋 বিদায় বার্তা সক্রিয়!',
    },
    // Errors
    errors: {
      notFound: '❌ কমান্ড পাওয়া যায়নি: {command}',
      permission: '🚫 এই কমান্ড ব্যবহার করার অনুমতি নেই',
      validation: '⚠️ ভুল ইনপুট। /help দেখুন',
      internal: '💥 অভ্যন্তরীণ ত্রুটি। পরে আবার চেষ্টা করুন',
    },
  },
  en: {
    // Common
    common: {
      back: '🔙 Back',
      home: '🏠 Home',
      cancel: '❌ Cancel',
      save: '💾 Save',
      loading: '⏳ Loading...',
      error: '❌ Error',
      success: '✅ Success',
      notFound: '🔍 Not found',
      permission: '🚫 Permission denied',
      validation: '⚠️ Invalid input',
      internal: '💥 Internal error',
    },
    // Start
    start: {
      welcome: '🎉 <b>Welcome to HyperGiga TG Bot!</b>\n\nI\'m a powerful Telegram bot that can help you with various tasks.\n\n🔧 <b>Available features:</b>\n• 📥 Media downloads\n• 🤖 AI assistance\n• 🎨 Sticker creation\n• 🎮 Games\n• 🔧 Utility tools\n\nUse /help command to learn more!',
      help: '❓ Help',
      settings: '⚙️ Settings',
    },
    // Help
    help: {
      title: '📚 <b>Command Help</b>',
      categories: '📂 <b>Categories:</b>',
      usage: '📖 <b>Usage:</b>',
      examples: '💡 <b>Examples:</b>',
      cooldown: '⏱️ <b>Cooldown:</b>',
      roles: '👥 <b>Permissions:</b>',
      backToCategories: '🔙 Back to categories',
      backToHelp: '🔙 Back to help',
    },
    // Language
    lang: {
      current: '🌐 <b>Current language:</b> {language}',
      select: '🌐 <b>Select language:</b>',
      changed: '✅ Language changed to: {language}',
    },
    // Me
    me: {
      profile: '👤 <b>Profile</b>\n\n👤 <b>User:</b> {username}\n👑 <b>Role:</b> {role}\n📅 <b>Joined:</b> {joined}\n🏆 <b>Badges:</b> {badges}',
      quota: '📊 <b>Quota Usage</b>\n\n📝 <b>Commands:</b> {commands_used}/{commands_limit}\n📥 <b>Downloads:</b> {downloads_used}/{downloads_limit}\n🤖 <b>AI Requests:</b> {ai_used}/{ai_limit}\n🎨 <b>Media Conversions:</b> {media_used}/{media_limit}\n\n🔄 <b>Reset:</b> {reset_time}',
    },
    // Settings
    settings: {
      title: '⚙️ <b>Settings</b>',
      language: '🌐 Language',
      notifications: '🔔 Notifications',
      privacy: '🔒 Privacy',
      save: '💾 Save',
    },
    // Ping
    ping: {
      response: '🏓 <b>Ping:</b> {latency}ms',
    },
    // Uptime
    uptime: {
      response: '⏱️ <b>Uptime:</b> {uptime}',
    },
    // Stats
    stats: {
      title: '📊 <b>Bot Statistics</b>',
      users: '👥 <b>Total users:</b> {count}',
      chats: '💬 <b>Active chats:</b> {count}',
      commands: '📝 <b>Total commands:</b> {count}',
      uptime: '⏱️ <b>Uptime:</b> {uptime}',
    },
    // Download
    download: {
      processing: '📥 Downloading...',
      success: '✅ Download completed!',
      error: '❌ Download error: {error}',
      unsupported: '❌ Unsupported URL',
    },
    // Convert
    convert: {
      processing: '🔄 Converting...',
      success: '✅ Conversion completed!',
      error: '❌ Conversion error: {error}',
    },
    // YouTube
    yt: {
      searching: '🔍 Searching...',
      results: '📺 <b>YouTube Results:</b>',
      noResults: '❌ No results found',
    },
    // AI Commands
    ask: {
      processing: '🤖 AI is thinking...',
      error: '❌ AI error: {error}',
    },
    summarize: {
      processing: '📝 Creating summary...',
      error: '❌ Summary error: {error}',
    },
    translate: {
      processing: '🌐 Translating...',
      error: '❌ Translation error: {error}',
    },
    ocr: {
      processing: '👁️ Extracting text...',
      error: '❌ OCR error: {error}',
    },
    tts: {
      processing: '🔊 Generating audio...',
      error: '❌ TTS error: {error}',
    },
    stt: {
      processing: '🎤 Converting to text...',
      error: '❌ STT error: {error}',
    },
    // Sticker Commands
    sticker: {
      success: '🎨 Sticker created!',
    },
    toimg: {
      success: '🖼️ Converted to image!',
    },
    bgremove: {
      success: '🎭 Background removed!',
    },
    upscale: {
      success: '🔍 Image enhanced!',
    },
    watermark: {
      success: '💧 Watermark added!',
    },
    // Utility Commands
    shorten: {
      success: '🔗 URL shortened!',
    },
    expand: {
      success: '🔗 URL expanded!',
    },
    wiki: {
      success: '📚 Wikipedia information found!',
    },
    define: {
      success: '📖 Word definition found!',
    },
    remind: {
      success: '⏰ Reminder set!',
    },
    todo: {
      success: '📝 Todo list updated!',
    },
    poll: {
      success: '🗳️ Poll created!',
    },
    quiz: {
      success: '🧠 Quiz started!',
    },
    // Game Commands
    rpg: {
      success: '⚔️ RPG game started!',
    },
    tictactoe: {
      success: '⭕ Tic-tac-toe game started!',
    },
    chess: {
      success: '♟️ Chess game started!',
    },
    trivia: {
      success: '🧠 Trivia question!',
    },
    leaderboard: {
      success: '🏆 Showing leaderboard!',
    },
    // Admin Commands
    mod: {
      enabled: '🛡️ Moderation enabled!',
    },
    warn: {
      success: '⚠️ Warning issued!',
    },
    mute: {
      success: '🔇 User muted!',
    },
    ban: {
      success: '🚫 User banned!',
    },
    purge: {
      success: '🗑️ Messages deleted!',
    },
    slowmode: {
      set: '🐌 Slow mode set!',
    },
    welcome: {
      enabled: '👋 Welcome message enabled!',
    },
    goodbye: {
      enabled: '👋 Goodbye message enabled!',
    },
    // Errors
    errors: {
      notFound: '❌ Command not found: {command}',
      permission: '🚫 You don\'t have permission to use this command',
      validation: '⚠️ Invalid input. See /help',
      internal: '💥 Internal error. Try again later',
    },
  },
};

// I18n manager
export class I18nManager {
  private static instance: I18nManager;
  private defaultLanguage: Language = 'bn';

  private constructor() {}

  static getInstance(): I18nManager {
    if (!I18nManager.instance) {
      I18nManager.instance = new I18nManager();
    }
    return I18nManager.instance;
  }

  async initialize(): Promise<void> {
    logger.info('i18n initialized', { defaultLanguage: this.defaultLanguage });
  }

  t(key: string, lang: Language = this.defaultLanguage, params?: Record<string, any>): string {
    const keys = key.split('.');
    let value: any = translations[lang] || translations[this.defaultLanguage];

    for (const k of keys) {
      if (value && typeof value === 'object' && k in value) {
        value = value[k];
      } else {
        // Fallback to default language
        value = translations[this.defaultLanguage];
        for (const fallbackKey of keys) {
          if (value && typeof value === 'object' && fallbackKey in value) {
            value = value[fallbackKey];
          } else {
            return key; // Return key if not found
          }
        }
        break;
      }
    }

    if (typeof value !== 'string') {
      return key;
    }

    if (params) {
      return value.replace(/\{(\w+)\}/g, (match, param) => {
        return params[param] !== undefined ? String(params[param]) : match;
      });
    }

    return value;
  }

  tWithFallback(key: string, lang: Language, fallbackLang: Language = 'en', params?: Record<string, any>): string {
    const result = this.t(key, lang, params);
    if (result === key && lang !== fallbackLang) {
      return this.t(key, fallbackLang, params);
    }
    return result;
  }

  has(key: string, lang: Language = this.defaultLanguage): boolean {
    const keys = key.split('.');
    let value: any = translations[lang];

    for (const k of keys) {
      if (value && typeof value === 'object' && k in value) {
        value = value[k];
      } else {
        return false;
      }
    }

    return typeof value === 'string';
  }

  getAll(key: string, params?: Record<string, any>): Record<Language, string> {
    const result: Record<Language, string> = {} as Record<Language, string>;
    for (const lang of this.getSupportedLanguages()) {
      result[lang] = this.t(key, lang, params);
    }
    return result;
  }

  setDefaultLanguage(lang: Language): void {
    this.defaultLanguage = lang;
  }

  getDefaultLanguage(): Language {
    return this.defaultLanguage;
  }

  getSupportedLanguages(): Language[] {
    return Object.keys(translations) as Language[];
  }

  getLanguageName(lang: Language): string {
    const names: Record<Language, string> = {
      bn: 'বাংলা',
      en: 'English',
    };
    return names[lang] || lang;
  }

  formatDate(date: Date, lang: Language = this.defaultLanguage): string {
    if (lang === 'bn') {
      return date.toLocaleDateString('bn-BD');
    }
    return date.toLocaleDateString('en-US');
  }

  formatTime(date: Date, lang: Language = this.defaultLanguage): string {
    if (lang === 'bn') {
      return date.toLocaleTimeString('bn-BD');
    }
    return date.toLocaleTimeString('en-US');
  }

  formatNumber(num: number, lang: Language = this.defaultLanguage): string {
    if (lang === 'bn') {
      return num.toLocaleString('bn-BD');
    }
    return num.toLocaleString('en-US');
  }

  formatDuration(seconds: number, lang: Language = this.defaultLanguage): string {
    const days = Math.floor(seconds / 86400);
    const hours = Math.floor((seconds % 86400) / 3600);
    const minutes = Math.floor((seconds % 3600) / 60);
    const secs = seconds % 60;

    const parts: string[] = [];
    if (days > 0) parts.push(`${days}d`);
    if (hours > 0) parts.push(`${hours}h`);
    if (minutes > 0) parts.push(`${minutes}m`);
    if (secs > 0 || parts.length === 0) parts.push(`${secs}s`);

    return parts.join(' ');
  }
}

// Export singleton instance
export const i18n = I18nManager.getInstance();