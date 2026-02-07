<p align="center">
  <a href="http://nestjs.com/" target="blank"><img src="https://nestjs.com/img/logo-small.svg" width="120" alt="Nest Logo" /></a>
</p>

[circleci-image]: https://img.shields.io/circleci/build/github/nestjs/nest/master?token=abc123def456
[circleci-url]: https://circleci.com/gh/nestjs/nest

  <p align="center">A progressive <a href="http://nodejs.org" target="_blank">Node.js</a> framework for building efficient and scalable server-side applications.</p>
    <p align="center">
<a href="https://www.npmjs.com/~nestjscore" target="_blank"><img src="https://img.shields.io/npm/v/@nestjs/core.svg" alt="NPM Version" /></a>
<a href="https://www.npmjs.com/~nestjscore" target="_blank"><img src="https://img.shields.io/npm/l/@nestjs/core.svg" alt="Package License" /></a>
<a href="https://www.npmjs.com/~nestjscore" target="_blank"><img src="https://img.shields.io/npm/dm/@nestjs/common.svg" alt="NPM Downloads" /></a>
<a href="https://circleci.com/gh/nestjs/nest" target="_blank"><img src="https://img.shields.io/circleci/build/github/nestjs/nest/master" alt="CircleCI" /></a>
<a href="https://discord.gg/G7Qnnhy" target="_blank"><img src="https://img.shields.io/badge/discord-online-brightgreen.svg" alt="Discord"/></a>
<a href="https://opencollective.com/nest#backer" target="_blank"><img src="https://opencollective.com/nest/backers/badge.svg" alt="Backers on Open Collective" /></a>
<a href="https://opencollective.com/nest#sponsor" target="_blank"><img src="https://opencollective.com/nest/sponsors/badge.svg" alt="Sponsors on Open Collective" /></a>
  <a href="https://paypal.me/kamilmysliwiec" target="_blank"><img src="https://img.shields.io/badge/Donate-PayPal-ff3f59.svg" alt="Donate us"/></a>
    <a href="https://opencollective.com/nest#sponsor"  target="_blank"><img src="https://img.shields.io/badge/Support%20us-Open%20Collective-41B883.svg" alt="Support us"></a>
  <a href="https://twitter.com/nestframework" target="_blank"><img src="https://img.shields.io/twitter/follow/nestframework.svg?style=social&label=Follow" alt="Follow us on Twitter"></a>
</p>
  <!--[![Backers on Open Collective](https://opencollective.com/nest/backers/badge.svg)](https://opencollective.com/nest#backer)
  [![Sponsors on Open Collective](https://opencollective.com/nest/sponsors/badge.svg)](https://opencollective.com/nest#sponsor)-->

## Description

[Nest](https://github.com/nestjs/nest) framework TypeScript starter repository.

## Project setup

```bash
$ npm install
```

## Environment Configuration

This project uses environment variables for configuration. Create a `.env` file in the project root (or use the symbolic link to `.env.dev`).

### Application Configuration

```env
# Application Port (default: 3000)
PORT=3000

# Environment
NODE_ENV=development

# Supabase Configuration (for authentication)
SUPABASE_URL=https://your-project.supabase.co
SUPABASE_SERVICE_ROLE_KEY=your-secret-key
```

**Supabase Configuration Variables:**
- **SUPABASE_URL**: Your Supabase project URL
- **SUPABASE_SERVICE_ROLE_KEY**: Secret Key from Supabase Settings → API → Secret Key (formerly called Service Role Key)

### Database Configuration

This project uses TypeORM with PostgreSQL. To configure the database connection, add the following variables to your `.env` file:

#### For local PostgreSQL:

```env
# Database Configuration
DB_HOST=localhost
DB_PORT=5432
DB_USERNAME=postgres
DB_PASSWORD=postgres
DB_DATABASE=jpay
DB_SSL=false
DB_LOGGING=false
```

**Database Configuration Variables:**
- **DB_HOST**: Database host address
- **DB_PORT**: Database port number
- **DB_USERNAME**: Database username
- **DB_PASSWORD**: Database password
- **DB_DATABASE**: Database name
- **DB_SSL**: Enable SSL connection (`true` or `false`)
- **DB_LOGGING**: Enable TypeORM query logging (`true` or `false`, default: `false`)

### For Supabase:

1. Go to your project in the [Supabase Dashboard](https://app.supabase.com)
2. Navigate to **Settings** → **Database**
3. In the **Connection string** section, you'll find two options:
   - **Connection pooling** (recommended for production): Port `6543`
   - **Direct connection** (for migrations): Port `5432`

4. Use the **Connection pooling** information for your application:

```env
# Application Port
PORT=3000

# Supabase Configuration
DB_HOST=db.xxxxx.supabase.co
DB_PORT=6543
DB_USERNAME=postgres.xxxxx
DB_PASSWORD=your_password_here
DB_DATABASE=postgres
DB_SSL=true
DB_LOGGING=false

# Environment
NODE_ENV=development
```

**Where to find each value:**
- **Host**: Appears as `db.xxxxx.supabase.co` in the connection string
- **Port**: `6543` for connection pooling (recommended) or `5432` for direct connection
- **Username**: `postgres.xxxxx` (the format includes the project ref)
- **Password**: The password you set when creating the project (if you forgot it, you can reset it in Settings → Database)
- **Database**: Usually `postgres`

**Note:** 
- In development, `synchronize` is enabled to automatically create/update tables. In production, disable it and use migrations.
- For Supabase, always use `DB_SSL=true` as it requires SSL connections.

## Database Migrations

This project includes a CLI command to safely run TypeORM migrations. The command connects directly to Supabase using a direct connection (without pool) to ensure proper migration execution.

### Initial Environment Setup

The project supports multiple migration environments (alpha, beta, prod) using symbolic links. To set up the environments for the first time:

```bash
npm run migrate:setup
```

This command:
- ✅ Moves your existing `.env.migrations` file to `.env.migrations.alpha` (if it exists)
- ✅ Creates the files `.env.migrations.alpha`, `.env.migrations.beta`, and `.env.migrations.prod`
- ✅ Creates a symbolic link `.env.migrations` that initially points to `.env.migrations.alpha`
- ✅ If the files don't exist, creates them from `.env.migrations.example`

**Important:**
- After running `migrate:setup`, edit each file (`.env.migrations.alpha`, `.env.migrations.beta`, `.env.migrations.prod`) with the corresponding credentials
- Use the **Direct connection** (port `5432`) for migrations, not the connection pooler
- These files should be in `.gitignore` to avoid exposing credentials

### Switching Between Environments

To change the migration environment, use:

```bash
# Switch to ALPHA environment
npm run migrate:env alpha

# Switch to BETA environment
npm run migrate:env beta

# Switch to PRODUCTION environment
npm run migrate:env prod
```

This command updates the symbolic link `.env.migrations` to point to the selected environment.

**File structure:**
```
.env.migrations          → symbolic link (points to .env.migrations.alpha|beta|prod)
.env.migrations.alpha   → configuration for ALPHA environment
.env.migrations.beta     → configuration for BETA environment
.env.migrations.prod     → configuration for PRODUCTION environment
```

### Environment File Format

Each environment file must contain the direct connection credentials to Supabase:

```env
# .env.migrations.alpha (or beta, prod)
DB_HOST=db.xxxxx.supabase.co
DB_PORT=5432
DB_USERNAME=postgres.xxxxx
DB_PASSWORD=your_password_here
DB_DATABASE=postgres
DB_SSL=true
```

### Running Migrations

To run pending migrations in the current environment:

```bash
npm run migrate
```

**Recommended workflow:**
1. Check which environment you're in: `ls -la .env.migrations` (shows where the link points)
2. Switch to the desired environment: `npm run migrate:env [alpha|beta|prod]`
3. Run the migrations: `npm run migrate`

The command:
- ✅ Connects to the database using the credentials from the file that `.env.migrations` points to
- ✅ Checks which migrations have already been executed (using the `typeorm_migrations` table)
- ✅ Only runs migrations that haven't been applied yet
- ✅ Shows a summary of executed migrations

**Example output:**
```
🔄 Connecting to database...
✅ Connection established
🔄 Running pending migrations...
✅ Migrations executed: 2
   ✓ CreateUsersTable1234567890
   ✓ AddEmailToUsers1234567891
✅ Process completed
```

If there are no pending migrations, you'll see:
```
🔄 Connecting to database...
✅ Connection established
🔄 Running pending migrations...
✅ No pending migrations. All migrations have already been applied.
✅ Process completed
```

### Creating Migrations

To create new migrations, you can use TypeORM CLI or create them manually in the `src/migrations/` directory. Migrations must follow this format:

```typescript
import { MigrationInterface, QueryRunner } from 'typeorm';

export class YourMigrationName1234567890 implements MigrationInterface {
  public async up(queryRunner: QueryRunner): Promise<void> {
    // Code to apply the migration
  }

  public async down(queryRunner: QueryRunner): Promise<void> {
    // Code to revert the migration
  }
}
```

## Compile and run the project

```bash
# development
$ npm run start

# watch mode
$ npm run start:dev

# production mode
$ npm run start:prod
```

## Run tests

```bash
# unit tests
$ npm run test

# e2e tests
$ npm run test:e2e

# test coverage
$ npm run test:cov
```

## Deployment

When you're ready to deploy your NestJS application to production, there are some key steps you can take to ensure it runs as efficiently as possible. Check out the [deployment documentation](https://docs.nestjs.com/deployment) for more information.

If you are looking for a cloud-based platform to deploy your NestJS application, check out [Mau](https://mau.nestjs.com), our official platform for deploying NestJS applications on AWS. Mau makes deployment straightforward and fast, requiring just a few simple steps:

```bash
$ npm install -g @nestjs/mau
$ mau deploy
```

With Mau, you can deploy your application in just a few clicks, allowing you to focus on building features rather than managing infrastructure.

## Resources

Check out a few resources that may come in handy when working with NestJS:

- Visit the [NestJS Documentation](https://docs.nestjs.com) to learn more about the framework.
- For questions and support, please visit our [Discord channel](https://discord.gg/G7Qnnhy).
- To dive deeper and get more hands-on experience, check out our official video [courses](https://courses.nestjs.com/).
- Deploy your application to AWS with the help of [NestJS Mau](https://mau.nestjs.com) in just a few clicks.
- Visualize your application graph and interact with the NestJS application in real-time using [NestJS Devtools](https://devtools.nestjs.com).
- Need help with your project (part-time to full-time)? Check out our official [enterprise support](https://enterprise.nestjs.com).
- To stay in the loop and get updates, follow us on [X](https://x.com/nestframework) and [LinkedIn](https://linkedin.com/company/nestjs).
- Looking for a job, or have a job to offer? Check out our official [Jobs board](https://jobs.nestjs.com).

## Support

Nest is an MIT-licensed open source project. It can grow thanks to the sponsors and support by the amazing backers. If you'd like to join them, please [read more here](https://docs.nestjs.com/support).

## Stay in touch

- Author - [Kamil Myśliwiec](https://twitter.com/kammysliwiec)
- Website - [https://nestjs.com](https://nestjs.com/)
- Twitter - [@nestframework](https://twitter.com/nestframework)

## License

Nest is [MIT licensed](https://github.com/nestjs/nest/blob/master/LICENSE).
