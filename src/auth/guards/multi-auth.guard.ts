/**
 * @fileoverview Multi-authentication guard supporting both JWT and API Key
 * @module auth/guards/multi-auth.guard
 */

import { Injectable, ExecutionContext, UnauthorizedException } from '@nestjs/common';
import { AuthGuard } from '@nestjs/passport';
import { I18nContext } from 'nestjs-i18n';

/**
 * Multi Authentication Guard
 * Tries JWT authentication first, then API Key authentication
 * Succeeds if either strategy succeeds
 */
@Injectable()
export class MultiAuthGuard extends AuthGuard(['jwt', 'api-key']) {
  /**
   * Handles authentication errors gracefully
   * Tries both strategies and succeeds if either works
   * @param {any} err - Error object
   * @param {any} user - User object
   * @param {any} info - Additional info
   * @param {ExecutionContext} context - Execution context
   * @returns {any} User object or throws error
   */
  handleRequest(err: any, user: any, info: any, context: ExecutionContext) {
    if (user) {
      return user;
    }

    const request = context.switchToHttp().getRequest();
    const hasJwt = request.headers.authorization?.startsWith('Bearer ');
    const hasApiKey = !!request.headers['x-api-key'];

    // Get I18n context for translations
    const i18n = I18nContext.current();

    if (!hasJwt && !hasApiKey) {
      const message = i18n?.t('auth.missing_credentials') || 'Missing authentication credentials. Provide either Bearer token or x-api-key header.';
      throw new UnauthorizedException(message);
    }

    const message = i18n?.t('auth.authentication_failed') || 'Authentication failed';
    throw err || new UnauthorizedException(message);
  }
}
