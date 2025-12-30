#!/usr/bin/env node

/**
 * Script para limpiar variables de entorno antes del build
 * Soluciona problemas con caracteres de escape de Vercel
 */

const fs = require("fs");
const path = require("path");

console.log("🧹 Limpiando variables de entorno...\n");

try {
  // 1. Limpiar caracteres de escape en DATABASE_URL
  if (process.env.DATABASE_URL) {
    const originalURL = process.env.DATABASE_URL;
    // Eliminar \n y \r que Vercel pueda haber añadido
    const cleanURL = originalURL
      .trim()
      .replace(/\\n/g, "")
      .replace(/\\r/g, "");

    if (originalURL !== cleanURL) {
      process.env.DATABASE_URL = cleanURL;
      console.log("✅ DATABASE_URL limpiada");
    } else {
      console.log("✅ DATABASE_URL ya estaba limpia");
    }

    // 2. Verificar que el esquema está en la URL
    if (!cleanURL.includes("search_path")) {
      console.log("⚠️  Añadiendo schema 'movies-tracker'...");
      let newURL = cleanURL;
      if (cleanURL.includes("?")) {
        newURL = cleanURL + "&options=-csearch_path%3D%22movies-tracker%22";
      } else {
        newURL = cleanURL + "?options=-csearch_path%3D%22movies-tracker%22";
      }
      process.env.DATABASE_URL = newURL;
      console.log("✅ Schema añadido");
    } else {
      console.log("✅ Schema ya presente");
    }
  } else {
    console.warn("⚠️  DATABASE_URL no está configurada");
  }

  // 3. Validar JWT_SECRET
  if (process.env.JWT_SECRET) {
    if (process.env.JWT_SECRET.length >= 32) {
      console.log("✅ JWT_SECRET válida");
    } else {
      console.warn(
        "⚠️  JWT_SECRET corta (se recomienda 32+ caracteres)"
      );
    }
  } else {
    console.warn("⚠️  JWT_SECRET no está configurada");
  }

  console.log("✅ Limpieza completada\n");
  process.exit(0);
} catch (error) {
  console.error("❌ Error durante la limpieza:", error.message);
  process.exit(1);
}

