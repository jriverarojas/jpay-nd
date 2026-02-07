/**
 * @fileoverview Role Permission entity (junction table)
 * @module entities/role-permission.entity
 */

import { Entity, PrimaryColumn, ManyToOne, JoinColumn, CreateDateColumn } from 'typeorm';
import { Role } from './role.entity';
import { Permission } from './permission.entity';

/**
 * RolePermission entity
 * Represents the role_permission junction table in the jpay schema
 */
@Entity({ name: 'role_permission', schema: 'jpay' })
export class RolePermission {
  /**
   * Foreign key to Role (part of composite primary key)
   */
  @PrimaryColumn({ name: 'role_id', type: 'uuid' })
  roleId: string;

  /**
   * Foreign key to Permission (part of composite primary key)
   */
  @PrimaryColumn({ name: 'permission_id', type: 'uuid' })
  permissionId: string;

  /**
   * Creation timestamp
   */
  @CreateDateColumn({ name: 'created_at', type: 'timestamptz' })
  createdAt: Date;

  /**
   * Many-to-one relationship with Role
   */
  @ManyToOne(() => Role, (role) => role.rolePermissions, { onDelete: 'CASCADE', onUpdate: 'CASCADE' })
  @JoinColumn({ name: 'role_id' })
  role: Role;

  /**
   * Many-to-one relationship with Permission
   */
  @ManyToOne(() => Permission, (permission) => permission.rolePermissions, { onDelete: 'CASCADE', onUpdate: 'CASCADE' })
  @JoinColumn({ name: 'permission_id' })
  permission: Permission;
}
