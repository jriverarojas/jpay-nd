/**
 * @fileoverview User service for managing tenant users
 * @module user/user.service
 */

import { Injectable, NotFoundException, BadRequestException, Logger } from '@nestjs/common';
import { InjectRepository } from '@nestjs/typeorm';
import { Repository, In } from 'typeorm';
import { TenantUser } from '../entities/tenant-user.entity';
import { Role } from '../entities/role.entity';
import { TenantUserRole } from '../entities/tenant-user-role.entity';
import { CreateUserDto } from './dto/create-user.dto';
import { UpdateUserDto } from './dto/update-user.dto';
import { PermissionService } from '../auth/services/permission.service';
import { SupabaseService } from '../auth/supabase/supabase.service';

/**
 * User service
 * Provides methods to manage tenant users and their roles
 */
@Injectable()
export class UserService {
  private readonly logger = new Logger(UserService.name);

  constructor(
    @InjectRepository(TenantUser)
    private readonly tenantUserRepository: Repository<TenantUser>,
    @InjectRepository(Role)
    private readonly roleRepository: Repository<Role>,
    @InjectRepository(TenantUserRole)
    private readonly tenantUserRoleRepository: Repository<TenantUserRole>,
    private readonly permissionService: PermissionService,
    private readonly supabaseService: SupabaseService,
  ) {}

  /**
   * Gets the tenant ID for a user
   * @param {string} externalUserId - External user ID
   * @returns {Promise<string>} Tenant ID
   */
  async getUserTenantId(externalUserId: string): Promise<string> {
    const tenantUser = await this.tenantUserRepository.findOne({
      where: { externalUserId },
      select: ['tenantId'],
    });

    if (!tenantUser) {
      throw new NotFoundException('User not found');
    }

    return tenantUser.tenantId;
  }

  /**
   * Checks if user is admin and filters roles/permissions accordingly
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
   * Creates a new user
   * @param {string} tenantId - Tenant ID
   * @param {CreateUserDto} createUserDto - User creation data
   * @param {string} currentUserId - Current user ID (for admin check)
   * @returns {Promise<TenantUser>} Created user
   */
  async create(tenantId: string, createUserDto: CreateUserDto, currentUserId: string): Promise<TenantUser> {
    const supabase = this.supabaseService.getClient();

    // Always create a new user in Supabase (externalUserId never comes from the request)
    let externalUserId: string;
    
    try {
      this.logger.log('Creating new user in Supabase');
      
      // Prepare user metadata
      const userMetadata: Record<string, any> = {
        username: createUserDto.username,
      };
      
      if (createUserDto.firstname) {
        userMetadata.firstname = createUserDto.firstname;
      }
      
      if (createUserDto.lastname) {
        userMetadata.lastname = createUserDto.lastname;
      }
      
      // Create user in Supabase without specifying ID (Supabase will generate it)
      // User will be created in PENDING_INVITE status, waiting for invitation acceptance
      const { data: newUser, error: createError } = await supabase.auth.admin.createUser({
        email: createUserDto.email,
        user_metadata: userMetadata,
        email_confirm: false, // Don't auto-confirm, user needs to accept invitation
      });

      if (createError) {
        this.logger.error(`Failed to create user in Supabase: ${createError.message}`, createError.stack);
        throw new BadRequestException(`Failed to create user in Supabase: ${createError.message}`);
      }

      if (!newUser?.user?.id) {
        throw new BadRequestException('Failed to create user in Supabase: No user ID returned');
      }

      externalUserId = newUser.user.id;
      this.logger.log(`Created user in Supabase with ID: ${externalUserId}, status: PENDING_INVITE`);
    } catch (error) {
      if (error instanceof BadRequestException) {
        throw error;
      }
      this.logger.error(`Error creating user in Supabase: ${error.message}`, error.stack);
      throw new BadRequestException(`Failed to create user in Supabase: ${error.message}`);
    }

    // Verify all roles exist and belong to the tenant
    const roles = await this.roleRepository.find({
      where: {
        id: In(createUserDto.roleIds),
        tenantId,
      },
    });

    if (roles.length !== createUserDto.roleIds.length) {
      throw new BadRequestException('One or more roles not found or do not belong to this tenant');
    }

    // Filter roles by admin access
    const filteredRoles = await this.filterRolesByAdminAccess(currentUserId, roles);

    if (filteredRoles.length !== roles.length) {
      throw new BadRequestException('Cannot assign admin-only roles');
    }

    // Create user in database with PENDING_INVITE status
    const user = this.tenantUserRepository.create({
      tenantId,
      externalUserId,
      username: createUserDto.username,
      firstname: createUserDto.firstname || null,
      lastname: createUserDto.lastname || null,
      status: 'PENDING_INVITE', // User is invited but pending acceptance
    });

    const savedUser = await this.tenantUserRepository.save(user);

    // Assign roles
    const tenantUserRoles = createUserDto.roleIds.map((roleId) =>
      this.tenantUserRoleRepository.create({
        tenantUserId: savedUser.id,
        roleId,
      }),
    );

    await this.tenantUserRoleRepository.save(tenantUserRoles);

    // Return user with roles
    return this.findOne(savedUser.id, currentUserId);
  }

  /**
   * Finds all users for a tenant
   * @param {string} tenantId - Tenant ID
   * @param {string} currentUserId - Current user ID (for admin check)
   * @returns {Promise<TenantUser[]>} List of users
   */
  async findAll(tenantId: string, currentUserId: string): Promise<TenantUser[]> {
    const users = await this.tenantUserRepository.find({
      where: { tenantId },
      relations: ['roles', 'roles.role'],
    });

    // Filter roles by admin access for each user
    for (const user of users) {
      if (user.roles && user.roles.length > 0) {
        const roles = user.roles.map((tur) => tur.role).filter((r) => r) as Role[];
        const filteredRoles = await this.filterRolesByAdminAccess(currentUserId, roles);
        user.roles = user.roles.filter((tur) => filteredRoles.some((r) => r.id === tur.roleId));
      }
    }

    return users;
  }

  /**
   * Finds a user by ID
   * @param {string} id - User ID
   * @param {string} currentUserId - Current user ID (for admin check)
   * @returns {Promise<TenantUser>} User
   */
  async findOne(id: string, currentUserId: string): Promise<TenantUser> {
    const user = await this.tenantUserRepository.findOne({
      where: { id },
      relations: ['roles', 'roles.role'],
    });

    if (!user) {
      throw new NotFoundException('User not found');
    }

    // Filter roles by admin access
    if (user.roles && user.roles.length > 0) {
      const roles = user.roles.map((tur) => tur.role).filter((r) => r) as Role[];
      const filteredRoles = await this.filterRolesByAdminAccess(currentUserId, roles);
      user.roles = user.roles.filter((tur) => filteredRoles.some((r) => r.id === tur.roleId));
    }

    return user;
  }

  /**
   * Updates a user
   * @param {string} id - User ID
   * @param {UpdateUserDto} updateUserDto - User update data
   * @param {string} currentUserId - Current user ID (for admin check)
   * @returns {Promise<TenantUser>} Updated user
   */
  async update(id: string, updateUserDto: UpdateUserDto, currentUserId: string): Promise<TenantUser> {
    const user = await this.tenantUserRepository.findOne({
      where: { id },
      relations: ['roles'],
    });

    if (!user) {
      throw new NotFoundException('User not found');
    }

    // Update username if provided
    if (updateUserDto.username !== undefined) {
      user.username = updateUserDto.username;
      await this.tenantUserRepository.save(user);

      // Update user in Supabase (externalUserId is the Supabase user ID)
      const supabase = this.supabaseService.getClient();
      try {
        const { error: updateError } = await supabase.auth.admin.updateUserById(user.externalUserId, {
          user_metadata: {
            username: updateUserDto.username,
          },
        });

        if (updateError) {
          this.logger.error(`Failed to update user in Supabase: ${updateError.message}`, updateError);
          // Don't throw error, just log it - database update succeeded
        } else {
          this.logger.log(`Updated user in Supabase with ID: ${user.externalUserId}`);
        }
      } catch (error) {
        this.logger.error(`Error updating user in Supabase: ${error.message}`, error.stack);
        // Don't throw error, just log it - database update succeeded
      }
    }

    // Update roles if provided
    if (updateUserDto.roleIds !== undefined) {
      // Verify all roles exist and belong to the tenant
      const roles = await this.roleRepository.find({
        where: {
          id: In(updateUserDto.roleIds),
          tenantId: user.tenantId,
        },
      });

      if (roles.length !== updateUserDto.roleIds.length) {
        throw new BadRequestException('One or more roles not found or do not belong to this tenant');
      }

      // Filter roles by admin access
      const filteredRoles = await this.filterRolesByAdminAccess(currentUserId, roles);

      if (filteredRoles.length !== roles.length) {
        throw new BadRequestException('Cannot assign admin-only roles');
      }

      // Remove existing role assignments
      await this.tenantUserRoleRepository.delete({ tenantUserId: id });

      // Create new role assignments
      const tenantUserRoles = updateUserDto.roleIds.map((roleId) =>
        this.tenantUserRoleRepository.create({
          tenantUserId: id,
          roleId,
        }),
      );

      await this.tenantUserRoleRepository.save(tenantUserRoles);
    }

    return this.findOne(id, currentUserId);
  }

  /**
   * Deletes a user
   * @param {string} id - User ID
   * @returns {Promise<void>}
   */
  async remove(id: string): Promise<void> {
    const user = await this.tenantUserRepository.findOne({ where: { id } });

    if (!user) {
      throw new NotFoundException('User not found');
    }

    // Delete user from Supabase (externalUserId is the Supabase user ID)
    const supabase = this.supabaseService.getClient();
    try {
      const { error: deleteError } = await supabase.auth.admin.deleteUser(user.externalUserId);

      if (deleteError) {
        this.logger.error(`Failed to delete user from Supabase: ${deleteError.message}`, deleteError);
        // Just log the error and continue with database deletion
        // This allows database cleanup even if Supabase deletion fails
        this.logger.warn(`Continuing with database deletion despite Supabase error`);
      } else {
        this.logger.log(`Deleted user from Supabase with ID: ${user.externalUserId}`);
      }
    } catch (error) {
      this.logger.error(`Error deleting user from Supabase: ${error.message}`, error.stack);
      // Continue with database deletion
    }

    // Delete user from database
    await this.tenantUserRepository.remove(user);
  }
}
