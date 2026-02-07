/**
 * @fileoverview DTO for updating a permission
 * @module permission/dto/update-permission.dto
 */

import { IsString, IsUUID, IsBoolean, IsInt, IsOptional, Min } from 'class-validator';

/**
 * DTO for updating a permission
 */
export class UpdatePermissionDto {
  /**
   * Unique permission code
   */
  @IsString()
  @IsOptional()
  code?: string;

  /**
   * Permission type (MENU, ACTION, etc.)
   */
  @IsString()
  @IsOptional()
  permissionType?: string;

  /**
   * Optional menu group
   */
  @IsString()
  @IsOptional()
  group?: string | null;

  /**
   * Foreign key to parent Permission (for menu tree)
   */
  @IsUUID('4')
  @IsOptional()
  parentPermissionId?: string | null;

  /**
   * Sort order among siblings
   */
  @IsInt()
  @Min(0)
  @IsOptional()
  sortOrder?: number;

  /**
   * Whether the permission is active
   */
  @IsBoolean()
  @IsOptional()
  isActive?: boolean;

  /**
   * Whether this permission can only be assigned/viewed by admin users
   */
  @IsBoolean()
  @IsOptional()
  onlyAdmin?: boolean;
}
