/**
 * @fileoverview Permission controller for managing permissions
 * @module permission/permission.controller
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
import { PermissionService } from './permission.service';
import { CreatePermissionDto } from './dto/create-permission.dto';
import { UpdatePermissionDto } from './dto/update-permission.dto';
import { MultiAuthGuard } from '../auth/guards/multi-auth.guard';
import { PermissionGuard } from '../auth/guards/permission.guard';
import { RequirePermission } from '../auth/decorators/require-permission.decorator';
import { AuthUser } from '../auth/strategies/jwt.strategy';
import { Permission } from '../entities/permission.entity';

/**
 * Permission controller
 * Handles HTTP requests for permission management
 */
@Controller('permissions')
@UseGuards(MultiAuthGuard, PermissionGuard)
export class PermissionController {
  constructor(private readonly permissionService: PermissionService) {}

  /**
   * Creates a new permission
   * @param {CreatePermissionDto} createPermissionDto - Permission creation data
   * @param {Request} request - Express request object
   * @returns {Promise<Permission>} Created permission
   */
  @Post()
  @RequirePermission('permission.create')
  async create(
    @Body() createPermissionDto: CreatePermissionDto,
    @Request() request: Request & { user: AuthUser },
  ): Promise<Permission> {
    const user: AuthUser = request.user;
    return this.permissionService.create(createPermissionDto, user.id);
  }

  /**
   * Gets all permissions
   * @param {Request} request - Express request object
   * @returns {Promise<Permission[]>} List of permissions
   */
  @Get()
  @RequirePermission('permission.list')
  async findAll(@Request() request: Request & { user: AuthUser }): Promise<Permission[]> {
    const user: AuthUser = request.user;
    return this.permissionService.findAll(user.id);
  }

  /**
   * Gets a permission by ID
   * @param {string} id - Permission ID
   * @param {Request} request - Express request object
   * @returns {Promise<Permission>} Permission
   */
  @Get(':id')
  @RequirePermission('permission.view')
  async findOne(
    @Param('id', ParseUUIDPipe) id: string,
    @Request() request: Request & { user: AuthUser },
  ): Promise<Permission> {
    const user: AuthUser = request.user;
    return this.permissionService.findOne(id, user.id);
  }

  /**
   * Updates a permission
   * @param {string} id - Permission ID
   * @param {UpdatePermissionDto} updatePermissionDto - Permission update data
   * @param {Request} request - Express request object
   * @returns {Promise<Permission>} Updated permission
   */
  @Patch(':id')
  @RequirePermission('permission.edit')
  async update(
    @Param('id', ParseUUIDPipe) id: string,
    @Body() updatePermissionDto: UpdatePermissionDto,
    @Request() request: Request & { user: AuthUser },
  ): Promise<Permission> {
    const user: AuthUser = request.user;
    return this.permissionService.update(id, updatePermissionDto, user.id);
  }

  /**
   * Deletes a permission
   * @param {string} id - Permission ID
   * @param {Request} request - Express request object
   * @returns {Promise<void>}
   */
  @Delete(':id')
  @RequirePermission('permission.delete')
  async remove(
    @Param('id', ParseUUIDPipe) id: string,
    @Request() request: Request & { user: AuthUser },
  ): Promise<void> {
    const user: AuthUser = request.user;
    return this.permissionService.remove(id, user.id);
  }
}
