/**
 * @fileoverview DTO for creating a user
 * @module user/dto/create-user.dto
 */

import { IsString, IsArray, IsUUID, IsNotEmpty, ArrayMinSize } from 'class-validator';

/**
 * DTO for creating a user
 */
export class CreateUserDto {
  /**
   * External User ID (from Supabase)
   */
  @IsString()
  @IsNotEmpty()
  externalUserId: string;

  /**
   * Username/display handle
   */
  @IsString()
  @IsNotEmpty()
  username: string;

  /**
   * Array of role IDs to assign to the user
   */
  @IsArray()
  @ArrayMinSize(1)
  @IsUUID('4', { each: true })
  roleIds: string[];
}
