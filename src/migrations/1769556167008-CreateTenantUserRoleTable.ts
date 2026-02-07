/**
 * @fileoverview Migration to create tenant_user_role junction table
 * @module migrations/1769556167008-CreateTenantUserRoleTable
 */

import { MigrationInterface, QueryRunner } from 'typeorm';

/**
 * Migration: CreateTenantUserRoleTable
 * Creates the tenant_user_role junction table to relate tenant users with roles
 */
export class CreateTenantUserRoleTable1769556167008 implements MigrationInterface {
  /**
   * Applies the migration
   * Creates the tenant_user_role junction table in the jpay schema
   * @param {QueryRunner} queryRunner - TypeORM query runner
   */
  public async up(queryRunner: QueryRunner): Promise<void> {
    // Create tenant_user_role table (junction table)
    await queryRunner.query(`
      CREATE TABLE IF NOT EXISTS "jpay"."tenant_user_role" (
        "tenant_user_id" UUID NOT NULL,
        "role_id" UUID NOT NULL,
        "created_at" TIMESTAMP WITH TIME ZONE NOT NULL DEFAULT CURRENT_TIMESTAMP,
        CONSTRAINT "PK_tenant_user_role" PRIMARY KEY ("tenant_user_id", "role_id"),
        CONSTRAINT "FK_tenant_user_role_tenant_user" FOREIGN KEY ("tenant_user_id")
          REFERENCES "jpay"."tenant_user"("id") ON DELETE CASCADE ON UPDATE CASCADE,
        CONSTRAINT "FK_tenant_user_role_role" FOREIGN KEY ("role_id")
          REFERENCES "jpay"."role"("id") ON DELETE CASCADE ON UPDATE CASCADE
      )
    `);

    // Add indexes
    await queryRunner.query(`CREATE INDEX IF NOT EXISTS "IDX_tenant_user_role_tenant_user_id" ON "jpay"."tenant_user_role" ("tenant_user_id")`);
    await queryRunner.query(`CREATE INDEX IF NOT EXISTS "IDX_tenant_user_role_role_id" ON "jpay"."tenant_user_role" ("role_id")`);
  }

  /**
   * Reverts the migration
   * Drops the tenant_user_role table
   * @param {QueryRunner} queryRunner - TypeORM query runner
   */
  public async down(queryRunner: QueryRunner): Promise<void> {
    await queryRunner.query(`DROP INDEX IF EXISTS "jpay"."IDX_tenant_user_role_role_id"`);
    await queryRunner.query(`DROP INDEX IF EXISTS "jpay"."IDX_tenant_user_role_tenant_user_id"`);
    await queryRunner.query(`DROP TABLE IF EXISTS "jpay"."tenant_user_role"`);
  }
}
