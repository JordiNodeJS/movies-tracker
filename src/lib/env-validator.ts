/**
 * Environment Variable Validator
 *
 * Este script verifica que todas las variables de entorno requeridas
 * estén configuradas correctamente en producción (Vercel)
 *
 * Uso:
 * - Se ejecuta automáticamente al iniciar la app
 * - Falla con error claro si faltan variables críticas
 */

export function validateEnvironmentVariables() {
  const errors: string[] = [];
  const warnings: string[] = [];

  // Variables críticas para autenticación
  const REQUIRED_VARS = ["DATABASE_URL", "JWT_SECRET"] as const;

  // Variables opcionales con fallbacks
  const OPTIONAL_VARS = ["TMDB_READ_ACCESS_TOKEN", "TMDB_API_KEY"] as const;

  // Validar variables requeridas
  for (const varName of REQUIRED_VARS) {
    const value = process.env[varName];

    if (!value) {
      errors.push(
        `❌ ${varName} is not set. This is REQUIRED for authentication and database access.`
      );
    } else if (varName === "JWT_SECRET" && value.length < 16) {
      warnings.push(
        `⚠️ ${varName} is very short (${value.length} chars). For production, use at least 32 characters.`
      );
    } else if (varName === "DATABASE_URL") {
      // Validar formato básico
      if (!value.includes("postgresql://") && !value.includes("postgres://")) {
        errors.push(
          `❌ ${varName} has invalid format. Should be a PostgreSQL connection string.`
        );
      }
      if (
        !value.includes("search_path=") &&
        !value.includes("search_path%3D")
      ) {
        warnings.push(
          `⚠️ ${varName} may not include schema specification. Expected: ?options=-csearch_path%3D%22movies-tracker%22 or &search_path=movies-tracker`
        );
      }
    }
  }

  // Validar variables opcionales
  for (const varName of OPTIONAL_VARS) {
    const value = process.env[varName];
    if (!value) {
      warnings.push(
        `⚠️ ${varName} is not set. Some features may not work correctly.`
      );
    }
  }

  // Log results
  if (errors.length > 0 || warnings.length > 0) {
    console.log("\n🔍 Environment Variables Validation Report");
    console.log("=".repeat(60));
  }

  if (warnings.length > 0) {
    console.log("\nWarnings:");
    warnings.forEach((w) => console.log(`  ${w}`));
  }

  if (errors.length > 0) {
    console.log("\nErrors:");
    errors.forEach((e) => console.log(`  ${e}`));
    console.log("\n📋 Configuration Required:");
    console.log("  1. Go to https://vercel.com/dashboard");
    console.log("  2. Select your movies-tracker project");
    console.log("  3. Go to Settings → Environment Variables");
    console.log("  4. Add the missing variables above");
    console.log("  5. Redeploy the application\n");

    // En desarrollo, solo advertir; en producción, fallar
    if (process.env.NODE_ENV === "production") {
      throw new Error(
        `Missing required environment variables: ${errors.map((e) => e.split(" ")[1]).join(", ")}`
      );
    }
  }

  return {
    isValid: errors.length === 0,
    errors,
    warnings,
  };
}

// Exportar para uso en Server Actions
export function getRequiredEnvVars() {
  return {
    DATABASE_URL: process.env.DATABASE_URL,
    JWT_SECRET: process.env.JWT_SECRET,
    TMDB_READ_ACCESS_TOKEN: process.env.TMDB_READ_ACCESS_TOKEN,
    TMDB_API_KEY: process.env.TMDB_API_KEY,
    NODE_ENV: process.env.NODE_ENV,
  };
}
