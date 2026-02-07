/**
 * @fileoverview Payment Type entity
 * @module entities/payment-type.entity
 */

import { Entity, Column, PrimaryGeneratedColumn, CreateDateColumn, UpdateDateColumn, ManyToOne, JoinColumn, OneToMany } from 'typeorm';
import { Tenant } from './tenant.entity';
import { TenantPaymentType } from './tenant-payment-type.entity';

/**
 * Payment Type entity
 * Represents the payment_type table in the jpay schema
 */
@Entity({ name: 'payment_type', schema: 'jpay' })
export class PaymentType {
  /**
   * Primary key - UUID
   */
  @PrimaryGeneratedColumn('uuid')
  id: string;

  /**
   * Foreign key to tenant
   */
  @Column({ name: 'tenant_id', type: 'uuid' })
  tenantId: string;

  /**
   * Logical code (same across languages)
   * Examples: QR, CASH, CARD, TRANSFER
   */
  @Column({ name: 'logical_code', type: 'varchar', length: 100 })
  logicalCode: string;

  /**
   * ISO language code
   * Examples: en, es
   */
  @Column({ name: 'language_code', type: 'varchar', length: 10 })
  languageCode: string;

  /**
   * Localized name shown to users
   */
  @Column({ name: 'display_name', type: 'varchar', length: 255 })
  displayName: string;

  /**
   * Localized description/help text
   */
  @Column({ type: 'varchar', length: 500, nullable: true })
  description: string | null;

  /**
   * Ordered allowed statuses
   * Example: ['CREATED','PENDING','PAID']
   */
  @Column({ name: 'status_flow_json', type: 'jsonb', nullable: true })
  statusFlowJson: string[] | null;

  /**
   * Status to set when expired
   * Example: EXPIRED
   */
  @Column({ name: 'expiration_status_code', type: 'varchar', length: 50, nullable: true })
  expirationStatusCode: string | null;

  /**
   * Status to set when failed
   * Example: FAILED
   */
  @Column({ name: 'failure_status_code', type: 'varchar', length: 50, nullable: true })
  failureStatusCode: string | null;

  /**
   * Whether the payment type is active
   */
  @Column({ name: 'is_active', type: 'boolean', default: true })
  isActive: boolean;

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
  @ManyToOne(() => Tenant)
  @JoinColumn({ name: 'tenant_id' })
  tenant: Tenant;

  /**
   * One-to-many relationship with TenantPaymentType
   */
  @OneToMany(() => TenantPaymentType, (tenantPaymentType) => tenantPaymentType.paymentType)
  tenantPaymentTypes: TenantPaymentType[];
}
