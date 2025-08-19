# Contributing to HyperGiga TG Bot

Thank you for your interest in contributing to HyperGiga TG Bot! This document provides guidelines and information for contributors.

## 🚀 Getting Started

### Prerequisites
- Node.js 20 or higher
- Docker and Docker Compose
- Git

### Development Setup
1. Fork the repository
2. Clone your fork: `git clone https://github.com/your-username/hypergiga-tg-bot.git`
3. Install dependencies: `npm install`
4. Copy environment file: `cp .env.example .env`
5. Start development environment: `docker-compose up -d`
6. Run tests: `npm test`

## 📝 Code Style

### TypeScript
- Use strict TypeScript mode
- Prefer `const` over `let`
- Use explicit return types for public functions
- Use interfaces for object shapes
- Avoid `any` type - use proper typing

### Naming Conventions
- Use camelCase for variables and functions
- Use PascalCase for classes and interfaces
- Use UPPER_SNAKE_CASE for constants
- Use kebab-case for file names

### File Structure
```
src/
├── config/          # Configuration files
├── core/            # Core services
├── database/        # Database related code
├── i18n/            # Internationalization
├── middleware/      # GrammY middleware
├── plugins/         # Command plugins
├── types/           # TypeScript types
└── utils/           # Utility functions
```

## 🧪 Testing

### Writing Tests
- Write tests for all new features
- Use descriptive test names
- Test both success and error cases
- Mock external dependencies
- Aim for high test coverage

### Running Tests
```bash
# Run all tests
npm test

# Run tests in watch mode
npm run test:watch

# Run tests with coverage
npm run test:coverage

# Run specific test file
npm test -- logger.test.ts
```

## 🌐 Internationalization

### Adding Translations
1. Add translation keys to `src/i18n/index.ts`
2. Provide translations for both Bengali (`bn`) and English (`en`)
3. Use parameter substitution for dynamic content: `{variable}`
4. Keep translations concise and clear

### Example
```typescript
// In src/i18n/index.ts
bn: {
  myFeature: {
    title: 'আমার বৈশিষ্ট্য',
    description: 'এটি একটি {type} বৈশিষ্ট্য',
  },
},
en: {
  myFeature: {
    title: 'My Feature',
    description: 'This is a {type} feature',
  },
},
```

## 🔧 Adding New Commands

### 1. Create Command Handler
```typescript
// src/plugins/example/mycommand.ts
import { BotContext } from '@/types';

export async function mycommand(ctx: BotContext): Promise<void> {
  try {
    // Command logic here
    await ctx.reply(ctx.t('mycommand.success'));
  } catch (error) {
    ctx.logger?.error('My command error', error);
    await ctx.reply(ctx.t('mycommand.error'));
  }
}
```

### 2. Register Command
```typescript
// src/plugins/example/index.ts
import { mycommand } from './mycommand';

export const exampleCommands = [
  {
    metadata: {
      name: 'mycommand',
      category: CommandCategory.UTILITIES,
      description: 'My custom command',
      usage: '/mycommand [options]',
      examples: ['/mycommand', '/mycommand option'],
      cooldown: 10,
      roles: [UserRole.USER, UserRole.ADMIN, UserRole.OWNER],
    },
    handler: mycommand,
  },
];
```

### 3. Add Translations
```typescript
// In src/i18n/index.ts
bn: {
  mycommand: {
    success: 'কমান্ড সফল!',
    error: 'কমান্ড ত্রুটি!',
  },
},
en: {
  mycommand: {
    success: 'Command successful!',
    error: 'Command error!',
  },
},
```

## 🔒 Security Guidelines

### Input Validation
- Always validate user input
- Use Zod schemas for validation
- Sanitize data before processing
- Implement proper error handling

### Rate Limiting
- Respect rate limits
- Implement proper quota checking
- Use appropriate cooldowns

### Secrets Management
- Never commit secrets to version control
- Use environment variables for sensitive data
- Redact sensitive information in logs

## 📊 Performance Guidelines

### Database
- Use connection pooling
- Implement proper indexing
- Avoid N+1 queries
- Use transactions when appropriate

### Caching
- Cache frequently accessed data
- Use Redis for distributed caching
- Implement cache invalidation strategies

### Memory Management
- Avoid memory leaks
- Use streams for large files
- Implement proper cleanup

## 🐛 Bug Reports

### Before Submitting
1. Check existing issues
2. Try to reproduce the bug
3. Check the logs for errors
4. Test with different configurations

### Bug Report Template
```markdown
**Bug Description**
Brief description of the bug

**Steps to Reproduce**
1. Step 1
2. Step 2
3. Step 3

**Expected Behavior**
What should happen

**Actual Behavior**
What actually happens

**Environment**
- Node.js version:
- Database version:
- Redis version:
- Environment (dev/prod):

**Logs**
Relevant log entries

**Additional Context**
Any other relevant information
```

## 💡 Feature Requests

### Before Submitting
1. Check existing feature requests
2. Consider the impact on existing features
3. Think about internationalization needs
4. Consider performance implications

### Feature Request Template
```markdown
**Feature Description**
Brief description of the feature

**Use Case**
Why this feature is needed

**Proposed Implementation**
How you think it should work

**Alternatives Considered**
Other approaches you considered

**Additional Context**
Any other relevant information
```

## 🔄 Pull Request Process

### Before Submitting
1. Ensure all tests pass
2. Update documentation if needed
3. Add translations for new features
4. Follow the code style guidelines
5. Squash commits if necessary

### Pull Request Template
```markdown
**Description**
Brief description of changes

**Type of Change**
- [ ] Bug fix
- [ ] New feature
- [ ] Breaking change
- [ ] Documentation update

**Testing**
- [ ] Unit tests pass
- [ ] Integration tests pass
- [ ] Manual testing completed

**Checklist**
- [ ] Code follows style guidelines
- [ ] Self-review completed
- [ ] Documentation updated
- [ ] Translations added
- [ ] No breaking changes (or documented)

**Screenshots** (if applicable)
```

## 📚 Documentation

### Code Documentation
- Use JSDoc for public functions
- Document complex algorithms
- Include examples in comments
- Keep documentation up to date

### User Documentation
- Update README.md for new features
- Add usage examples
- Document configuration options
- Include troubleshooting guides

## 🏷️ Versioning

We use [Semantic Versioning](https://semver.org/):
- **MAJOR**: Breaking changes
- **MINOR**: New features (backward compatible)
- **PATCH**: Bug fixes (backward compatible)

## 📞 Getting Help

- **Issues**: [GitHub Issues](https://github.com/your-username/hypergiga-tg-bot/issues)
- **Discussions**: [GitHub Discussions](https://github.com/your-username/hypergiga-tg-bot/discussions)
- **Documentation**: [Wiki](https://github.com/your-username/hypergiga-tg-bot/wiki)

## 🙏 Recognition

Contributors will be recognized in:
- README.md contributors section
- Release notes
- Project documentation

Thank you for contributing to HyperGiga TG Bot! 🚀