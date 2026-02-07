/**
 * @fileoverview Root application controller
 * @module app.controller
 */

import { Controller, Get, Query } from '@nestjs/common';
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
}
