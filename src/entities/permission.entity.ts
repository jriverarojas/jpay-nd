/**
 * @fileoverview Permission entity
 * @module entities/permission.entity
 */

import {
  Entity,
  Column,
  PrimaryGeneratedColumn,
  CreateDateColumn,
  UpdateDateColumn,
  ManyToOne,
  JoinColumn,
  OneToMany,
} from 'typeorm';
import { PermissionTranslation } from './permission-translation.entity';
import { RolePermission } from './role-permission.entity';

/**
 * Permission entity
 * Represents the permission table in the jpay schema
 */
@Entity({ name: 'permission', schema: 'jpay' })
export class Permission {
  /**
   * Primary key - UUID
   */
  @PrimaryGeneratedColumn('uuid')
  id: string;

  /**
   * Unique permission code
   */
  @Column({ type: 'varchar', length: 100, unique: true })
  code: string;

  /**
   * Permission type
   * Examples: MENU, ACTION, etc. (extensible)
   */
  @Column({ name: 'permission_type', type: 'varchar', length: 50 })
  permissionType: string;

  /**
   * Optional menu group
   * Examples: overview, management, reports
   * Used to group menu items in the UI
   */
  @Column({ name: 'group', type: 'varchar', length: 50, nullable: true })
  group: string | null;

  /**
   * Foreign key to parent Permission (self-reference for menu tree)
   * null = root permission
   */
  @Column({ name: 'parent_permission_id', type: 'uuid', nullable: true })
  parentPermissionId: string | null;

  /**
   * Sort order among siblings (for menus)
   */
  @Column({ name: 'sort_order', type: 'integer', default: 0 })
  sortOrder: number;

  /**
   * Whether the permission is active
   */
  @Column({ name: 'is_active', type: 'boolean', default: true })
  isActive: boolean;

  /**
   * Whether this permission can only be assigned/viewed by admin users
   */
  @Column({ name: 'only_admin', type: 'boolean', default: false })
  onlyAdmin: boolean;

  /**
   * Creation timestamp
   */
  @CreateDateColumn({ name: 'created_at', type: 'timestamptz' })
  createdAt: Date;

  /**
   * Last update timestamp
   */
  @UpdateDateColumn({ name: 'updated_at', type: 'timestamptz' })
  updatedAt: Date;

  /**
   * Many-to-one relationship with parent Permission (self-reference)
   */
  @ManyToOne(() => Permission, (permission) => permission.children, { onDelete: 'SET NULL', onUpdate: 'CASCADE' })
  @JoinColumn({ name: 'parent_permission_id' })
  parent: Permission | null;

  /**
   * One-to-many relationship with child Permissions
   */
  @OneToMany(() => Permission, (permission) => permission.parent)
  children: Permission[];

  /**
   * One-to-many relationship with PermissionTranslation
   */
  @OneToMany(() => PermissionTranslation, (translation) => translation.permission)
  translations: PermissionTranslation[];

  /**
   * One-to-many relationship with RolePermission
   */
  @OneToMany(() => RolePermission, (rolePermission) => rolePermission.permission)
  rolePermissions: RolePermission[];
}
