/**
 * @fileoverview Migration to create request_log table
 * @module migrations/CreateRequestLogTable
 */

import { MigrationInterface, QueryRunner } from 'typeorm';

/**
 * Migration: CreateRequestLogTable
 * Creates the request_log table for storing HTTP request logs
 */
export class CreateRequestLogTable1770513762087 implements MigrationInterface {
  /**
   * Applies the migration
   * Creates request_log table with indexes
   * @param {QueryRunner} queryRunner - TypeORM query runner
   */
  public async up(queryRunner: QueryRunner): Promise<void> {
    // Create request_log table
    await queryRunner.query(`
      CREATE TABLE IF NOT EXISTS "jpay"."request_log" (
        "id" UUID NOT NULL DEFAULT gen_random_uuid(),
        "method" VARCHAR(10) NOT NULL,
        "url" VARCHAR(2048) NOT NULL,
        "path" VARCHAR(2048) NOT NULL,
        "query" JSONB,
        "headers" JSONB,
        "body" TEXT,
        "status_code" INTEGER,
        "response_body" TEXT,
        "response_time" INTEGER,
        "user_id" UUID,
        "user_external_id" VARCHAR(255),
        "ip_address" VARCHAR(45),
        "user_agent" VARCHAR(512),
        "error" TEXT,
        "error_stack" TEXT,
        "created_at" TIMESTAMP WITH TIME ZONE NOT NULL DEFAULT CURRENT_TIMESTAMP,
        CONSTRAINT "PK_request_log" PRIMARY KEY ("id")
      )
    `);

    // Create indexes for better query performance
    await queryRunner.query(`
      CREATE INDEX IF NOT EXISTS "IDX_request_log_user_id" 
      ON "jpay"."request_log" ("user_id")
    `);

    await queryRunner.query(`
      CREATE INDEX IF NOT EXISTS "IDX_request_log_user_external_id" 
      ON "jpay"."request_log" ("user_external_id")
    `);

    await queryRunner.query(`
      CREATE INDEX IF NOT EXISTS "IDX_request_log_created_at" 
      ON "jpay"."request_log" ("created_at")
    `);

    await queryRunner.query(`
      CREATE INDEX IF NOT EXISTS "IDX_request_log_method" 
      ON "jpay"."request_log" ("method")
    `);

    await queryRunner.query(`
      CREATE INDEX IF NOT EXISTS "IDX_request_log_status_code" 
      ON "jpay"."request_log" ("status_code")
    `);

    await queryRunner.query(`
      CREATE INDEX IF NOT EXISTS "IDX_request_log_path" 
      ON "jpay"."request_log" ("path")
    `);
  }

  /**
   * Reverts the migration
   * Drops request_log table and indexes
   * @param {QueryRunner} queryRunner - TypeORM query runner
   */
  public async down(queryRunner: QueryRunner): Promise<void> {
    // Drop indexes
    await queryRunner.query(`DROP INDEX IF EXISTS "jpay"."IDX_request_log_path"`);
    await queryRunner.query(`DROP INDEX IF EXISTS "jpay"."IDX_request_log_status_code"`);
    await queryRunner.query(`DROP INDEX IF EXISTS "jpay"."IDX_request_log_method"`);
    await queryRunner.query(`DROP INDEX IF EXISTS "jpay"."IDX_request_log_created_at"`);
    await queryRunner.query(`DROP INDEX IF EXISTS "jpay"."IDX_request_log_user_external_id"`);
    await queryRunner.query(`DROP INDEX IF EXISTS "jpay"."IDX_request_log_user_id"`);

    // Drop table
    await queryRunner.query(`DROP TABLE IF EXISTS "jpay"."request_log"`);
  }
}
