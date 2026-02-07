/**
 * @fileoverview Migration script to run pending TypeORM migrations
 * @module scripts/migrate
 */

import { DataSource } from 'typeorm';
import { config } from 'dotenv';
import { join } from 'path';

// Load environment variables from .env.migrations
config({ path: '.env.migrations' });

/**
 * Runs pending database migrations
 * Only executes migrations that have not been applied yet
 */
async function runMigrations(): Promise<void> {
  const dataSource = new DataSource({
    type: 'postgres',
    host: process.env.DB_HOST,
    port: parseInt(process.env.DB_PORT || '5432', 10),
    username: process.env.DB_USERNAME,
    password: process.env.DB_PASSWORD,
    database: process.env.DB_DATABASE,
    ssl: process.env.DB_SSL === 'true' ? { rejectUnauthorized: false } : false,
    entities: [join(__dirname, '../**/*.entity{.ts,.js}')],
    migrations: [join(__dirname, '../migrations/*{.ts,.js}')],
    migrationsTableName: 'typeorm_migrations',
  });

  try {
    console.log('🔄 Connecting to database...');
    await dataSource.initialize();
    console.log('✅ Connection established');

    console.log('🔄 Running pending migrations...');

    // runMigrations() only executes migrations that have not been applied yet
    // TypeORM automatically checks the typeorm_migrations table and only runs pending ones
    const executedMigrations = await dataSource.runMigrations();

    if (executedMigrations.length > 0) {
      console.log(`✅ Migrations executed: ${executedMigrations.length}`);
      executedMigrations.forEach((migration) => {
        console.log(`   ✓ ${migration.name}`);
      });
    } else {
      console.log('✅ No pending migrations. All migrations have already been applied.');
    }

    await dataSource.destroy();
    console.log('✅ Process completed');
    process.exit(0);
  } catch (error) {
    console.error('❌ Error running migrations:', error);
    await dataSource.destroy();
    process.exit(1);
  }
}

runMigrations();
