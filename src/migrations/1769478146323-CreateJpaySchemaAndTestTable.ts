/**
 * @fileoverview Migration to create the jpay schema and test table
 * @module migrations/1769478146323-CreateJpaySchemaAndTestTable
 */

import { MigrationInterface, QueryRunner } from 'typeorm';

/**
 * Migration: CreateJpaySchemaAndTestTable
 * Creates the jpay schema and the test table within it
 */
export class CreateJpaySchemaAndTestTable1769478146323 implements MigrationInterface {
  /**
   * Applies the migration
   * Creates the jpay schema and test table
   * @param {QueryRunner} queryRunner - TypeORM query runner
   */
  public async up(queryRunner: QueryRunner): Promise<void> {
    // Create the 'jpay' schema
    await queryRunner.query(`CREATE SCHEMA IF NOT EXISTS "jpay"`);

    // Create the 'test' table within the 'jpay' schema
    await queryRunner.query(`
      CREATE TABLE IF NOT EXISTS "jpay"."test" (
        "id" SERIAL NOT NULL,
        "name" TEXT NOT NULL,
        CONSTRAINT "PK_test" PRIMARY KEY ("id")
      )
    `);
  }

  /**
   * Reverts the migration
   * Drops the test table and jpay schema
   * @param {QueryRunner} queryRunner - TypeORM query runner
   */
  public async down(queryRunner: QueryRunner): Promise<void> {
    // Drop the 'test' table
    await queryRunner.query(`DROP TABLE IF EXISTS "jpay"."test"`);

    // Drop the 'jpay' schema (CASCADE to drop even if not empty)
    await queryRunner.query(`DROP SCHEMA IF EXISTS "jpay" CASCADE`);
  }
}
