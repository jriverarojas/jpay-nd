/**
 * @fileoverview Supabase service for initializing and managing Supabase client
 * @module auth/supabase/supabase.service
 */

import { Injectable } from '@nestjs/common';
import { ConfigService } from '@nestjs/config';
import { createClient, SupabaseClient } from '@supabase/supabase-js';

/**
 * Supabase service
 * Provides Supabase client instance for authentication and database operations
 * Uses Supabase Secret Key (formerly Service Role Key) for server-side operations
 */
@Injectable()
export class SupabaseService {
  private readonly supabaseClient: SupabaseClient;

  constructor(private readonly configService: ConfigService) {
    const supabaseUrl = this.configService.get<string>('SUPABASE_URL');
    // Note: SUPABASE_SERVICE_ROLE_KEY now contains the Secret Key from Supabase
    const supabaseSecretKey = this.configService.get<string>('SUPABASE_SERVICE_ROLE_KEY');

    if (!supabaseUrl || !supabaseSecretKey) {
      throw new Error('SUPABASE_URL and SUPABASE_SERVICE_ROLE_KEY (Secret Key) must be configured');
    }

    this.supabaseClient = createClient(supabaseUrl, supabaseSecretKey, {
      auth: {
        autoRefreshToken: false,
        persistSession: false,
      },
    });
  }

  /**
   * Get the Supabase client instance
   * @returns {SupabaseClient} Supabase client
   */
  getClient(): SupabaseClient {
    return this.supabaseClient;
  }
}
