/**
 * @fileoverview Menu controller for retrieving user menus
 * @module menu/menu.controller
 */

import { Controller, Get, UseGuards, Request } from '@nestjs/common';
import { MultiAuthGuard } from '../auth/guards/multi-auth.guard';
import { PermissionGuard } from '../auth/guards/permission.guard';
import { RequirePermission } from '../auth/decorators/require-permission.decorator';
import { AuthUser } from '../auth/strategies/jwt.strategy';
import { MenuService, MenuItem } from './menu.service';

/**
 * Menu controller
 * Handles menu-related HTTP requests
 */
@Controller('menu')
@UseGuards(MultiAuthGuard, PermissionGuard)
export class MenuController {
  constructor(private readonly menuService: MenuService) {}

  /**
   * GET endpoint to retrieve user menus
   * Requires menu.list permission
   * Returns menus in the user's language based on i18n context
   * @param {Request} request - Express request object
   * @returns {Promise<MenuItem[]>} Array of menu items
   */
  @Get()
  @RequirePermission('menu.list')
  async getMenus(@Request() request: Request & { user: AuthUser }): Promise<MenuItem[]> {
    const user: AuthUser = request.user;
    return this.menuService.getUserMenus(user.id);
  }
}
