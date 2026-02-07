/**
 * @fileoverview Tenant User Role entity (junction table)
 * @module entities/tenant-user-role.entity
 */

import { Entity, PrimaryColumn, ManyToOne, JoinColumn, CreateDateColumn } from 'typeorm';
import { TenantUser } from './tenant-user.entity';
import { Role } from './role.entity';

/**
 * TenantUserRole entity
 * Represents the tenant_user_role junction table in the jpay schema
 */
@Entity({ name: 'tenant_user_role', schema: 'jpay' })
export class TenantUserRole {
  /**
   * Foreign key to TenantUser (part of composite primary key)
   */
  @PrimaryColumn({ name: 'tenant_user_id', type: 'uuid' })
  tenantUserId: string;

  /**
   * Foreign key to Role (part of composite primary key)
   */
  @PrimaryColumn({ name: 'role_id', type: 'uuid' })
  roleId: string;

  /**
   * Creation timestamp
   */
  @CreateDateColumn({ name: 'created_at', type: 'timestamptz' })
  createdAt: Date;

  /**
   * Many-to-one relationship with TenantUser
   */
  @ManyToOne(() => TenantUser, (tenantUser) => tenantUser.roles, { onDelete: 'CASCADE', onUpdate: 'CASCADE' })
  @JoinColumn({ name: 'tenant_user_id' })
  tenantUser: TenantUser;

  /**
   * Many-to-one relationship with Role
   */
  @ManyToOne(() => Role, (role) => role.tenantUsers, { onDelete: 'CASCADE', onUpdate: 'CASCADE' })
  @JoinColumn({ name: 'role_id' })
  role: Role;
}
