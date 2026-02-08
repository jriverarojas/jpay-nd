/**
 * @fileoverview Logging module
 * @module logging/logging.module
 */

import { Module } from '@nestjs/common';
import { TypeOrmModule } from '@nestjs/typeorm';
import { RequestLog } from '../entities/request-log.entity';
import { LoggingService } from './logging.service';
import { LoggingInterceptor } from './logging.interceptor';

/**
 * Logging module
 * Provides request logging functionality
 */
@Module({
  imports: [TypeOrmModule.forFeature([RequestLog])],
  providers: [LoggingService, LoggingInterceptor],
  exports: [LoggingService, LoggingInterceptor],
})
export class LoggingModule {}
