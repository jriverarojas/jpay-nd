/**
 * @fileoverview Migration to remove tenant_id from permission table
 * @module migrations/1769620873039-RemoveTenantIdFromPermission
 */

import { MigrationInterface, QueryRunner } from 'typeorm';

/**
 * Migration: RemoveTenantIdFromPermission
 * Removes tenant_id column from permission table and updates constraints
 */
export class RemoveTenantIdFromPermission1769620873039 implements MigrationInterface {
  /**
   * Applies the migration
   * Removes tenant_id column and updates unique constraint
   * @param {QueryRunner} queryRunner - TypeORM query runner
   */
  public async up(queryRunner: QueryRunner): Promise<void> {
    // Drop the foreign key constraint first
    await queryRunner.query(`
      ALTER TABLE "jpay"."permission"
      DROP CONSTRAINT IF EXISTS "FK_permission_tenant"
    `);

    // Drop the unique constraint that includes tenant_id
    await queryRunner.query(`
      ALTER TABLE "jpay"."permission"
      DROP CONSTRAINT IF EXISTS "UQ_permission_code_tenant"
    `);

    // Drop the index on tenant_id
    await queryRunner.query(`
      DROP INDEX IF EXISTS "jpay"."IDX_permission_tenant_id"
    `);

    // Drop the tenant_id column
    await queryRunner.query(`
      ALTER TABLE "jpay"."permission"
      DROP COLUMN IF EXISTS "tenant_id"
    `);

    // Create new unique constraint on code only
    await queryRunner.query(`
      ALTER TABLE "jpay"."permission"
      ADD CONSTRAINT "UQ_permission_code" UNIQUE ("code")
    `);
  }

  /**
   * Reverts the migration
   * Adds back tenant_id column and constraints
   * @param {QueryRunner} queryRunner - TypeORM query runner
   */
  public async down(queryRunner: QueryRunner): Promise<void> {
    // Drop the unique constraint on code only
    await queryRunner.query(`
      ALTER TABLE "jpay"."permission"
      DROP CONSTRAINT IF EXISTS "UQ_permission_code"
    `);

    // Add tenant_id column back
    await queryRunner.query(`
      ALTER TABLE "jpay"."permission"
      ADD COLUMN "tenant_id" UUID
    `);

    // Create index on tenant_id
    await queryRunner.query(`
      CREATE INDEX IF NOT EXISTS "IDX_permission_tenant_id" ON "jpay"."permission" ("tenant_id")
    `);

    // Add foreign key constraint
    await queryRunner.query(`
      ALTER TABLE "jpay"."permission"
      ADD CONSTRAINT "FK_permission_tenant" FOREIGN KEY ("tenant_id")
        REFERENCES "jpay"."tenant"("id") ON DELETE CASCADE ON UPDATE CASCADE
    `);

    // Add unique constraint on code and tenant_id
    await queryRunner.query(`
      ALTER TABLE "jpay"."permission"
      ADD CONSTRAINT "UQ_permission_code_tenant" UNIQUE ("code", "tenant_id")
    `);
  }
}
