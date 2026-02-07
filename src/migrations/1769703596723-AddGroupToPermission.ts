/**
 * @fileoverview Migration to add group column to permission table
 * @module migrations/AddGroupToPermission
 */

import { MigrationInterface, QueryRunner, TableColumn } from 'typeorm';

/**
 * Migration: Add group column to permission table
 * 
 * This migration adds an optional 'group' column to the permission table
 * to allow grouping menu items in the UI (e.g., overview, management, reports)
 */
export class AddGroupToPermission1769703596723 implements MigrationInterface {
  /**
   * Run the migration
   * @param {QueryRunner} queryRunner - TypeORM query runner
   */
  public async up(queryRunner: QueryRunner): Promise<void> {
    // Add group column to permission table
    await queryRunner.addColumn(
      'jpay.permission',
      new TableColumn({
        name: 'group',
        type: 'varchar',
        length: '50',
        isNullable: true,
        comment: 'Optional menu group: overview, management, reports, etc.',
      }),
    );

    // Optional: Add a check constraint to validate group values
    await queryRunner.query(`
      ALTER TABLE jpay.permission
      ADD CONSTRAINT chk_permission_group
      CHECK (
        "group" IS NULL OR
        "group" IN ('overview', 'management', 'reports')
      );
    `);
  }

  /**
   * Revert the migration
   * @param {QueryRunner} queryRunner - TypeORM query runner
   */
  public async down(queryRunner: QueryRunner): Promise<void> {
    // Drop check constraint
    await queryRunner.query(`
      ALTER TABLE jpay.permission
      DROP CONSTRAINT IF EXISTS chk_permission_group;
    `);

    // Drop group column
    await queryRunner.dropColumn('jpay.permission', 'group');
  }
}
