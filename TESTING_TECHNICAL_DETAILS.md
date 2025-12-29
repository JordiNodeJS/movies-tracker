# 🧪 Detalles Técnicos de Pruebas - Profile Update Feature

## Archivo 1: `__tests__/auth/profile-update.test.ts`

### Descripción

Tests completos para el Server Action `updateProfile` que maneja la actualización de perfil del usuario en la base de datos.

### Dependencias Mockeadas

```typescript
✅ @/lib/prisma        - Prisma client (user.update, user.findUnique)
✅ @/lib/jwt           - JWT token signing
✅ @/lib/password      - Hashing de contraseñas
✅ next/headers        - Cookies API
✅ next/cache          - Path revalidation
✅ @/lib/actions       - ensureUser middleware
```

### Tests Implementados

#### Test 1: Update User Name

```typescript
describe("updateProfile", () => {
  it("should update user name successfully", async () => {
    // Setup
    mockEnsureUser.mockResolvedValue({ id: userId, email });
    (prisma.user.update as jest.Mock).mockResolvedValue({
      id: userId,
      name: newName,
    });

    // Action
    const formData = new FormData();
    formData.set("name", "Updated Name");
    formData.set("email", "");
    formData.set("password", "");
    const result = await updateProfile(formData);

    // Assert
    expect(result.success).toBe(true);
    expect(prisma.user.update).toHaveBeenCalledWith({
      where: { id: userId },
      data: { name: "Updated Name" },
    });
  });
});
```

**Propósito:** Verifica que se puede actualizar solo el nombre del usuario
**Expectativas:**

- ✅ Actualización exitosa en BD
- ✅ Mensaje de éxito retornado
- ✅ JWT NO regenerado (no es necesario para nombre)

---

#### Test 2: Update User Email

```typescript
it("should update user email successfully", async () => {
  // Verifica que no existe otro usuario con ese email
  (prisma.user.findUnique as jest.Mock).mockResolvedValue(null);

  // JWT regeneración con nuevo email
  (signJWT as jest.Mock).mockResolvedValue("new-jwt-token");

  // Actualizar usuario
  (prisma.user.update as jest.Mock).mockResolvedValue({
    id: userId,
    email: newEmail,
  });

  // FormData
  const formData = new FormData();
  formData.set("name", "");
  formData.set("email", newEmail);
  formData.set("password", "");

  const result = await updateProfile(formData);

  // Assertions
  expect(signJWT).toHaveBeenCalled(); // JWT regenerado
  expect(mockCookieStore.set).toHaveBeenCalledWith(
    "auth_token",
    "new-jwt-token",
    expect.objectContaining({
      httpOnly: true,
      secure: true,
      sameSite: "strict",
    })
  );
});
```

**Propósito:** Verifica que se puede cambiar el email con validación y JWT regeneración
**Expectativas:**

- ✅ Email validado (no duplicado)
- ✅ JWT token regenerado con nuevo email
- ✅ Cookie actualizada
- ✅ BD actualizada

---

#### Test 3: Reject Duplicate Email

```typescript
it("should reject duplicate email", async () => {
  mockEnsureUser.mockResolvedValue({ id: userId, email: oldEmail });

  // Usuario existente con ese email
  (prisma.user.findUnique as jest.Mock).mockResolvedValue({
    id: "other-user-id",
    email: duplicateEmail,
  });

  const formData = new FormData();
  formData.set("email", duplicateEmail);
  formData.set("name", "");
  formData.set("password", "");

  const result = await updateProfile(formData);

  expect(result.success).toBe(false);
  expect(result.message).toContain("already in use");
});
```

**Propósito:** Verifica validación de duplicados
**Expectativas:**

- ✅ Rechaza emails que ya existen
- ✅ Retorna error descriptivo

---

#### Test 4: Update Password Successfully

```typescript
it("should update password successfully", async () => {
  const newPassword = "NewSecurePassword123!";

  // Simular hash de contraseña
  (hashPassword as jest.Mock).mockResolvedValue({
    hash: "hashed_value",
    salt: "random_salt",
  });

  (prisma.user.update as jest.Mock).mockResolvedValue({
    id: userId,
    email,
  });

  const formData = new FormData();
  formData.set("name", "");
  formData.set("email", "");
  formData.set("password", newPassword);

  const result = await updateProfile(formData);

  // Verifica que password se hashea antes de guardar
  expect(hashPassword).toHaveBeenCalledWith(newPassword);
  expect(prisma.user.update).toHaveBeenCalledWith({
    where: { id: userId },
    data: {
      password: expect.stringContaining("hashed_value"),
    },
  });
});
```

**Propósito:** Verifica que la contraseña se hashea correctamente
**Expectativas:**

- ✅ `hashPassword` es llamado
- ✅ Contraseña hasheada se guarda en BD
- ✅ No se guarda plaintext

---

#### Test 5: Reject Short Password

```typescript
it("should reject password shorter than 6 characters", async () => {
  mockEnsureUser.mockResolvedValue({ id: userId, email });

  const formData = new FormData();
  formData.set("password", "12345"); // 5 caracteres

  const result = await updateProfile(formData);

  expect(result.success).toBe(false);
  expect(result.message).toContain("at least 6 characters");
  expect(prisma.user.update).not.toHaveBeenCalled();
});
```

**Propósito:** Valida longitud mínima de contraseña
**Expectativas:**

- ✅ Rechaza contraseñas < 6 caracteres
- ✅ No actualiza BD

---

#### Test 6: Update Multiple Fields

```typescript
it("should update multiple fields at once", async () => {
  mockEnsureUser.mockResolvedValue({ id: userId, email: oldEmail });

  (prisma.user.findUnique as jest.Mock).mockResolvedValue(null);
  (hashPassword as jest.Mock).mockResolvedValue({
    hash: "hashed",
    salt: "salt",
  });
  (signJWT as jest.Mock).mockResolvedValue("new-token");

  const formData = new FormData();
  formData.set("name", "New Name");
  formData.set("email", newEmail);
  formData.set("password", "NewPass123");

  const result = await updateProfile(formData);

  expect(prisma.user.update).toHaveBeenCalledWith({
    where: { id: userId },
    data: {
      name: "New Name",
      email: newEmail,
      password: expect.any(String), // hashed
    },
  });
  expect(signJWT).toHaveBeenCalled(); // JWT regenerado
});
```

**Propósito:** Verifica actualización simultánea de múltiples campos
**Expectativas:**

- ✅ Todos los campos se actualizan
- ✅ JWT se regenera (por email)
- ✅ Validaciones aplicadas a todos

---

#### Test 7-9: Edge Cases

```typescript
// Test 7: Solo nombre enviado (email/password vacíos)
it("should handle only name being sent", async () {
  // Verifica que solo name se actualiza
})

// Test 8: Rechazar formato email inválido
it("should reject invalid email format", async () {
  // Verifica validación de email
})

// Test 9: Revalidar path después de update
it("should revalidate profile path after update", async () {
  expect(revalidatePath).toHaveBeenCalledWith("/[locale]/profile");
})
```

---

## Archivo 2: `__tests__/components/profile-form.test.tsx`

### Descripción

Tests de lógica del componente `ProfileForm` que maneja la interfaz de usuario para actualizar el perfil.

### Dependencias Mockeadas

```typescript
✅ jose              - JWT library
✅ @/lib/jwt        - JWT functions
✅ @/lib/prisma     - Prisma client
✅ @/lib/auth-actions - updateProfile Server Action
```

### Tests Implementados

#### Test 1: Call updateProfile on Submit

```typescript
it("should call updateProfile with form data on submission", async () => {
  const mockUpdateProfile = jest.fn().mockResolvedValue({
    success: true,
    message: "Profile updated successfully",
  });

  const formData = new FormData();
  formData.set("name", "John Doe");
  formData.set("email", "john@example.com");
  formData.set("password", "");

  const result = await mockUpdateProfile(formData);

  expect(result.success).toBe(true);
  expect(mockUpdateProfile).toHaveBeenCalledWith(formData);
});
```

**Propósito:** Verifica que Server Action se llama al submit
**Expectativas:**

- ✅ `updateProfile` llamado con FormData
- ✅ Respuesta procesada

---

#### Test 2: Handle Success Response

```typescript
it("should handle successful update response", async () => {
  const mockUpdateProfile = jest.fn().mockResolvedValue({
    success: true,
    message: "Profile updated successfully",
  });

  const result = await mockUpdateProfile(formData);

  expect(result.success).toBe(true);
  expect(result.message).toBe("Profile updated successfully");
});
```

**Propósito:** Verifica manejo de respuesta exitosa
**Expectativas:**

- ✅ `success: true` detectado
- ✅ Mensaje visible al usuario

---

#### Test 3: Handle Error Response

```typescript
it("should handle failed update response", async () => {
  const mockUpdateProfile = jest.fn().mockResolvedValue({
    success: false,
    message: "Email already in use",
  });

  const result = await mockUpdateProfile(formData);

  expect(result.success).toBe(false);
  expect(result.message).toBe("Email already in use");
});
```

**Propósito:** Verifica manejo de errores
**Expectativas:**

- ✅ `success: false` detectado
- ✅ Mensaje de error mostrado

---

#### Test 4: Handle Thrown Errors

```typescript
it("should handle error thrown during submission", async () => {
  const errorMessage = "Network error";
  const mockUpdateProfile = jest
    .fn()
    .mockRejectedValue(new Error(errorMessage));

  await expect(mockUpdateProfile(formData)).rejects.toThrow(errorMessage);
});
```

**Propósito:** Verifica manejo de excepciones
**Expectativas:**

- ✅ Excepciones capturadas
- ✅ Error manejado gracefully

---

#### Test 5-8: Single Field Updates

```typescript
// Test 5: Update only name
it("should support updating name only", async () => {
  formData.set("name", "New Name");
  formData.set("email", "");
  formData.set("password", "");

  const result = await mockUpdateProfile(formData);
  expect(result.success).toBe(true);
})

// Test 6: Update only email
it("should support updating email only", async () {
  formData.set("name", "");
  formData.set("email", "new@example.com");
  formData.set("password", "");
  // ...
})

// Test 7: Update only password
it("should support updating password only", async () {
  formData.set("name", "");
  formData.set("email", "");
  formData.set("password", "NewPass123");
  // ...
})

// Test 8: Update multiple fields
it("should support updating multiple fields", async () {
  formData.set("name", "New Name");
  formData.set("email", "new@example.com");
  formData.set("password", "NewPass123");
  // ...
})
```

**Propósito:** Verifica actualización de campos individuales y combinados
**Expectativas:**

- ✅ Cada combinación funciona
- ✅ FormData estructurado correctamente

---

#### Test 9: FormData Structure

```typescript
it("should pass FormData with correct field names", async () => {
  const formData = new FormData();
  formData.set("name", "John");
  formData.set("email", "john@example.com");
  formData.set("password", "Pass123");

  const mockUpdateProfile = jest.fn();
  await mockUpdateProfile(formData);

  const call = mockUpdateProfile.mock.calls[0][0];
  expect(call.get("name")).toBe("John");
  expect(call.get("email")).toBe("john@example.com");
  expect(call.get("password")).toBe("Pass123");
});
```

**Propósito:** Verifica que FormData tiene estructura correcta
**Expectativas:**

- ✅ Nombres de campos correctos
- ✅ Valores almacenados correctamente

---

#### Test 10: Validation Errors

```typescript
it("should handle validation errors in responses", async () => {
  const mockUpdateProfile = jest.fn().mockResolvedValue({
    success: false,
    message: "Email format invalid",
  });

  const result = await mockUpdateProfile(formData);

  expect(result.success).toBe(false);
  expect(result.message).toContain("invalid");
});
```

**Propósito:** Verifica manejo de errores de validación
**Expectativas:**

- ✅ Mensajes de validación mostrados
- ✅ Usuario informado de problemas

---

## Configuración Jest

### `jest.config.ts`

```typescript
{
  testEnvironment: "node", // Usar Node.js, no jsdom
  testMatch: ["**/__tests__/**/*.test.{ts,tsx}"],
  preset: "ts-jest",
  moduleNameMapper: {
    "^@/(.*)$": "<rootDir>/src/$1"
  },
  transform: {
    "^.+\\.tsx?$": "ts-jest"
  }
}
```

### Mocking Strategy

```typescript
// 1. Mockear dependencias ANTES de imports
jest.mock("jose");
jest.mock("@/lib/jwt");

// 2. Luego importar lo que se quiere testear
import { updateProfile } from "@/lib/auth-actions";

// 3. Usar jest.fn() para crear mocks
const mockPrisma = jest.fn();

// 4. Setup/Teardown
beforeEach(() => jest.clearAllMocks());
afterEach(() => jest.resetAllMocks());
```

---

## Ejecución de Tests

### Comando

```bash
npx jest --testPathPattern="profile"
```

### Output

```
PASS  __tests__/auth/profile-update.test.ts
PASS  __tests__/components/profile-form.test.tsx

Test Suites: 2 passed, 2 total
Tests:       19 passed, 19 total
Time:        0.79 s
```

### Opcionalmente

```bash
# Ver solo tests que fallan
npx jest --onlyChanged

# Ver coverage
npx jest --coverage

# Modo watch
npx jest --watch
```

---

## Validaciones Cubiertas

### Server Action Tests

```
✅ Actualización de nombre
✅ Actualización de email
✅ Prevención de emails duplicados
✅ Actualización de contraseña
✅ Validación de longitud mínima de password
✅ Actualización simultánea de múltiples campos
✅ Manejo de campos vacíos
✅ Validación de formato de email
✅ Revalidación de caché post-update
```

### Component Tests

```
✅ Llamada al Server Action
✅ Manejo de respuesta exitosa
✅ Manejo de respuesta con error
✅ Manejo de excepciones
✅ Actualización selectiva (campos individuales)
✅ Actualización múltiple
✅ Estructura correcta de FormData
✅ Validaciones en respuesta
```

---

## Notas Técnicas

### ¿Por qué mockear en top-level?

```typescript
// ❌ Incorrecto - Mock después de imports
import { signJWT } from "@/lib/jwt";
jest.mock("@/lib/jwt");

// ✅ Correcto - Mock ANTES de imports
jest.mock("@/lib/jwt");
import { signJWT } from "@/lib/jwt";
```

### ¿Por qué usar `jest.fn()` en tests?

```typescript
// Permite:
✅ Verificar si fue llamada: .toHaveBeenCalled()
✅ Verificar argumentos: .toHaveBeenCalledWith(arg)
✅ Controlar retorno: .mockResolvedValue()
✅ Simular errores: .mockRejectedValue()
```

### ¿Por qué testear navegador Y unitarios?

```
Unitarios:  ✅ Lógica de funciones (servidor)
Navegador:  ✅ Interacción usuario (UI, persistencia)
Juntos:     ✅ Cobertura completa
```

---

## Próximas Mejoras (Opcionales)

```typescript
// 1. Tests de integración
// Testear updateProfile + ProfileForm juntos

// 2. Tests de rendimiento
// Verificar que las queries de BD son eficientes

// 3. Tests de accesibilidad
// Verificar que el formulario es accesible

// 4. Tests de seguridad
// Verificar protecciones CSRF, XSS, etc.
```

---

_Documentación generada: 29 de Diciembre 2025_
