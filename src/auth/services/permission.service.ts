/**
 * @fileoverview Permission service for checking user permissions
 * @module auth/services/permission.service
 */

import { Injectable } from '@nestjs/common';
import { InjectRepository } from '@nestjs/typeorm';
import { Repository } from 'typeorm';
import { TenantUser } from '../../entities/tenant-user.entity';
import { Role } from '../../entities/role.entity';
import { Permission } from '../../entities/permission.entity';

/**
 * Permission service
 * Provides methods to check user permissions and roles
 */
@Injectable()
export class PermissionService {
  constructor(
    @InjectRepository(TenantUser)
    private readonly tenantUserRepository: Repository<TenantUser>,
    @InjectRepository(Role)
    private readonly roleRepository: Repository<Role>,
    @InjectRepository(Permission)
    private readonly permissionRepository: Repository<Permission>,
  ) {}

  /**
   * Checks if a user has the ADMIN role
   * @param {string} externalUserId - External user ID (Supabase UUID)
   * @returns {Promise<boolean>} True if user has ADMIN role
   */
  async isAdmin(externalUserId: string): Promise<boolean> {
    const tenantUser = await this.tenantUserRepository
      .createQueryBuilder('tu')
      .leftJoinAndSelect('tu.roles', 'tur')
      .leftJoinAndSelect('tur.role', 'r')
      .where('tu.external_user_id = :externalUserId', { externalUserId })
      .getOne();

    if (!tenantUser || !tenantUser.roles) {
      return false;
    }

    // Check if any of the user's roles has external_role_key = 'ADMIN'
    const hasAdminRole = tenantUser.roles.some(
      (tenantUserRole) => tenantUserRole.role?.externalRoleKey === 'ADMIN',
    );

    return hasAdminRole;
  }

  /**
   * Gets all permission codes for a user
   * @param {string} externalUserId - External user ID (Supabase UUID)
   * @returns {Promise<string[]>} Array of permission codes
   */
  async getUserPermissions(externalUserId: string): Promise<string[]> {
    // Use query builder to efficiently load all relations
    const tenantUser = await this.tenantUserRepository
      .createQueryBuilder('tu')
      .leftJoinAndSelect('tu.roles', 'tur')
      .leftJoinAndSelect('tur.role', 'r')
      .leftJoinAndSelect('r.rolePermissions', 'rp')
      .leftJoinAndSelect('rp.permission', 'p')
      .where('tu.external_user_id = :externalUserId', { externalUserId })
      .getOne();

    if (!tenantUser || !tenantUser.roles) {
      return [];
    }

    // Get all unique permission codes from all user's roles
    const permissionCodes = new Set<string>();

    for (const tenantUserRole of tenantUser.roles) {
      const role = tenantUserRole.role;
      if (role && role.rolePermissions) {
        for (const rolePermission of role.rolePermissions) {
          const permission = rolePermission.permission;
          if (permission && permission.isActive) {
            permissionCodes.add(permission.code);
          }
        }
      }
    }

    return Array.from(permissionCodes);
  }

  /**
   * Checks if a user has a specific permission
   * @param {string} externalUserId - External user ID (Supabase UUID)
   * @param {string} permissionCode - Permission code to check
   * @returns {Promise<boolean>} True if user has the permission
   */
  async hasPermission(externalUserId: string, permissionCode: string): Promise<boolean> {
    // First check if user is ADMIN
    const isUserAdmin = await this.isAdmin(externalUserId);
    if (isUserAdmin) {
      return true;
    }

    // Get all user permissions
    const userPermissions = await this.getUserPermissions(externalUserId);

    // Check if user has the required permission
    return userPermissions.includes(permissionCode);
  }

  /**
   * Checks if a user has all required permissions
   * @param {string} externalUserId - External user ID (Supabase UUID)
   * @param {string[]} permissionCodes - Array of permission codes to check
   * @returns {Promise<boolean>} True if user has all required permissions
   */
  async hasAllPermissions(externalUserId: string, permissionCodes: string[]): Promise<boolean> {
    // First check if user is ADMIN
    const isUserAdmin = await this.isAdmin(externalUserId);
    if (isUserAdmin) {
      return true;
    }

    // Get all user permissions
    const userPermissions = await this.getUserPermissions(externalUserId);

    // Check if user has all required permissions
    return permissionCodes.every((permissionCode) => userPermissions.includes(permissionCode));
  }
}
