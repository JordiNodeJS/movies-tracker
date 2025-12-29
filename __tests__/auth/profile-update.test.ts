import { describe, it, expect, beforeEach, vi } from "vitest";
import { updateProfile } from "@/lib/auth-actions";
import { prisma } from "@/lib/prisma";
import { signJWT } from "@/lib/jwt";
import { hashPassword } from "@/lib/password";
import { cookies } from "next/headers";
import { revalidatePath } from "next/cache";

// Mock dependencies
vi.mock("@/lib/prisma", () => ({
  prisma: {
    user: {
      findUnique: vi.fn(),
      update: vi.fn(),
    },
  },
}));

vi.mock("@/lib/jwt", () => ({
  signJWT: vi.fn(),
}));

vi.mock("@/lib/password", () => ({
  hashPassword: vi.fn(),
}));

vi.mock("next/headers", () => ({
  cookies: vi.fn(),
}));

vi.mock("next/cache", () => ({
  revalidatePath: vi.fn(),
}));

vi.mock("@/lib/actions", () => ({
  ensureUser: vi.fn(),
}));

// Get the mocked module
import * as actions from "@/lib/actions";
const mockEnsureUser = actions.ensureUser as any;

describe("updateProfile", () => {
  beforeEach(() => {
    vi.clearAllMocks();
  });

  it("should update user name successfully", async () => {
    const userId = "test-user-1";
    const email = "test@example.com";
    const newName = "Updated Name";

    mockEnsureUser.mockResolvedValue({ id: userId, email });

    const mockCookieStore = {
      set: vi.fn(),
      delete: vi.fn(),
    };
    (cookies as any).mockResolvedValue(mockCookieStore);

    (prisma.user.update as any).mockResolvedValue({
      id: userId,
      email,
      name: newName,
    });

    const formData = new FormData();
    formData.set("name", newName);
    formData.set("email", email);
    formData.set("password", "");

    const result = await updateProfile(formData);

    expect(result.success).toBe(true);
    expect(result.message).toBe("Profile updated successfully");
    expect(prisma.user.update).toHaveBeenCalledWith({
      where: { id: userId },
      data: { name: newName },
    });
  });

  it("should update user email successfully", async () => {
    const userId = "test-user-1";
    const oldEmail = "old@example.com";
    const newEmail = "new@example.com";

    mockEnsureUser.mockResolvedValue({ id: userId, email: oldEmail });

    (prisma.user.findUnique as any).mockResolvedValue(null); // No existing user with new email

    (signJWT as any).mockResolvedValue("new-jwt-token");

    const mockCookieStore = {
      set: vi.fn(),
      delete: vi.fn(),
    };
    (cookies as any).mockResolvedValue(mockCookieStore);

    (prisma.user.update as any).mockResolvedValue({
      id: userId,
      email: newEmail,
    });

    const formData = new FormData();
    formData.set("name", "");
    formData.set("email", newEmail);
    formData.set("password", "");

    const result = await updateProfile(formData);

    expect(result.success).toBe(true);
    expect(prisma.user.findUnique).toHaveBeenCalledWith({
      where: { email: newEmail },
    });
    expect(signJWT).toHaveBeenCalledWith({
      userId,
      email: newEmail,
    });
    expect(mockCookieStore.set).toHaveBeenCalled();
  });

  it("should reject duplicate email", async () => {
    const userId = "test-user-1";
    const email = "test@example.com";
    const duplicateEmail = "duplicate@example.com";

    mockEnsureUser.mockResolvedValue({ id: userId, email });

    (prisma.user.findUnique as any).mockResolvedValue({
      id: "other-user",
      email: duplicateEmail,
    });

    const formData = new FormData();
    formData.set("name", "");
    formData.set("email", duplicateEmail);
    formData.set("password", "");

    await expect(updateProfile(formData)).rejects.toThrow(
      "Email already in use"
    );
  });

  it("should update password successfully", async () => {
    const userId = "test-user-1";
    const email = "test@example.com";
    const newPassword = "NewPassword123!";
    const hashedPassword = "hashed-password-hash";

    mockEnsureUser.mockResolvedValue({ id: userId, email });

    (hashPassword as any).mockResolvedValue(hashedPassword);

    const mockCookieStore = {
      set: vi.fn(),
      delete: vi.fn(),
    };
    (cookies as any).mockResolvedValue(mockCookieStore);

    (prisma.user.update as any).mockResolvedValue({
      id: userId,
      password: hashedPassword,
    });

    const formData = new FormData();
    formData.set("name", "");
    formData.set("email", email);
    formData.set("password", newPassword);

    const result = await updateProfile(formData);

    expect(result.success).toBe(true);
    expect(hashPassword).toHaveBeenCalledWith(newPassword);
    expect(prisma.user.update).toHaveBeenCalledWith({
      where: { id: userId },
      data: { name: "", password: hashedPassword },
    });
  });

  it("should reject password shorter than 6 characters", async () => {
    const userId = "test-user-1";
    const email = "test@example.com";

    mockEnsureUser.mockResolvedValue({ id: userId, email });

    const formData = new FormData();
    formData.set("name", "");
    formData.set("email", email);
    formData.set("password", "short");

    await expect(updateProfile(formData)).rejects.toThrow(
      "Password must be at least 6 characters"
    );
  });

  it("should update multiple fields at once", async () => {
    const userId = "test-user-1";
    const oldEmail = "old@example.com";
    const newEmail = "new@example.com";
    const newName = "New Name";
    const newPassword = "NewPassword123!";
    const hashedPassword = "hashed-password";

    mockEnsureUser.mockResolvedValue({ id: userId, email: oldEmail });

    (prisma.user.findUnique as any).mockResolvedValue(null);
    (signJWT as any).mockResolvedValue("new-jwt-token");
    (hashPassword as any).mockResolvedValue(hashedPassword);

    const mockCookieStore = {
      set: vi.fn(),
      delete: vi.fn(),
    };
    (cookies as any).mockResolvedValue(mockCookieStore);

    (prisma.user.update as any).mockResolvedValue({
      id: userId,
      email: newEmail,
      name: newName,
      password: hashedPassword,
    });

    const formData = new FormData();
    formData.set("name", newName);
    formData.set("email", newEmail);
    formData.set("password", newPassword);

    const result = await updateProfile(formData);

    expect(result.success).toBe(true);
    expect(prisma.user.update).toHaveBeenCalledWith({
      where: { id: userId },
      data: {
        name: newName,
        email: newEmail,
        password: hashedPassword,
      },
    });
  });

  it("should handle only name being sent (even if empty)", async () => {
    const userId = "test-user-1";
    const email = "test@example.com";

    mockEnsureUser.mockResolvedValue({ id: userId, email });

    const mockCookieStore = {
      set: vi.fn(),
      delete: vi.fn(),
    };
    (cookies as any).mockResolvedValue(mockCookieStore);

    (prisma.user.update as any).mockResolvedValue({
      id: userId,
      email,
      name: "",
    });

    const formData = new FormData();
    formData.set("name", "");
    formData.set("email", email);
    formData.set("password", "");

    const result = await updateProfile(formData);

    // Even though all values are empty/unchanged, the name is still sent
    // because it's part of the form data
    expect(result.success).toBe(true);
    expect(prisma.user.update).toHaveBeenCalled();
  });

  it("should reject invalid email format", async () => {
    const userId = "test-user-1";
    const email = "test@example.com";
    const invalidEmail = "invalid-email";

    mockEnsureUser.mockResolvedValue({ id: userId, email });

    const formData = new FormData();
    formData.set("name", "");
    formData.set("email", invalidEmail);
    formData.set("password", "");

    await expect(updateProfile(formData)).rejects.toThrow("Invalid email");
  });

  it("should revalidate profile path after update", async () => {
    const userId = "test-user-1";
    const email = "test@example.com";
    const newName = "Updated Name";

    mockEnsureUser.mockResolvedValue({ id: userId, email });

    const mockCookieStore = {
      set: vi.fn(),
      delete: vi.fn(),
    };
    (cookies as any).mockResolvedValue(mockCookieStore);

    (prisma.user.update as any).mockResolvedValue({
      id: userId,
      name: newName,
    });

    const formData = new FormData();
    formData.set("name", newName);
    formData.set("email", email);
    formData.set("password", "");

    await updateProfile(formData);

    expect(revalidatePath).toHaveBeenCalledWith("/profile");
  });
});
