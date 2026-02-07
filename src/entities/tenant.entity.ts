/**
 * @fileoverview Tenant entity
 * @module entities/tenant.entity
 */

import { Entity, Column, PrimaryGeneratedColumn, CreateDateColumn, UpdateDateColumn, ManyToOne, JoinColumn, OneToMany } from 'typeorm';
import { TenantType } from './tenant-type.entity';
import { TenantPaymentType } from './tenant-payment-type.entity';
import { PaymentType } from './payment-type.entity';
import { TenantUser } from './tenant-user.entity';
import { Role } from './role.entity';

/**
 * Tenant entity
 * Represents the tenant table in the jpay schema
 */
@Entity({ name: 'tenant', schema: 'jpay' })
export class Tenant {
  /**
   * Primary key - UUID
   */
  @PrimaryGeneratedColumn('uuid')
  id: string;

  /**
   * External Organization ID (unique)
   */
  @Column({ name: 'external_org_id', type: 'varchar', length: 255, unique: true })
  externalOrgId: string;

  /**
   * Tenant display name
   */
  @Column({ type: 'varchar', length: 255 })
  name: string;

  /**
   * Main contact email
   */
  @Column({ name: 'contact_email', type: 'varchar', length: 255, nullable: true })
  contactEmail: string | null;

  /**
   * Main contact phone
   */
  @Column({ name: 'contact_phone', type: 'varchar', length: 50, nullable: true })
  contactPhone: string | null;

  /**
   * Foreign key to tenant_type
   */
  @Column({ name: 'tenant_type_id', type: 'uuid' })
  tenantTypeId: string;

  /**
   * Tenant-specific editable copy of customer field definitions
   */
  @Column({ name: 'customer_field_overrides_json', type: 'jsonb', nullable: true })
  customerFieldOverridesJson: Record<string, any> | null;

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
   * Many-to-one relationship with TenantType
   */
  @ManyToOne(() => TenantType, (tenantType) => tenantType.tenants)
  @JoinColumn({ name: 'tenant_type_id' })
  tenantType: TenantType;

  /**
   * One-to-many relationship with PaymentType
   */
  @OneToMany(() => PaymentType, (paymentType) => paymentType.tenant)
  paymentTypes: PaymentType[];

  /**
   * One-to-many relationship with TenantPaymentType
   */
  @OneToMany(() => TenantPaymentType, (tenantPaymentType) => tenantPaymentType.tenant)
  tenantPaymentTypes: TenantPaymentType[];

  /**
   * One-to-many relationship with TenantUser
   */
  @OneToMany(() => TenantUser, (tenantUser) => tenantUser.tenant)
  tenantUsers: TenantUser[];

  /**
   * One-to-many relationship with Role
   */
  @OneToMany(() => Role, (role) => role.tenant)
  roles: Role[];
}
