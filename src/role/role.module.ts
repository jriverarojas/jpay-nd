/**
 * @fileoverview Role module
 * @module role/role.module
 */

import { Module } from '@nestjs/common';
import { TypeOrmModule } from '@nestjs/typeorm';
import { RoleService } from './role.service';
import { RoleController } from './role.controller';
import { Role } from '../entities/role.entity';
import { Permission } from '../entities/permission.entity';
import { RolePermission } from '../entities/role-permission.entity';
import { AuthModule } from '../auth/auth.module';
import { UserModule } from '../user/user.module';

/**
 * Role module
 * Provides role management functionality
 */
@Module({
  imports: [
    TypeOrmModule.forFeature([Role, Permission, RolePermission]),
    AuthModule,
    UserModule,
  ],
  controllers: [RoleController],
  providers: [RoleService],
  exports: [RoleService],
})
export class RoleModule {}
