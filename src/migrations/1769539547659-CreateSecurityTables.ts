/**
 * @fileoverview Migration to create security-related tables: tenant_user, role, permission, permission_translation, and role_permission
 * @module migrations/1769539547659-CreateSecurityTables
 */

import { MigrationInterface, QueryRunner } from 'typeorm';

/**
 * Migration: CreateSecurityTables
 * Creates the security-related tables in the jpay schema
 */
export class CreateSecurityTables1769539547659 implements MigrationInterface {
  /**
   * Applies the migration
   * Creates tenant_user, role, permission, permission_translation, and role_permission tables in the jpay schema
   * @param {QueryRunner} queryRunner - TypeORM query runner
   */
  public async up(queryRunner: QueryRunner): Promise<void> {
    // Create tenant_user table
    await queryRunner.query(`
      CREATE TABLE IF NOT EXISTS "jpay"."tenant_user" (
        "id" UUID NOT NULL DEFAULT gen_random_uuid(),
        "tenant_id" UUID NOT NULL,
        "external_user_id" VARCHAR(255) NOT NULL,
        "username" VARCHAR(255) NOT NULL,
        "created_at" TIMESTAMP WITH TIME ZONE NOT NULL DEFAULT CURRENT_TIMESTAMP,
        "updated_at" TIMESTAMP WITH TIME ZONE NOT NULL DEFAULT CURRENT_TIMESTAMP,
        CONSTRAINT "PK_tenant_user" PRIMARY KEY ("id"),
        CONSTRAINT "UQ_tenant_user_external_user_id" UNIQUE ("external_user_id"),
        CONSTRAINT "FK_tenant_user_tenant" FOREIGN KEY ("tenant_id")
          REFERENCES "jpay"."tenant"("id") ON DELETE CASCADE ON UPDATE CASCADE
      )
    `);

    // Create role table
    await queryRunner.query(`
      CREATE TABLE IF NOT EXISTS "jpay"."role" (
        "id" UUID NOT NULL DEFAULT gen_random_uuid(),
        "tenant_id" UUID NOT NULL,
        "external_role_key" VARCHAR(255) NOT NULL,
        "name" VARCHAR(255) NOT NULL,
        "created_at" TIMESTAMP WITH TIME ZONE NOT NULL DEFAULT CURRENT_TIMESTAMP,
        "updated_at" TIMESTAMP WITH TIME ZONE NOT NULL DEFAULT CURRENT_TIMESTAMP,
        CONSTRAINT "PK_role" PRIMARY KEY ("id"),
        CONSTRAINT "UQ_role_external_role_key_tenant" UNIQUE ("external_role_key", "tenant_id"),
        CONSTRAINT "FK_role_tenant" FOREIGN KEY ("tenant_id")
          REFERENCES "jpay"."tenant"("id") ON DELETE CASCADE ON UPDATE CASCADE
      )
    `);

    // Create permission table
    await queryRunner.query(`
      CREATE TABLE IF NOT EXISTS "jpay"."permission" (
        "id" UUID NOT NULL DEFAULT gen_random_uuid(),
        "tenant_id" UUID NOT NULL,
        "code" VARCHAR(100) NOT NULL,
        "permission_type" VARCHAR(50) NOT NULL,
        "parent_permission_id" UUID,
        "sort_order" INTEGER NOT NULL DEFAULT 0,
        "is_active" BOOLEAN NOT NULL DEFAULT true,
        "created_at" TIMESTAMP WITH TIME ZONE NOT NULL DEFAULT CURRENT_TIMESTAMP,
        "updated_at" TIMESTAMP WITH TIME ZONE NOT NULL DEFAULT CURRENT_TIMESTAMP,
        CONSTRAINT "PK_permission" PRIMARY KEY ("id"),
        CONSTRAINT "UQ_permission_code_tenant" UNIQUE ("code", "tenant_id"),
        CONSTRAINT "FK_permission_tenant" FOREIGN KEY ("tenant_id")
          REFERENCES "jpay"."tenant"("id") ON DELETE CASCADE ON UPDATE CASCADE,
        CONSTRAINT "FK_permission_parent" FOREIGN KEY ("parent_permission_id")
          REFERENCES "jpay"."permission"("id") ON DELETE SET NULL ON UPDATE CASCADE
      )
    `);

    // Create permission_translation table
    await queryRunner.query(`
      CREATE TABLE IF NOT EXISTS "jpay"."permission_translation" (
        "id" UUID NOT NULL DEFAULT gen_random_uuid(),
        "permission_id" UUID NOT NULL,
        "language_code" VARCHAR(10) NOT NULL,
        "label" VARCHAR(255) NOT NULL,
        "description" VARCHAR(500),
        "created_at" TIMESTAMP WITH TIME ZONE NOT NULL DEFAULT CURRENT_TIMESTAMP,
        CONSTRAINT "PK_permission_translation" PRIMARY KEY ("id"),
        CONSTRAINT "UQ_permission_translation_permission_language" UNIQUE ("permission_id", "language_code"),
        CONSTRAINT "FK_permission_translation_permission" FOREIGN KEY ("permission_id")
          REFERENCES "jpay"."permission"("id") ON DELETE CASCADE ON UPDATE CASCADE
      )
    `);

    // Create role_permission table (junction table)
    await queryRunner.query(`
      CREATE TABLE IF NOT EXISTS "jpay"."role_permission" (
        "role_id" UUID NOT NULL,
        "permission_id" UUID NOT NULL,
        "created_at" TIMESTAMP WITH TIME ZONE NOT NULL DEFAULT CURRENT_TIMESTAMP,
        CONSTRAINT "PK_role_permission" PRIMARY KEY ("role_id", "permission_id"),
        CONSTRAINT "FK_role_permission_role" FOREIGN KEY ("role_id")
          REFERENCES "jpay"."role"("id") ON DELETE CASCADE ON UPDATE CASCADE,
        CONSTRAINT "FK_role_permission_permission" FOREIGN KEY ("permission_id")
          REFERENCES "jpay"."permission"("id") ON DELETE CASCADE ON UPDATE CASCADE
      )
    `);

    // Add indexes
    await queryRunner.query(`CREATE INDEX IF NOT EXISTS "IDX_tenant_user_tenant_id" ON "jpay"."tenant_user" ("tenant_id")`);
    await queryRunner.query(`CREATE INDEX IF NOT EXISTS "IDX_role_tenant_id" ON "jpay"."role" ("tenant_id")`);
    await queryRunner.query(`CREATE INDEX IF NOT EXISTS "IDX_permission_tenant_id" ON "jpay"."permission" ("tenant_id")`);
    await queryRunner.query(`CREATE INDEX IF NOT EXISTS "IDX_permission_parent_permission_id" ON "jpay"."permission" ("parent_permission_id")`);
    await queryRunner.query(`CREATE INDEX IF NOT EXISTS "IDX_permission_is_active" ON "jpay"."permission" ("is_active")`);
    await queryRunner.query(`CREATE INDEX IF NOT EXISTS "IDX_permission_translation_permission_id" ON "jpay"."permission_translation" ("permission_id")`);
    await queryRunner.query(`CREATE INDEX IF NOT EXISTS "IDX_permission_translation_language_code" ON "jpay"."permission_translation" ("language_code")`);
  }

  /**
   * Reverts the migration
   * Drops tenant_user, role, permission, permission_translation, and role_permission tables
   * @param {QueryRunner} queryRunner - TypeORM query runner
   */
  public async down(queryRunner: QueryRunner): Promise<void> {
    await queryRunner.query(`DROP TABLE IF EXISTS "jpay"."role_permission"`);
    await queryRunner.query(`DROP TABLE IF EXISTS "jpay"."permission_translation"`);
    await queryRunner.query(`DROP TABLE IF EXISTS "jpay"."permission"`);
    await queryRunner.query(`DROP TABLE IF EXISTS "jpay"."role"`);
    await queryRunner.query(`DROP TABLE IF EXISTS "jpay"."tenant_user"`);
  }
}
