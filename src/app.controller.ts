/**
 * @fileoverview Root application controller
 * @module app.controller
 */

import { Controller, Get, Query, Request } from '@nestjs/common';
import { AppService } from './app.service';

/**
 * Root application controller
 * Handles root-level HTTP requests
 */
@Controller()
export class AppController {
  constructor(private readonly appService: AppService) {}

  /**
   * GET endpoint for root path
   * Language can be specified via query parameter (lang, locale, or l)
   * or via Accept-Language header (automatic detection)
   * @param {string} lang - Optional language code (e.g., 'en', 'es')
   * @returns {Promise<string>} Translated greeting message
   */
  @Get()
  async getHello(@Query('lang') lang?: string): Promise<string> {
    return this.appService.getHello(lang);
  }

  /**
   * GET endpoint for health check
   * Used by Docker and monitoring tools to verify application status
   * @returns {object} Health status object
   */
  @Get('health')
  getHealth(): { status: string; timestamp: string } {
    return {
      status: 'ok',
      timestamp: new Date().toISOString(),
    };
  }

  /**
   * GET endpoint for CORS debug (development only)
   * Returns CORS configuration for debugging
   * @param {any} request - Express request object
   * @returns {object} CORS debug information
   */
  @Get('cors-debug')
  getCorsDebug(@Request() request: any): {
    origin: string | undefined;
    corsOrigins: string;
    allowed: boolean;
  } {
    const origin = request.headers?.origin;
    const corsOrigins = process.env.CORS_ORIGINS || 'http://localhost:5173,http://localhost:5174';
    
    // Simple check for debugging (this is a simplified version)
    const corsConfig = corsOrigins.split(',').map(o => o.trim().toLowerCase());
    const originDomain = origin?.replace(/^https?:\/\//, '').toLowerCase() || '';
    
    let allowed = false;
    for (const pattern of corsConfig) {
      if (pattern === origin?.toLowerCase()) {
        allowed = true;
        break;
      }
      if (pattern.startsWith('*.')) {
        const domain = pattern.substring(2);
        if (originDomain !== domain && originDomain.endsWith(`.${domain}`)) {
          allowed = true;
          break;
        }
      }
      if (!pattern.includes('*') && !pattern.startsWith('http')) {
        const domain = pattern;
        if (originDomain === domain || originDomain.endsWith(`.${domain}`)) {
          allowed = true;
          break;
        }
      }
    }

    return {
      origin: origin,
      corsOrigins: corsOrigins,
      allowed: allowed,
    };
  }
}
