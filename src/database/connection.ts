import { Pool, PoolClient } from 'pg';
import { config } from '@/config/app';
import { logger } from '@/core/logger';
import { metrics } from '@/core/metrics';

// Database connection pool
const pool = new Pool({
  connectionString: config.database.url,
  max: 20,
  idleTimeoutMillis: 30000,
  connectionTimeoutMillis: 2000,
  ssl: config.server.env === 'production' ? { rejectUnauthorized: false } : false,
});

// Database manager
export class DatabaseManager {
  private static instance: DatabaseManager;
  private isConnected = false;

  private constructor() {
    this.setupEventHandlers();
  }

  static getInstance(): DatabaseManager {
    if (!DatabaseManager.instance) {
      DatabaseManager.instance = new DatabaseManager();
    }
    return DatabaseManager.instance;
  }

  private setupEventHandlers(): void {
    pool.on('connect', (client: PoolClient) => {
      logger.debug('New database client connected');
    });

    pool.on('error', (err: Error, client: PoolClient) => {
      logger.error('Unexpected error on idle client', err);
      metrics.trackError('database_connection_error');
    });

    pool.on('acquire', (client: PoolClient) => {
      logger.debug('Client acquired from pool');
    });

    pool.on('release', (client: PoolClient) => {
      logger.debug('Client released to pool');
    });
  }

  async connect(): Promise<void> {
    try {
      const startTime = Date.now();
      const client = await pool.connect();
      const duration = Date.now() - startTime;

      metrics.trackDatabaseQuery('connect', 'system', true, duration);
      client.release();

      this.isConnected = true;
      logger.info('Database connected successfully');
    } catch (error) {
      this.isConnected = false;
      logger.error('Failed to connect to database:', error);
      metrics.trackError('database_connection_failed');
      throw error;
    }
  }

  async end(): Promise<void> {
    try {
      await pool.end();
      this.isConnected = false;
      logger.info('Database connection pool closed');
    } catch (error) {
      logger.error('Error closing database pool:', error);
      throw error;
    }
  }

  async query<T = any>(text: string, params?: any[]): Promise<T[]> {
    const startTime = Date.now();
    let success = false;

    try {
      const result = await pool.query(text, params);
      success = true;
      return result.rows;
    } catch (error) {
      logger.error('Database query error:', { text, params, error });
      metrics.trackError('database_query_error');
      throw error;
    } finally {
      const duration = Date.now() - startTime;
      const table = this.extractTableFromQuery(text);
      metrics.trackDatabaseQuery('query', table, success, duration);
    }
  }

  async queryOne<T = any>(text: string, params?: any[]): Promise<T | null> {
    const results = await this.query<T>(text, params);
    return results.length > 0 ? results[0] : null;
  }

  async transaction<T>(callback: (client: PoolClient) => Promise<T>): Promise<T> {
    const client = await pool.connect();
    const startTime = Date.now();
    let success = false;

    try {
      await client.query('BEGIN');
      const result = await callback(client);
      await client.query('COMMIT');
      success = true;
      return result;
    } catch (error) {
      await client.query('ROLLBACK');
      logger.error('Transaction error:', error);
      metrics.trackError('database_transaction_error');
      throw error;
    } finally {
      const duration = Date.now() - startTime;
      metrics.trackDatabaseQuery('transaction', 'system', success, duration);
      client.release();
    }
  }

  private extractTableFromQuery(query: string): string {
    const match = query.match(/FROM\s+(\w+)/i) || query.match(/UPDATE\s+(\w+)/i) || query.match(/INSERT\s+INTO\s+(\w+)/i);
    return match ? match[1] : 'unknown';
  }

  get isConnectedToDatabase(): boolean {
    return this.isConnected;
  }

  async healthCheck(): Promise<boolean> {
    try {
      await this.query('SELECT 1');
      return true;
    } catch (error) {
      logger.error('Database health check failed:', error);
      return false;
    }
  }
}

// Export singleton instance
export const database = DatabaseManager.getInstance();

// Database migrations
export const migrations = [
  // Users table
  `
    CREATE TABLE IF NOT EXISTS users (
      id BIGINT PRIMARY KEY,
      username VARCHAR(255),
      first_name VARCHAR(255) NOT NULL,
      last_name VARCHAR(255),
      role VARCHAR(50) NOT NULL DEFAULT 'user',
      joined_at TIMESTAMP WITH TIME ZONE DEFAULT NOW(),
      last_seen TIMESTAMP WITH TIME ZONE DEFAULT NOW(),
      quota_data JSONB NOT NULL DEFAULT '{}',
      badges TEXT[] DEFAULT '{}',
      settings JSONB NOT NULL DEFAULT '{}',
      created_at TIMESTAMP WITH TIME ZONE DEFAULT NOW(),
      updated_at TIMESTAMP WITH TIME ZONE DEFAULT NOW()
    );
  `,
  
  // Chats table
  `
    CREATE TABLE IF NOT EXISTS chats (
      id BIGINT PRIMARY KEY,
      type VARCHAR(50) NOT NULL,
      title VARCHAR(255),
      username VARCHAR(255),
      settings JSONB NOT NULL DEFAULT '{}',
      created_at TIMESTAMP WITH TIME ZONE DEFAULT NOW(),
      updated_at TIMESTAMP WITH TIME ZONE DEFAULT NOW()
    );
  `,
  
  // Commands table
  `
    CREATE TABLE IF NOT EXISTS commands (
      id SERIAL PRIMARY KEY,
      user_id BIGINT NOT NULL REFERENCES users(id),
      chat_id BIGINT NOT NULL REFERENCES chats(id),
      command VARCHAR(255) NOT NULL,
      success BOOLEAN NOT NULL DEFAULT true,
      error TEXT,
      execution_time INTEGER NOT NULL,
      created_at TIMESTAMP WITH TIME ZONE DEFAULT NOW()
    );
  `,
  
  // Events table
  `
    CREATE TABLE IF NOT EXISTS events (
      id SERIAL PRIMARY KEY,
      type VARCHAR(50) NOT NULL,
      user_id BIGINT REFERENCES users(id),
      chat_id BIGINT REFERENCES chats(id),
      message_id BIGINT,
      metadata JSONB DEFAULT '{}',
      created_at TIMESTAMP WITH TIME ZONE DEFAULT NOW()
    );
  `,
  
  // Quotas table
  `
    CREATE TABLE IF NOT EXISTS quotas (
      id SERIAL PRIMARY KEY,
      user_id BIGINT NOT NULL REFERENCES users(id),
      quota_type VARCHAR(50) NOT NULL,
      used INTEGER NOT NULL DEFAULT 0,
      limit_value INTEGER NOT NULL,
      reset_at TIMESTAMP WITH TIME ZONE NOT NULL,
      created_at TIMESTAMP WITH TIME ZONE DEFAULT NOW(),
      updated_at TIMESTAMP WITH TIME ZONE DEFAULT NOW(),
      UNIQUE(user_id, quota_type)
    );
  `,
  
  // Rate limits table
  `
    CREATE TABLE IF NOT EXISTS rate_limits (
      id SERIAL PRIMARY KEY,
      key VARCHAR(255) NOT NULL,
      points INTEGER NOT NULL DEFAULT 0,
      reset_at TIMESTAMP WITH TIME ZONE NOT NULL,
      created_at TIMESTAMP WITH TIME ZONE DEFAULT NOW(),
      updated_at TIMESTAMP WITH TIME ZONE DEFAULT NOW(),
      UNIQUE(key)
    );
  `,
  
  // Indexes
  `
    CREATE INDEX IF NOT EXISTS idx_users_username ON users(username);
    CREATE INDEX IF NOT EXISTS idx_users_role ON users(role);
    CREATE INDEX IF NOT EXISTS idx_users_last_seen ON users(last_seen);
    CREATE INDEX IF NOT EXISTS idx_commands_user_id ON commands(user_id);
    CREATE INDEX IF NOT EXISTS idx_commands_chat_id ON commands(chat_id);
    CREATE INDEX IF NOT EXISTS idx_commands_created_at ON commands(created_at);
    CREATE INDEX IF NOT EXISTS idx_events_type ON events(type);
    CREATE INDEX IF NOT EXISTS idx_events_user_id ON events(user_id);
    CREATE INDEX IF NOT EXISTS idx_events_chat_id ON events(chat_id);
    CREATE INDEX IF NOT EXISTS idx_events_created_at ON events(created_at);
    CREATE INDEX IF NOT EXISTS idx_quotas_user_id ON quotas(user_id);
    CREATE INDEX IF NOT EXISTS idx_quotas_reset_at ON quotas(reset_at);
    CREATE INDEX IF NOT EXISTS idx_rate_limits_key ON rate_limits(key);
    CREATE INDEX IF NOT EXISTS idx_rate_limits_reset_at ON rate_limits(reset_at);
  `,
];

// Run migrations
export async function runMigrations(): Promise<void> {
  try {
    logger.info('Running database migrations...');
    
    for (let i = 0; i < migrations.length; i++) {
      const migration = migrations[i];
      await database.query(migration);
      logger.debug(`Migration ${i + 1}/${migrations.length} completed`);
    }
    
    logger.info('Database migrations completed successfully');
  } catch (error) {
    logger.error('Migration failed:', error);
    throw error;
  }
}