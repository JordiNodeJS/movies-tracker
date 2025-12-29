import { PrismaClient } from "@prisma/client";
import { PrismaNeon } from "@prisma/adapter-neon";
import { describe, it, expect, beforeAll, afterAll } from "vitest";
import dotenv from "dotenv";
import path from "path";

// Load environment variables
dotenv.config({ path: path.resolve(process.cwd(), ".env.local") });

describe("Neon Database Tests - Schema movies-tracker", () => {
  let prisma: PrismaClient;

  beforeAll(() => {
    const dbUrl = process.env.DATABASE_URL;
    if (!dbUrl) {
      throw new Error("DATABASE_URL not set in environment");
    }

    // Initialize Prisma with explicit movies-tracker schema
    const adapter = new PrismaNeon(
      { connectionString: dbUrl },
      { schema: "movies-tracker" }
    );
    prisma = new PrismaClient({ adapter });
  });

  afterAll(async () => {
    await prisma.$disconnect();
  });

  describe("Database Connection", () => {
    it("should connect to neon-indigo-kite database", async () => {
      const result = await prisma.$queryRaw<
        Array<{ current_database: string }>
      >`
        SELECT current_database()
      `;
      expect(result[0].current_database).toBe("neondb");
    });

    it("should use movies-tracker schema", async () => {
      const result = await prisma.$queryRaw<Array<{ current_schema: string }>>`
        SELECT current_schema()
      `;
      expect(result[0].current_schema).toBe("movies-tracker");
    });

    it("should verify search_path includes movies-tracker", async () => {
      const result = await prisma.$queryRaw<Array<{ search_path: string }>>`
        SHOW search_path
      `;
      expect(result[0].search_path).toContain("movies-tracker");
    });
  });

  describe("User Model", () => {
    it("should query users table from movies-tracker schema", async () => {
      const users = await prisma.user.findMany({ take: 5 });
      expect(Array.isArray(users)).toBe(true);
    });

    it("should verify users table exists in movies-tracker schema", async () => {
      const result = await prisma.$queryRaw<Array<{ tablename: string }>>`
        SELECT tablename 
        FROM pg_tables 
        WHERE schemaname = 'movies-tracker' 
        AND tablename = 'users'
      `;
      expect(result.length).toBeGreaterThan(0);
      expect(result[0].tablename).toBe("users");
    });

    it("should create and delete a test user", async () => {
      const testUser = await prisma.user.create({
        data: {
          email: `test-${Date.now()}@example.com`,
          password: "test-password-hash",
          name: "Test User",
        },
      });

      expect(testUser.id).toBeDefined();
      expect(testUser.email).toContain("test-");

      // Clean up
      await prisma.user.delete({ where: { id: testUser.id } });
    });
  });

  describe("WatchlistItem Model", () => {
    it("should query watchlist_items table from movies-tracker schema", async () => {
      const items = await prisma.watchlistItem.findMany({ take: 5 });
      expect(Array.isArray(items)).toBe(true);
    });

    it("should verify watchlist_items table exists in movies-tracker schema", async () => {
      const result = await prisma.$queryRaw<Array<{ tablename: string }>>`
        SELECT tablename 
        FROM pg_tables 
        WHERE schemaname = 'movies-tracker' 
        AND tablename = 'watchlist_items'
      `;
      expect(result.length).toBeGreaterThan(0);
      expect(result[0].tablename).toBe("watchlist_items");
    });
  });

  describe("Rating Model", () => {
    it("should query ratings table from movies-tracker schema", async () => {
      const ratings = await prisma.rating.findMany({ take: 5 });
      expect(Array.isArray(ratings)).toBe(true);
    });

    it("should verify ratings table exists in movies-tracker schema", async () => {
      const result = await prisma.$queryRaw<Array<{ tablename: string }>>`
        SELECT tablename 
        FROM pg_tables 
        WHERE schemaname = 'movies-tracker' 
        AND tablename = 'ratings'
      `;
      expect(result.length).toBeGreaterThan(0);
      expect(result[0].tablename).toBe("ratings");
    });
  });

  describe("Note Model", () => {
    it("should query notes table from movies-tracker schema", async () => {
      const notes = await prisma.note.findMany({ take: 5 });
      expect(Array.isArray(notes)).toBe(true);
    });

    it("should verify notes table exists in movies-tracker schema", async () => {
      const result = await prisma.$queryRaw<Array<{ tablename: string }>>`
        SELECT tablename 
        FROM pg_tables 
        WHERE schemaname = 'movies-tracker' 
        AND tablename = 'notes'
      `;
      expect(result.length).toBeGreaterThan(0);
      expect(result[0].tablename).toBe("notes");
    });
  });

  describe("Recommendation Model", () => {
    it("should query recommendations table from movies-tracker schema", async () => {
      const recommendations = await prisma.recommendation.findMany({ take: 5 });
      expect(Array.isArray(recommendations)).toBe(true);
    });

    it("should verify recommendations table exists in movies-tracker schema", async () => {
      const result = await prisma.$queryRaw<Array<{ tablename: string }>>`
        SELECT tablename 
        FROM pg_tables 
        WHERE schemaname = 'movies-tracker' 
        AND tablename = 'recommendations'
      `;
      expect(result.length).toBeGreaterThan(0);
      expect(result[0].tablename).toBe("recommendations");
    });
  });

  describe("GenreCache Model", () => {
    it("should query genre_cache table from movies-tracker schema", async () => {
      const genres = await prisma.genreCache.findMany({ take: 5 });
      expect(Array.isArray(genres)).toBe(true);
    });

    it("should verify genre_cache table exists in movies-tracker schema", async () => {
      const result = await prisma.$queryRaw<Array<{ tablename: string }>>`
        SELECT tablename 
        FROM pg_tables 
        WHERE schemaname = 'movies-tracker' 
        AND tablename = 'genre_cache'
      `;
      expect(result.length).toBeGreaterThan(0);
      expect(result[0].tablename).toBe("genre_cache");
    });
  });

  describe("Schema Isolation", () => {
    it("should NOT access tables from other schemas", async () => {
      const result = await prisma.$queryRaw<Array<{ schemaname: string }>>`
        SELECT DISTINCT schemaname 
        FROM pg_tables 
        WHERE tablename IN ('users', 'watchlist_items', 'ratings', 'notes', 'recommendations', 'genre_cache')
      `;

      // All tables should be in movies-tracker schema only
      result.forEach((row) => {
        expect(row.schemaname).toBe("movies-tracker");
      });
    });

    it("should list all tables in movies-tracker schema", async () => {
      const result = await prisma.$queryRaw<Array<{ tablename: string }>>`
        SELECT tablename 
        FROM pg_tables 
        WHERE schemaname = 'movies-tracker'
        ORDER BY tablename
      `;

      const tableNames = result.map((r) => r.tablename);
      expect(tableNames).toContain("users");
      expect(tableNames).toContain("watchlist_items");
      expect(tableNames).toContain("ratings");
      expect(tableNames).toContain("notes");
      expect(tableNames).toContain("recommendations");
      expect(tableNames).toContain("genre_cache");
      expect(tableNames).toContain("user_preferences");
      expect(tableNames).toContain("view_history");
    });
  });

  describe("Foreign Key Constraints", () => {
    it("should enforce foreign key constraint on watchlist_items.userId", async () => {
      await expect(
        prisma.watchlistItem.create({
          data: {
            userId: "non-existent-user-id",
            movieId: 12345,
            title: "Test Movie",
          },
        })
      ).rejects.toThrow();
    });

    it("should cascade delete watchlist items when user is deleted", async () => {
      // Create test user
      const testUser = await prisma.user.create({
        data: {
          email: `cascade-test-${Date.now()}@example.com`,
          password: "test-password-hash",
          name: "Cascade Test User",
        },
      });

      // Create watchlist item
      const watchlistItem = await prisma.watchlistItem.create({
        data: {
          userId: testUser.id,
          movieId: 99999,
          title: "Test Movie for Cascade",
        },
      });

      // Delete user - should cascade to watchlist items
      await prisma.user.delete({ where: { id: testUser.id } });

      // Verify watchlist item was deleted
      const deletedItem = await prisma.watchlistItem.findUnique({
        where: {
          userId_movieId: { userId: testUser.id, movieId: 99999 },
        },
      });
      expect(deletedItem).toBeNull();
    });
  });

  describe("Data Integrity", () => {
    it("should enforce unique constraint on user email", async () => {
      const email = `unique-test-${Date.now()}@example.com`;

      await prisma.user.create({
        data: { email, password: "test" },
      });

      await expect(
        prisma.user.create({
          data: { email, password: "test2" },
        })
      ).rejects.toThrow();

      // Clean up
      await prisma.user.delete({ where: { email } });
    });

    it("should enforce unique constraint on userId + movieId in watchlist", async () => {
      const testUser = await prisma.user.create({
        data: {
          email: `unique-watchlist-${Date.now()}@example.com`,
          password: "test",
        },
      });

      await prisma.watchlistItem.create({
        data: {
          userId: testUser.id,
          movieId: 88888,
          title: "Unique Test Movie",
        },
      });

      await expect(
        prisma.watchlistItem.create({
          data: {
            userId: testUser.id,
            movieId: 88888,
            title: "Duplicate Movie",
          },
        })
      ).rejects.toThrow();

      // Clean up
      await prisma.user.delete({ where: { id: testUser.id } });
    });
  });
});
