#!/bin/bash

# Script para configurar variables de entorno en Vercel CLI

PROJECT_DIR="/g/DEV/LAB/movies-tracker"
cd "$PROJECT_DIR"

echo "=== Configurando Variables de Entorno en Vercel ==="
echo ""

# Generar JWT_SECRET seguro
JWT_SECRET=$(node -e "console.log(require('crypto').randomBytes(32).toString('hex'))")

# Variables a configurar
DATABASE_URL="postgresql://neondb_owner:<REDACTED_NEON_PASSWORD>@<REDACTED>/neondb?sslmode=require&channel_binding=require&options=-csearch_path%3D%22movies-tracker%22"
TMDB_READ_ACCESS_TOKEN="eyJhbGciOiJIUzI1NiJ9.eyJhdWQiOiJjZDUxNzQwOTY5NzYzMWQ2MDEwN2E0ZjUyMzFlNmM3MiIsIm5iZiI6MTc2NjQ0NDkxNC42ODMsInN1YiI6IjY5NDljZjcyNmQzNjU2MDBmYWZiMWE0YSIsInNjb3BlcyI6WyJhcGlfcmVhZCJdLCJ2ZXJzaW9uIjoxfQ.NowHJhmYPsvo9a4eyHKCBX60RdFmHk6-4H9DlFIYuwU"

echo "1. DATABASE_URL"
echo "   Valor: (PostgreSQL connection string)"
echo ""

echo "2. JWT_SECRET"
echo "   Valor: $JWT_SECRET"
echo ""

echo "3. TMDB_READ_ACCESS_TOKEN"
echo "   Valor: (TMDB API token)"
echo ""

echo "Presiona Enter para continuar con la configuración en Vercel..."
read

echo ""
echo "Configurando DATABASE_URL..."
vercel env add DATABASE_URL --sensitive "$DATABASE_URL" --production --preview --development

echo ""
echo "Configurando JWT_SECRET..."
vercel env add JWT_SECRET --sensitive "$JWT_SECRET" --production --preview --development

echo ""
echo "Configurando TMDB_READ_ACCESS_TOKEN..."
vercel env add TMDB_READ_ACCESS_TOKEN --sensitive "$TMDB_READ_ACCESS_TOKEN" --production --preview --development

echo ""
echo "✅ Variables configuradas exitosamente!"
echo ""
echo "Próximos pasos:"
echo "1. Espera 2-3 minutos para que Vercel redeploy automático se complete"
echo "2. Prueba: https://movies-trackers.vercel.app/en/register"
echo "3. Debería funcionar sin HTTP 500"
