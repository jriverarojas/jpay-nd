/**
 * @fileoverview Permission module
 * @module permission/permission.module
 */

import { Module } from '@nestjs/common';
import { TypeOrmModule } from '@nestjs/typeorm';
import { PermissionService } from './permission.service';
import { PermissionController } from './permission.controller';
import { Permission } from '../entities/permission.entity';
import { AuthModule } from '../auth/auth.module';

/**
 * Permission module
 * Provides permission management functionality
 */
@Module({
  imports: [TypeOrmModule.forFeature([Permission]), AuthModule],
  controllers: [PermissionController],
  providers: [PermissionService],
  exports: [PermissionService],
})
export class PermissionModule {}
