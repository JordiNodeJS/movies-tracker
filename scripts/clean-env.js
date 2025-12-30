#!/usr/bin/env node

/**
 * Script para limpiar variables de entorno antes del build
 * Soluciona problemas con caracteres de escape de Vercel
 */

const fs = require("fs");
const path = require("path");

console.log("🧹 Limpiando variables de entorno...\n");

// 1. Limpiar caracteres de escape en DATABASE_URL
if (process.env.DATABASE_URL) {
  const originalURL = process.env.DATABASE_URL;
  // Eliminar \n y \r que Vercel pueda haber añadido
  const cleanURL = originalURL.trim().replace(/\\n/g, "").replace(/\\r/g, "");

  process.env.DATABASE_URL = cleanURL;

  if (originalURL !== cleanURL) {
    console.log("✅ DATABASE_URL limpiada (removidos caracteres de escape)");
  } else {
    console.log("✅ DATABASE_URL ya estaba limpia");
  }

  // 2. Verificar que el esquema está en la URL
  if (!cleanURL.includes("search_path")) {
    console.log("⚠️  Schema no encontrado, añadiendo 'movies-tracker'...");
    let newURL = cleanURL;
    if (cleanURL.includes("?")) {
      newURL = cleanURL + "&options=-csearch_path%3D%22movies-tracker%22";
    } else {
      newURL = cleanURL + "?options=-csearch_path%3D%22movies-tracker%22";
    }
    process.env.DATABASE_URL = newURL;
    console.log("✅ Schema 'movies-tracker' añadido a DATABASE_URL");
  } else {
    console.log("✅ Schema 'movies-tracker' ya presente en DATABASE_URL");
  }

  // Escribir a .env.production si es necesario
  if (process.env.NODE_ENV === "production" || process.env.VERCEL) {
    const envPath = path.join(process.cwd(), ".env.production.local");
    const envContent = `DATABASE_URL="${process.env.DATABASE_URL}"
JWT_SECRET="${process.env.JWT_SECRET || ""}"
TMDB_READ_ACCESS_TOKEN="${process.env.TMDB_READ_ACCESS_TOKEN || ""}"
`;

    try {
      fs.writeFileSync(envPath, envContent);
      console.log("✅ .env.production.local actualizado");
    } catch (err) {
      console.log(
        "ℹ️  No se pudo escribir .env.production.local (probablemente no necesario)"
      );
    }
  }
} else {
  console.warn("⚠️  DATABASE_URL no está configurada");
}

// 3. Validar JWT_SECRET
if (process.env.JWT_SECRET) {
  console.log(
    `✅ JWT_SECRET configurada (${process.env.JWT_SECRET.length} caracteres)`
  );
  if (process.env.JWT_SECRET.length < 32) {
    console.warn(
      "⚠️  JWT_SECRET es muy corta, se recomienda al menos 32 caracteres"
    );
  }
} else {
  console.warn("⚠️  JWT_SECRET no está configurada");
}

console.log("\n✅ Limpieza de variables de entorno completada\n");
