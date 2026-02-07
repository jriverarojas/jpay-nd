/**
 * @fileoverview Role entity
 * @module entities/role.entity
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
import { Tenant } from './tenant.entity';
import { RolePermission } from './role-permission.entity';
import { TenantUserRole } from './tenant-user-role.entity';

/**
 * Role entity
 * Represents the role table in the jpay schema
 */
@Entity({ name: 'role', schema: 'jpay' })
export class Role {
  /**
   * Primary key - UUID
   */
  @PrimaryGeneratedColumn('uuid')
  id: string;

  /**
   * Foreign key to Tenant
   */
  @Column({ name: 'tenant_id', type: 'uuid' })
  tenantId: string;

  /**
   * External role key (unique within tenant)
   * Maps to External role identifier/key
   */
  @Column({ name: 'external_role_key', type: 'varchar', length: 255 })
  externalRoleKey: string;

  /**
   * Role name shown in app
   */
  @Column({ type: 'varchar', length: 255 })
  name: string;

  /**
   * Whether this role can only be assigned/viewed by admin users
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
   * Many-to-one relationship with Tenant
   */
  @ManyToOne(() => Tenant, (tenant) => tenant.roles, { onDelete: 'CASCADE', onUpdate: 'CASCADE' })
  @JoinColumn({ name: 'tenant_id' })
  tenant: Tenant;

  /**
   * One-to-many relationship with RolePermission
   */
  @OneToMany(() => RolePermission, (rolePermission) => rolePermission.role)
  rolePermissions: RolePermission[];

  /**
   * One-to-many relationship with TenantUserRole
   */
  @OneToMany(() => TenantUserRole, (tenantUserRole) => tenantUserRole.role)
  tenantUsers: TenantUserRole[];
}
