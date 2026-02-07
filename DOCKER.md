# Docker Deployment Guide

This guide explains how to build and deploy the jpay-nd application using Docker.

## Prerequisites

- Docker installed on your system
- Docker Hub account (or another container registry) for pushing images
- Access to Portainer for deployment

## Quick Answer: Using YAML in Portainer

**Yes, you can use YAML files in Portainer using Stacks (recommended):**

1. Edit `docker-compose.portainer.yml` with your values (image, DB, Supabase)
2. Go to **Stacks** → **Add stack**
3. Select **Web editor**
4. Paste the YAML content (already with your values)
5. Click **Deploy the stack** - Done! You don't need to configure additional variables

**Advantages:**
- ✅ You don't need to use the graphical interface
- ✅ **All variables are in the YAML** - no need to configure them twice
- ✅ Versioned configuration (you can save it in Git)
- ✅ Easy to update and maintain
- ✅ Better for production

See the **"Option 2: Using Docker Compose Stack"** section below for detailed instructions.

## Quick Start

### 1. Build the Docker Image

```bash
# Build only
./docker-build.sh

# Or manually
docker build -t jpay-nd:latest .
```

### 2. Test Locally (Optional)

```bash
# Run the container locally
docker run -p 3000:3000 --env-file .env jpay-nd:latest

# Or using docker-compose
docker-compose up
```

### 3. Push to Registry

Before pushing, you need to:

1. **Login to Docker Hub** (or your registry):
   ```bash
   docker login
   ```

2. **Build and push using the script**:
   ```bash
   # Using Docker Hub (default)
   export DOCKER_REGISTRY=docker.io/your-username
   ./docker-build.sh push

   # Or specify registry directly
   ./docker-build.sh push docker.io/your-username
   ./docker-build.sh push ghcr.io/your-username/jpay-nd
   ```

3. **Or manually**:
   ```bash
   docker tag jpay-nd:latest your-username/jpay-nd:latest
   docker push your-username/jpay-nd:latest
   ```

## Deploying to Portainer

### Option 1: Using Container Registry

1. **In Portainer:**
   - Go to **Containers** → **Add container**
   - **Name**: `jpay-nd`
   - **Image**: `your-username/jpay-nd:latest` (or your registry path)
   - **Port mapping**: `3000:3000` (or your desired port)
   - **Restart policy**: `Unless stopped`

2. **Environment Variables:**
   Add all required environment variables:
   - `PORT=3000`
   - `NODE_ENV=production`
   - `DB_HOST=your-db-host`
   - `DB_PORT=5432`
   - `DB_USERNAME=your-username`
   - `DB_PASSWORD=your-password`
   - `DB_DATABASE=your-database`
   - `DB_SSL=true` (if using Supabase)
   - `SUPABASE_URL=your-supabase-url`
   - `SUPABASE_SERVICE_ROLE_KEY=your-key`

3. **Network:**
   - Create or select a network that allows connection to your database

4. **Deploy:**
   - Click **Deploy the container**

### Option 2: Using Docker Compose Stack (Recommended)

Portainer allows using YAML files (docker-compose) through **Stacks**. This is easier and more maintainable than the graphical interface.

#### Steps:

1. **Prepare your Docker image** (if you haven't already):
   ```bash
   ./docker-build.sh push your-username
   ```

2. **Edit the YAML file with your values:**
   - Open `docker-compose.portainer.yml`
   - Replace `your-username` with your Docker Hub username
   - Replace all example values with your real credentials:
     - `DB_HOST`, `DB_USERNAME`, `DB_PASSWORD`, etc.
     - `SUPABASE_URL`, `SUPABASE_SERVICE_ROLE_KEY`

3. **In Portainer:**
   - Go to **Stacks** → **Add stack**
   - **Name**: `jpay-nd`
   - **Build method**: Select one of these options:

   **Option A: Web editor** (easiest - direct values in YAML)
   - Select **Web editor**
   - Copy and paste the content of `docker-compose.portainer.yml` (already with your values)
   - **You don't need to add environment variables** - they're already in the YAML
   - Click **Deploy the stack**

   **Option B: Use environment variables** (more secure for secrets)
   - Use `docker-compose.portainer.with-env.yml` if you prefer
   - In the **Environment variables** section of Portainer, add:
     ```
     DOCKER_IMAGE=your-username/jpay-nd:latest
     PORT=3000
     DB_HOST=your-db-host
     DB_PORT=5432
     DB_USERNAME=your-username
     DB_PASSWORD=your-password
     DB_DATABASE=your-database
     DB_SSL=true
     SUPABASE_URL=https://your-project.supabase.co
     SUPABASE_SERVICE_ROLE_KEY=your-key
     ```
   - Click **Deploy the stack**

   **Option C: Upload** (if you have the file)
   - Select **Upload**
   - Upload the `docker-compose.portainer.yml` file
   - Configure environment variables
   - Click **Deploy the stack**

   **Option D: Git repository** (for CI/CD)
   - Select **Repository**
   - Enter your Git repository URL
   - **Compose path**: `jpay-nd/docker-compose.portainer.yml`
   - Configure environment variables
   - Click **Deploy the stack**

4. **Update the stack:**
   - Go to **Stacks** → Select `jpay-nd`
   - Click **Editor**
   - Modify the YAML if necessary
   - Click **Update the stack**

#### Advantages of using Stacks:
- ✅ Versioned configuration (you can save the YAML in Git)
- ✅ Easy to update (just edit the YAML)
- ✅ You can use environment variables
- ✅ Better for multiple services
- ✅ You can easily recreate from the YAML

## Updating the Application

When you make changes to the code:

1. **Build the new image:**
   ```bash
   ./docker-build.sh
   ```

2. **Tag with a new version** (recommended):
   ```bash
   docker tag jpay-nd:latest jpay-nd:v1.0.1
   docker tag jpay-nd:latest your-username/jpay-nd:v1.0.1
   ```

3. **Push to registry:**
   ```bash
   ./docker-build.sh push your-username
   ```

4. **In Portainer:**
   - Go to your container
   - Click **Recreate**
   - Enable **Pull latest image**
   - Click **Recreate**

## Environment Variables

Required environment variables:

```env
# Server
PORT=3000
NODE_ENV=production

# Database
DB_HOST=your-db-host
DB_PORT=5432
DB_USERNAME=your-username
DB_PASSWORD=your-password
DB_DATABASE=your-database
DB_SSL=true
DB_LOGGING=false

# Supabase
SUPABASE_URL=https://your-project.supabase.co
SUPABASE_SERVICE_ROLE_KEY=your-secret-key

# External
EXTERNAL_KEY=your-external-key

# CORS Configuration - Whitelist of allowed origins (comma-separated)
# Supports wildcards: *.example.com allows all subdomains
# Examples:
#   - Exact origins: https://app.example.com,https://www.example.com
#   - Wildcard subdomains: *.example.com (allows app1.example.com, app2.example.com, etc.)
#   - Base domain: example.com (allows example.com and all subdomains)
#   - With protocol: https://*.example.com
CORS_ORIGINS=https://your-frontend-domain.com,https://www.your-frontend-domain.com
```

## Health Check

The application includes a health check endpoint at `/health` that returns:

```json
{
  "status": "ok",
  "timestamp": "2024-01-01T00:00:00.000Z"
}
```

Docker will automatically monitor this endpoint.

## Database Migrations

**Important:** Database migrations should be run **before** starting the container, or as a separate step.

Options:

1. **Run migrations from your local machine** (recommended):
   ```bash
   npm run migrate:env prod
   npm run migrate
   ```

2. **Run migrations inside the container** (requires modifying Dockerfile):
   - This would require including migration scripts in the image
   - Not recommended for production

## Troubleshooting

### Container won't start
- Check logs: `docker logs jpay-nd`
- Verify environment variables are set correctly
- Ensure database is accessible from container network

### Health check failing
- Verify the application is listening on the correct port
- Check if `/health` endpoint is accessible
- Review application logs

### Database connection errors
- Verify `DB_HOST` is accessible from container
- Check firewall rules
- Ensure `DB_SSL=true` for Supabase connections
- Verify credentials are correct

## Security Notes

- Never commit `.env` files to version control
- Use secrets management in Portainer for sensitive data
- The container runs as non-root user (`nestjs`) for security
- Use SSL/TLS for database connections in production
