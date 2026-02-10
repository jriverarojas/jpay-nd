/**
 * @fileoverview Tenant User entity
 * @module entities/tenant-user.entity
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
import { TenantUserRole } from './tenant-user-role.entity';

/**
 * TenantUser entity
 * Represents the tenant_user table in the jpay schema
 */
@Entity({ name: 'tenant_user', schema: 'jpay' })
export class TenantUser {
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
   * External User ID (unique)
   */
  @Column({ name: 'external_user_id', type: 'varchar', length: 255, unique: true })
  externalUserId: string;

  /**
   * Username/display handle
   */
  @Column({ type: 'varchar', length: 255 })
  username: string;

  /**
   * First name
   */
  @Column({ type: 'varchar', length: 255, nullable: true })
  firstname: string | null;

  /**
   * Last name
   */
  @Column({ type: 'varchar', length: 255, nullable: true })
  lastname: string | null;

  /**
   * Status: PENDING_INVITE | ACTIVE
   */
  @Column({ type: 'varchar', length: 50, default: 'PENDING_INVITE' })
  status: string;

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
  @ManyToOne(() => Tenant, (tenant) => tenant.tenantUsers, { onDelete: 'CASCADE', onUpdate: 'CASCADE' })
  @JoinColumn({ name: 'tenant_id' })
  tenant: Tenant;

  /**
   * One-to-many relationship with TenantUserRole
   */
  @OneToMany(() => TenantUserRole, (tenantUserRole) => tenantUserRole.tenantUser)
  roles: TenantUserRole[];
}
