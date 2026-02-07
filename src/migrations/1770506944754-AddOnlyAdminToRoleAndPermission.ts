/**
 * @fileoverview Migration to add only_admin field to role and permission tables
 * @module migrations/AddOnlyAdminToRoleAndPermission
 */

import { MigrationInterface, QueryRunner } from 'typeorm';

/**
 * Migration: AddOnlyAdminToRoleAndPermission
 * Adds the only_admin boolean field to role and permission tables
 * This field identifies roles and permissions that can only be assigned/viewed by admin users
 */
export class AddOnlyAdminToRoleAndPermission1770506944754 implements MigrationInterface {
  /**
   * Applies the migration
   * Adds only_admin column to role and permission tables with default value false
   * @param {QueryRunner} queryRunner - TypeORM query runner
   */
  public async up(queryRunner: QueryRunner): Promise<void> {
    // Add only_admin column to role table
    await queryRunner.query(`
      ALTER TABLE "jpay"."role"
      ADD COLUMN IF NOT EXISTS "only_admin" BOOLEAN NOT NULL DEFAULT false
    `);

    // Add only_admin column to permission table
    await queryRunner.query(`
      ALTER TABLE "jpay"."permission"
      ADD COLUMN IF NOT EXISTS "only_admin" BOOLEAN NOT NULL DEFAULT false
    `);

    // Add index on only_admin for role table (for filtering queries)
    await queryRunner.query(`
      CREATE INDEX IF NOT EXISTS "IDX_role_only_admin" ON "jpay"."role" ("only_admin")
    `);

    // Add index on only_admin for permission table (for filtering queries)
    await queryRunner.query(`
      CREATE INDEX IF NOT EXISTS "IDX_permission_only_admin" ON "jpay"."permission" ("only_admin")
    `);
  }

  /**
   * Reverts the migration
   * Removes only_admin column from role and permission tables
   * @param {QueryRunner} queryRunner - TypeORM query runner
   */
  public async down(queryRunner: QueryRunner): Promise<void> {
    // Drop indexes
    await queryRunner.query(`DROP INDEX IF EXISTS "jpay"."IDX_permission_only_admin"`);
    await queryRunner.query(`DROP INDEX IF EXISTS "jpay"."IDX_role_only_admin"`);

    // Remove only_admin column from permission table
    await queryRunner.query(`
      ALTER TABLE "jpay"."permission"
      DROP COLUMN IF EXISTS "only_admin"
    `);

    // Remove only_admin column from role table
    await queryRunner.query(`
      ALTER TABLE "jpay"."role"
      DROP COLUMN IF EXISTS "only_admin"
    `);
  }
}
