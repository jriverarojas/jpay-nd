# Docker Deployment Guide

This guide explains how to build and deploy the jpay-nd application using Docker.

## Prerequisites

- Docker installed on your system
- Docker Hub account (or another container registry) for pushing images
- Access to Portainer for deployment

## Quick Answer: Using YAML in Portainer

**Sí, puedes usar archivos YAML en Portainer usando Stacks (recomendado):**

1. Edita `docker-compose.portainer.yml` con tus valores (imagen, DB, Supabase)
2. Ve a **Stacks** → **Add stack**
3. Selecciona **Web editor**
4. Pega el contenido del YAML (ya con tus valores)
5. Click **Deploy the stack** - ¡Listo! No necesitas configurar variables adicionales

**Ventajas:**
- ✅ No necesitas usar la interfaz gráfica
- ✅ **Todas las variables están en el YAML** - no hay que configurarlas dos veces
- ✅ Configuración versionada (puedes guardarla en Git)
- ✅ Fácil de actualizar y mantener
- ✅ Mejor para producción

Ver la sección **"Option 2: Using Docker Compose Stack"** más abajo para instrucciones detalladas.

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

Portainer permite usar archivos YAML (docker-compose) a través de **Stacks**. Esto es más fácil y mantenible que la interfaz gráfica.

#### Pasos:

1. **Prepara tu imagen Docker** (si aún no lo has hecho):
   ```bash
   ./docker-build.sh push your-username
   ```

2. **Edita el archivo YAML con tus valores:**
   - Abre `docker-compose.portainer.yml`
   - Reemplaza `your-username` con tu usuario de Docker Hub
   - Reemplaza todos los valores de ejemplo con tus credenciales reales:
     - `DB_HOST`, `DB_USERNAME`, `DB_PASSWORD`, etc.
     - `SUPABASE_URL`, `SUPABASE_SERVICE_ROLE_KEY`

3. **En Portainer:**
   - Ve a **Stacks** → **Add stack**
   - **Name**: `jpay-nd`
   - **Build method**: Selecciona una de estas opciones:

   **Opción A: Web editor** (más fácil - valores directos en YAML)
   - Selecciona **Web editor**
   - Copia y pega el contenido de `docker-compose.portainer.yml` (ya con tus valores)
   - **No necesitas agregar variables de entorno** - ya están en el YAML
   - Click **Deploy the stack**

   **Opción B: Usar variables de entorno** (más seguro para secrets)
   - Usa `docker-compose.portainer.with-env.yml` si prefieres
   - En la sección **Environment variables** de Portainer, agrega:
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

   **Opción B: Upload** (si tienes el archivo)
   - Selecciona **Upload**
   - Sube el archivo `docker-compose.portainer.yml`
   - Configura las variables de entorno
   - Click **Deploy the stack**

   **Opción C: Git repository** (para CI/CD)
   - Selecciona **Repository**
   - Ingresa la URL de tu repositorio Git
   - **Compose path**: `jpay-nd/docker-compose.portainer.yml`
   - Configura las variables de entorno
   - Click **Deploy the stack**

3. **Actualizar el stack:**
   - Ve a **Stacks** → Selecciona `jpay-nd`
   - Click **Editor**
   - Modifica el YAML si es necesario
   - Click **Update the stack**

#### Ventajas de usar Stacks:
- ✅ Configuración versionada (puedes guardar el YAML en Git)
- ✅ Fácil de actualizar (solo editas el YAML)
- ✅ Puedes usar variables de entorno
- ✅ Mejor para múltiples servicios
- ✅ Puedes recrear fácilmente desde el YAML

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

# CORS Configuration - Lista blanca de orígenes permitidos (separados por comas)
# Soporta wildcards: *.example.com permite todos los subdominios
# Ejemplos:
#   - Orígenes exactos: https://app.example.com,https://www.example.com
#   - Wildcard subdominios: *.example.com (permite app1.example.com, app2.example.com, etc.)
#   - Dominio base: example.com (permite example.com y todos los subdominios)
#   - Con protocolo: https://*.example.com
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
