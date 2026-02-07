/**
 * @fileoverview Migration to create menu permissions with translations
 * @module migrations/1769615303088-CreateMenuPermissions
 */

import { MigrationInterface, QueryRunner } from 'typeorm';

/**
 * Migration: CreateMenuPermissions
 * Creates menu permissions and their translations for the master tenant
 */
export class CreateMenuPermissions1769615303088 implements MigrationInterface {
  /**
   * Applies the migration
   * Creates menu permissions and translations in English and Spanish
   * @param {QueryRunner} queryRunner - TypeORM query runner
   */
  public async up(queryRunner: QueryRunner): Promise<void> {
    // Create menu.list permission (required to access the menu endpoint)
    await queryRunner.query(`
      INSERT INTO jpay.permission (code, permission_type, parent_permission_id, sort_order, is_active)
      SELECT 'menu.list', 'ACTION', NULL, 0, true
      WHERE NOT EXISTS (
        SELECT 1 FROM jpay.permission WHERE code = 'menu.list'
      )
    `);

    const menuListPermissionResult = await queryRunner.query(`
      SELECT id FROM jpay.permission WHERE code = 'menu.list'
    `);
    const menuListPermissionId = menuListPermissionResult[0]?.id;

    // Insert translations for menu.list
    if (menuListPermissionId) {
      await queryRunner.query(`
        INSERT INTO jpay.permission_translation (permission_id, language_code, label, description)
        SELECT $1, 'en', 'List Menus', 'Permission to view the menu list'
        WHERE NOT EXISTS (
          SELECT 1 FROM jpay.permission_translation WHERE permission_id = $1 AND language_code = 'en'
        )
      `, [menuListPermissionId]);
      await queryRunner.query(`
        INSERT INTO jpay.permission_translation (permission_id, language_code, label, description)
        SELECT $1, 'es', 'Listar Menús', 'Permiso para ver la lista de menús'
        WHERE NOT EXISTS (
          SELECT 1 FROM jpay.permission_translation WHERE permission_id = $1 AND language_code = 'es'
        )
      `, [menuListPermissionId]);
    }

    // 1. Dashboard menu
    const dashboardResult = await queryRunner.query(`
      INSERT INTO jpay.permission (code, permission_type, parent_permission_id, sort_order, is_active)
      SELECT 'dashboard', 'MENU', NULL, 1, true
      WHERE NOT EXISTS (
        SELECT 1 FROM jpay.permission WHERE code = 'dashboard'
      )
      RETURNING id
    `);

    const dashboardId = dashboardResult[0]?.id || (await queryRunner.query(`
      SELECT id FROM jpay.permission WHERE code = 'dashboard'
    `))[0]?.id;

    if (dashboardId) {
      await queryRunner.query(`
        INSERT INTO jpay.permission_translation (permission_id, language_code, label, description)
        SELECT $1, 'en', 'Dashboard', 'Main dashboard view'
        WHERE NOT EXISTS (
          SELECT 1 FROM jpay.permission_translation WHERE permission_id = $1 AND language_code = 'en'
        )
      `, [dashboardId]);
      await queryRunner.query(`
        INSERT INTO jpay.permission_translation (permission_id, language_code, label, description)
        SELECT $1, 'es', 'Panel de Control', 'Vista principal del panel de control'
        WHERE NOT EXISTS (
          SELECT 1 FROM jpay.permission_translation WHERE permission_id = $1 AND language_code = 'es'
        )
      `, [dashboardId]);
    }

    // 2. Customers menu
    const customersResult = await queryRunner.query(`
      INSERT INTO jpay.permission (code, permission_type, parent_permission_id, sort_order, is_active)
      SELECT 'customers', 'MENU', NULL, 2, true
      WHERE NOT EXISTS (
        SELECT 1 FROM jpay.permission WHERE code = 'customers'
      )
      RETURNING id
    `);

    const customersId = customersResult[0]?.id || (await queryRunner.query(`
      SELECT id FROM jpay.permission WHERE code = 'customers'
    `))[0]?.id;

    if (customersId) {
      await queryRunner.query(`
        INSERT INTO jpay.permission_translation (permission_id, language_code, label, description)
        SELECT $1, 'en', 'Customers', 'Customer management'
        WHERE NOT EXISTS (
          SELECT 1 FROM jpay.permission_translation WHERE permission_id = $1 AND language_code = 'en'
        )
      `, [customersId]);
      await queryRunner.query(`
        INSERT INTO jpay.permission_translation (permission_id, language_code, label, description)
        SELECT $1, 'es', 'Clientes', 'Gestión de clientes'
        WHERE NOT EXISTS (
          SELECT 1 FROM jpay.permission_translation WHERE permission_id = $1 AND language_code = 'es'
        )
      `, [customersId]);
    }

    // 3. Payments parent menu
    const paymentsResult = await queryRunner.query(`
      INSERT INTO jpay.permission (code, permission_type, parent_permission_id, sort_order, is_active)
      SELECT 'payments', 'MENU', NULL, 3, true
      WHERE NOT EXISTS (
        SELECT 1 FROM jpay.permission WHERE code = 'payments'
      )
      RETURNING id
    `);

    const paymentsId = paymentsResult[0]?.id || (await queryRunner.query(`
      SELECT id FROM jpay.permission WHERE code = 'payments'
    `))[0]?.id;

    if (paymentsId) {
      await queryRunner.query(`
        INSERT INTO jpay.permission_translation (permission_id, language_code, label, description)
        SELECT $1, 'en', 'Payments', 'Payment management'
        WHERE NOT EXISTS (
          SELECT 1 FROM jpay.permission_translation WHERE permission_id = $1 AND language_code = 'en'
        )
      `, [paymentsId]);
      await queryRunner.query(`
        INSERT INTO jpay.permission_translation (permission_id, language_code, label, description)
        SELECT $1, 'es', 'Pagos', 'Gestión de pagos'
        WHERE NOT EXISTS (
          SELECT 1 FROM jpay.permission_translation WHERE permission_id = $1 AND language_code = 'es'
        )
      `, [paymentsId]);

      // 3.1. Recurring Payments (child of Payments)
      const recurringPaymentsResult = await queryRunner.query(`
        INSERT INTO jpay.permission (code, permission_type, parent_permission_id, sort_order, is_active)
        SELECT 'payments.recurring', 'MENU', $1, 1, true
        WHERE NOT EXISTS (
          SELECT 1 FROM jpay.permission WHERE code = 'payments.recurring'
        )
        RETURNING id
      `, [paymentsId]);

      const recurringPaymentsId = recurringPaymentsResult[0]?.id || (await queryRunner.query(`
        SELECT id FROM jpay.permission WHERE code = 'payments.recurring'
      `))[0]?.id;

      if (recurringPaymentsId) {
        await queryRunner.query(`
          INSERT INTO jpay.permission_translation (permission_id, language_code, label, description)
          SELECT $1, 'en', 'Recurring Payments', 'Manage recurring payment schedules'
          WHERE NOT EXISTS (
            SELECT 1 FROM jpay.permission_translation WHERE permission_id = $1 AND language_code = 'en'
          )
        `, [recurringPaymentsId]);
        await queryRunner.query(`
          INSERT INTO jpay.permission_translation (permission_id, language_code, label, description)
          SELECT $1, 'es', 'Pagos Recurrentes', 'Gestionar planes de pagos recurrentes'
          WHERE NOT EXISTS (
            SELECT 1 FROM jpay.permission_translation WHERE permission_id = $1 AND language_code = 'es'
          )
        `, [recurringPaymentsId]);
      }

      // 3.2. Quick Pay (child of Payments)
      const quickPayResult = await queryRunner.query(`
        INSERT INTO jpay.permission (code, permission_type, parent_permission_id, sort_order, is_active)
        SELECT 'payments.quick-pay', 'MENU', $1, 2, true
        WHERE NOT EXISTS (
          SELECT 1 FROM jpay.permission WHERE code = 'payments.quick-pay'
        )
        RETURNING id
      `, [paymentsId]);

      const quickPayId = quickPayResult[0]?.id || (await queryRunner.query(`
        SELECT id FROM jpay.permission WHERE code = 'payments.quick-pay'
      `))[0]?.id;

      if (quickPayId) {
        await queryRunner.query(`
          INSERT INTO jpay.permission_translation (permission_id, language_code, label, description)
          SELECT $1, 'en', 'Quick Pay', 'Quick payment processing'
          WHERE NOT EXISTS (
            SELECT 1 FROM jpay.permission_translation WHERE permission_id = $1 AND language_code = 'en'
          )
        `, [quickPayId]);
        await queryRunner.query(`
          INSERT INTO jpay.permission_translation (permission_id, language_code, label, description)
          SELECT $1, 'es', 'Pago Rápido', 'Procesamiento rápido de pagos'
          WHERE NOT EXISTS (
            SELECT 1 FROM jpay.permission_translation WHERE permission_id = $1 AND language_code = 'es'
          )
        `, [quickPayId]);
      }
    }

    // 4. User Management menu
    const userManagementResult = await queryRunner.query(`
      INSERT INTO jpay.permission (code, permission_type, parent_permission_id, sort_order, is_active)
      SELECT 'user-management', 'MENU', NULL, 4, true
      WHERE NOT EXISTS (
        SELECT 1 FROM jpay.permission WHERE code = 'user-management'
      )
      RETURNING id
    `);

    const userManagementId = userManagementResult[0]?.id || (await queryRunner.query(`
      SELECT id FROM jpay.permission WHERE code = 'user-management'
    `))[0]?.id;

    if (userManagementId) {
      await queryRunner.query(`
        INSERT INTO jpay.permission_translation (permission_id, language_code, label, description)
        SELECT $1, 'en', 'User Management', 'Manage users and permissions'
        WHERE NOT EXISTS (
          SELECT 1 FROM jpay.permission_translation WHERE permission_id = $1 AND language_code = 'en'
        )
      `, [userManagementId]);
      await queryRunner.query(`
        INSERT INTO jpay.permission_translation (permission_id, language_code, label, description)
        SELECT $1, 'es', 'Gestión de Usuarios', 'Gestionar usuarios y permisos'
        WHERE NOT EXISTS (
          SELECT 1 FROM jpay.permission_translation WHERE permission_id = $1 AND language_code = 'es'
        )
      `, [userManagementId]);
    }
  }

  /**
   * Reverts the migration
   * Removes menu permissions and their translations
   * @param {QueryRunner} queryRunner - TypeORM query runner
   */
  public async down(queryRunner: QueryRunner): Promise<void> {
    // Delete in reverse order (children first, then parents)
    const menuCodes = [
      'payments.quick-pay',
      'payments.recurring',
      'payments',
      'user-management',
      'customers',
      'dashboard',
      'menu.list',
    ];

    for (const code of menuCodes) {
      // Delete translations first
      await queryRunner.query(`
        DELETE FROM jpay.permission_translation
        WHERE permission_id IN (
          SELECT id FROM jpay.permission WHERE code = $1
        )
      `, [code]);

      // Delete permission
      await queryRunner.query(`
        DELETE FROM jpay.permission WHERE code = $1
      `, [code]);
    }
  }
}
