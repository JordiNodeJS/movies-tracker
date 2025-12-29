# 🚀 Guía de Corrección: Error HTTP 500 en Registro (Producción)

## Problema Identificado

El endpoint de registro en **producción (https://movies-trackers.vercel.app)** retorna HTTP 500 porque **las variables de entorno NO están configuradas en Vercel**.

### Root Cause Analysis

```
Local (✅ Funciona):
├─ DATABASE_URL: Configurada en .env.local
├─ JWT_SECRET: Configurada en .env.local
└─ Prisma: Se conecta a Neon schema 'movies-tracker'

Vercel (❌ Error 500):
├─ DATABASE_URL: ❌ NO configurada
├─ JWT_SECRET: ❌ NO configurada
├─ TMDB_READ_ACCESS_TOKEN: ❌ NO configurada
└─ Prisma: No puede conectarse → Schema access failure
```

---

## 🔐 Paso 1: Obtener los Secretos Necesarios

De tu `.env.local` actual, necesitas estos valores:

```env
DATABASE_URL=postgresql://neondb_owner:npg_PDx78KApEjVU@ep-aged-night-ab7l7nwr.eu-west-2.aws.neon.tech/neondb?sslmode=require&channel_binding=require&options=-csearch_path%3D%22movies-tracker%22

JWT_SECRET=development_secret_key_for_movies_tracker

TMDB_READ_ACCESS_TOKEN=eyJhbGciOiJIUzI1NiJ9.eyJhdWQiOiJjZDUxNzQwOTY5NzYzMWQ2MDEwN2E0ZjUyMzFlNmM3MiIsIm5iZiI6MTc2NjQ0NDkxNC42ODMsInN1YiI6IjY5NDljZjcyNmQzNjU2MDBmYWZiMWE0YSIsInNjb3BlcyI6WyJhcGlfcmVhZCJdLCJ2ZXJzaW9uIjoxfQ.NowHJhmYPsvo9a4eyHKCBX60RdFmHk6-4H9DlFIYuwU
```

> ⚠️ **IMPORTANTE**: El `JWT_SECRET` en desarrollo no es seguro. Para producción, genera uno más fuerte:
>
> ```bash
> node -e "console.log(require('crypto').randomBytes(32).toString('hex'))"
> ```

---

## 🔗 Paso 2: Configurar Variables en Vercel

### Opción A: Por Dashboard de Vercel

1. Ir a https://vercel.com/dashboard
2. Seleccionar tu proyecto **movies-tracker**
3. Ir a **Settings** → **Environment Variables**
4. Agregar cada variable:

```
KEY: DATABASE_URL
VALUE: postgresql://neondb_owner:npg_PDx78KApEjVU@ep-aged-night-ab7l7nwr.eu-west-2.aws.neon.tech/neondb?sslmode=require&channel_binding=require&options=-csearch_path%3D%22movies-tracker%22
ENVIRONMENTS: Production, Preview, Development
```

```
KEY: JWT_SECRET
VALUE: <tu-nuevo-secret-fuerte-de-32-caracteres>
ENVIRONMENTS: Production, Preview, Development
```

```
KEY: TMDB_READ_ACCESS_TOKEN
VALUE: eyJhbGciOiJIUzI1NiJ9.eyJhdWQiOiJjZDUxNzQwOTY5NzYzMWQ2MDEwN2E0ZjUyMzFlNmM3MiIsIm5iZiI6MTc2NjQ0NDkxNC42ODMsInN1YiI6IjY5NDljZjcyNmQzNjU2MDBmYWZiMWE0YSIsInNjb3BlcyI6WyJhcGlfcmVhZCJdLCJ2ZXJzaW9uIjoxfQ.NowHJhmYPsvo9a4eyHKCBX60RdFmHk6-4H9DlFIYuwU
ENVIRONMENTS: Production, Preview, Development
```

5. Click **Save**
6. Vercel automáticamente redesplegará la aplicación

### Opción B: Por Vercel CLI

```bash
# Install Vercel CLI if not already installed
npm install -g vercel

# Link to your project
cd /g/DEV/LAB/movies-tracker
vercel link

# Add environment variables
vercel env add DATABASE_URL
vercel env add JWT_SECRET
vercel env add TMDB_READ_ACCESS_TOKEN

# Redeploy
vercel --prod
```

---

## ⚠️ Paso 3: Actualizar .env.local para Producción

Para máxima seguridad, usa un `JWT_SECRET` diferente en producción:

```bash
# Generar un nuevo secret seguro
node -e "console.log(require('crypto').randomBytes(32).toString('hex'))" > new-secret.txt

# Usar ese valor en Vercel (copiarlo del archivo)
```

Actualiza tu `.env.local` local también:

```env
# Para desarrollo
JWT_SECRET=development_secret_key_for_movies_tracker

# (NO guardes el secret de producción en .env.local)
```

---

## 🧪 Paso 4: Verificar la Configuración

Después de actualizar las variables:

1. **Espera 1-2 minutos** a que Vercel redeploy
2. Visita https://movies-trackers.vercel.app/register
3. Intenta registrarte con:
   - Email: `test@example.com`
   - Password: `Password123`
4. Deberías ser redirigido a login (indicando que el registro fue exitoso)

---

## 🐛 Si Aún Hay Errores

### Verificar logs en Vercel

1. Ir a tu proyecto en https://vercel.com/dashboard
2. Seleccionar **movies-tracker**
3. Ir a **Deployments** → ultimo deployment
4. Click en el build
5. Ver **Functions** logs (buscar errores de Prisma)

### Posibles Errores y Soluciones

| Error                          | Causa                    | Solución                             |
| ------------------------------ | ------------------------ | ------------------------------------ |
| `DATABASE_URL is not set`      | Variable no configurada  | Verifica en Vercel Settings          |
| `Could not connect to schema`  | URL incorrecta           | Copia exactamente desde `.env.local` |
| `JWT_SECRET is not set`        | Variable no configurada  | Agrega en Vercel Settings            |
| `P1000: Authentication failed` | Credenciales incorrectas | Verifica usuario/contraseña Neon     |

---

## 📋 Checklist de Validación

- [ ] `DATABASE_URL` configurada en Vercel
- [ ] `JWT_SECRET` configurada en Vercel (diferente a desarrollo)
- [ ] `TMDB_READ_ACCESS_TOKEN` configurada en Vercel
- [ ] Vercel ha redesplegado (esperar 2-3 minutos)
- [ ] Registro funciona en producción
- [ ] Login funciona en producción
- [ ] Watchlist funciona en producción

---

## 🔄 Flujo de Registro Funcional

Cuando todo está configurado correctamente:

```
1. User visita /register
2. Completa formulario: email + password
3. POST a register() Server Action
4. register() verifica credenciales (valida email/password)
5. Genera hash de contraseña con scrypt
6. Crea user en Neon (schema: movies-tracker)
7. Redirige a /login
8. User ingresa email + password
9. login() verifica credenciales contra BD
10. Genera JWT token
11. Guarda token en cookie httpOnly
12. Redirige a /
13. User está logueado ✅
```

---

## 📞 Soporte

Si necesitas ayuda:

1. **Vercel Logs**: https://vercel.com/docs/observability/edge-runtime-logs
2. **Neon Console**: https://console.neon.tech
3. **Prisma Docs**: https://www.prisma.io/docs/getting-started
4. **Next.js Docs**: https://nextjs.org/docs
