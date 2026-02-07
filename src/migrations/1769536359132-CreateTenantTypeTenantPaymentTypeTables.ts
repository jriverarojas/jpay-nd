/**
 * @fileoverview Migration to create tenant_type, tenant, payment_type and tenant_payment_type tables
 * @module migrations/1769536359132-CreateTenantTypeTenantPaymentTypeTables
 */

import { MigrationInterface, QueryRunner } from 'typeorm';

/**
 * Migration: CreateTenantTypeTenantPaymentTypeTables
 * Creates the tenant_type, tenant, payment_type and tenant_payment_type tables in the jpay schema
 */
export class CreateTenantTypeTenantPaymentTypeTables1769536359132 implements MigrationInterface {
  /**
   * Applies the migration
   * Creates the tenant_type, tenant, payment_type and tenant_payment_type tables
   * @param {QueryRunner} queryRunner - TypeORM query runner
   */
  public async up(queryRunner: QueryRunner): Promise<void> {
    // Create tenant_type table
    await queryRunner.query(`
      CREATE TABLE IF NOT EXISTS "jpay"."tenant_type" (
        "id" UUID NOT NULL DEFAULT gen_random_uuid(),
        "code" VARCHAR(100) NOT NULL,
        "name" VARCHAR(255) NOT NULL,
        "tenant_fields_schema_json" JSONB,
        "customer_fields_schema_json" JSONB,
        "created_at" TIMESTAMP WITH TIME ZONE NOT NULL DEFAULT CURRENT_TIMESTAMP,
        "updated_at" TIMESTAMP WITH TIME ZONE NOT NULL DEFAULT CURRENT_TIMESTAMP,
        CONSTRAINT "PK_tenant_type" PRIMARY KEY ("id"),
        CONSTRAINT "UQ_tenant_type_code" UNIQUE ("code")
      )
    `);

    // Create tenant table
    await queryRunner.query(`
      CREATE TABLE IF NOT EXISTS "jpay"."tenant" (
        "id" UUID NOT NULL DEFAULT gen_random_uuid(),
        "external_org_id" VARCHAR(255) NOT NULL,
        "name" VARCHAR(255) NOT NULL,
        "contact_email" VARCHAR(255),
        "contact_phone" VARCHAR(50),
        "tenant_type_id" UUID NOT NULL,
        "customer_field_overrides_json" JSONB,
        "created_at" TIMESTAMP WITH TIME ZONE NOT NULL DEFAULT CURRENT_TIMESTAMP,
        "updated_at" TIMESTAMP WITH TIME ZONE NOT NULL DEFAULT CURRENT_TIMESTAMP,
        CONSTRAINT "PK_tenant" PRIMARY KEY ("id"),
        CONSTRAINT "UQ_tenant_external_org_id" UNIQUE ("external_org_id"),
        CONSTRAINT "FK_tenant_tenant_type" FOREIGN KEY ("tenant_type_id") 
          REFERENCES "jpay"."tenant_type"("id") ON DELETE RESTRICT ON UPDATE CASCADE
      )
    `);

    // Create payment_type table
    await queryRunner.query(`
      CREATE TABLE IF NOT EXISTS "jpay"."payment_type" (
        "id" UUID NOT NULL DEFAULT gen_random_uuid(),
        "tenant_id" UUID NOT NULL,
        "logical_code" VARCHAR(100) NOT NULL,
        "language_code" VARCHAR(10) NOT NULL,
        "display_name" VARCHAR(255) NOT NULL,
        "description" VARCHAR(500),
        "status_flow_json" JSONB,
        "expiration_status_code" VARCHAR(50),
        "failure_status_code" VARCHAR(50),
        "is_active" BOOLEAN NOT NULL DEFAULT true,
        "created_at" TIMESTAMP WITH TIME ZONE NOT NULL DEFAULT CURRENT_TIMESTAMP,
        "updated_at" TIMESTAMP WITH TIME ZONE NOT NULL DEFAULT CURRENT_TIMESTAMP,
        CONSTRAINT "PK_payment_type" PRIMARY KEY ("id"),
        CONSTRAINT "FK_payment_type_tenant" FOREIGN KEY ("tenant_id") 
          REFERENCES "jpay"."tenant"("id") ON DELETE CASCADE ON UPDATE CASCADE
      )
    `);

    // Create tenant_payment_type table (junction table)
    await queryRunner.query(`
      CREATE TABLE IF NOT EXISTS "jpay"."tenant_payment_type" (
        "tenant_id" UUID NOT NULL,
        "payment_type_id" UUID NOT NULL,
        "created_at" TIMESTAMP WITH TIME ZONE NOT NULL DEFAULT CURRENT_TIMESTAMP,
        CONSTRAINT "PK_tenant_payment_type" PRIMARY KEY ("tenant_id", "payment_type_id"),
        CONSTRAINT "FK_tenant_payment_type_tenant" FOREIGN KEY ("tenant_id") 
          REFERENCES "jpay"."tenant"("id") ON DELETE CASCADE ON UPDATE CASCADE,
        CONSTRAINT "FK_tenant_payment_type_payment_type" FOREIGN KEY ("payment_type_id") 
          REFERENCES "jpay"."payment_type"("id") ON DELETE CASCADE ON UPDATE CASCADE
      )
    `);

    // Create indexes
    await queryRunner.query(`
      CREATE INDEX IF NOT EXISTS "IDX_tenant_tenant_type_id" ON "jpay"."tenant" ("tenant_type_id")
    `);

    await queryRunner.query(`
      CREATE INDEX IF NOT EXISTS "IDX_payment_type_tenant_id" ON "jpay"."payment_type" ("tenant_id")
    `);

    await queryRunner.query(`
      CREATE INDEX IF NOT EXISTS "IDX_payment_type_logical_code" ON "jpay"."payment_type" ("logical_code")
    `);

    await queryRunner.query(`
      CREATE INDEX IF NOT EXISTS "IDX_payment_type_is_active" ON "jpay"."payment_type" ("is_active")
    `);
  }

  /**
   * Reverts the migration
   * Drops the tables in reverse order
   * @param {QueryRunner} queryRunner - TypeORM query runner
   */
  public async down(queryRunner: QueryRunner): Promise<void> {
    // Drop indexes
    await queryRunner.query(`DROP INDEX IF EXISTS "jpay"."IDX_payment_type_is_active"`);
    await queryRunner.query(`DROP INDEX IF EXISTS "jpay"."IDX_payment_type_logical_code"`);
    await queryRunner.query(`DROP INDEX IF EXISTS "jpay"."IDX_payment_type_tenant_id"`);
    await queryRunner.query(`DROP INDEX IF EXISTS "jpay"."IDX_tenant_tenant_type_id"`);

    // Drop tables in reverse order (respecting foreign key constraints)
    await queryRunner.query(`DROP TABLE IF EXISTS "jpay"."tenant_payment_type"`);
    await queryRunner.query(`DROP TABLE IF EXISTS "jpay"."payment_type"`);
    await queryRunner.query(`DROP TABLE IF EXISTS "jpay"."tenant"`);
    await queryRunner.query(`DROP TABLE IF EXISTS "jpay"."tenant_type"`);
  }
}
