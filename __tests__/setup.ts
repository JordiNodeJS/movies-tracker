// Vitest setup file
import dotenv from "dotenv";
import path from "path";
import "@testing-library/jest-dom";

// Polyfill for jsdom - TextDecoder/TextEncoder
if (typeof global.TextDecoder === "undefined") {
  const { TextEncoder, TextDecoder } = require("util");
  global.TextEncoder = TextEncoder;
  global.TextDecoder = TextDecoder;
}

// Load environment variables before tests run
dotenv.config({ path: path.resolve(process.cwd(), ".env.local") });
