/**
 * @fileoverview Decorator to require specific permissions for endpoints
 * @module auth/decorators/require-permission.decorator
 */

import { SetMetadata } from '@nestjs/common';

/**
 * Metadata key for storing required permissions
 */
export const PERMISSION_KEY = 'permissions';

/**
 * Decorator to require specific permissions for an endpoint
 * @param {...string} permissions - Permission codes required to access the endpoint
 * @returns {ClassDecorator & MethodDecorator} Decorator function
 * @example @RequirePermission('users.read', 'users.write')
 */
export const RequirePermission = (...permissions: string[]) => SetMetadata(PERMISSION_KEY, permissions);
