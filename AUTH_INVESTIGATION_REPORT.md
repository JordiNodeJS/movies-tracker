# 🔍 ANÁLISIS DETALLADO: Error "Invalid credentials" en Autenticación

## Resumen Ejecutivo

El usuario `testuser2024@demo.com` **NO PUEDE HACER LOGIN** porque la contraseña almacenada en la base de datos **NO COINCIDE con ninguna contraseña conocida**. El hash está correctamente formateado, pero verifyPassword() falla con CUALQUIER contraseña.

---

## 1️⃣ ESTADO DEL USUARIO EN BD

✅ **ENCONTRADO**: El usuario existe en la base de datos

- **ID**: cmjrmhdqr00004ka86qf1qgat
- **Email**: testuser2024@demo.com
- **Nombre**: NULL (no registrado)
- **Actividad**: 0 elementos (sin watchlist, ratings, notas, etc.)

---

## 2️⃣ ANÁLISIS DEL HASH DE CONTRASEÑA

### Formato del Hash

✅ **FORMATO CORRECTO**: El hash está en formato `hex.salt` como se esperaba

```
Hash almacenado:
a07f1bf7085fdd8910f171995bdb122fde34ba91f075e448da352db4fd4bc8dcd1785a5038a2365ec15873bf03b492bee0cc75915c16597be4f8df6cafa68dc5.811a6040c905d86146bdad88665658f8

Estructura:
- Hash (128 caracteres hex): a07f1bf7085fdd8910f171995bdb122fde34ba91f075e448da352db4fd4bc8dcd1785a5038a2365ec15873bf03b492bee0cc75915c16597be4f8df6cafa68dc5
- Salt (32 caracteres hex): 811a6040c905d86146bdad88665658f8
- Total: 128 + 1 (punto) + 32 = 161 caracteres
```

### Validación de Formato

✅ **VÁLIDO**: Coincide con patrón `^[a-f0-9]{128}\.[a-f0-9]{32}$`

- Hash: 128 caracteres hexadecimales ✓
- Separator: un punto (.) ✓
- Salt: 32 caracteres hexadecimales ✓

---

## 3️⃣ PRUEBAS DE VERIFICACIÓN DE CONTRASEÑA

### Resultado de `verifyPassword()`

❌ **TODAS LAS PRUEBAS FALLARON**

Intenté verificar con 21 contraseñas comunes:

- Test@1234 ❌
- test@1234 ❌
- TestPassword123 ❌
- Test123 ❌
- test123 ❌
- Password123 ❌
- password123 ❌
- 123456 ❌
- 12345678 ❌
- Testuser2024 ❌
- testuser2024 ❌
- Demo@2024 ❌
- demo@2024 ❌
- Password@123 ❌
- password@123 ❌
- Qwerty123 ❌
- qwerty123 ❌
- Admin@123 ❌
- admin@123 ❌
- Testing123 ❌
- testing123 ❌

**Ninguna contraseña coincide con el hash.**

---

## 4️⃣ ANÁLISIS DEL ALGORITMO DE HASHING

### Cómo funciona `hashPassword()` en [src/lib/password.ts](src/lib/password.ts)

```typescript
export async function hashPassword(password: string): Promise<string> {
  const salt = randomBytes(16).toString("hex"); // Salt aleatorio de 16 bytes → 32 hex chars
  const buf = (await scryptAsync(password, salt, 64)) as Buffer; // Genera 64 bytes
  return `${buf.toString("hex")}.${salt}`; // Retorna: hex.salt (128.32)
}
```

✅ **Funciona correctamente**:

1. Genera un salt aleatorio de 16 bytes (32 caracteres hex)
2. Usa scrypt con parámetros: N=16384, r=8, p=1 (parámetros por defecto de Node.js)
3. Genera 64 bytes de hash
4. Retorna en formato `hex.salt`

### Cómo funciona `verifyPassword()` en [src/lib/password.ts](src/lib/password.ts)

```typescript
export async function verifyPassword(
  password: string,
  storedHash: string
): Promise<boolean> {
  const [hash, salt] = storedHash.split("."); // Divide en hash y salt
  const hashBuf = Buffer.from(hash, "hex"); // Convierte hash a Buffer
  const buf = (await scryptAsync(password, salt, 64)) as Buffer; // Rehace el hash
  return timingSafeEqual(hashBuf, buf); // Comparación segura
}
```

✅ **Lógica correcta**:

1. Divide el hash almacenado en dos partes: hash y salt
2. Convierte el hash hexadecimal a Buffer
3. Rehace el scrypt con la contraseña proporcionada y el salt almacenado
4. Compara con `timingSafeEqual` (protección contra timing attacks)

---

## 5️⃣ PRUEBA MANUAL DEL ALGORITMO

Cuando intenté rehacer el hash manualmente:

```
Contraseña de prueba: 'Test@1234'

Buffer del hash en BD:
- Length: 64 bytes ✓
- Hex: a07f1bf7085fdd8910f171995bdb122fde34ba91...

Buffer recalculado con 'Test@1234':
- Length: 64 bytes ✓
- Hex: 17ec07e0d9cdda4eaca8dcd14b16d63b6593ed08...

¿Coinciden?: ❌ NO
```

**Conclusión**: El hash almacenado NO fue generado con 'Test@1234'.

---

## 6️⃣ ANÁLISIS DEL JWT

### Implementación en [src/lib/jwt.ts](src/lib/jwt.ts)

✅ **Correcto**:

- Algoritmo: HS256
- Secret: Cargado desde `process.env.JWT_SECRET`
- Issued At: Se establece automáticamente
- Expiration: 7 días
- Secret configurado en .env.local: `development_secret_key_for_movies_tracker`

### Flujo de autenticación en [src/lib/auth-actions.ts](src/lib/auth-actions.ts)

Línea 83 (función `login()`):

```typescript
const isValid = await verifyPassword(password, user.password);

if (!isValid) {
  throw new Error("Invalid credentials"); // ← AQUÍ FALLA
}
```

---

## 7️⃣ POSIBLES CAUSAS DEL PROBLEMA

### 🔴 **CAUSA 1: El hash está corrupto (PROBABLE)**

El hash podría haber sido:

1. **Truncado o modificado** durante la creación o almacenamiento
2. **Copiado incorrectamente** de otra fuente
3. **Generado sin salt** (falta el `.salt` al guardarse)
4. **Guardado de forma incompleta** en la BD

**Indicio**: El usuario NO tiene actividad (0 watchlist, ratings, notas), sugiere que fue creado manualmente o con un script de prueba.

### 🔴 **CAUSA 2: Versión incompatible del algoritmo scrypt (MENOS PROBABLE)**

Aunque scrypt es determinístico con los mismos parámetros, podría haber:

1. Diferencia de versión de Node.js
2. Parámetros de scrypt diferentes en creación vs verificación
3. Problema de encoding (UTF-8 vs ASCII)

**Evidencia contra esto**: El hash tiene exactamente 128 + 32 chars, confirmando que fue generado correctamente.

### 🔴 **CAUSA 3: Problema en la capa de datos (MENOS PROBABLE)**

1. **Corrupción en base de datos Neon**
2. **Problema de encoding en almacenamiento**
3. **Truncamiento automático del campo password**

**Evidencia contra esto**: El hash tiene 160 caracteres, dentro del rango de VARCHAR normal.

### 🔴 **CAUSA 4: Contraseña es desconocida (MÁS PROBABLE)**

Simplemente **nadie sabe cuál fue la contraseña original** utilizada para crear este usuario.

---

## 8️⃣ LISTA DE VERIFICACIÓN REALIZADA

| Verificación           | Resultado                 | Conclusión        |
| ---------------------- | ------------------------- | ----------------- |
| Usuario existe en BD   | ✅ SÍ                     | Creación correcta |
| Email es correcto      | ✅ testuser2024@demo.com  | OK                |
| Hash está presente     | ✅ 160 caracteres         | OK                |
| Formato del hash       | ✅ hex.salt (128.32)      | Correcto          |
| Validación regex       | ✅ Patrón válido          | OK                |
| `hashPassword()`       | ✅ Funciona correctamente | OK                |
| `verifyPassword()`     | ✅ Lógica correcta        | OK                |
| Algoritmo scrypt       | ✅ Parámetros correctos   | OK                |
| Timing-safe comparison | ✅ Implementado           | OK                |
| JWT implementation     | ✅ Correcto               | OK                |
| Contraseña coincide    | ❌ NO                     | **PROBLEMA RAÍZ** |

---

## 9️⃣ RECOMENDACIONES Y SOLUCIONES

### ✅ Solución 1: Reiniciar con una contraseña conocida (RECOMENDADO)

**Opción A**: Eliminar el usuario y recrearlo

```
1. Eliminar testuser2024@demo.com de BD
2. Registrarse nuevamente con credenciales conocidas
3. Usar la aplicación normalmente
```

**Opción B**: Actualizar la contraseña directamente (RIESGO)
Requeriría modificar directamente la BD con un hash generado localmente.

### ✅ Solución 2: Crear un script de reset de contraseña

Un endpoint que permita resetear la contraseña si:

- El usuario proporciona el email
- Se confirma vía email (si hay sistema de email)

### ✅ Solución 3: Agregar logging más detallado

Para futuras depuraciones:

```typescript
// En verifyPassword()
const isValid = timingSafeEqual(hashBuf, buf);
console.log("Password verification:");
console.log("  Stored hash:", hash.substring(0, 20) + "...");
console.log("  Calculated hash:", buf.toString("hex").substring(0, 20) + "...");
console.log("  Valid:", isValid);
```

---

## 🔟 CONCLUSIÓN

**El error "Invalid credentials" es correcto y esperado.**

El usuario `testuser2024@demo.com` existe en la base de datos, pero:

- ✅ El hash está correctamente formateado
- ✅ El algoritmo de verificación es correcto
- ✅ El JWT está correctamente implementado
- ❌ **La contraseña proporcionada NO coincide con el hash almacenado**

**Root Cause**: La contraseña utilizada para el login NO es la misma que se usó para crear el hash durante el registro.

**Próximos Pasos**:

1. Determinar cuál fue la contraseña original usada al crear el usuario
2. O eliminar el usuario y registrarlo nuevamente
3. O implementar un mecanismo de reset de contraseña

---

## 📋 Archivos Revisados

- [src/lib/auth-actions.ts](src/lib/auth-actions.ts) - Contiene `login()` y `register()`
- [src/lib/password.ts](src/lib/password.ts) - Contiene `hashPassword()` y `verifyPassword()`
- [src/lib/jwt.ts](src/lib/jwt.ts) - Contiene `signJWT()` y `verifyJWT()`
- [src/lib/actions.ts](src/lib/actions.ts) - Contiene `ensureUser()` para verificación de tokens
- [prisma/schema.prisma](prisma/schema.prisma) - Esquema de User
- `.env.local` - Configuración de JWT_SECRET

---

**Generado**: 2025-12-29
**Usuario investigado**: testuser2024@demo.com
**ID**: cmjrmhdqr00004ka86qf1qgat
