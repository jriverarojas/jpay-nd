/**
 * @fileoverview DTO for creating a user
 * @module user/dto/create-user.dto
 */

import { IsString, IsArray, IsUUID, IsNotEmpty, ArrayMinSize, IsOptional, IsEmail } from 'class-validator';

/**
 * DTO for creating a user
 */
export class CreateUserDto {
  /**
   * Username/display handle
   */
  @IsString()
  @IsNotEmpty()
  username: string;

  /**
   * Email address (required for Supabase user creation)
   */
  @IsString()
  @IsEmail()
  @IsNotEmpty()
  email: string;

  /**
   * First name
   */
  @IsString()
  @IsOptional()
  firstname?: string;

  /**
   * Last name
   */
  @IsString()
  @IsOptional()
  lastname?: string;

  /**
   * Array of role IDs to assign to the user
   */
  @IsArray()
  @ArrayMinSize(1)
  @IsUUID('4', { each: true })
  roleIds: string[];
}
