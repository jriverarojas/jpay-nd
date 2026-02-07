/**
 * @fileoverview Permission service for managing permissions
 * @module permission/permission.service
 */

import { Injectable, NotFoundException, BadRequestException } from '@nestjs/common';
import { InjectRepository } from '@nestjs/typeorm';
import { Repository } from 'typeorm';
import { Permission } from '../entities/permission.entity';
import { CreatePermissionDto } from './dto/create-permission.dto';
import { UpdatePermissionDto } from './dto/update-permission.dto';
import { PermissionService as AuthPermissionService } from '../auth/services/permission.service';

/**
 * Permission service
 * Provides methods to manage permissions
 */
@Injectable()
export class PermissionService {
  constructor(
    @InjectRepository(Permission)
    private readonly permissionRepository: Repository<Permission>,
    private readonly authPermissionService: AuthPermissionService,
  ) {}

  /**
   * Filters permissions by admin access
   * @param {string} externalUserId - External user ID
   * @param {Permission[]} permissions - Permissions to filter
   * @returns {Promise<Permission[]>} Filtered permissions
   */
  private async filterPermissionsByAdminAccess(
    externalUserId: string,
    permissions: Permission[],
  ): Promise<Permission[]> {
    const isAdmin = await this.authPermissionService.isAdmin(externalUserId);

    if (isAdmin) {
      return permissions; // Admin can see all permissions
    }

    // Non-admin users can only see permissions that are not only_admin
    return permissions.filter((permission) => !permission.onlyAdmin);
  }

  /**
   * Creates a new permission
   * @param {CreatePermissionDto} createPermissionDto - Permission creation data
   * @param {string} currentUserId - Current user ID (for admin check)
   * @returns {Promise<Permission>} Created permission
   */
  async create(createPermissionDto: CreatePermissionDto, currentUserId: string): Promise<Permission> {
    // Check if permission with same code already exists
    const existingPermission = await this.permissionRepository.findOne({
      where: { code: createPermissionDto.code },
    });

    if (existingPermission) {
      throw new BadRequestException('Permission with this code already exists');
    }

    // Verify parent permission exists if provided
    if (createPermissionDto.parentPermissionId) {
      const parentPermission = await this.permissionRepository.findOne({
        where: { id: createPermissionDto.parentPermissionId },
      });

      if (!parentPermission) {
        throw new BadRequestException('Parent permission not found');
      }

      // Check if user can assign admin-only parent
      const isAdmin = await this.authPermissionService.isAdmin(currentUserId);
      if (!isAdmin && parentPermission.onlyAdmin) {
        throw new BadRequestException('Cannot use admin-only parent permission');
      }
    }

    // Create permission
    const permission = this.permissionRepository.create({
      code: createPermissionDto.code,
      permissionType: createPermissionDto.permissionType,
      group: createPermissionDto.group ?? null,
      parentPermissionId: createPermissionDto.parentPermissionId ?? null,
      sortOrder: createPermissionDto.sortOrder ?? 0,
      isActive: createPermissionDto.isActive ?? true,
      onlyAdmin: createPermissionDto.onlyAdmin ?? false,
    });

    return this.permissionRepository.save(permission);
  }

  /**
   * Finds all permissions
   * @param {string} currentUserId - Current user ID (for admin check)
   * @returns {Promise<Permission[]>} List of permissions
   */
  async findAll(currentUserId: string): Promise<Permission[]> {
    const permissions = await this.permissionRepository.find({
      order: { sortOrder: 'ASC' },
      relations: ['parent', 'children'],
    });

    return this.filterPermissionsByAdminAccess(currentUserId, permissions);
  }

  /**
   * Finds a permission by ID
   * @param {string} id - Permission ID
   * @param {string} currentUserId - Current user ID (for admin check)
   * @returns {Promise<Permission>} Permission
   */
  async findOne(id: string, currentUserId: string): Promise<Permission> {
    const permission = await this.permissionRepository.findOne({
      where: { id },
      relations: ['parent', 'children'],
    });

    if (!permission) {
      throw new NotFoundException('Permission not found');
    }

    // Check if user can view this permission
    const isAdmin = await this.authPermissionService.isAdmin(currentUserId);
    if (!isAdmin && permission.onlyAdmin) {
      throw new NotFoundException('Permission not found');
    }

    return permission;
  }

  /**
   * Updates a permission
   * @param {string} id - Permission ID
   * @param {UpdatePermissionDto} updatePermissionDto - Permission update data
   * @param {string} currentUserId - Current user ID (for admin check)
   * @returns {Promise<Permission>} Updated permission
   */
  async update(id: string, updatePermissionDto: UpdatePermissionDto, currentUserId: string): Promise<Permission> {
    const permission = await this.permissionRepository.findOne({ where: { id } });

    if (!permission) {
      throw new NotFoundException('Permission not found');
    }

    // Check if user can edit this permission
    const isAdmin = await this.authPermissionService.isAdmin(currentUserId);
    if (!isAdmin && permission.onlyAdmin) {
      throw new NotFoundException('Permission not found');
    }

    // Check if code is being changed and if it conflicts
    if (updatePermissionDto.code && updatePermissionDto.code !== permission.code) {
      const existingPermission = await this.permissionRepository.findOne({
        where: { code: updatePermissionDto.code },
      });

      if (existingPermission) {
        throw new BadRequestException('Permission with this code already exists');
      }
    }

    // Verify parent permission exists if provided
    if (updatePermissionDto.parentPermissionId !== undefined) {
      if (updatePermissionDto.parentPermissionId) {
        const parentPermission = await this.permissionRepository.findOne({
          where: { id: updatePermissionDto.parentPermissionId },
        });

        if (!parentPermission) {
          throw new BadRequestException('Parent permission not found');
        }

        // Check if user can assign admin-only parent
        if (!isAdmin && parentPermission.onlyAdmin) {
          throw new BadRequestException('Cannot use admin-only parent permission');
        }

        // Prevent circular reference
        if (updatePermissionDto.parentPermissionId === id) {
          throw new BadRequestException('Cannot set permission as its own parent');
        }
      }
    }

    // Update permission fields
    if (updatePermissionDto.code !== undefined) {
      permission.code = updatePermissionDto.code;
    }
    if (updatePermissionDto.permissionType !== undefined) {
      permission.permissionType = updatePermissionDto.permissionType;
    }
    if (updatePermissionDto.group !== undefined) {
      permission.group = updatePermissionDto.group;
    }
    if (updatePermissionDto.parentPermissionId !== undefined) {
      permission.parentPermissionId = updatePermissionDto.parentPermissionId;
    }
    if (updatePermissionDto.sortOrder !== undefined) {
      permission.sortOrder = updatePermissionDto.sortOrder;
    }
    if (updatePermissionDto.isActive !== undefined) {
      permission.isActive = updatePermissionDto.isActive;
    }
    if (updatePermissionDto.onlyAdmin !== undefined) {
      // Only admin can change onlyAdmin flag
      if (!isAdmin) {
        throw new BadRequestException('Only admin can change onlyAdmin flag');
      }
      permission.onlyAdmin = updatePermissionDto.onlyAdmin;
    }

    return this.permissionRepository.save(permission);
  }

  /**
   * Deletes a permission
   * @param {string} id - Permission ID
   * @param {string} currentUserId - Current user ID (for admin check)
   * @returns {Promise<void>}
   */
  async remove(id: string, currentUserId: string): Promise<void> {
    const permission = await this.permissionRepository.findOne({ where: { id } });

    if (!permission) {
      throw new NotFoundException('Permission not found');
    }

    // Check if user can delete this permission
    const isAdmin = await this.authPermissionService.isAdmin(currentUserId);
    if (!isAdmin && permission.onlyAdmin) {
      throw new NotFoundException('Permission not found');
    }

    // Check if permission has children
    const children = await this.permissionRepository.find({
      where: { parentPermissionId: id },
    });

    if (children.length > 0) {
      throw new BadRequestException('Cannot delete permission with children. Delete children first.');
    }

    await this.permissionRepository.remove(permission);
  }
}
