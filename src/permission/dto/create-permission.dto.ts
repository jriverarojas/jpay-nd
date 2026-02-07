/**
 * @fileoverview DTO for creating a permission
 * @module permission/dto/create-permission.dto
 */

import { IsString, IsUUID, IsBoolean, IsInt, IsNotEmpty, IsOptional, Min } from 'class-validator';

/**
 * DTO for creating a permission
 */
export class CreatePermissionDto {
  /**
   * Unique permission code
   */
  @IsString()
  @IsNotEmpty()
  code: string;

  /**
   * Permission type (MENU, ACTION, etc.)
   */
  @IsString()
  @IsNotEmpty()
  permissionType: string;

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
