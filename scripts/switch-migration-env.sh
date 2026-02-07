#!/bin/bash

# Script para cambiar entre entornos de migraciones
# Uso: ./scripts/switch-migration-env.sh [alpha|beta|prod]

set -e

SCRIPT_DIR="$(cd "$(dirname "${BASH_SOURCE[0]}")" && pwd)"
PROJECT_ROOT="$(cd "$SCRIPT_DIR/.." && pwd)"

cd "$PROJECT_ROOT"

ENV=${1:-alpha}

if [[ ! "$ENV" =~ ^(alpha|beta|prod)$ ]]; then
  echo "❌ Error: Entorno inválido. Debe ser: alpha, beta o prod"
  echo "Uso: $0 [alpha|beta|prod]"
  exit 1
fi

TARGET_FILE=".env.migrations.$ENV"

if [ ! -f "$TARGET_FILE" ]; then
  echo "❌ Error: El archivo $TARGET_FILE no existe"
  echo "💡 Ejecuta primero: npm run migrate:setup"
  exit 1
fi

# Eliminar enlace simbólico existente si existe
if [ -L ".env.migrations" ]; then
  CURRENT_TARGET=$(readlink .env.migrations)
  if [ "$CURRENT_TARGET" = "$TARGET_FILE" ]; then
    echo "ℹ️  .env.migrations ya apunta a $TARGET_FILE"
    exit 0
  fi
  echo "🔗 Eliminando enlace simbólico actual (apuntaba a $CURRENT_TARGET)..."
  rm .env.migrations
fi

# Crear nuevo enlace simbólico
echo "🔗 Creando enlace simbólico .env.migrations -> $TARGET_FILE..."
ln -s "$TARGET_FILE" .env.migrations

echo "✅ Entorno de migraciones cambiado a: $ENV"
echo "📋 .env.migrations ahora apunta a: $TARGET_FILE"
echo ""
echo "💡 Para ejecutar migraciones en este entorno:"
echo "   npm run migrate"
echo ""
