/**
 * @fileoverview Authentication module
 * @module auth/auth.module
 */

import { Module } from '@nestjs/common';
import { PassportModule } from '@nestjs/passport';
import { TypeOrmModule } from '@nestjs/typeorm';
import { SupabaseService } from './supabase/supabase.service';
import { JwtStrategy } from './strategies/jwt.strategy';
import { ApiKeyStrategy } from './strategies/api-key.strategy';
import { MultiAuthGuard } from './guards/multi-auth.guard';
import { PermissionGuard } from './guards/permission.guard';
import { PermissionService } from './services/permission.service';
import { UserApiKey } from './entities/user-api-key.entity';
import { TenantUser } from '../entities/tenant-user.entity';
import { Role } from '../entities/role.entity';
import { Permission } from '../entities/permission.entity';

/**
 * Authentication module
 * Configures Passport strategies and authentication services
 */
@Module({
  imports: [
    PassportModule.register({ defaultStrategy: 'jwt' }),
    TypeOrmModule.forFeature([UserApiKey, TenantUser, Role, Permission]),
  ],
  providers: [
    SupabaseService,
    JwtStrategy,
    ApiKeyStrategy,
    MultiAuthGuard,
    PermissionGuard,
    PermissionService,
  ],
  exports: [SupabaseService, MultiAuthGuard, PermissionGuard, PermissionService],
})
export class AuthModule {}
