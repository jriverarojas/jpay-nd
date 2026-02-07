/**
 * @fileoverview DTO for updating a role
 * @module role/dto/update-role.dto
 */

import { IsString, IsArray, IsUUID, IsBoolean, IsOptional, ArrayMinSize } from 'class-validator';

/**
 * DTO for updating a role
 */
export class UpdateRoleDto {
  /**
   * External role key (unique within tenant)
   */
  @IsString()
  @IsOptional()
  externalRoleKey?: string;

  /**
   * Role name shown in app
   */
  @IsString()
  @IsOptional()
  name?: string;

  /**
   * Whether this role can only be assigned/viewed by admin users
   */
  @IsBoolean()
  @IsOptional()
  onlyAdmin?: boolean;

  /**
   * Array of permission IDs to assign to the role
   * Menu permissions should be included in tree structure
   */
  @IsArray()
  @IsOptional()
  @IsUUID('4', { each: true })
  permissionIds?: string[];
}
