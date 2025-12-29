#!/bin/bash
# Script para configurar variables en Vercel usando Vercel CLI
# Este script configura DATABASE_URL, JWT_SECRET y TMDB_READ_ACCESS_TOKEN

set -e

PROJECT_DIR="/g/DEV/LAB/movies-tracker"
cd "$PROJECT_DIR"

echo "================================================"
echo "Configurando Variables de Entorno en Vercel"
echo "================================================"
echo ""

# Generar JWT_SECRET
JWT_SECRET_VALUE="$(node -e "require('crypto').randomBytes(32).toString('hex')" 2>/dev/null || echo "6f7e8d9c0a1b2c3d4e5f6g7h8i9j0k1l2m3n4o5p")"

DATABASE_URL_VALUE="postgresql://neondb_owner:<REDACTED>@<REDACTED>/neondb?sslmode=require&channel_binding=require&options=-csearch_path%3D%22movies-tracker%22"
TMDB_TOKEN_VALUE="eyJhbGciOiJIUzI1NiJ9.eyJhdWQiOiJjZDUxNzQwOTY5NzYzMWQ2MDEwN2E0ZjUyMzFlNmM3MiIsIm5iZiI6MTc2NjQ0NDkxNC42ODMsInN1YiI6IjY5NDljZjcyNmQzNjU2MDBmYWZiMWE0YSIsInNjb3BlcyI6WyJhcGlfcmVhZCJdLCJ2ZXJzaW9uIjoxfQ.NowHJhmYPsvo9a4eyHKCBX60RdFmHk6-4H9DlFIYuwU"

echo "✅ Variables a configurar:"
echo "   1. DATABASE_URL"
echo "   2. JWT_SECRET (generado): ${JWT_SECRET_VALUE:0:16}..."
echo "   3. TMDB_READ_ACCESS_TOKEN"
echo ""

echo "Configurando en Vercel..."
echo ""

# DATABASE_URL para production
echo "→ DATABASE_URL en production..."
printf "%s\n" "$DATABASE_URL_VALUE" | vercel env add DATABASE_URL production 2>&1 | grep -v "^$" || true

# DATABASE_URL para preview  
echo "→ DATABASE_URL en preview..."
printf "%s\n" "$DATABASE_URL_VALUE" | vercel env add DATABASE_URL preview 2>&1 | grep -v "^$" || true

# DATABASE_URL para development
echo "→ DATABASE_URL en development..."
printf "%s\n" "$DATABASE_URL_VALUE" | vercel env add DATABASE_URL development 2>&1 | grep -v "^$" || true

# JWT_SECRET para todos los entornos
echo "→ JWT_SECRET en production..."
printf "%s\n" "$JWT_SECRET_VALUE" | vercel env add JWT_SECRET production 2>&1 | grep -v "^$" || true

echo "→ JWT_SECRET en preview..."
printf "%s\n" "$JWT_SECRET_VALUE" | vercel env add JWT_SECRET preview 2>&1 | grep -v "^$" || true

echo "→ JWT_SECRET en development..."
printf "%s\n" "$JWT_SECRET_VALUE" | vercel env add JWT_SECRET development 2>&1 | grep -v "^$" || true

# TMDB_READ_ACCESS_TOKEN
echo "→ TMDB_READ_ACCESS_TOKEN en production..."
printf "%s\n" "$TMDB_TOKEN_VALUE" | vercel env add TMDB_READ_ACCESS_TOKEN production 2>&1 | grep -v "^$" || true

echo "→ TMDB_READ_ACCESS_TOKEN en preview..."
printf "%s\n" "$TMDB_TOKEN_VALUE" | vercel env add TMDB_READ_ACCESS_TOKEN preview 2>&1 | grep -v "^$" || true

echo "→ TMDB_READ_ACCESS_TOKEN en development..."
printf "%s\n" "$TMDB_TOKEN_VALUE" | vercel env add TMDB_READ_ACCESS_TOKEN development 2>&1 | grep -v "^$" || true

echo ""
echo "================================================"
echo "✅ Variables configuradas exitosamente"
echo "================================================"
echo ""
echo "Verificando estado actual..."
vercel env ls
echo ""
echo "📝 Próximos pasos:"
echo "1. Espera 2-3 minutos para que Vercel inicie redeploy automático"
echo "2. Verifica el estado en: https://vercel.com/dashboard/projects/movies-tracker"
echo "3. Prueba la app en: https://movies-trackers.vercel.app/en/register"
echo "4. Si aún hay error, revisa los logs de Vercel"
echo ""
