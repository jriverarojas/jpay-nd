/**
 * @fileoverview Application service with basic business logic
 * @module app.service
 */

import { Injectable } from '@nestjs/common';
import { I18nService } from 'nestjs-i18n';

/**
 * Application service
 * Provides basic application-level services
 */
@Injectable()
export class AppService {
  constructor(private readonly i18n: I18nService) {}

  /**
   * Returns a greeting message
   * @param {string} lang - Optional language code (e.g., 'en', 'es')
   * @returns {Promise<string>} Translated greeting message
   */
  async getHello(lang?: string): Promise<string> {
    return this.i18n.translate('app.hello', {
      lang: lang,
    });
  }
}
