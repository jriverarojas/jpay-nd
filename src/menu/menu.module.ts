/**
 * @fileoverview Menu module
 * @module menu/menu.module
 */

import { Module } from '@nestjs/common';
import { TypeOrmModule } from '@nestjs/typeorm';
import { MenuController } from './menu.controller';
import { MenuService } from './menu.service';
import { TenantUser } from '../entities/tenant-user.entity';
import { Permission } from '../entities/permission.entity';
import { PermissionTranslation } from '../entities/permission-translation.entity';
import { AuthModule } from '../auth/auth.module';

/**
 * Menu module
 * Configures menu-related services and controllers
 */
@Module({
  imports: [
    TypeOrmModule.forFeature([TenantUser, Permission, PermissionTranslation]),
    AuthModule,
  ],
  controllers: [MenuController],
  providers: [MenuService],
  exports: [MenuService],
})
export class MenuModule {}
