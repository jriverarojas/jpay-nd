/**
 * @fileoverview User controller for managing tenant users
 * @module user/user.controller
 */

import {
  Controller,
  Get,
  Post,
  Body,
  Patch,
  Param,
  Delete,
  UseGuards,
  Request,
  ParseUUIDPipe,
} from '@nestjs/common';
import { UserService } from './user.service';
import { CreateUserDto } from './dto/create-user.dto';
import { UpdateUserDto } from './dto/update-user.dto';
import { MultiAuthGuard } from '../auth/guards/multi-auth.guard';
import { PermissionGuard } from '../auth/guards/permission.guard';
import { RequirePermission } from '../auth/decorators/require-permission.decorator';
import { AuthUser } from '../auth/strategies/jwt.strategy';
import { TenantUser } from '../entities/tenant-user.entity';

/**
 * User controller
 * Handles HTTP requests for user management
 */
@Controller('users')
@UseGuards(MultiAuthGuard, PermissionGuard)
export class UserController {
  constructor(private readonly userService: UserService) {}

  /**
   * Creates a new user
   * @param {CreateUserDto} createUserDto - User creation data
   * @param {Request} request - Express request object
   * @returns {Promise<TenantUser>} Created user
   */
  @Post()
  @RequirePermission('user.create')
  async create(
    @Body() createUserDto: CreateUserDto,
    @Request() request: Request & { user: AuthUser },
  ): Promise<TenantUser> {
    const user: AuthUser = request.user;
    const tenantId = await this.userService.getUserTenantId(user.id);
    return this.userService.create(tenantId, createUserDto, user.id);
  }

  /**
   * Gets all users for the current tenant
   * @param {Request} request - Express request object
   * @returns {Promise<TenantUser[]>} List of users
   */
  @Get()
  @RequirePermission('user.list')
  async findAll(@Request() request: Request & { user: AuthUser }): Promise<TenantUser[]> {
    const user: AuthUser = request.user;
    const tenantId = await this.userService.getUserTenantId(user.id);
    return this.userService.findAll(tenantId, user.id);
  }

  /**
   * Gets a user by ID
   * @param {string} id - User ID
   * @param {Request} request - Express request object
   * @returns {Promise<TenantUser>} User
   */
  @Get(':id')
  @RequirePermission('user.view')
  async findOne(
    @Param('id', ParseUUIDPipe) id: string,
    @Request() request: Request & { user: AuthUser },
  ): Promise<TenantUser> {
    const user: AuthUser = request.user;
    return this.userService.findOne(id, user.id);
  }

  /**
   * Updates a user
   * @param {string} id - User ID
   * @param {UpdateUserDto} updateUserDto - User update data
   * @param {Request} request - Express request object
   * @returns {Promise<TenantUser>} Updated user
   */
  @Patch(':id')
  @RequirePermission('user.edit')
  async update(
    @Param('id', ParseUUIDPipe) id: string,
    @Body() updateUserDto: UpdateUserDto,
    @Request() request: Request & { user: AuthUser },
  ): Promise<TenantUser> {
    const user: AuthUser = request.user;
    return this.userService.update(id, updateUserDto, user.id);
  }

  /**
   * Deletes a user
   * @param {string} id - User ID
   * @returns {Promise<void>}
   */
  @Delete(':id')
  @RequirePermission('user.delete')
  async remove(@Param('id', ParseUUIDPipe) id: string): Promise<void> {
    return this.userService.remove(id);
  }
}
