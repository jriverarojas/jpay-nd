/**
 * @fileoverview JWT authentication strategy using Supabase SDK
 * @module auth/strategies/jwt.strategy
 */

import { Injectable, UnauthorizedException } from '@nestjs/common';
import { PassportStrategy } from '@nestjs/passport';
import { Strategy } from 'passport-custom';
import { Request } from 'express';
import { I18nContext } from 'nestjs-i18n';
import { SupabaseService } from '../supabase/supabase.service';

/**
 * User interface returned by authentication strategies
 */
export interface AuthUser {
  id: string;
  email?: string;
  authMethod: 'jwt' | 'api-key';
  [key: string]: any;
}

/**
 * JWT Strategy
 * Validates JWT tokens using Supabase SDK
 */
@Injectable()
export class JwtStrategy extends PassportStrategy(Strategy, 'jwt') {
  constructor(private readonly supabaseService: SupabaseService) {
    super();
  }

  /**
   * Validates the JWT token using Supabase SDK
   * @param {Request} request - Express request object
   * @returns {Promise<AuthUser>} User object if token is valid
   */
  async validate(request: Request): Promise<AuthUser | null> {
    const authHeader = request.headers.authorization;
    
    // If no JWT header, return null to allow other strategies to be tried
    if (!authHeader || !authHeader.startsWith('Bearer ')) {
      return null;
    }
    
    // Get I18n context for translations
    const i18n = I18nContext.current();

    const token = authHeader.substring(7); // Remove 'Bearer ' prefix

    try {
      const supabase = this.supabaseService.getClient();
      const { data: { user }, error } = await supabase.auth.getUser(token);

      if (error || !user) {
        const message = i18n?.t('auth.invalid_or_expired_token') || 'Invalid or expired token';
        throw new UnauthorizedException(message);
      }

      return {
        ...user,
        id: user.id,
        email: user.email,
        authMethod: 'jwt',
      };
    } catch (error) {
      if (error instanceof UnauthorizedException) {
        throw error;
      }
      const message = i18n?.t('auth.invalid_or_expired_token') || 'Invalid or expired token';
      throw new UnauthorizedException(message);
    }
  }
}
