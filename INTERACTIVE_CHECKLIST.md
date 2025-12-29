# ✅ CHECKLIST INTERACTIVO: Corregir HTTP 500 en Registro

## 🎯 Objetivo

Configurar 3 variables de entorno en Vercel para que el registro funcione en producción.

---

## 📋 FASE 1: Preparación (3 minutos)

### ⚪ Paso 1.1: Abrir .env.local

- [ ] Abre el archivo `.env.local` en la raíz del proyecto
- [ ] Localiza estas líneas:
  ```
  DATABASE_URL=postgresql://neondb_owner:...
  JWT_SECRET=development_secret_key_for_movies_tracker
  TMDB_READ_ACCESS_TOKEN=eyJhbGciOiJIUzI1NiJ9...
  ```

### ⚪ Paso 1.2: Generar JWT_SECRET seguro para producción

- [ ] Abre terminal en el proyecto
- [ ] Ejecuta:
  ```bash
  node -e "console.log(require('crypto').randomBytes(32).toString('hex'))"
  ```
- [ ] **Copia el resultado** (será algo como: `abc123def456...`)
- [ ] **Guarda** el valor en un archivo temporal o cópialo al portapapeles

### ⚪ Paso 1.3: Preparar los 3 valores

Completa esta tabla con los valores de `.env.local`:

| Variable                 | Valor                                                                                                                                                                                                                                             | ¿Copiado? |
| ------------------------ | ------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------- | --------- |
| `DATABASE_URL`           | `postgresql://neondb_owner:<REDACTED_NEON_PASSWORD>@<REDACTED>/neondb?sslmode=require&channel_binding=require&options=-csearch_path%3D%22movies-tracker%22`                                                           | [ ]       |
| `JWT_SECRET`             | `(El que generaste arriba)`                                                                                                                                                                                                                       | [ ]       |
| `TMDB_READ_ACCESS_TOKEN` | `eyJhbGciOiJIUzI1NiJ9.eyJhdWQiOiJjZDUxNzQwOTY5NzYzMWQ2MDEwN2E0ZjUyMzFlNmM3MiIsIm5iZiI6MTc2NjQ0NDkxNC42ODMsInN1YiI6IjY5NDljZjcyNmQzNjU2MDBmYWZiMWE0YSIsInNjb3BlcyI6WyJhcGlfcmVhZCJdLCJ2ZXJzaW9uIjoxfQ.NowHJhmYPsvo9a4eyHKCBX60RdFmHk6-4H9DlFIYuwU` | [ ]       |

---

## 🚀 FASE 2: Configuración en Vercel (5 minutos)

### ⚪ Paso 2.1: Ir a Vercel Dashboard

- [ ] Abre https://vercel.com/dashboard
- [ ] ✅ Verifica que estés logueado en tu cuenta Vercel

### ⚪ Paso 2.2: Seleccionar proyecto movies-tracker

- [ ] Localiza el proyecto **movies-tracker** en la lista
- [ ] Click en el proyecto para abrirlo
- [ ] ✅ Verificas que la URL sea: `vercel.com/dashboard/projects/movies-tracker`

### ⚪ Paso 2.3: Ir a Environment Variables

- [ ] Click en **Settings** (barra superior)
- [ ] Espera a que cargue la página de Settings
- [ ] Click en **Environment Variables** (panel izquierdo)
- [ ] ✅ Deberías ver un botón "Add New" (azul)

### ⚪ Paso 2.4: Agregar DATABASE_URL

- [ ] Click en el botón **"Add New"**
- [ ] **Key**: Escribe exactamente `DATABASE_URL`
- [ ] **Value**: Pega el valor de DATABASE_URL (postgresql://...)
- [ ] **Environments**: Marca ✅ en:
  - [ ] Production
  - [ ] Preview
  - [ ] Development
- [ ] Click en **"Save"**
- [ ] ✅ Verifica que aparezca la variable en la lista (con checkmarks verdes)

### ⚪ Paso 2.5: Agregar JWT_SECRET

- [ ] Click en **"Add New"**
- [ ] **Key**: Escribe exactamente `JWT_SECRET`
- [ ] **Value**: Pega el JWT_SECRET que generaste (abc123def456...)
- [ ] **Environments**: Marca ✅ en:
  - [ ] Production
  - [ ] Preview
  - [ ] Development
- [ ] Click en **"Save"**
- [ ] ✅ Verifica que aparezca en la lista

### ⚪ Paso 2.6: Agregar TMDB_READ_ACCESS_TOKEN

- [ ] Click en **"Add New"**
- [ ] **Key**: Escribe exactamente `TMDB_READ_ACCESS_TOKEN`
- [ ] **Value**: Pega el valor del token (eyJhbGciOi...)
- [ ] **Environments**: Marca ✅ en:
  - [ ] Production
  - [ ] Preview
  - [ ] Development
- [ ] Click en **"Save"**
- [ ] ✅ Verifica que aparezca en la lista

### ⚪ Paso 2.7: Verificar configuración

- [ ] Debería haber **3 variables** en la lista:
  - [ ] DATABASE_URL ✅ Prod ✅ Preview ✅ Dev
  - [ ] JWT_SECRET ✅ Prod ✅ Preview ✅ Dev
  - [ ] TMDB_READ_ACCESS_TOKEN ✅ Prod ✅ Preview ✅ Dev
- [ ] ✅ Todas las variables tienen checkmarks verdes

---

## ⏳ FASE 3: Espera y Validación (5 minutos)

### ⚪ Paso 3.1: Esperar a que Vercel redeploy

- [ ] **Espera 2-3 minutos** (sin hacer nada)
- [ ] Vercel redesplegará automáticamente
- [ ] Puedes ver el progreso en: Settings → Deployments

### ⚪ Paso 3.2: Ver estado del deployment

- [ ] Abre https://vercel.com/dashboard/projects/movies-tracker
- [ ] Click en **Deployments** (si no estás ahí)
- [ ] Busca el deployment más reciente (arriba en la lista)
- [ ] **Estado debe ser**: 🟢 "Ready" (verde)
- [ ] ✅ Si dice "Building" o "Queued", espera más

### ⚪ Paso 3.3: Probar Registro (Prueba 1)

- [ ] Abre https://movies-trackers.vercel.app/register
- [ ] Espera a que la página cargue (2-3 segundos)
- [ ] Completa el formulario:
  - [ ] Email: `test1@example.com`
  - [ ] Password: `TestPassword123`
- [ ] Click en **"Create Account"**
- [ ] ✅ **Deberías ser redirigido a /login** (SIN HTTP 500)

### ⚪ Paso 3.4: Probar Login (Prueba 2)

- [ ] Ya estás en la página de login (`/login`)
- [ ] Completa el formulario:
  - [ ] Email: `test1@example.com`
  - [ ] Password: `TestPassword123`
- [ ] Click en **"Login"**
- [ ] ✅ **Deberías ser redirigido a /** (home page)

### ⚪ Paso 3.5: Validar que estés logueado

- [ ] Ya estás en la home page
- [ ] Busca la **barra de navegación** (arriba)
- [ ] Debería mostrar: **"Profile"** o tu email (indicando que estás logueado)
- [ ] ✅ Si ves el botón de login, intenta de nuevo

### ⚪ Paso 3.6: Probar Watchlist (Bonus)

- [ ] Click en **"Watchlist"** en la navegación
- [ ] La página debe cargar sin HTTP 500
- [ ] ✅ Debería estar vacía (porque es un usuario nuevo)

---

## 🎉 FASE 4: Confirmación Final (2 minutos)

### ✅ Checklist de Éxito

Si has llegado aquí y todo funcionó:

- [x] ✅ DATABASE_URL configurada en Vercel
- [x] ✅ JWT_SECRET configurada en Vercel
- [x] ✅ TMDB_READ_ACCESS_TOKEN configurada en Vercel
- [x] ✅ /register funciona (sin HTTP 500)
- [x] ✅ /login funciona (sin HTTP 500)
- [x] ✅ Usuario puede registrarse
- [x] ✅ Usuario puede hacer login
- [x] ✅ Usuario está logueado después de login
- [x] ✅ Watchlist accesible
- [x] ✅ Sistema 100% operativo en producción

### 🎊 Resultado

**🎉 ¡Problema resuelto! HTTP 500 en registro está corregido.**

---

## 🆘 FASE 5: Troubleshooting (Si algo falla)

### ❌ Problema: Aún recibo HTTP 500 en /register

**Paso de debugging**:

1. [ ] Abre https://vercel.com/dashboard/projects/movies-tracker
2. [ ] Click en **Deployments**
3. [ ] Click en el último deployment (arriba)
4. [ ] Busca la sección **"Functions"**
5. [ ] Haz click en una función (cualquiera con rojo ❌)
6. [ ] Lee el error en los logs
7. [ ] Verifica:
   - [ ] ¿Dice "DATABASE_URL is not set"? → La variable no fue guardada
   - [ ] ¿Dice "Invalid credentials"? → Credenciales de Neon son incorrectas
   - [ ] ¿Dice "PrismaClientInitializationError"? → Problema de conexión

**Solución**:

- [ ] Vuelve a Vercel Settings
- [ ] Verifica que las 3 variables existan
- [ ] Verifica que tengan valores (no vacías)
- [ ] Espera 3 minutos más
- [ ] Intenta de nuevo

---

### ❌ Problema: Registro funciona pero Login no

**Causas posibles**:

- [ ] La contraseña está mal hasheada (problema de JWT_SECRET)
- [ ] El JWT_SECRET es diferente entre registro y login

**Solución**:

1. [ ] Crea una cuenta nueva (con diferentes credenciales)
2. [ ] Intenta inmediatamente hacer login
3. [ ] Si funciona → Problema de JWT_SECRET diferente
4. [ ] Si no funciona → Problema con DATABASE_URL

---

### ❌ Problema: Página tarda mucho en cargar (Timeout)

**Causas**:

- [ ] Conexión a Neon es lenta (normal a veces)
- [ ] Neon compute está dormido (se despierta al conectar)

**Solución**:

- [ ] Espera 5-10 segundos (Neon se está activando)
- [ ] Recarga la página (F5)
- [ ] Intenta de nuevo

---

## 📞 Contacto y Soporte

Si después de todo esto aún falla:

1. **Revisa los logs de Vercel**:
   - Vercel Dashboard → Deployments → Functions → Ver logs

2. **Verifica credenciales Neon**:
   - https://console.neon.tech → Verifica la contraseña

3. **Genera nuevo JWT_SECRET**:
   - A veces es más seguro generar uno nuevo
   - `node -e "console.log(require('crypto').randomBytes(32).toString('hex'))"`

4. **Contacta soporte**:
   - Proporciona: URL del proyecto, error exacto, logs de Vercel

---

## 📊 Progreso

Marca tu avance aquí:

```
FASE 1: Preparación
├─ Paso 1.1: Abrir .env.local          [ ✅ ]
├─ Paso 1.2: Generar JWT_SECRET        [ ✅ ]
└─ Paso 1.3: Preparar valores          [ ✅ ]

FASE 2: Configuración en Vercel
├─ Paso 2.1: Ir a Dashboard            [ ✅ ]
├─ Paso 2.2: Seleccionar proyecto      [ ✅ ]
├─ Paso 2.3: Environment Variables     [ ✅ ]
├─ Paso 2.4: DATABASE_URL              [ ✅ ]
├─ Paso 2.5: JWT_SECRET                [ ✅ ]
├─ Paso 2.6: TMDB_READ_ACCESS_TOKEN    [ ✅ ]
└─ Paso 2.7: Verificar                 [ ✅ ]

FASE 3: Validación
├─ Paso 3.1: Esperar deployment        [ ✅ ]
├─ Paso 3.2: Ver estado                [ ✅ ]
├─ Paso 3.3: Probar registro           [ ✅ ]
├─ Paso 3.4: Probar login              [ ✅ ]
├─ Paso 3.5: Verificar logueado        [ ✅ ]
└─ Paso 3.6: Probar watchlist          [ ✅ ]

FASE 4: Confirmación
└─ Checklist de éxito                  [ ✅ ]

RESULTADO: 🎉 ¡COMPLETADO!
```

---

**Inicio**: 2025-12-29  
**Duración esperada**: 15-20 minutos  
**Complejidad**: 🟢 Muy Fácil  
**Éxito esperado**: 99%
