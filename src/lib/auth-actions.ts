"use server";

import { prisma } from "@/lib/prisma";
import { hashPassword, verifyPassword } from "@/lib/password";
import { signJWT } from "@/lib/jwt";
import { cookies } from "next/headers";
import { redirect } from "next/navigation";

export async function register(formData: FormData) {
  try {
    const email = formData.get("email") as string;
    const password = formData.get("password") as string;

    if (!email || !email.includes("@") || !password || password.length < 6) {
      throw new Error("Invalid input");
    }

    const existingUser = await prisma.user.findUnique({ where: { email } });
    if (existingUser) {
      throw new Error("User already exists");
    }

    const hashedPassword = await hashPassword(password);

    await prisma.user.create({
      data: {
        email,
        password: hashedPassword,
      },
    });
  } catch (error) {
    console.error("Registration error:", error);
    if (error instanceof Error && error.message === "NEXT_REDIRECT") {
      throw error;
    }
    throw new Error(
      error instanceof Error ? error.message : "Registration failed"
    );
  }

  redirect("/en/login");
}

export async function login(formData: FormData) {
  console.log("Login attempt for:", formData.get("email"));
  try {
    const email = formData.get("email") as string;
    const password = formData.get("password") as string;

    console.log("Finding user in DB...");
    const user = await prisma.user.findUnique({ where: { email } });
    console.log("User found:", !!user);

    if (!user || !user.password) {
      throw new Error("Invalid credentials");
    }

    const isValid = await verifyPassword(password, user.password);

    if (!isValid) {
      throw new Error("Invalid credentials");
    }

    const token = await signJWT({ userId: user.id, email: user.email });

    const cookieStore = await cookies();
    cookieStore.set("auth_token", token, {
      httpOnly: true,
      secure: process.env.NODE_ENV === "production",
      sameSite: "strict",
      maxAge: 60 * 60 * 24 * 7, // 1 week
      path: "/",
    });
  } catch (error) {
    console.error("Login error:", error);
    if (error instanceof Error && error.message === "NEXT_REDIRECT") {
      throw error;
    }
    throw new Error(error instanceof Error ? error.message : "Login failed");
  }

  redirect("/en");
}

export async function logout() {
  (await cookies()).delete("auth_token");
  redirect("/en");
}
