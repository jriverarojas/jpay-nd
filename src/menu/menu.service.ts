/**
 * @fileoverview Menu service for retrieving user menus
 * @module menu/menu.service
 */

import { Injectable } from '@nestjs/common';
import { InjectRepository } from '@nestjs/typeorm';
import { Repository, In } from 'typeorm';
import { I18nContext } from 'nestjs-i18n';
import { TenantUser } from '../entities/tenant-user.entity';
import { Permission } from '../entities/permission.entity';
import { PermissionTranslation } from '../entities/permission-translation.entity';
import { PermissionService } from '../auth/services/permission.service';

/**
 * Menu item interface
 */
export interface MenuItem {
  code: string;
  label: string;
  description?: string | null;
  url: string;
  sortOrder: number;
  group?: string | null;
  children?: MenuItem[];
}

/**
 * Menu service
 * Provides methods to retrieve user menus based on permissions
 */
@Injectable()
export class MenuService {
  constructor(
    @InjectRepository(TenantUser)
    private readonly tenantUserRepository: Repository<TenantUser>,
    @InjectRepository(Permission)
    private readonly permissionRepository: Repository<Permission>,
    @InjectRepository(PermissionTranslation)
    private readonly permissionTranslationRepository: Repository<PermissionTranslation>,
    private readonly permissionService: PermissionService,
  ) {}

  /**
   * Gets menu items for a user based on their permissions
   * @param {string} externalUserId - External user ID (Supabase UUID)
   * @returns {Promise<MenuItem[]>} Array of menu items
   */
  async getUserMenus(externalUserId: string): Promise<MenuItem[]> {
    // Get current language from I18n context
    const i18nContext = I18nContext.current();
    // Extract language from context (default to 'en')
    const languageCode = i18nContext ? (i18nContext as any).lang || 'en' : 'en';

    // Check if user is ADMIN (has access to all menus)
    const isAdmin = await this.permissionService.isAdmin(externalUserId);

    // Get tenant user
    const tenantUser = await this.tenantUserRepository.findOne({
      where: { externalUserId },
    });

    if (!tenantUser) {
      return [];
    }

    // Get all menu permissions
    let menuPermissions: Permission[];

    if (isAdmin) {
      // Admin gets all active menu permissions
      menuPermissions = await this.permissionRepository.find({
        where: {
          permissionType: 'MENU',
          isActive: true,
        },
        order: {
          sortOrder: 'ASC',
        },
      });
    } else {
      // Regular user gets only permissions from their roles
      const tenantUserWithRoles = await this.tenantUserRepository
        .createQueryBuilder('tu')
        .leftJoinAndSelect('tu.roles', 'tur')
        .leftJoinAndSelect('tur.role', 'r')
        .leftJoinAndSelect('r.rolePermissions', 'rp')
        .leftJoinAndSelect('rp.permission', 'p')
        .where('tu.external_user_id = :externalUserId', { externalUserId })
        .getOne();

      if (!tenantUserWithRoles) {
        return [];
      }
      // Regular user gets only permissions from their roles
      const permissionIds = new Set<string>();
      for (const tenantUserRole of tenantUserWithRoles.roles) {
        const role = tenantUserRole.role;
        if (role && role.rolePermissions) {
          for (const rolePermission of role.rolePermissions) {
            const permission = rolePermission.permission;
            if (
              permission &&
              permission.isActive &&
              permission.permissionType === 'MENU'
            ) {
              permissionIds.add(permission.id);
            }
          }
        }
      }

      if (permissionIds.size === 0) {
        return [];
      }

      menuPermissions = await this.permissionRepository.find({
        where: {
          id: In(Array.from(permissionIds)),
          isActive: true,
        },
        order: {
          sortOrder: 'ASC',
        },
      });
    }

    // Get translations for all menu permissions
    const permissionIds = menuPermissions.map((p) => p.id);
    const translations = await this.permissionTranslationRepository.find({
      where: {
        permissionId: In(permissionIds),
        languageCode,
      },
    });

    // Create a map of permission ID to translation
    const translationMap = new Map<string, PermissionTranslation>();
    translations.forEach((translation) => {
      translationMap.set(translation.permissionId, translation);
    });

    // Build menu items with translations
    const menuItemsMap = new Map<string, MenuItem>();

    // First pass: create all menu items
    for (const permission of menuPermissions) {
      const translation = translationMap.get(permission.id);
      const url = this.codeToUrl(permission.code);

      menuItemsMap.set(permission.id, {
        code: permission.code,
        label: translation?.label || permission.code,
        description: translation?.description || null,
        url,
        sortOrder: permission.sortOrder,
        group: permission.group || null,
        children: [],
      });
    }

    // Second pass: build hierarchy (parent-child relationships)
    const rootMenus: MenuItem[] = [];

    for (const permission of menuPermissions) {
      const menuItem = menuItemsMap.get(permission.id);
      if (!menuItem) continue;

      if (permission.parentPermissionId) {
        // This is a child menu
        const parentMenuItem = menuItemsMap.get(permission.parentPermissionId);
        if (parentMenuItem) {
          parentMenuItem.children = parentMenuItem.children || [];
          parentMenuItem.children.push(menuItem);
          // Sort children by sortOrder
          parentMenuItem.children.sort((a, b) => a.sortOrder - b.sortOrder);
        }
      } else {
        // This is a root menu
        rootMenus.push(menuItem);
      }
    }

    // Sort root menus by sortOrder
    rootMenus.sort((a, b) => a.sortOrder - b.sortOrder);

    return rootMenus;
  }

  /**
   * Converts permission code to URL
   * @param {string} code - Permission code
   * @returns {string} URL path
   */
  private codeToUrl(code: string): string {
    // Convert code to URL format
    // Examples: 'dashboard' -> '/dashboard', 'payments.recurring' -> '/payments/recurring'
    return '/' + code.replace(/\./g, '/');
  }
}
