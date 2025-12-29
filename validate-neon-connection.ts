import { Pool } from "@neondatabase/serverless";
import * as dotenv from "dotenv";
import * as fs from "fs";
import * as path from "path";

// Load environment variables
dotenv.config({ path: ".env.local" });

interface ValidationResult {
  environmentVariables: {
    DATABASE_URL: {
      present: boolean;
      value?: string;
      masked?: string;
    };
    JWT_SECRET: {
      present: boolean;
      length?: number;
    };
    TMDB_READ_ACCESS_TOKEN: {
      present: boolean;
      length?: number;
    };
    TMDB_API_KEY: {
      present: boolean;
      length?: number;
    };
  };
  databaseUrl: {
    valid: boolean;
    format?: string;
    host?: string;
    database?: string;
    schema?: string;
    ssl?: string;
    credentialsPresent?: boolean;
    errors?: string[];
  };
  neonConnection: {
    success: boolean;
    error?: string;
    simpleQuery?: {
      success: boolean;
      result?: string;
      error?: string;
    };
    schemaAccess?: {
      success: boolean;
      tables?: string[];
      error?: string;
    };
  };
  finalStatus: string;
}

// Mask sensitive data
function maskUrl(url: string): string {
  try {
    const urlObj = new URL(url);
    const password = urlObj.password;
    if (password) {
      urlObj.password =
        password.substring(0, 3) +
        "***" +
        password.substring(password.length - 3);
    }
    urlObj.username = urlObj.username.substring(0, 3) + "***";
    return urlObj.toString();
  } catch (e) {
    return "INVALID URL";
  }
}

async function validateNeonConnection(): Promise<ValidationResult> {
  const result: ValidationResult = {
    environmentVariables: {
      DATABASE_URL: { present: !!process.env.DATABASE_URL },
      JWT_SECRET: { present: !!process.env.JWT_SECRET },
      TMDB_READ_ACCESS_TOKEN: { present: !!process.env.TMDB_READ_ACCESS_TOKEN },
      TMDB_API_KEY: { present: !!process.env.TMDB_API_KEY },
    },
    databaseUrl: {
      valid: false,
      errors: [],
    },
    neonConnection: {
      success: false,
    },
    finalStatus: "PENDING",
  };

  // Check environment variables
  if (process.env.DATABASE_URL) {
    result.environmentVariables.DATABASE_URL.value = process.env.DATABASE_URL;
    result.environmentVariables.DATABASE_URL.masked = maskUrl(
      process.env.DATABASE_URL
    );
  }

  if (process.env.JWT_SECRET) {
    result.environmentVariables.JWT_SECRET.length =
      process.env.JWT_SECRET.length;
  }

  if (process.env.TMDB_READ_ACCESS_TOKEN) {
    result.environmentVariables.TMDB_READ_ACCESS_TOKEN.length =
      process.env.TMDB_READ_ACCESS_TOKEN.length;
  }

  if (process.env.TMDB_API_KEY) {
    result.environmentVariables.TMDB_API_KEY.length =
      process.env.TMDB_API_KEY.length;
  }

  // Validate DATABASE_URL format
  if (!process.env.DATABASE_URL) {
    result.databaseUrl.errors!.push("DATABASE_URL no está definida");
    result.finalStatus = "FAILED - DATABASE_URL missing";
    return result;
  }

  try {
    const url = new URL(process.env.DATABASE_URL);

    result.databaseUrl.format = "postgresql";
    result.databaseUrl.host = url.hostname;
    result.databaseUrl.database = url.pathname.replace("/", "");
    result.databaseUrl.credentialsPresent = !!(url.username && url.password);

    // Extract schema from search params
    const searchParams = new URLSearchParams(url.search);
    const searchPath =
      searchParams.get("options")?.match(/search_path[=:]"([^"]+)"/)?.[1] ||
      "public";
    result.databaseUrl.schema = searchPath;

    // Validate host
    if (!url.hostname.includes("neon.tech")) {
      result.databaseUrl.errors!.push(
        "Host no es *.neon.tech: " + url.hostname
      );
    } else {
      result.databaseUrl.valid = true;
    }

    // Validate database name
    if (!result.databaseUrl.database) {
      result.databaseUrl.errors!.push("Nombre de base de datos no encontrado");
    }

    // Validate schema
    if (!searchPath.includes("movies-tracker")) {
      result.databaseUrl.errors!.push(
        "Schema no contiene 'movies-tracker': " + searchPath
      );
    }

    // Validate SSL
    result.databaseUrl.ssl = searchParams.get("sslmode") || "not set";
    if (result.databaseUrl.ssl === "not set") {
      result.databaseUrl.errors!.push("SSL mode no está configurado");
    }

    // Validate credentials
    if (!result.databaseUrl.credentialsPresent) {
      result.databaseUrl.errors!.push(
        "Credenciales (usuario/contraseña) no presentes"
      );
    }

    // Overall validation
    if (result.databaseUrl.errors!.length > 0) {
      result.databaseUrl.valid = false;
    } else {
      result.databaseUrl.valid = true;
    }
  } catch (e) {
    result.databaseUrl.errors!.push(
      "URL inválida: " + (e instanceof Error ? e.message : String(e))
    );
    result.finalStatus = "FAILED - Invalid DATABASE_URL format";
    return result;
  }

  // Try to connect to Neon
  if (!result.databaseUrl.valid) {
    result.neonConnection.error = "DATABASE_URL validation failed";
    result.finalStatus = "FAILED - DATABASE_URL validation failed";
    return result;
  }

  try {
    console.log("\n🔌 Conectando a Neon...");
    const pool = new Pool({ connectionString: process.env.DATABASE_URL });

    // Test simple query
    console.log("📝 Ejecutando SELECT 1...");
    try {
      const simpleResult = await pool.query("SELECT 1");
      result.neonConnection.simpleQuery = {
        success: true,
        result: JSON.stringify(simpleResult.rows),
      };
      console.log("✅ SELECT 1 exitoso");
    } catch (e) {
      result.neonConnection.simpleQuery = {
        success: false,
        error: e instanceof Error ? e.message : String(e),
      };
      console.error(
        "❌ SELECT 1 falló:",
        result.neonConnection.simpleQuery.error
      );
    }

    // Test schema access
    console.log("📊 Verificando acceso al schema 'movies-tracker'...");
    try {
      const schemaQuery = `
        SELECT table_name 
        FROM information_schema.tables 
        WHERE table_schema = 'movies-tracker'
        ORDER BY table_name
      `;
      const schemaResult = await pool.query(schemaQuery);
      const tables = schemaResult.rows.map((row: any) => row.table_name);

      result.neonConnection.schemaAccess = {
        success: true,
        tables: tables,
      };

      console.log(
        `✅ Schema 'movies-tracker' accesible - ${tables.length} tablas encontradas`
      );
      if (tables.length > 0) {
        console.log("   Tablas:", tables.join(", "));
      }
    } catch (e) {
      result.neonConnection.schemaAccess = {
        success: false,
        error: e instanceof Error ? e.message : String(e),
      };
      console.error(
        "❌ Acceso al schema falló:",
        result.neonConnection.schemaAccess.error
      );
    }

    result.neonConnection.success = !!(
      result.neonConnection.simpleQuery?.success &&
      result.neonConnection.schemaAccess?.success
    );

    await pool.end();
  } catch (e) {
    result.neonConnection.error = e instanceof Error ? e.message : String(e);
    result.neonConnection.success = false;
    console.error("❌ Error de conexión:", result.neonConnection.error);
  }

  // Final status
  if (
    result.environmentVariables.DATABASE_URL.present &&
    result.databaseUrl.valid &&
    result.neonConnection.success &&
    result.neonConnection.simpleQuery?.success &&
    result.neonConnection.schemaAccess?.success
  ) {
    result.finalStatus = "SUCCESS ✅ - Todas las validaciones pasaron";
  } else {
    result.finalStatus = "FAILED ❌ - Algunas validaciones fallaron";
  }

  return result;
}

// Main execution
(async () => {
  console.log("🚀 Iniciando validación de conexión a Neon...\n");
  console.log("=" + "=".repeat(60) + "\n");

  const result = await validateNeonConnection();

  console.log("\n" + "=".repeat(61));
  console.log("\n📋 REPORTE DE VALIDACIÓN:\n");
  console.log(JSON.stringify(result, null, 2));

  console.log("\n" + "=".repeat(61));
  console.log(`\n📌 ESTADO FINAL: ${result.finalStatus}\n`);

  process.exit(result.finalStatus.includes("SUCCESS") ? 0 : 1);
})();
