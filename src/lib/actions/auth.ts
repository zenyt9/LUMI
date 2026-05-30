"use server";

import { z } from "zod";
import bcrypt from "bcryptjs";
import { AuthError } from "next-auth";
import { redirect } from "next/navigation";
import { prisma } from "@/lib/prisma";
import { signIn, signOut } from "@/auth";

const registerSchema = z.object({
  name: z.string().min(2, "Нэр дор хаяж 2 тэмдэгт байх ёстой"),
  email: z.string().email("Имэйл буруу байна"),
  password: z.string().min(6, "Нууц үг дор хаяж 6 тэмдэгт байх ёстой"),
});

export type AuthFormState = { error?: string } | undefined;

export async function registerUser(
  _prev: AuthFormState,
  formData: FormData,
): Promise<AuthFormState> {
  const parsed = registerSchema.safeParse({
    name: formData.get("name"),
    email: formData.get("email"),
    password: formData.get("password"),
  });

  if (!parsed.success) {
    return { error: parsed.error.issues[0].message };
  }

  const { name, email, password } = parsed.data;
  const callbackUrl = String(formData.get("callbackUrl") || "/");

  const existing = await prisma.user.findUnique({ where: { email } });
  if (existing) {
    return { error: "Энэ имэйл хаягаар бүртгэл аль хэдийн үүссэн байна" };
  }

  const passwordHash = await bcrypt.hash(password, 10);
  await prisma.user.create({
    data: { name, email, passwordHash, role: "USER" },
  });

  // Бүртгэсний дараа шууд нэвтрүүлэх
  await signIn("credentials", { email, password, redirectTo: callbackUrl });
  return undefined;
}

export async function loginUser(
  _prev: AuthFormState,
  formData: FormData,
): Promise<AuthFormState> {
  const email = String(formData.get("email") ?? "");
  const password = String(formData.get("password") ?? "");
  const callbackUrl = String(formData.get("callbackUrl") || "/");

  try {
    await signIn("credentials", { email, password, redirectTo: callbackUrl });
  } catch (error) {
    if (error instanceof AuthError) {
      return { error: "Имэйл эсвэл нууц үг буруу байна" };
    }
    throw error; // redirect алдааг дахин шидэх ёстой
  }
  return undefined;
}

export async function logout() {
  await signOut({ redirectTo: "/" });
  redirect("/");
}
