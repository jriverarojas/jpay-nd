/**
 * @fileoverview Role service for managing roles
 * @module role/role.service
 */

import { Injectable, NotFoundException, BadRequestException } from '@nestjs/common';
import { InjectRepository } from '@nestjs/typeorm';
import { Repository, In } from 'typeorm';
import { Role } from '../entities/role.entity';
import { Permission } from '../entities/permission.entity';
import { RolePermission } from '../entities/role-permission.entity';
import { CreateRoleDto } from './dto/create-role.dto';
import { UpdateRoleDto } from './dto/update-role.dto';
import { PermissionService } from '../auth/services/permission.service';

/**
 * Menu permission tree node
 */
export interface MenuPermissionNode {
  id: string;
  code: string;
  permissionType: string;
  group: string | null;
  sortOrder: number;
  isActive: boolean;
  onlyAdmin: boolean;
  assigned: boolean;
  children?: MenuPermissionNode[];
}

/**
 * Permission with assigned flag
 */
export interface PermissionWithAssigned extends Permission {
  assigned: boolean;
}

/**
 * Role with permissions response
 */
export interface RoleWithPermissions {
  id: string;
  externalRoleKey: string;
  name: string;
  onlyAdmin: boolean;
  createdAt: Date;
  updatedAt: Date;
  menuPermissions: MenuPermissionNode[];
  otherPermissions: PermissionWithAssigned[];
}

/**
 * Role service
 * Provides methods to manage roles and their permissions
 */
@Injectable()
export class RoleService {
  constructor(
    @InjectRepository(Role)
    private readonly roleRepository: Repository<Role>,
    @InjectRepository(Permission)
    private readonly permissionRepository: Repository<Permission>,
    @InjectRepository(RolePermission)
    private readonly rolePermissionRepository: Repository<RolePermission>,
    private readonly permissionService: PermissionService,
  ) {}

  /**
   * Builds a tree structure from menu permissions
   * @param {Permission[]} permissions - Flat list of permissions
   * @returns {MenuPermissionNode[]} Tree structure
   */
  private buildMenuTree(permissions: Permission[]): MenuPermissionNode[] {
    const permissionMap = new Map<string, MenuPermissionNode>();
    const roots: MenuPermissionNode[] = [];

    // Create nodes for all permissions
    for (const perm of permissions) {
      const node: MenuPermissionNode = {
        id: perm.id,
        code: perm.code,
        permissionType: perm.permissionType,
        group: perm.group,
        sortOrder: perm.sortOrder,
        isActive: perm.isActive,
        onlyAdmin: perm.onlyAdmin,
        assigned: false, // Will be set later
        children: [],
      };
      permissionMap.set(perm.id, node);
    }

    // Build tree structure
    for (const perm of permissions) {
      const node = permissionMap.get(perm.id)!;
      if (perm.parentPermissionId) {
        const parent = permissionMap.get(perm.parentPermissionId);
        if (parent) {
          if (!parent.children) {
            parent.children = [];
          }
          parent.children.push(node);
        }
      } else {
        roots.push(node);
      }
    }

    // Sort children by sortOrder
    const sortChildren = (nodes: MenuPermissionNode[]) => {
      nodes.sort((a, b) => a.sortOrder - b.sortOrder);
      for (const node of nodes) {
        if (node.children && node.children.length > 0) {
          sortChildren(node.children);
        }
      }
    };

    sortChildren(roots);
    return roots;
  }

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
    const isAdmin = await this.permissionService.isAdmin(externalUserId);

    if (isAdmin) {
      return permissions; // Admin can see all permissions
    }

    // Non-admin users can only see permissions that are not only_admin
    return permissions.filter((permission) => !permission.onlyAdmin);
  }

  /**
   * Filters roles by admin access
   * @param {string} externalUserId - External user ID
   * @param {Role[]} roles - Roles to filter
   * @returns {Promise<Role[]>} Filtered roles
   */
  private async filterRolesByAdminAccess(externalUserId: string, roles: Role[]): Promise<Role[]> {
    const isAdmin = await this.permissionService.isAdmin(externalUserId);

    if (isAdmin) {
      return roles; // Admin can see all roles
    }

    // Non-admin users can only see roles that are not only_admin
    return roles.filter((role) => !role.onlyAdmin);
  }

  /**
   * Creates a new role
   * @param {string} tenantId - Tenant ID
   * @param {CreateRoleDto} createRoleDto - Role creation data
   * @param {string} currentUserId - Current user ID (for admin check)
   * @returns {Promise<RoleWithPermissions>} Created role with permissions
   */
  async create(
    tenantId: string,
    createRoleDto: CreateRoleDto,
    currentUserId: string,
  ): Promise<RoleWithPermissions> {
    // Check if role with same external_role_key already exists in tenant
    const existingRole = await this.roleRepository.findOne({
      where: {
        externalRoleKey: createRoleDto.externalRoleKey,
        tenantId,
      },
    });

    if (existingRole) {
      throw new BadRequestException('Role with this externalRoleKey already exists in this tenant');
    }

    // Create role
    const role = this.roleRepository.create({
      tenantId,
      externalRoleKey: createRoleDto.externalRoleKey,
      name: createRoleDto.name,
      onlyAdmin: createRoleDto.onlyAdmin ?? false,
    });

    const savedRole = await this.roleRepository.save(role);

    // Assign permissions if provided
    if (createRoleDto.permissionIds && createRoleDto.permissionIds.length > 0) {
      // Verify all permissions exist
      const permissions = await this.permissionRepository.find({
        where: {
          id: In(createRoleDto.permissionIds),
        },
      });

      if (permissions.length !== createRoleDto.permissionIds.length) {
        throw new BadRequestException('One or more permissions not found');
      }

      // Filter permissions by admin access
      const filteredPermissions = await this.filterPermissionsByAdminAccess(currentUserId, permissions);

      if (filteredPermissions.length !== permissions.length) {
        throw new BadRequestException('Cannot assign admin-only permissions');
      }

      // Create role-permission relationships
      const rolePermissions = createRoleDto.permissionIds.map((permissionId) =>
        this.rolePermissionRepository.create({
          roleId: savedRole.id,
          permissionId,
        }),
      );

      await this.rolePermissionRepository.save(rolePermissions);
    }

    return this.findOne(savedRole.id, currentUserId);
  }

  /**
   * Finds all roles for a tenant
   * @param {string} tenantId - Tenant ID
   * @param {string} currentUserId - Current user ID (for admin check)
   * @returns {Promise<RoleWithPermissions[]>} List of roles with permissions
   */
  async findAll(tenantId: string, currentUserId: string): Promise<RoleWithPermissions[]> {
    const roles = await this.roleRepository.find({
      where: { tenantId },
      relations: ['rolePermissions', 'rolePermissions.permission'],
    });

    // Filter roles by admin access
    const filteredRoles = await this.filterRolesByAdminAccess(currentUserId, roles);

    // Build response with permissions
    const result: RoleWithPermissions[] = [];

    for (const role of filteredRoles) {
      const roleWithPerms = await this.findOne(role.id, currentUserId);
      result.push(roleWithPerms);
    }

    return result;
  }

  /**
   * Finds a role by ID with permissions
   * @param {string} id - Role ID
   * @param {string} currentUserId - Current user ID (for admin check)
   * @returns {Promise<RoleWithPermissions>} Role with permissions
   */
  async findOne(id: string, currentUserId: string): Promise<RoleWithPermissions> {
    const role = await this.roleRepository.findOne({
      where: { id },
      relations: ['rolePermissions', 'rolePermissions.permission'],
    });

    if (!role) {
      throw new NotFoundException('Role not found');
    }

    // Check if user can view this role
    const isAdmin = await this.permissionService.isAdmin(currentUserId);
    if (!isAdmin && role.onlyAdmin) {
      throw new NotFoundException('Role not found');
    }

    // Get all permissions for this role
    const allPermissions = role.rolePermissions
      .map((rp) => rp.permission)
      .filter((p) => p) as Permission[];

    // Get all available permissions (for frontend checkbox list)
    const allAvailablePermissions = await this.permissionRepository.find({
      where: { isActive: true },
      order: { sortOrder: 'ASC' },
    });

    // Filter available permissions by admin access
    const filteredAvailablePermissions = await this.filterPermissionsByAdminAccess(
      currentUserId,
      allAvailablePermissions,
    );

    // Separate menu permissions from other permissions
    const menuPermissions = filteredAvailablePermissions.filter((p) => p.permissionType === 'MENU');
    const otherPermissions = filteredAvailablePermissions.filter((p) => p.permissionType !== 'MENU');

    // Build menu tree
    const menuTree = this.buildMenuTree(menuPermissions);

    // Mark which permissions are assigned to this role
    const assignedPermissionIds = new Set(allPermissions.map((p) => p.id));

    const markAssigned = (nodes: MenuPermissionNode[]) => {
      for (const node of nodes) {
        node.assigned = assignedPermissionIds.has(node.id);
        if (node.children && node.children.length > 0) {
          markAssigned(node.children);
        }
      }
    };

    markAssigned(menuTree);

    return {
      id: role.id,
      externalRoleKey: role.externalRoleKey,
      name: role.name,
      onlyAdmin: role.onlyAdmin,
      createdAt: role.createdAt,
      updatedAt: role.updatedAt,
      menuPermissions: menuTree,
      otherPermissions: otherPermissions.map((p) => ({
        ...p,
        assigned: assignedPermissionIds.has(p.id),
      })),
    };
  }

  /**
   * Updates a role
   * @param {string} id - Role ID
   * @param {UpdateRoleDto} updateRoleDto - Role update data
   * @param {string} currentUserId - Current user ID (for admin check)
   * @returns {Promise<RoleWithPermissions>} Updated role with permissions
   */
  async update(id: string, updateRoleDto: UpdateRoleDto, currentUserId: string): Promise<RoleWithPermissions> {
    const role = await this.roleRepository.findOne({ where: { id } });

    if (!role) {
      throw new NotFoundException('Role not found');
    }

    // Check if user can edit this role
    const isAdmin = await this.permissionService.isAdmin(currentUserId);
    if (!isAdmin && role.onlyAdmin) {
      throw new NotFoundException('Role not found');
    }

    // Check if external_role_key is being changed and if it conflicts
    if (updateRoleDto.externalRoleKey && updateRoleDto.externalRoleKey !== role.externalRoleKey) {
      const existingRole = await this.roleRepository.findOne({
        where: {
          externalRoleKey: updateRoleDto.externalRoleKey,
          tenantId: role.tenantId,
        },
      });

      if (existingRole) {
        throw new BadRequestException('Role with this externalRoleKey already exists in this tenant');
      }
    }

    // Update role fields
    if (updateRoleDto.externalRoleKey !== undefined) {
      role.externalRoleKey = updateRoleDto.externalRoleKey;
    }
    if (updateRoleDto.name !== undefined) {
      role.name = updateRoleDto.name;
    }
    if (updateRoleDto.onlyAdmin !== undefined) {
      // Only admin can change onlyAdmin flag
      if (!isAdmin) {
        throw new BadRequestException('Only admin can change onlyAdmin flag');
      }
      role.onlyAdmin = updateRoleDto.onlyAdmin;
    }

    await this.roleRepository.save(role);

    // Update permissions if provided
    if (updateRoleDto.permissionIds !== undefined) {
      // Verify all permissions exist
      const permissions = await this.permissionRepository.find({
        where: {
          id: In(updateRoleDto.permissionIds),
        },
      });

      if (permissions.length !== updateRoleDto.permissionIds.length) {
        throw new BadRequestException('One or more permissions not found');
      }

      // Filter permissions by admin access
      const filteredPermissions = await this.filterPermissionsByAdminAccess(currentUserId, permissions);

      if (filteredPermissions.length !== permissions.length) {
        throw new BadRequestException('Cannot assign admin-only permissions');
      }

      // Remove existing role-permission relationships
      await this.rolePermissionRepository.delete({ roleId: id });

      // Create new role-permission relationships
      const rolePermissions = updateRoleDto.permissionIds.map((permissionId) =>
        this.rolePermissionRepository.create({
          roleId: id,
          permissionId,
        }),
      );

      await this.rolePermissionRepository.save(rolePermissions);
    }

    return this.findOne(id, currentUserId);
  }

  /**
   * Deletes a role
   * @param {string} id - Role ID
   * @param {string} currentUserId - Current user ID (for admin check)
   * @returns {Promise<void>}
   */
  async remove(id: string, currentUserId: string): Promise<void> {
    const role = await this.roleRepository.findOne({ where: { id } });

    if (!role) {
      throw new NotFoundException('Role not found');
    }

    // Check if user can delete this role
    const isAdmin = await this.permissionService.isAdmin(currentUserId);
    if (!isAdmin && role.onlyAdmin) {
      throw new NotFoundException('Role not found');
    }

    await this.roleRepository.remove(role);
  }
}
