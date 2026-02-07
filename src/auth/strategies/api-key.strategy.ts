/**
 * @fileoverview API Key authentication strategy
 * @module auth/strategies/api-key.strategy
 */

import { Injectable, UnauthorizedException } from '@nestjs/common';
import { InjectRepository } from '@nestjs/typeorm';
import { Repository } from 'typeorm';
import { PassportStrategy } from '@nestjs/passport';
import { Strategy } from 'passport-custom';
import { Request } from 'express';
import { createHash } from 'crypto';
import { I18nContext } from 'nestjs-i18n';
import { SupabaseService } from '../supabase/supabase.service';
import { UserApiKey } from '../entities/user-api-key.entity';
import { AuthUser } from './jwt.strategy';

/**
 * API Key Strategy
 * Validates API keys by hashing and comparing with database
 */
@Injectable()
export class ApiKeyStrategy extends PassportStrategy(Strategy, 'api-key') {
  constructor(
    private readonly supabaseService: SupabaseService,
    @InjectRepository(UserApiKey)
    private readonly userApiKeyRepository: Repository<UserApiKey>,
  ) {
    super();
  }

  /**
   * Hashes an API key using SHA-256
   * @param {string} apiKey - Plain API key
   * @returns {string} Hashed API key
   */
  private hashApiKey(apiKey: string): string {
    return createHash('sha256').update(apiKey).digest('hex');
  }

  /**
   * Validates the API key from request header
   * @param {Request} request - Express request object
   * @returns {Promise<AuthUser>} User object if API key is valid
   */
  async validate(request: Request): Promise<AuthUser> {
    const apiKey = request.headers['x-api-key'] as string;

    // Get I18n context for translations
    const i18n = I18nContext.current();

    if (!apiKey) {
      const message = i18n?.t('auth.missing_api_key') || 'Missing API key';
      throw new UnauthorizedException(message);
    }

    try {
      const keyHash = this.hashApiKey(apiKey);
      const supabase = this.supabaseService.getClient();

      // Query the user_api_keys table using TypeORM
      const apiKeyRecord = await this.userApiKeyRepository.findOne({
        where: {
          keyHash,
          isActive: true,
        },
      });

      if (!apiKeyRecord) {
        const message = i18n?.t('auth.invalid_api_key') || 'Invalid API key';
        throw new UnauthorizedException(message);
      }

      // Update last_used_at timestamp
      apiKeyRecord.lastUsedAt = new Date();
      await this.userApiKeyRepository.save(apiKeyRecord);

      // Get user information from Supabase Auth
      const { data: { user }, error: userError } = await supabase.auth.admin.getUserById(apiKeyRecord.userId);

      if (userError || !user) {
        const message = i18n?.t('auth.user_not_found') || 'User not found';
        throw new UnauthorizedException(message);
      }

      return {
        ...user,
        id: user.id,
        email: user.email,
        authMethod: 'api-key',
      };
    } catch (error) {
      if (error instanceof UnauthorizedException) {
        throw error;
      }
      const message = i18n?.t('auth.invalid_api_key') || 'Invalid API key';
      throw new UnauthorizedException(message);
    }
  }
}
