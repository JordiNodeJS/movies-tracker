"use server";

import { prisma } from "@/lib/prisma";
import { hashPassword, verifyPassword } from "@/lib/password";
import { signJWT } from "@/lib/jwt";
import { cookies } from "next/headers";
import { redirect } from "next/navigation";

export async function register(formData: FormData) {
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

  redirect("/en/login");
}

export async function login(formData: FormData) {
  const email = formData.get("email") as string;
  const password = formData.get("password") as string;

  const user = await prisma.user.findUnique({ where: { email } });

  if (!user || !user.password) {
    throw new Error("Invalid credentials");
  }

  const isValid = await verifyPassword(password, user.password);

  if (!isValid) {
    throw new Error("Invalid credentials");
  }

  const token = signJWT({ userId: user.id, email: user.email });

  const cookieStore = await cookies();
  cookieStore.set("auth_token", token, {
    httpOnly: true,
    secure: process.env.NODE_ENV === "production",
    sameSite: "lax",
    maxAge: 60 * 60 * 24 * 7, // 1 week
    path: "/",
  });

  redirect("/en");
}

export async function logout() {
  (await cookies()).delete("auth_token");
  redirect("/en");
}
