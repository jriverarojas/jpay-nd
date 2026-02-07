/**
 * @fileoverview DTO for creating a role
 * @module role/dto/create-role.dto
 */

import { IsString, IsArray, IsUUID, IsBoolean, IsNotEmpty, IsOptional, ArrayMinSize } from 'class-validator';

/**
 * DTO for creating a role
 */
export class CreateRoleDto {
  /**
   * External role key (unique within tenant)
   */
  @IsString()
  @IsNotEmpty()
  externalRoleKey: string;

  /**
   * Role name shown in app
   */
  @IsString()
  @IsNotEmpty()
  name: string;

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
