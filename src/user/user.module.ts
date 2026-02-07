/**
 * @fileoverview User module
 * @module user/user.module
 */

import { Module } from '@nestjs/common';
import { TypeOrmModule } from '@nestjs/typeorm';
import { UserService } from './user.service';
import { UserController } from './user.controller';
import { TenantUser } from '../entities/tenant-user.entity';
import { Role } from '../entities/role.entity';
import { TenantUserRole } from '../entities/tenant-user-role.entity';
import { AuthModule } from '../auth/auth.module';

/**
 * User module
 * Provides user management functionality
 */
@Module({
  imports: [
    TypeOrmModule.forFeature([TenantUser, Role, TenantUserRole]),
    AuthModule,
  ],
  controllers: [UserController],
  providers: [UserService],
  exports: [UserService],
})
export class UserModule {}
