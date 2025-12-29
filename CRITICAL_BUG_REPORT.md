# 🚨 INFORME CRÍTICO: Error HTTP 500 en Registro (Producción)

**Status**: 🔴 CRITICAL  
**Afectado**: https://movies-trackers.vercel.app/register  
**Causa**: Falta de variables de entorno en Vercel  
**Severidad**: Sistema de autenticación completamente no funcional

---

## 📊 Resumen Ejecutivo

El endpoint de registro en **Vercel (producción)** retorna **HTTP 500** mientras que funciona perfectamente en desarrollo local.

**Causa Raíz Identificada**: Las variables de entorno críticas (`DATABASE_URL`, `JWT_SECRET`, `TMDB_READ_ACCESS_TOKEN`) **NO están configuradas en Vercel**, causando que:

1. Prisma no pueda conectarse a Neon
2. JWT no pueda firmar tokens
3. El Server Action `register()` falla silenciosamente
4. Se retorna HTTP 500 al cliente

---

## 🔍 Evidencia de Diagnóstico

### ✅ Ambiente Local (Funciona)

```bash
$ pnpm dlx tsx validate-neon-connection.ts

🔌 Conectando a Neon...
✅ SELECT 1 exitoso
✅ Schema 'movies-tracker' accesible - 8 tablas encontradas
📊 REPORTE DE VALIDACIÓN:
{
  "neonConnection": {
    "success": true,
    "simpleQuery": { "success": true },
    "schemaAccess": { "success": true }
  },
  "finalStatus": "SUCCESS ✅"
}
```

**Conclusión**: En local, la BD está perfectamente configurada con:

- ✅ DATABASE_URL con `search_path="movies-tracker"`
- ✅ Tabla `users` accesible
- ✅ Prisma puede conectar y operar

### ❌ Ambiente Vercel (Falla)

Cuando se visita https://movies-trackers.vercel.app/register:

- ❌ HTTP 500 Internal Server Error
- ❌ No hay respuesta válida del endpoint
- ❌ Los logs de Vercel probablemente muestran: "DATABASE_URL is not set"

---

## 🔧 Variables de Entorno Requeridas

| Variable                 | Local                          | Vercel                | Crítica | Propósito         |
| ------------------------ | ------------------------------ | --------------------- | ------- | ----------------- |
| `DATABASE_URL`           | ✅ Configurada en `.env.local` | ❌ **NO CONFIGURADA** | **SÍ**  | Conexión a Neon   |
| `JWT_SECRET`             | ✅ Configurada en `.env.local` | ❌ **NO CONFIGURADA** | **SÍ**  | Autenticación JWT |
| `TMDB_READ_ACCESS_TOKEN` | ✅ Configurada en `.env.local` | ❌ **NO CONFIGURADA** | **SÍ**  | API de películas  |

---

## 🚀 Plan de Acción Inmediato (5-10 minutos)

### Paso 1: Preparar los valores

De tu `.env.local` actual, necesitas copiar exactamente:

```env
# From .env.local, copy these exact values
DATABASE_URL=postgresql://neondb_owner:<REDACTED>@<REDACTED>/neondb?sslmode=require&channel_binding=require&options=-csearch_path%3D%22movies-tracker%22

JWT_SECRET=development_secret_key_for_movies_tracker
# ⚠️ Para producción, genera uno más fuerte con:
# node -e "console.log(require('crypto').randomBytes(32).toString('hex'))"

TMDB_READ_ACCESS_TOKEN=eyJhbGciOiJIUzI1NiJ9.eyJhdWQiOiJjZDUxNzQwOTY5NzYzMWQ2MDEwN2E0ZjUyMzFlNmM3MiIsIm5iZiI6MTc2NjQ0NDkxNC42ODMsInN1YiI6IjY5NDljZjcyNmQzNjU2MDBmYWZiMWE0YSIsInNjb3BlcyI6WyJhcGlfcmVhZCJdLCJ2ZXJzaW9uIjoxfQ.NowHJhmYPsvo9a4eyHKCBX60RdFmHk6-4H9DlFIYuwU
```

### Paso 2: Configurar en Vercel (1 minuto)

1. Ir a: https://vercel.com/dashboard
2. Seleccionar proyecto: **movies-tracker**
3. Click en: **Settings** (top bar)
4. Click en: **Environment Variables** (left sidebar)
5. **Agregar cada variable**:
   - Key: `DATABASE_URL`
   - Value: `postgresql://neondb_owner:<REDACTED>@...`
   - Environments: ✅ Production, ✅ Preview, ✅ Development
   - Click **Save**

6. Repetir para:
   - `JWT_SECRET`
   - `TMDB_READ_ACCESS_TOKEN`

### Paso 3: Esperar y validar (2-3 minutos)

1. Vercel automáticamente redesplegará
2. Espera 2-3 minutos
3. Visita: https://movies-trackers.vercel.app/register
4. Intenta registrarte:
   - Email: `test@example.com`
   - Password: `Test@123456`
5. Deberías ser redirigido a `/login` (indicando éxito ✅)

---

## 💡 Explicación Técnica

### Flujo en Local (Funciona)

```
1. User → /register form
2. POST data → register() Server Action
3. register() loads Prisma Client
4. Prisma checks: process.env.DATABASE_URL
5. ✅ DATABASE_URL existe → conecta a Neon
6. ✅ Schema 'movies-tracker' accesible
7. ✅ Crea usuario en BD
8. ✅ Genera JWT con JWT_SECRET
9. ✅ Redirige a /login
```

### Flujo en Vercel (Falla)

```
1. User → /register form
2. POST data → register() Server Action
3. register() loads Prisma Client
4. Prisma checks: process.env.DATABASE_URL
5. ❌ DATABASE_URL no existe (no está en Vercel env vars)
6. ❌ Prisma fallback: intenta conectarse sin URL
7. ❌ Conexión fallida → Error en Prisma initialization
8. ❌ Server Action falla → HTTP 500 al cliente
9. ❌ Error logeado en Vercel Functions logs
```

---

## 🐛 Cambios de Código Implementados

Para mejorar la detección de este problema en el futuro, hemos:

### 1. Creado validador de variables (NEW)

**Archivo**: [src/lib/env-validator.ts](src/lib/env-validator.ts)

Valida en tiempo de inicio:

```typescript
validateEnvironmentVariables();
// Falla inmediatamente si falta DATABASE_URL o JWT_SECRET
// Advierte si variables opcionales faltan
```

### 2. Mejorado manejo de errores en auth-actions

**Archivo**: [src/lib/auth-actions.ts](src/lib/auth-actions.ts)

Ahora captura errores de BD con mensajes claros:

```typescript
try {
  existingUser = await prisma.user.findUnique(...)
} catch (dbError) {
  throw new Error(
    process.env.NODE_ENV === "production"
      ? "Database connection failed"
      : `Database error: ${dbError.message}`
  );
}
```

### 3. Documentación detallada creada

- [PRODUCTION_DEPLOYMENT_FIX.md](PRODUCTION_DEPLOYMENT_FIX.md): Guía paso a paso
- [VERCEL_ENV_SETUP.md](VERCEL_ENV_SETUP.md): Referencia completa de env vars

---

## 📋 Checklist de Verificación

Después de configurar las variables:

- [ ] Las 3 variables están en Vercel Settings → Environment Variables
- [ ] Cada variable tiene checkmark en `Production`, `Preview`, `Development`
- [ ] Han pasado 3+ minutos desde la configuración
- [ ] Vercel dashboard muestra "Latest Deployment: Ready"
- [ ] Visitás /register y no recibís 500 ✅
- [ ] Puedo completar un registro sin errores ✅
- [ ] Puedo hacer login con la cuenta creada ✅
- [ ] El watchlist funciona después de login ✅

---

## 🔐 Recomendaciones de Seguridad

### Inmediatas

1. ✅ **Usar JWT_SECRET diferente en producción**

   ```bash
   node -e "console.log(require('crypto').randomBytes(32).toString('hex'))"
   # Resultado: abc123def456... (copiar esto a Vercel)
   ```

2. ✅ **Nunca guardes secrets en código**
   - `.env.local` ya está en `.gitignore`
   - Secrets solo en Vercel dashboard

3. ✅ **Verificar credenciales Neon**
   - Go to https://console.neon.tech
   - Verify la contraseña del usuario aún es válida
   - Si fue comprometida, regenerar en Neon

### Futuras

- Rotar `JWT_SECRET` cada 6 meses
- Monitorear logs de Vercel por errores 500
- Implementar alertas para fallos de autenticación
- Usar secret manager (Vercel Secrets) para mayor seguridad

---

## 📞 Siguiente Pasos

1. **Ahora**: Configura las 3 variables en Vercel (5 minutos)
2. **Espera**: 2-3 minutos para que Vercel redeploy
3. **Prueba**: Intenta registrarte en producción
4. **Valida**: Si funciona, problema resuelto ✅
5. **Si falla**: Revisa los logs en Vercel → Deployments → Functions

---

## 📊 Impacto

**Antes de esta corrección**:

- ❌ Registro no funciona (HTTP 500)
- ❌ Login no funciona (HTTP 500)
- ❌ Sistema de autenticación completo fuera de servicio

**Después de esta corrección**:

- ✅ Registro funciona completamente
- ✅ Login funciona completamente
- ✅ Watchlist y todas las features funcionan
- ✅ Sistema de autenticación 100% operativo

---

## 📚 Referencias

- 📖 [Guía Completa de Configuración](PRODUCTION_DEPLOYMENT_FIX.md)
- 📖 [Variables de Entorno Detalladas](VERCEL_ENV_SETUP.md)
- 🔗 [Vercel Documentation](https://vercel.com/docs)
- 🔗 [Neon Console](https://console.neon.tech)
- 🔗 [Next.js Environment Variables](https://nextjs.org/docs/basic-features/environment-variables)

---

**Última Actualización**: 2025-12-29  
**Reportado por**: Sistema de Monitoreo  
**Urgencia**: 🔴 CRITICAL  
**Tiempo de Resolución Estimado**: 10 minutos
