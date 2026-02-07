/**
 * @fileoverview Migration to set group values for existing menu permissions
 * @module migrations/UpdateMenuPermissionGroups
 */

import { MigrationInterface, QueryRunner } from 'typeorm';

/**
 * Migration: Update menu permission groups
 * 
 * Sets the 'group' field for existing menu permissions:
 * - dashboard: 'overview'
 * - all other MENU permissions: 'management'
 */
export class UpdateMenuPermissionGroups1769703806791 implements MigrationInterface {
  /**
   * Run the migration
   * @param {QueryRunner} queryRunner - TypeORM query runner
   */
  public async up(queryRunner: QueryRunner): Promise<void> {
    // Set dashboard to 'overview' group
    await queryRunner.query(`
      UPDATE jpay.permission
      SET "group" = 'overview'
      WHERE permission_type = 'MENU'
        AND code = 'dashboard';
    `);

    // Set all other MENU permissions (except dashboard) to 'management' group
    await queryRunner.query(`
      UPDATE jpay.permission
      SET "group" = 'management'
      WHERE permission_type = 'MENU'
        AND code != 'dashboard'
        AND "group" IS NULL;
    `);
  }

  /**
   * Revert the migration
   * @param {QueryRunner} queryRunner - TypeORM query runner
   */
  public async down(queryRunner: QueryRunner): Promise<void> {
    // Reset all groups to NULL
    await queryRunner.query(`
      UPDATE jpay.permission
      SET "group" = NULL
      WHERE permission_type = 'MENU';
    `);
  }
}
