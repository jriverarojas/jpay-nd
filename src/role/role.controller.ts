/**
 * @fileoverview Role controller for managing roles
 * @module role/role.controller
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
import { RoleService, RoleWithPermissions } from './role.service';
import { CreateRoleDto } from './dto/create-role.dto';
import { UpdateRoleDto } from './dto/update-role.dto';
import { MultiAuthGuard } from '../auth/guards/multi-auth.guard';
import { PermissionGuard } from '../auth/guards/permission.guard';
import { RequirePermission } from '../auth/decorators/require-permission.decorator';
import { AuthUser } from '../auth/strategies/jwt.strategy';
import { UserService } from '../user/user.service';

/**
 * Role controller
 * Handles HTTP requests for role management
 */
@Controller('roles')
@UseGuards(MultiAuthGuard, PermissionGuard)
export class RoleController {
  constructor(
    private readonly roleService: RoleService,
    private readonly userService: UserService,
  ) {}

  /**
   * Creates a new role
   * @param {CreateRoleDto} createRoleDto - Role creation data
   * @param {Request} request - Express request object
   * @returns {Promise<RoleWithPermissions>} Created role with permissions
   */
  @Post()
  @RequirePermission('role.create')
  async create(
    @Body() createRoleDto: CreateRoleDto,
    @Request() request: Request & { user: AuthUser },
  ): Promise<RoleWithPermissions> {
    const user: AuthUser = request.user;
    const tenantId = await this.userService.getUserTenantId(user.id);
    return this.roleService.create(tenantId, createRoleDto, user.id);
  }

  /**
   * Gets all roles for the current tenant
   * @param {Request} request - Express request object
   * @returns {Promise<RoleWithPermissions[]>} List of roles with permissions
   */
  @Get()
  @RequirePermission('role.list')
  async findAll(@Request() request: Request & { user: AuthUser }): Promise<RoleWithPermissions[]> {
    const user: AuthUser = request.user;
    const tenantId = await this.userService.getUserTenantId(user.id);
    return this.roleService.findAll(tenantId, user.id);
  }

  /**
   * Gets a role by ID with permissions
   * @param {string} id - Role ID
   * @param {Request} request - Express request object
   * @returns {Promise<RoleWithPermissions>} Role with permissions
   */
  @Get(':id')
  @RequirePermission('role.view')
  async findOne(
    @Param('id', ParseUUIDPipe) id: string,
    @Request() request: Request & { user: AuthUser },
  ): Promise<RoleWithPermissions> {
    const user: AuthUser = request.user;
    return this.roleService.findOne(id, user.id);
  }

  /**
   * Updates a role
   * @param {string} id - Role ID
   * @param {UpdateRoleDto} updateRoleDto - Role update data
   * @param {Request} request - Express request object
   * @returns {Promise<RoleWithPermissions>} Updated role with permissions
   */
  @Patch(':id')
  @RequirePermission('role.edit')
  async update(
    @Param('id', ParseUUIDPipe) id: string,
    @Body() updateRoleDto: UpdateRoleDto,
    @Request() request: Request & { user: AuthUser },
  ): Promise<RoleWithPermissions> {
    const user: AuthUser = request.user;
    return this.roleService.update(id, updateRoleDto, user.id);
  }

  /**
   * Deletes a role
   * @param {string} id - Role ID
   * @param {Request} request - Express request object
   * @returns {Promise<void>}
   */
  @Delete(':id')
  @RequirePermission('role.delete')
  async remove(
    @Param('id', ParseUUIDPipe) id: string,
    @Request() request: Request & { user: AuthUser },
  ): Promise<void> {
    const user: AuthUser = request.user;
    return this.roleService.remove(id, user.id);
  }
}
