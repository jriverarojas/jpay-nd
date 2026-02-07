/**
 * @fileoverview DTO for updating a user
 * @module user/dto/update-user.dto
 */

import { IsString, IsArray, IsUUID, IsOptional, ArrayMinSize } from 'class-validator';

/**
 * DTO for updating a user
 */
export class UpdateUserDto {
  /**
   * Username/display handle
   */
  @IsString()
  @IsOptional()
  username?: string;

  /**
   * Array of role IDs to assign to the user
   */
  @IsArray()
  @IsOptional()
  @IsUUID('4', { each: true })
  roleIds?: string[];
}
