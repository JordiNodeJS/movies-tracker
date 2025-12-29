import { validateEnvironmentVariables } from "@/lib/env-validator";

describe("Environment Variables Validation", () => {
  const originalEnv = process.env;

  beforeEach(() => {
    jest.resetModules();
    process.env = { ...originalEnv };
  });

  afterAll(() => {
    process.env = originalEnv;
  });

  it("should validate that all required variables are present", () => {
    // Mocking required variables
    process.env.DATABASE_URL =
      "postgresql://user:pass@host:5432/db?options=-csearch_path%3D%22movies-tracker%22";
    process.env.JWT_SECRET = "a-very-long-secret-key-for-testing-purposes";
    process.env.TMDB_READ_ACCESS_TOKEN = "some-token";
    process.env.TMDB_API_KEY = "some-key";

    const result = validateEnvironmentVariables();
    expect(result.errors).toHaveLength(0);
  });

  it("should return errors if required variables are missing", () => {
    delete process.env.DATABASE_URL;
    delete process.env.JWT_SECRET;

    const result = validateEnvironmentVariables();
    expect(result.errors.some((err) => err.includes("DATABASE_URL"))).toBe(
      true
    );
    expect(result.errors.some((err) => err.includes("JWT_SECRET"))).toBe(true);
  });

  it("should warn if JWT_SECRET is too short", () => {
    process.env.DATABASE_URL =
      "postgresql://user:pass@host:5432/db?options=-csearch_path%3D%22movies-tracker%22";
    process.env.JWT_SECRET = "short";
    process.env.TMDB_READ_ACCESS_TOKEN = "some-token";
    process.env.TMDB_API_KEY = "some-key";

    const result = validateEnvironmentVariables();
    expect(
      result.warnings.some((warn) => warn.includes("JWT_SECRET is very short"))
    ).toBe(true);
  });

  it("should warn if DATABASE_URL is missing search_path", () => {
    process.env.DATABASE_URL = "postgresql://user:pass@host:5432/db";
    process.env.JWT_SECRET = "a-very-long-secret-key-for-testing-purposes";
    process.env.TMDB_READ_ACCESS_TOKEN = "some-token";
    process.env.TMDB_API_KEY = "some-key";

    const result = validateEnvironmentVariables();
    expect(result.warnings.some((warn) => warn.includes("search_path"))).toBe(
      true
    );
  });
});
