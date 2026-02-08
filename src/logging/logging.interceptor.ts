/**
 * @fileoverview Logging interceptor for capturing HTTP requests
 * @module logging/logging.interceptor
 */

import {
  Injectable,
  NestInterceptor,
  ExecutionContext,
  CallHandler,
  Logger,
} from '@nestjs/common';
import { ConfigService } from '@nestjs/config';
import { Observable } from 'rxjs';
import { tap, catchError } from 'rxjs/operators';
import { throwError } from 'rxjs';
import { Request, Response } from 'express';
import { LoggingService } from './logging.service';
import { AuthUser } from '../auth/strategies/jwt.strategy';

/**
 * Logging interceptor
 * Captures HTTP request information and saves it to the database
 * 
 * Configuration via environment variables:
 * - LOG_REQUESTS_ENABLED: Enable/disable request logging (default: true)
 * - LOG_REQUESTS_ONLY_ERRORS: Only log requests with errors (default: false)
 * - LOG_REQUESTS_EXCLUDE_METHODS: Comma-separated list of HTTP methods to exclude (e.g., "OPTIONS,GET")
 * - LOG_REQUESTS_EXCLUDE_PATHS: Comma-separated list of paths to exclude (e.g., "/health,/cors-debug")
 */
@Injectable()
export class LoggingInterceptor implements NestInterceptor {
  private readonly logger = new Logger(LoggingInterceptor.name);
  private readonly enabled: boolean;
  private readonly onlyErrors: boolean;
  private readonly excludeMethods: string[];
  private readonly excludePaths: string[];

  constructor(
    private readonly loggingService: LoggingService,
    private readonly configService: ConfigService,
  ) {
    this.enabled = this.configService.get<string>('LOG_REQUESTS_ENABLED', 'true') === 'true';
    this.onlyErrors = this.configService.get<string>('LOG_REQUESTS_ONLY_ERRORS', 'false') === 'true';
    this.excludeMethods = this.configService
      .get<string>('LOG_REQUESTS_EXCLUDE_METHODS', 'OPTIONS')
      .split(',')
      .map((m) => m.trim().toUpperCase())
      .filter((m) => m.length > 0);
    this.excludePaths = this.configService
      .get<string>('LOG_REQUESTS_EXCLUDE_PATHS', '/health,/cors-debug')
      .split(',')
      .map((p) => p.trim())
      .filter((p) => p.length > 0);
  }

  intercept(context: ExecutionContext, next: CallHandler): Observable<any> {
    const request = context.switchToHttp().getRequest<Request>();
    const response = context.switchToHttp().getResponse<Response>();
    const startTime = Date.now();

    const { method, url, query, headers, body, ip } = request;
    const path = url.split('?')[0]; // Remove query string from path

    // Get user information if authenticated
    const user = request.user as AuthUser | undefined;
    const userId = user?.id || null;
    const userExternalId = user?.id || null; // externalUserId is the Supabase ID

    // Get IP address
    const ipAddress =
      (request.headers['x-forwarded-for'] as string)?.split(',')[0]?.trim() ||
      request.socket.remoteAddress ||
      ip ||
      null;

    // Get user agent
    const userAgent = headers['user-agent'] || null;

    // Check if logging is enabled
    if (!this.enabled) {
      return next.handle();
    }

    // Skip logging for excluded paths
    if (this.excludePaths.some((excludedPath) => path.startsWith(excludedPath))) {
      return next.handle();
    }

    // Skip logging for excluded HTTP methods
    if (this.excludeMethods.includes(method.toUpperCase())) {
      return next.handle();
    }

    return next.handle().pipe(
      tap({
        next: (data) => {
          // If only logging errors, skip successful requests
          if (this.onlyErrors) {
            return;
          }

          const responseTime = Date.now() - startTime;
          const statusCode = response.statusCode;

          // Convert response body to string (truncate if too large)
          let responseBody: string | null = null;
          try {
            if (data) {
              responseBody = JSON.stringify(data);
            }
          } catch (error) {
            responseBody = '[Unable to serialize response]';
          }

          // Save log asynchronously (don't wait for it)
          this.loggingService
            .logRequest({
              method,
              url,
              path,
              query: Object.keys(query).length > 0 ? (query as Record<string, any>) : null,
              headers: headers as Record<string, any>,
              body: body ? JSON.stringify(body) : null,
              statusCode,
              responseBody,
              responseTime,
              userId,
              userExternalId,
              ipAddress,
              userAgent,
              error: null,
              errorStack: null,
            })
            .catch((error) => {
              this.logger.error(`Failed to log request: ${error.message}`);
            });
        },
        error: (error) => {
          const responseTime = Date.now() - startTime;
          const statusCode = error.status || response.statusCode || 500;

          // Save error log
          this.loggingService
            .logRequest({
              method,
              url,
              path,
              query: Object.keys(query).length > 0 ? (query as Record<string, any>) : null,
              headers: headers as Record<string, any>,
              body: body ? JSON.stringify(body) : null,
              statusCode,
              responseBody: null,
              responseTime,
              userId,
              userExternalId,
              ipAddress,
              userAgent,
              error: error.message || 'Unknown error',
              errorStack: error.stack || null,
            })
            .catch((logError) => {
              this.logger.error(`Failed to log error: ${logError.message}`);
            });
        },
      }),
      catchError((error) => {
        return throwError(() => error);
      }),
    );
  }
}
