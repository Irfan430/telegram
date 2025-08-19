import { logger, createContextLogger, ContextLogger } from '@/core/logger';

describe('Logger', () => {
  it('should create a logger instance', () => {
    expect(logger).toBeDefined();
    expect(typeof logger.info).toBe('function');
    expect(typeof logger.error).toBe('function');
  });

  it('should create a context logger', () => {
    const context = {
      requestId: 'test-123',
      userId: 123456,
      chatId: 789012,
      command: 'test',
      shardId: 1,
    };

    const contextLogger = createContextLogger(context);
    expect(contextLogger).toBeInstanceOf(ContextLogger);
  });

  it('should log messages with context', () => {
    const context = {
      requestId: 'test-123',
      userId: 123456,
      chatId: 789012,
      command: 'test',
    };

    const contextLogger = createContextLogger(context);
    
    // Mock console.log to capture output
    const originalLog = console.log;
    const logs: string[] = [];
    console.log = jest.fn((...args) => {
      logs.push(args.join(' '));
    });

    contextLogger.info('Test message');
    
    expect(console.log).toHaveBeenCalled();
    
    // Restore console.log
    console.log = originalLog;
  });
});