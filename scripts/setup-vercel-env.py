#!/usr/bin/env python3
"""
Script para configurar variables de entorno en Vercel usando Vercel CLI.
"""
import subprocess
import sys

# Generar JWT_SECRET seguro
import secrets
jwt_secret = secrets.token_hex(32)

# Variables a configurar
variables = {
    "DATABASE_URL": "postgresql://neondb_owner:<REDACTED>@<REDACTED>/neondb?sslmode=require&channel_binding=require&options=-csearch_path%3D%22movies-tracker%22",
    "JWT_SECRET": jwt_secret,
    "TMDB_READ_ACCESS_TOKEN": "eyJhbGciOiJIUzI1NiJ9.eyJhdWQiOiJjZDUxNzQwOTY5NzYzMWQ2MDEwN2E0ZjUyMzFlNmM3MiIsIm5iZiI6MTc2NjQ0NDkxNC42ODMsInN1YiI6IjY5NDljZjcyNmQzNjU2MDBmYWZiMWE0YSIsInNjb3BlcyI6WyJhcGlfcmVhZCJdLCJ2ZXJzaW9uIjoxfQ.NowHJhmYPsvo9a4eyHKCBX60RdFmHk6-4H9DlFIYuwU",
}

entornos = ["production", "preview", "development"]

print("=== Configurando Variables de Entorno en Vercel ===\n")

for var_name, var_value in variables.items():
    print(f"📝 Configurando {var_name}...")
    
    for env in entornos:
        try:
            # Usar vercel env add para cada entorno
            process = subprocess.Popen(
                ["vercel", "env", "add", var_name, env, "--sensitive"],
                stdin=subprocess.PIPE,
                stdout=subprocess.PIPE,
                stderr=subprocess.PIPE,
                text=True
            )
            
            # Pasar el valor a través de stdin
            stdout, stderr = process.communicate(input=var_value, timeout=10)
            
            if process.returncode == 0:
                print(f"   ✅ {var_name} → {env}")
            else:
                print(f"   ⚠️  {var_name} → {env}: {stderr.strip()}")
                
        except subprocess.TimeoutExpired:
            process.kill()
            print(f"   ❌ {var_name} → {env}: Timeout")
        except Exception as e:
            print(f"   ❌ {var_name} → {env}: {str(e)}")

print("\n✅ Proceso completado!")
print(f"\nJWT_SECRET generado: {jwt_secret}")
print("\nProximos pasos:")
print("1. Espera 2-3 minutos para que Vercel redeploy automático se complete")
print("2. Prueba: https://movies-trackers.vercel.app/en/register")
print("3. Debería funcionar sin HTTP 500")
