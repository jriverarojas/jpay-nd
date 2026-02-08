/**
 * @fileoverview Logging service for saving request logs to database
 * @module logging/logging.service
 */

import { Injectable, Logger } from '@nestjs/common';
import { InjectRepository } from '@nestjs/typeorm';
import { Repository } from 'typeorm';
import { RequestLog } from '../entities/request-log.entity';

/**
 * Logging service
 * Handles saving request logs to the database
 */
@Injectable()
export class LoggingService {
  private readonly logger = new Logger(LoggingService.name);
  private readonly MAX_BODY_LENGTH = 10000; // Maximum length for request/response body

  constructor(
    @InjectRepository(RequestLog)
    private readonly requestLogRepository: Repository<RequestLog>,
  ) {}

  /**
   * Saves a request log to the database
   * @param {Partial<RequestLog>} logData - Log data to save
   * @returns {Promise<void>}
   */
  async logRequest(logData: Partial<RequestLog>): Promise<void> {
    try {
      // Truncate body if too long
      if (logData.body && logData.body.length > this.MAX_BODY_LENGTH) {
        logData.body = logData.body.substring(0, this.MAX_BODY_LENGTH) + '... [truncated]';
      }

      if (logData.responseBody && logData.responseBody.length > this.MAX_BODY_LENGTH) {
        logData.responseBody = logData.responseBody.substring(0, this.MAX_BODY_LENGTH) + '... [truncated]';
      }

      // Remove sensitive data from headers
      if (logData.headers) {
        const sensitiveHeaders = ['authorization', 'x-api-key', 'cookie', 'set-cookie'];
        const sanitizedHeaders = { ...logData.headers };
        sensitiveHeaders.forEach((header) => {
          if (sanitizedHeaders[header]) {
            sanitizedHeaders[header] = '[REDACTED]';
          }
        });
        logData.headers = sanitizedHeaders;
      }

      const log = this.requestLogRepository.create(logData);
      await this.requestLogRepository.save(log);
    } catch (error) {
      // Don't throw error, just log it to avoid breaking the request flow
      this.logger.error(`Failed to save request log: ${error.message}`, error.stack);
    }
  }

  /**
   * Gets request logs with pagination
   * @param {number} page - Page number (1-based)
   * @param {number} limit - Number of logs per page
   * @param {object} filters - Optional filters (userId, method, statusCode, etc.)
   * @returns {Promise<{ logs: RequestLog[]; total: number }>}
   */
  async getLogs(
    page: number = 1,
    limit: number = 50,
    filters?: {
      userId?: string;
      userExternalId?: string;
      method?: string;
      statusCode?: number;
      path?: string;
      startDate?: Date;
      endDate?: Date;
    },
  ): Promise<{ logs: RequestLog[]; total: number }> {
    const query = this.requestLogRepository.createQueryBuilder('log');

    if (filters?.userId) {
      query.andWhere('log.userId = :userId', { userId: filters.userId });
    }

    if (filters?.userExternalId) {
      query.andWhere('log.userExternalId = :userExternalId', { userExternalId: filters.userExternalId });
    }

    if (filters?.method) {
      query.andWhere('log.method = :method', { method: filters.method });
    }

    if (filters?.statusCode) {
      query.andWhere('log.statusCode = :statusCode', { statusCode: filters.statusCode });
    }

    if (filters?.path) {
      query.andWhere('log.path LIKE :path', { path: `%${filters.path}%` });
    }

    if (filters?.startDate) {
      query.andWhere('log.createdAt >= :startDate', { startDate: filters.startDate });
    }

    if (filters?.endDate) {
      query.andWhere('log.createdAt <= :endDate', { endDate: filters.endDate });
    }

    const [logs, total] = await query
      .orderBy('log.createdAt', 'DESC')
      .skip((page - 1) * limit)
      .take(limit)
      .getManyAndCount();

    return { logs, total };
  }
}
