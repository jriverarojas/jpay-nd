#!/bin/bash

# Script para configurar los entornos de migraciones
# Este script mueve .env.migrations a .env.migrations.alpha y crea enlaces simbólicos

set -e

SCRIPT_DIR="$(cd "$(dirname "${BASH_SOURCE[0]}")" && pwd)"
PROJECT_ROOT="$(cd "$SCRIPT_DIR/.." && pwd)"

cd "$PROJECT_ROOT"

echo "🔧 Configurando entornos de migraciones..."

# Si existe .env.migrations (y no es un enlace simbólico), moverlo a .env.migrations.alpha
if [ -f ".env.migrations" ] && [ ! -L ".env.migrations" ]; then
  echo "📦 Moviendo .env.migrations a .env.migrations.alpha..."
  mv .env.migrations .env.migrations.alpha
  echo "✅ Archivo movido correctamente"
elif [ -L ".env.migrations" ]; then
  echo "⚠️  .env.migrations ya es un enlace simbólico. Eliminándolo..."
  rm .env.migrations
fi

# Crear archivos de entorno si no existen
if [ ! -f ".env.migrations.alpha" ]; then
  echo "📝 Creando .env.migrations.alpha desde el ejemplo..."
  if [ -f ".env.migrations.example" ]; then
    cp .env.migrations.example .env.migrations.alpha
    echo "⚠️  Por favor, edita .env.migrations.alpha con las credenciales de ALPHA"
  else
    touch .env.migrations.alpha
    echo "# Configuración para entorno ALPHA" >> .env.migrations.alpha
    echo "DB_HOST=db.xxxxx.supabase.co" >> .env.migrations.alpha
    echo "DB_PORT=5432" >> .env.migrations.alpha
    echo "DB_USERNAME=postgres.xxxxx" >> .env.migrations.alpha
    echo "DB_PASSWORD=tu_password_aqui" >> .env.migrations.alpha
    echo "DB_DATABASE=postgres" >> .env.migrations.alpha
    echo "DB_SSL=true" >> .env.migrations.alpha
    echo "⚠️  Por favor, edita .env.migrations.alpha con las credenciales de ALPHA"
  fi
fi

if [ ! -f ".env.migrations.beta" ]; then
  echo "📝 Creando .env.migrations.beta..."
  if [ -f ".env.migrations.example" ]; then
    cp .env.migrations.example .env.migrations.beta
    echo "⚠️  Por favor, edita .env.migrations.beta con las credenciales de BETA"
  else
    touch .env.migrations.beta
    echo "# Configuración para entorno BETA" >> .env.migrations.beta
    echo "DB_HOST=db.xxxxx.supabase.co" >> .env.migrations.beta
    echo "DB_PORT=5432" >> .env.migrations.beta
    echo "DB_USERNAME=postgres.xxxxx" >> .env.migrations.beta
    echo "DB_PASSWORD=tu_password_aqui" >> .env.migrations.beta
    echo "DB_DATABASE=postgres" >> .env.migrations.beta
    echo "DB_SSL=true" >> .env.migrations.beta
    echo "⚠️  Por favor, edita .env.migrations.beta con las credenciales de BETA"
  fi
fi

if [ ! -f ".env.migrations.prod" ]; then
  echo "📝 Creando .env.migrations.prod..."
  if [ -f ".env.migrations.example" ]; then
    cp .env.migrations.example .env.migrations.prod
    echo "⚠️  Por favor, edita .env.migrations.prod con las credenciales de PRODUCCIÓN"
  else
    touch .env.migrations.prod
    echo "# Configuración para entorno PRODUCCIÓN" >> .env.migrations.prod
    echo "DB_HOST=db.xxxxx.supabase.co" >> .env.migrations.prod
    echo "DB_PORT=5432" >> .env.migrations.prod
    echo "DB_USERNAME=postgres.xxxxx" >> .env.migrations.prod
    echo "DB_PASSWORD=tu_password_aqui" >> .env.migrations.prod
    echo "DB_DATABASE=postgres" >> .env.migrations.prod
    echo "DB_SSL=true" >> .env.migrations.prod
    echo "⚠️  Por favor, edita .env.migrations.prod con las credenciales de PRODUCCIÓN"
  fi
fi

# Crear enlace simbólico inicial apuntando a alpha
if [ ! -L ".env.migrations" ]; then
  echo "🔗 Creando enlace simbólico .env.migrations -> .env.migrations.alpha..."
  ln -s .env.migrations.alpha .env.migrations
  echo "✅ Enlace simbólico creado"
else
  CURRENT_TARGET=$(readlink .env.migrations)
  echo "ℹ️  .env.migrations ya existe y apunta a: $CURRENT_TARGET"
fi

echo ""
echo "✅ Configuración completada!"
echo ""
echo "📋 Archivos creados:"
echo "   - .env.migrations.alpha (entorno ALPHA)"
echo "   - .env.migrations.beta (entorno BETA)"
echo "   - .env.migrations.prod (entorno PRODUCCIÓN)"
echo "   - .env.migrations -> enlace simbólico (actualmente apunta a .env.migrations.alpha)"
echo ""
echo "💡 Para cambiar de entorno, usa:"
echo "   npm run migrate:env alpha"
echo "   npm run migrate:env beta"
echo "   npm run migrate:env prod"
echo ""
