/**
 * @fileoverview Migration to add status, firstname, and lastname to tenant_user table
 * @module migrations/AddStatusAndNamesToTenantUser
 */

import { MigrationInterface, QueryRunner } from 'typeorm';

/**
 * Migration: AddStatusAndNamesToTenantUser
 * Adds status, firstname, and lastname columns to tenant_user table
 */
export class AddStatusAndNamesToTenantUser1770600000000 implements MigrationInterface {
  /**
   * Applies the migration
   * Adds status, firstname, and lastname columns to tenant_user table
   * @param {QueryRunner} queryRunner - TypeORM query runner
   */
  public async up(queryRunner: QueryRunner): Promise<void> {
    // Add firstname column
    await queryRunner.query(`
      ALTER TABLE "jpay"."tenant_user"
      ADD COLUMN IF NOT EXISTS "firstname" VARCHAR(255) NULL
    `);

    // Add lastname column
    await queryRunner.query(`
      ALTER TABLE "jpay"."tenant_user"
      ADD COLUMN IF NOT EXISTS "lastname" VARCHAR(255) NULL
    `);

    // Add status column with default value
    await queryRunner.query(`
      ALTER TABLE "jpay"."tenant_user"
      ADD COLUMN IF NOT EXISTS "status" VARCHAR(50) NOT NULL DEFAULT 'PENDING_INVITE'
    `);

    // Create index on status for filtering
    await queryRunner.query(`
      CREATE INDEX IF NOT EXISTS "IDX_tenant_user_status" 
      ON "jpay"."tenant_user" ("status")
    `);
  }

  /**
   * Reverts the migration
   * Removes status, firstname, and lastname columns from tenant_user table
   * @param {QueryRunner} queryRunner - TypeORM query runner
   */
  public async down(queryRunner: QueryRunner): Promise<void> {
    // Drop index
    await queryRunner.query(`
      DROP INDEX IF EXISTS "jpay"."IDX_tenant_user_status"
    `);

    // Remove status column
    await queryRunner.query(`
      ALTER TABLE "jpay"."tenant_user"
      DROP COLUMN IF EXISTS "status"
    `);

    // Remove lastname column
    await queryRunner.query(`
      ALTER TABLE "jpay"."tenant_user"
      DROP COLUMN IF EXISTS "lastname"
    `);

    // Remove firstname column
    await queryRunner.query(`
      ALTER TABLE "jpay"."tenant_user"
      DROP COLUMN IF EXISTS "firstname"
    `);
  }
}
