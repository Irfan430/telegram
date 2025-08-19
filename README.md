# HyperGiga TG Bot

An enterprise-scale, FREE-for-all users Telegram bot platform built with TypeScript, Node.js, and GrammY.

## 🚀 Features

### Core Features
- **Multi-language Support**: Bengali and English with easy extensibility
- **Role-based Access Control**: User, Admin, and Owner roles
- **Daily Quota System**: Configurable limits for commands, downloads, AI requests, and media conversions
- **Rate Limiting**: Global, per-user, per-command, and per-chat rate limits
- **Comprehensive Logging**: Structured JSON logs with context tracking
- **Metrics & Monitoring**: Prometheus metrics with Grafana visualization
- **Health Checks**: Built-in health and readiness endpoints
- **Error Handling**: Robust error taxonomy with retry policies and circuit breakers

### Command Categories

#### 🔧 Core Commands
- `/start` - Welcome message and bot introduction
- `/help` - Interactive help system with categories
- `/lang` - Language selection (Bengali/English)
- `/me` - User profile and quota information
- `/settings` - User preferences management
- `/ping` - Bot latency check
- `/uptime` - Bot uptime information
- `/stats` - Bot statistics and metrics

#### 📥 Media Commands
- `/download` - Download media from URLs
- `/convert` - Convert media formats
- `/yt` - YouTube search and download

#### 🤖 AI Commands
- `/ask` - AI-powered question answering
- `/summarize` - Text summarization
- `/translate` - Multi-language translation
- `/ocr` - Extract text from images
- `/tts` - Text-to-speech conversion
- `/stt` - Speech-to-text conversion

#### 🎨 Sticker & Image Commands
- `/sticker` - Create stickers from images
- `/toimg` - Convert stickers to images
- `/bgremove` - Remove image backgrounds
- `/upscale` - Enhance image quality
- `/watermark` - Add watermarks to images

#### 🔧 Utility Commands
- `/shorten` - URL shortening
- `/expand` - Expand shortened URLs
- `/wiki` - Wikipedia search
- `/define` - Word definitions
- `/remind` - Set reminders
- `/todo` - Todo list management
- `/poll` - Create polls
- `/quiz` - Interactive quizzes

#### 🎮 Games & Social
- `/rpg` - RPG game system
- `/tictactoe` - Tic-tac-toe game
- `/chess` - Chess game
- `/trivia` - Trivia questions
- `/leaderboard` - Game leaderboards

#### 👑 Admin Commands
- `/mod` - Moderation settings
- `/warn` - Warn users
- `/mute` - Mute users
- `/ban` - Ban users
- `/purge` - Delete messages
- `/slowmode` - Set slow mode
- `/welcome` - Welcome message settings
- `/goodbye` - Goodbye message settings

## 🛠️ Technology Stack

- **Runtime**: Node.js 20+
- **Language**: TypeScript (strict mode)
- **Bot Framework**: GrammY
- **Database**: PostgreSQL (primary), Redis (cache/queues)
- **Logging**: Pino (JSON logs)
- **Metrics**: Prometheus client
- **Tracing**: OpenTelemetry (optional)
- **Validation**: Zod
- **Containerization**: Docker & Docker Compose
- **Orchestration**: Kubernetes (Helm charts)

## 📋 Prerequisites

- Node.js 20 or higher
- Docker and Docker Compose
- PostgreSQL 15+
- Redis 7+
- Telegram Bot Token

## 🚀 Quick Start

### 1. Clone the Repository
```bash
git clone https://github.com/your-username/hypergiga-tg-bot.git
cd hypergiga-tg-bot
```

### 2. Environment Setup
```bash
cp .env.example .env
```

Edit `.env` file with your configuration:
```env
TELEGRAM_BOT_TOKEN=your_bot_token_here
DATABASE_URL=postgresql://postgres:password@localhost:5432/hypergiga_bot
REDIS_URL=redis://localhost:6379
```

### 3. Development Setup
```bash
# Install dependencies
npm install

# Start development environment
docker-compose up -d

# Run migrations
npm run migrate

# Start development server
npm run dev
```

### 4. Production Deployment
```bash
# Build and start production containers
docker-compose -f docker-compose.prod.yml up -d

# Or build manually
docker build -t hypergiga-tg-bot .
docker run -d --name hypergiga-bot hypergiga-tg-bot
```

## 📊 Monitoring

### Health Endpoints
- `GET /healthz` - Health check
- `GET /readyz` - Readiness probe
- `GET /metrics` - Prometheus metrics
- `GET /info` - Bot information

### Metrics Dashboard
Access Grafana at `http://localhost:3001` (default: admin/admin)

### Logs
```bash
# View bot logs
docker-compose logs -f bot

# View database logs
docker-compose logs -f postgres

# View Redis logs
docker-compose logs -f redis
```

## 🔧 Configuration

### Environment Variables

| Variable | Description | Default |
|----------|-------------|---------|
| `TELEGRAM_BOT_TOKEN` | Telegram bot token | Required |
| `DATABASE_URL` | PostgreSQL connection string | Required |
| `REDIS_URL` | Redis connection string | Required |
| `LOG_LEVEL` | Logging level | `info` |
| `FEATURE_TRACING` | Enable OpenTelemetry tracing | `false` |
| `QUOTAS_DEFAULT` | Default quota limits (JSON) | See .env.example |
| `RATE_LIMIT_GLOBAL` | Global rate limit | `1000` |
| `RATE_LIMIT_PER_USER` | Per-user rate limit | `100` |
| `RATE_LIMIT_PER_COMMAND` | Per-command rate limit | `10` |

### Quota Configuration
```json
{
  "daily_commands": 1000,
  "daily_downloads": 50,
  "daily_ai_requests": 100,
  "daily_media_conversions": 20
}
```

## 🧪 Testing

```bash
# Run all tests
npm test

# Run tests with coverage
npm run test:coverage

# Run tests in watch mode
npm run test:watch

# Run integration tests
npm run test:integration
```

## 📝 Development

### Project Structure
```
src/
├── config/          # Configuration management
├── core/            # Core services (logger, metrics, etc.)
├── database/        # Database connections and migrations
├── i18n/            # Internationalization
├── middleware/      # GrammY middleware
├── plugins/         # Command plugins
│   ├── admin/       # Admin commands
│   ├── ai/          # AI commands
│   ├── core/        # Core commands
│   ├── games/       # Game commands
│   ├── media/       # Media commands
│   ├── stickers/    # Sticker commands
│   └── utilities/   # Utility commands
├── types/           # TypeScript type definitions
└── utils/           # Utility functions
```

### Adding New Commands

1. Create command handler in appropriate plugin directory:
```typescript
// src/plugins/example/mycommand.ts
import { BotContext } from '@/types';

export async function mycommand(ctx: BotContext): Promise<void> {
  await ctx.reply('Hello from my command!');
}
```

2. Register command in plugin index:
```typescript
// src/plugins/example/index.ts
import { mycommand } from './mycommand';

export const exampleCommands = [
  {
    metadata: {
      name: 'mycommand',
      category: CommandCategory.UTILITIES,
      description: 'My custom command',
      usage: '/mycommand',
      roles: [UserRole.USER, UserRole.ADMIN, UserRole.OWNER],
    },
    handler: mycommand,
  },
];
```

3. Add translations in `src/i18n/index.ts`

### Adding New Languages

1. Add language to `Language` type in `src/i18n/index.ts`
2. Add translations object for the new language
3. Update `getLanguageName` function

## 🔒 Security

- Input validation with Zod schemas
- Rate limiting and quota enforcement
- PII and secret redaction in logs
- Non-root Docker containers
- Environment-based configuration
- JWT-based authentication (for admin features)

## 📈 Performance

- Connection pooling for PostgreSQL
- Redis caching for frequently accessed data
- Efficient command routing
- Optimized media processing
- Metrics collection for performance monitoring

## 🤝 Contributing

1. Fork the repository
2. Create a feature branch (`git checkout -b feature/amazing-feature`)
3. Commit your changes (`git commit -m 'Add amazing feature'`)
4. Push to the branch (`git push origin feature/amazing-feature`)
5. Open a Pull Request

### Development Guidelines

- Follow TypeScript strict mode
- Write comprehensive tests
- Add proper error handling
- Include translations for new features
- Update documentation
- Follow the existing code style

## 📄 License

This project is licensed under the MIT License - see the [LICENSE](LICENSE) file for details.

## 🙏 Acknowledgments

- [GrammY](https://grammy.dev/) - Modern Telegram Bot API framework
- [Pino](https://getpino.io/) - Fast Node.js logger
- [Prometheus](https://prometheus.io/) - Monitoring system
- [PostgreSQL](https://www.postgresql.org/) - Reliable database
- [Redis](https://redis.io/) - In-memory data store

## 📞 Support

- **Issues**: [GitHub Issues](https://github.com/your-username/hypergiga-tg-bot/issues)
- **Discussions**: [GitHub Discussions](https://github.com/your-username/hypergiga-tg-bot/discussions)
- **Documentation**: [Wiki](https://github.com/your-username/hypergiga-tg-bot/wiki)

---

**Made with ❤️ for the Telegram community**