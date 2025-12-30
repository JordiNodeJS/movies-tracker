#!/bin/bash
# Script para añadir NEON_API_KEY a Vercel
# 
# ⚠️  NUNCA comittees credenciales reales a este archivo
# 
# Uso:
#   1. Configura la variable de entorno: export NEON_API_KEY="tu_clave_aquí"
#   2. Corre este script: bash scripts/add_vercel_env.sh
#
# O usa Vercel CLI directamente:
#   vercel env add NEON_API_KEY production

# Verificar que la variable está configurada
if [ -z "$NEON_API_KEY" ]; then
  echo "❌ ERROR: NEON_API_KEY no está configurada"
  echo ""
  echo "Por favor configura la variable de entorno:"
  echo "  export NEON_API_KEY='tu_clave_neon_aqui'"
  echo ""
  echo "O usa Vercel CLI directamente:"
  echo "  vercel env add NEON_API_KEY production"
  exit 1
fi

# Obtener el PROJECT_ID
PROJECT_ID=$(vercel project list --json 2>/dev/null | jq -r '.projects[] | select(.name=="movies-tracker") | .id' 2>/dev/null)

if [ -z "$PROJECT_ID" ]; then
  echo "❌ No se pudo obtener el PROJECT_ID"
  echo "Asegúrate de estar logueado: vercel login"
  exit 1
fi

echo "✅ Project ID encontrado: $PROJECT_ID"
echo "📝 Añadiendo NEON_API_KEY a Production y Preview..."

# Usar Vercel CLI es más seguro que curl
vercel env add NEON_API_KEY "$NEON_API_KEY" production preview development 2>&1

if [ $? -eq 0 ]; then
  echo "✅ Variable añadida exitosamente"
  echo "⏳ El deploy se actualizará en 2-3 minutos"
else
  echo "❌ Error al añadir la variable"
  exit 1
fi
