/**
 * @fileoverview Tenant Payment Type entity (junction table)
 * @module entities/tenant-payment-type.entity
 */

import { Entity, Column, CreateDateColumn, ManyToOne, JoinColumn, PrimaryColumn } from 'typeorm';
import { Tenant } from './tenant.entity';
import { PaymentType } from './payment-type.entity';

/**
 * Tenant Payment Type entity
 * Junction table representing the many-to-many relationship between Tenant and PaymentType
 * Represents the tenant_payment_type table in the jpay schema
 */
@Entity({ name: 'tenant_payment_type', schema: 'jpay' })
export class TenantPaymentType {
  /**
   * Foreign key to tenant (part of composite primary key)
   */
  @PrimaryColumn({ name: 'tenant_id', type: 'uuid' })
  tenantId: string;

  /**
   * Foreign key to payment_type (part of composite primary key)
   */
  @PrimaryColumn({ name: 'payment_type_id', type: 'uuid' })
  paymentTypeId: string;

  /**
   * Creation timestamp
   */
  @CreateDateColumn({ name: 'created_at', type: 'timestamptz' })
  createdAt: Date;

  /**
   * Many-to-one relationship with Tenant
   */
  @ManyToOne(() => Tenant, (tenant) => tenant.tenantPaymentTypes)
  @JoinColumn({ name: 'tenant_id' })
  tenant: Tenant;

  /**
   * Many-to-one relationship with PaymentType
   */
  @ManyToOne(() => PaymentType, (paymentType) => paymentType.tenantPaymentTypes)
  @JoinColumn({ name: 'payment_type_id' })
  paymentType: PaymentType;
}
