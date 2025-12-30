#!/bin/bash
# Script para solucionar problemas de build en Vercel
# Se ejecuta automáticamente durante el deploy

set -e

echo "🔧 Preparando build para Vercel..."
echo ""

# 1. Validar DATABASE_URL
if [ -z "$DATABASE_URL" ]; then
  echo "❌ ERROR: DATABASE_URL no está configurada"
  exit 1
fi

# 2. Limpiar caracteres de escape en DATABASE_URL
# Eliminar \n y otros caracteres de escape que Vercel pueda añadir
export DATABASE_URL=$(echo "$DATABASE_URL" | sed 's/\\n//g' | sed 's/\\r//g')

echo "✅ DATABASE_URL limpiada"

# 3. Verificar que el esquema está en la URL
if ! echo "$DATABASE_URL" | grep -q "search_path"; then
  echo "⚠️  Esquema no encontrado en DATABASE_URL, añadiendo..."
  if echo "$DATABASE_URL" | grep -q "?"; then
    export DATABASE_URL="${DATABASE_URL}&options=-csearch_path%3D%22movies-tracker%22"
  else
    export DATABASE_URL="${DATABASE_URL}?options=-csearch_path%3D%22movies-tracker%22"
  fi
  echo "✅ Esquema 'movies-tracker' añadido a DATABASE_URL"
fi

# 4. Validar JWT_SECRET
if [ -z "$JWT_SECRET" ]; then
  echo "❌ ERROR: JWT_SECRET no está configurada"
  exit 1
fi

if [ ${#JWT_SECRET} -lt 32 ]; then
  echo "⚠️  ADVERTENCIA: JWT_SECRET es muy corta (${#JWT_SECRET} caracteres), se recomienda al menos 32"
fi

echo "✅ JWT_SECRET validada"

# 5. Generar Prisma Client
echo ""
echo "📦 Generando Prisma Client..."
pnpm dlx prisma generate || npm exec prisma -- generate

echo ""
echo "✅ Build preparado exitosamente para Vercel!"
