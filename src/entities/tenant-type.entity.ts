/**
 * @fileoverview Tenant Type entity
 * @module entities/tenant-type.entity
 */

import { Entity, Column, PrimaryGeneratedColumn, CreateDateColumn, UpdateDateColumn, OneToMany } from 'typeorm';
import { Tenant } from './tenant.entity';

/**
 * Tenant Type entity
 * Represents the tenant_type table in the jpay schema
 */
@Entity({ name: 'tenant_type', schema: 'jpay' })
export class TenantType {
  /**
   * Primary key - UUID
   */
  @PrimaryGeneratedColumn('uuid')
  id: string;

  /**
   * Internal type code (unique)
   * Examples: BUILDING, SCHOOL, UTIL_WATER
   */
  @Column({ type: 'varchar', length: 100, unique: true })
  code: string;

  /**
   * Human readable type name
   */
  @Column({ type: 'varchar', length: 255 })
  name: string;

  /**
   * Schema/metadata for extra tenant fields (dynamic UI)
   */
  @Column({ name: 'tenant_fields_schema_json', type: 'jsonb', nullable: true })
  tenantFieldsSchemaJson: Record<string, any> | null;

  /**
   * Schema/metadata for extra customer fields (dynamic UI)
   */
  @Column({ name: 'customer_fields_schema_json', type: 'jsonb', nullable: true })
  customerFieldsSchemaJson: Record<string, any> | null;

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
   * One-to-many relationship with Tenant
   */
  @OneToMany(() => Tenant, (tenant) => tenant.tenantType)
  tenants: Tenant[];
}
