import { config } from '@/config/app';
import { logger } from './logger';

// Optional OpenTelemetry imports
let NodeSDK: any;
let OTLPTraceExporter: any;
let Resource: any;
let SemanticResourceAttributes: any;
let BatchSpanProcessor: any;
let ConsoleSpanExporter: any;

// Try to import OpenTelemetry modules
try {
  if (config.tracing.enabled) {
    const otel = require('@opentelemetry/sdk-node');
    const otlpExporter = require('@opentelemetry/exporter-otlp-http');
    const resources = require('@opentelemetry/resources');
    const semanticConventions = require('@opentelemetry/semantic-conventions');
    const spanProcessor = require('@opentelemetry/sdk-trace-base');

    NodeSDK = otel.NodeSDK;
    OTLPTraceExporter = otlpExporter.OTLPTraceExporter;
    Resource = resources.Resource;
    SemanticResourceAttributes = semanticConventions.SemanticResourceAttributes;
    BatchSpanProcessor = spanProcessor.BatchSpanProcessor;
    ConsoleSpanExporter = spanProcessor.ConsoleSpanExporter;
  }
} catch (error) {
  logger.warn('OpenTelemetry modules not available, tracing will be disabled');
}

// Tracing manager
export class TracingManager {
  private static instance: TracingManager;
  private sdk: any;
  private tracer: any;
  private isInitialized = false;

  private constructor() {}

  static getInstance(): TracingManager {
    if (!TracingManager.instance) {
      TracingManager.instance = new TracingManager();
    }
    return TracingManager.instance;
  }

  async initialize(): Promise<void> {
    if (!config.tracing.enabled || !NodeSDK) {
      logger.info('Tracing is disabled or OpenTelemetry not available');
      return;
    }

    try {
      // Create resource
      const resource = new Resource({
        [SemanticResourceAttributes.SERVICE_NAME]: config.tracing.serviceName,
        [SemanticResourceAttributes.SERVICE_VERSION]: process.env.npm_package_version || '1.0.0',
        [SemanticResourceAttributes.DEPLOYMENT_ENVIRONMENT]: config.server.env,
      });

      // Create exporters
      const exporters = [];

      // OTLP HTTP exporter
      if (config.tracing.endpoint) {
        const otlpExporter = new OTLPTraceExporter({
          url: config.tracing.endpoint,
          headers: this.parseHeaders(config.tracing.headers),
        });
        exporters.push(otlpExporter);
      }

      // Console exporter for development
      if (config.server.env === 'development') {
        exporters.push(new ConsoleSpanExporter());
      }

      if (exporters.length === 0) {
        logger.warn('No tracing exporters configured, using console exporter');
        exporters.push(new ConsoleSpanExporter());
      }

      // Create span processors
      const spanProcessors = exporters.map(exporter => new BatchSpanProcessor(exporter));

      // Create SDK
      this.sdk = new NodeSDK({
        resource,
        spanProcessor: spanProcessors[0], // Use first processor for now
        instrumentations: [], // Add instrumentations as needed
      });

      // Initialize SDK
      await this.sdk.start();
      
      // Get tracer
      const { trace } = require('@opentelemetry/api');
      this.tracer = trace.getTracer(config.tracing.serviceName);

      this.isInitialized = true;
      logger.info('Tracing initialized successfully');
    } catch (error) {
      logger.error('Failed to initialize tracing:', error);
      this.isInitialized = false;
    }
  }

  private parseHeaders(headersString?: string): Record<string, string> {
    if (!headersString) return {};

    const headers: Record<string, string> = {};
    const pairs = headersString.split(',');

    for (const pair of pairs) {
      const [key, value] = pair.split('=').map(s => s.trim());
      if (key && value) {
        headers[key] = value;
      }
    }

    return headers;
  }

  async shutdown(): Promise<void> {
    if (this.sdk && this.isInitialized) {
      try {
        await this.sdk.shutdown();
        this.isInitialized = false;
        logger.info('Tracing shutdown completed');
      } catch (error) {
        logger.error('Error shutting down tracing:', error);
      }
    }
  }

  // Create a span
  createSpan(name: string, attributes?: Record<string, any>): any {
    if (!this.isInitialized || !this.tracer) {
      return null;
    }

    try {
      return this.tracer.startSpan(name, {
        attributes: {
          'service.name': config.tracing.serviceName,
          'service.version': process.env.npm_package_version || '1.0.0',
          ...attributes,
        },
      });
    } catch (error) {
      logger.error('Error creating span:', error);
      return null;
    }
  }

  // Add event to span
  addEvent(span: any, name: string, attributes?: Record<string, any>): void {
    if (span && this.isInitialized) {
      try {
        span.addEvent(name, attributes);
      } catch (error) {
        logger.error('Error adding event to span:', error);
      }
    }
  }

  // Add attributes to span
  setAttributes(span: any, attributes: Record<string, any>): void {
    if (span && this.isInitialized) {
      try {
        span.setAttributes(attributes);
      } catch (error) {
        logger.error('Error setting span attributes:', error);
      }
    }
  }

  // End span
  endSpan(span: any, status?: { code: number; message?: string }): void {
    if (span && this.isInitialized) {
      try {
        if (status) {
          span.setStatus(status);
        }
        span.end();
      } catch (error) {
        logger.error('Error ending span:', error);
      }
    }
  }

  // Create child span
  createChildSpan(parentSpan: any, name: string, attributes?: Record<string, any>): any {
    if (!this.isInitialized || !this.tracer) {
      return null;
    }

    try {
      const context = require('@opentelemetry/api').trace.setSpan(
        require('@opentelemetry/api').context.active(),
        parentSpan
      );

      return this.tracer.startSpan(name, {
        attributes: {
          'service.name': config.tracing.serviceName,
          'service.version': process.env.npm_package_version || '1.0.0',
          ...attributes,
        },
      }, context);
    } catch (error) {
      logger.error('Error creating child span:', error);
      return null;
    }
  }

  // Trace function execution
  async traceFunction<T>(
    name: string,
    fn: () => Promise<T>,
    attributes?: Record<string, any>
  ): Promise<T> {
    const span = this.createSpan(name, attributes);
    
    try {
      const result = await fn();
      this.endSpan(span, { code: 1 }); // OK
      return result;
    } catch (error) {
      this.endSpan(span, { code: 2, message: error.message }); // ERROR
      throw error;
    }
  }

  // Trace synchronous function execution
  traceSyncFunction<T>(
    name: string,
    fn: () => T,
    attributes?: Record<string, any>
  ): T {
    const span = this.createSpan(name, attributes);
    
    try {
      const result = fn();
      this.endSpan(span, { code: 1 }); // OK
      return result;
    } catch (error) {
      this.endSpan(span, { code: 2, message: error.message }); // ERROR
      throw error;
    }
  }

  // Get current span
  getCurrentSpan(): any {
    if (!this.isInitialized) {
      return null;
    }

    try {
      const { trace } = require('@opentelemetry/api');
      return trace.getActiveSpan();
    } catch (error) {
      logger.error('Error getting current span:', error);
      return null;
    }
  }

  // Check if tracing is enabled
  get isEnabled(): boolean {
    return config.tracing.enabled && this.isInitialized;
  }

  // Get tracer instance
  get getTracer(): any {
    return this.tracer;
  }
}

// Export singleton instance
export const tracing = TracingManager.getInstance();

// Decorator for tracing functions
export function trace(name?: string) {
  return function (target: any, propertyName: string, descriptor: PropertyDescriptor) {
    const method = descriptor.value;
    const spanName = name || `${target.constructor.name}.${propertyName}`;

    descriptor.value = async function (...args: any[]) {
      if (!tracing.isEnabled) {
        return method.apply(this, args);
      }

      const span = tracing.createSpan(spanName, {
        'function.name': propertyName,
        'function.class': target.constructor.name,
        'function.args': JSON.stringify(args),
      });

      try {
        const result = await method.apply(this, args);
        tracing.endSpan(span, { code: 1 });
        return result;
      } catch (error) {
        tracing.endSpan(span, { code: 2, message: error.message });
        throw error;
      }
    };
  };
}