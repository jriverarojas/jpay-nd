/**
 * @fileoverview Migration to create Roles menu permission with translations
 * @module migrations/CreateRolesMenuPermission
 */

import { MigrationInterface, QueryRunner } from 'typeorm';

/**
 * Migration: CreateRolesMenuPermission
 * Creates the Roles menu permission and its translations in English and Spanish
 */
export class CreateRolesMenuPermission1770507651739 implements MigrationInterface {
  /**
   * Applies the migration
   * Creates the Roles menu permission and translations in English and Spanish
   * @param {QueryRunner} queryRunner - TypeORM query runner
   */
  public async up(queryRunner: QueryRunner): Promise<void> {
    // Create roles menu permission
    const rolesResult = await queryRunner.query(`
      INSERT INTO jpay.permission (code, permission_type, parent_permission_id, sort_order, is_active, "group")
      SELECT 'roles', 'MENU', NULL, 5, true, 'management'
      WHERE NOT EXISTS (
        SELECT 1 FROM jpay.permission WHERE code = 'roles'
      )
      RETURNING id
    `);

    const rolesId = rolesResult[0]?.id || (await queryRunner.query(`
      SELECT id FROM jpay.permission WHERE code = 'roles'
    `))[0]?.id;

    if (rolesId) {
      // Insert English translation
      await queryRunner.query(`
        INSERT INTO jpay.permission_translation (permission_id, language_code, label, description)
        SELECT $1, 'en', 'Roles', 'Manage roles and permissions'
        WHERE NOT EXISTS (
          SELECT 1 FROM jpay.permission_translation WHERE permission_id = $1 AND language_code = 'en'
        )
      `, [rolesId]);

      // Insert Spanish translation
      await queryRunner.query(`
        INSERT INTO jpay.permission_translation (permission_id, language_code, label, description)
        SELECT $1, 'es', 'Roles', 'Gestionar roles y permisos'
        WHERE NOT EXISTS (
          SELECT 1 FROM jpay.permission_translation WHERE permission_id = $1 AND language_code = 'es'
        )
      `, [rolesId]);
    }
  }

  /**
   * Reverts the migration
   * Removes the Roles menu permission and its translations
   * @param {QueryRunner} queryRunner - TypeORM query runner
   */
  public async down(queryRunner: QueryRunner): Promise<void> {
    // Delete translations first
    await queryRunner.query(`
      DELETE FROM jpay.permission_translation
      WHERE permission_id IN (
        SELECT id FROM jpay.permission WHERE code = 'roles'
      )
    `);

    // Delete permission
    await queryRunner.query(`
      DELETE FROM jpay.permission WHERE code = 'roles'
    `);
  }
}
