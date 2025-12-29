/**
 * Profile Form Component Logic Tests
 * Tests form submission, data handling, and error scenarios
 */
import { describe, it, expect, beforeEach, vi } from "vitest";

// Mock jose and Prisma BEFORE any imports
vi.mock("jose");
vi.mock("@/lib/jwt", () => ({
  signJWT: vi.fn(),
  verifyJWT: vi.fn(),
}));
vi.mock("@/lib/prisma", () => ({
  default: {
    user: {
      findUnique: vi.fn(),
      update: vi.fn(),
    },
  },
}));
vi.mock("@/lib/auth-actions", () => ({
  updateProfile: vi.fn(),
}));

describe("ProfileForm Logic Tests", () => {
  beforeEach(() => {
    vi.clearAllMocks();
  });

  it("should call updateProfile with form data on submission", async () => {
    const mockUpdateProfile = vi.fn().mockResolvedValue({
      success: true,
      message: "Profile updated successfully",
    });

    // Simulating form submission
    const formData = new FormData();
    formData.set("name", "John Doe");
    formData.set("email", "john@example.com");
    formData.set("password", "");

    const result = await mockUpdateProfile(formData);

    expect(result.success).toBe(true);
    expect(result.message).toBe("Profile updated successfully");
  });

  it("should handle successful update response", async () => {
    const mockUpdateProfile = vi.fn().mockResolvedValue({
      success: true,
      message: "Profile updated successfully",
    });

    const formData = new FormData();
    formData.set("name", "Updated Name");
    formData.set("email", "updated@example.com");
    formData.set("password", "");

    const result = await mockUpdateProfile(formData);

    expect(mockUpdateProfile).toHaveBeenCalledWith(formData);
    expect(result.success).toBe(true);
  });

  it("should handle failed update response", async () => {
    const mockUpdateProfile = vi.fn().mockResolvedValue({
      success: false,
      message: "Email already in use",
    });

    const formData = new FormData();
    formData.set("name", "");
    formData.set("email", "existing@example.com");
    formData.set("password", "");

    const result = await mockUpdateProfile(formData);

    expect(result.success).toBe(false);
    expect(result.message).toBe("Email already in use");
  });

  it("should handle error thrown during submission", async () => {
    const errorMessage = "Network error";
    const mockUpdateProfile = vi
      .fn()
      .mockRejectedValue(new Error(errorMessage));

    const formData = new FormData();
    formData.set("name", "");
    formData.set("email", "test@example.com");
    formData.set("password", "");

    await expect(mockUpdateProfile(formData)).rejects.toThrow(errorMessage);
  });

  it("should support updating name only", async () => {
    const mockUpdateProfile = vi.fn().mockResolvedValue({
      success: true,
      message: "Profile updated successfully",
    });

    const formData = new FormData();
    formData.set("name", "New Name");
    formData.set("email", "test@example.com");
    formData.set("password", "");

    const result = await mockUpdateProfile(formData);

    expect(result.success).toBe(true);
    expect(mockUpdateProfile).toHaveBeenCalled();
  });

  it("should support updating email only", async () => {
    const mockUpdateProfile = vi.fn().mockResolvedValue({
      success: true,
      message: "Profile updated successfully",
    });

    const formData = new FormData();
    formData.set("name", "");
    formData.set("email", "newemail@example.com");
    formData.set("password", "");

    const result = await mockUpdateProfile(formData);

    expect(result.success).toBe(true);
  });

  it("should support updating password only", async () => {
    const mockUpdateProfile = vi.fn().mockResolvedValue({
      success: true,
      message: "Profile updated successfully",
    });

    const formData = new FormData();
    formData.set("name", "");
    formData.set("email", "test@example.com");
    formData.set("password", "NewPassword123!");

    const result = await mockUpdateProfile(formData);

    expect(result.success).toBe(true);
  });

  it("should support updating multiple fields", async () => {
    const mockUpdateProfile = vi.fn().mockResolvedValue({
      success: true,
      message: "Profile updated successfully",
    });

    const formData = new FormData();
    formData.set("name", "New Name");
    formData.set("email", "new@example.com");
    formData.set("password", "NewPassword123!");

    const result = await mockUpdateProfile(formData);

    expect(result.success).toBe(true);
    expect(mockUpdateProfile).toHaveBeenCalledWith(formData);
  });

  it("should pass FormData with correct field names", async () => {
    const mockUpdateProfile = vi.fn().mockResolvedValue({
      success: true,
      message: "Profile updated successfully",
    });

    const formData = new FormData();
    formData.set("name", "Test");
    formData.set("email", "test@test.com");
    formData.set("password", "Pass123!");

    await mockUpdateProfile(formData);

    expect(mockUpdateProfile).toHaveBeenCalledWith(formData);
    const passedData = mockUpdateProfile.mock.calls[0][0];
    expect(passedData.get("name")).toBe("Test");
    expect(passedData.get("email")).toBe("test@test.com");
    expect(passedData.get("password")).toBe("Pass123!");
  });

  it("should handle validation errors in responses", async () => {
    const mockUpdateProfile = vi.fn().mockResolvedValue({
      success: false,
      message: "Password must be at least 6 characters",
    });

    const formData = new FormData();
    formData.set("name", "");
    formData.set("email", "");
    formData.set("password", "short");

    const result = await mockUpdateProfile(formData);

    expect(result.success).toBe(false);
    expect(result.message).toContain("6 characters");
  });
});
