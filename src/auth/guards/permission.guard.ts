/**
 * @fileoverview Permission guard to check user permissions
 * @module auth/guards/permission.guard
 */

import { Injectable, CanActivate, ExecutionContext, ForbiddenException } from '@nestjs/common';
import { Reflector } from '@nestjs/core';
import { I18nContext } from 'nestjs-i18n';
import { PERMISSION_KEY } from '../decorators/require-permission.decorator';
import { AuthUser } from '../strategies/jwt.strategy';
import { PermissionService } from '../services/permission.service';

/**
 * Permission Guard
 * Checks if the authenticated user has the required permissions
 */
@Injectable()
export class PermissionGuard implements CanActivate {
  constructor(
    private readonly reflector: Reflector,
    private readonly permissionService: PermissionService,
  ) {}

  /**
   * Checks if the user has the required permissions
   * @param {ExecutionContext} context - Execution context
   * @returns {Promise<boolean>} True if user has required permissions
   */
  async canActivate(context: ExecutionContext): Promise<boolean> {
    // Get required permissions from decorator
    const requiredPermissions = this.reflector.getAllAndOverride<string[]>(
      PERMISSION_KEY,
      [context.getHandler(), context.getClass()],
    );

    // If no permissions required, allow access
    if (!requiredPermissions || requiredPermissions.length === 0) {
      return true;
    }

    // Get authenticated user from request
    const request = context.switchToHttp().getRequest();
    const user: AuthUser = request.user;

    // Get I18n context for translations
    const i18n = I18nContext.current();

    if (!user || !user.id) {
      const message = i18n?.t('auth.user_not_authenticated') || 'User not authenticated';
      throw new ForbiddenException(message);
    }

    // Check if user has all required permissions
    const hasAllPermissions = await this.permissionService.hasAllPermissions(
      user.id,
      requiredPermissions,
    );

    if (!hasAllPermissions) {
      const message = i18n?.t('auth.missing_required_permissions', {
        args: { permissions: requiredPermissions.join(', ') },
      }) || `Missing required permissions: ${requiredPermissions.join(', ')}`;
      throw new ForbiddenException(message);
    }

    return true;
  }
}
