/**
 * @fileoverview Migration to create the user_api_keys table
 * @module migrations/1769514364474-CreateUserApiKeysTable
 */

import { MigrationInterface, QueryRunner } from 'typeorm';

/**
 * Migration: CreateUserApiKeysTable
 * Creates the user_api_keys table for storing API keys with hashed values
 */
export class CreateUserApiKeysTable1769514364474 implements MigrationInterface {
  /**
   * Applies the migration
   * Creates the user_api_keys table in the jpay schema
   * @param {QueryRunner} queryRunner - TypeORM query runner
   */
  public async up(queryRunner: QueryRunner): Promise<void> {
    await queryRunner.query(`
      CREATE TABLE IF NOT EXISTS "jpay"."user_api_keys" (
        "id" SERIAL NOT NULL,
        "user_id" UUID NOT NULL,
        "key_hash" TEXT NOT NULL,
        "is_active" BOOLEAN NOT NULL DEFAULT true,
        "last_used_at" TIMESTAMP,
        "created_at" TIMESTAMP NOT NULL DEFAULT CURRENT_TIMESTAMP,
        "updated_at" TIMESTAMP NOT NULL DEFAULT CURRENT_TIMESTAMP,
        CONSTRAINT "PK_user_api_keys" PRIMARY KEY ("id"),
        CONSTRAINT "UQ_user_api_keys_key_hash" UNIQUE ("key_hash")
      )
    `);

    await queryRunner.query(`
      CREATE INDEX IF NOT EXISTS "IDX_user_api_keys_user_id" ON "jpay"."user_api_keys" ("user_id")
    `);

    await queryRunner.query(`
      CREATE INDEX IF NOT EXISTS "IDX_user_api_keys_is_active" ON "jpay"."user_api_keys" ("is_active")
    `);
  }

  /**
   * Reverts the migration
   * Drops the user_api_keys table
   * @param {QueryRunner} queryRunner - TypeORM query runner
   */
  public async down(queryRunner: QueryRunner): Promise<void> {
    await queryRunner.query(`DROP INDEX IF EXISTS "jpay"."IDX_user_api_keys_is_active"`);
    await queryRunner.query(`DROP INDEX IF EXISTS "jpay"."IDX_user_api_keys_user_id"`);
    await queryRunner.query(`DROP TABLE IF EXISTS "jpay"."user_api_keys"`);
  }
}
