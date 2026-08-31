"use server";

import { z } from "zod";
import bcrypt from "bcryptjs";
import { revalidatePath } from "next/cache";
import { prisma } from "@/lib/prisma";
import { auth } from "@/auth";

export type AccountState =
  | { error?: string; success?: string }
  | undefined;

const profileSchema = z.object({
  name: z.string().min(2, "Нэр дор хаяж 2 тэмдэгт"),
  phone: z
    .string()
    .regex(/^\d{8}$/, "Утас 8 оронтой байх ёстой")
    .optional()
    .or(z.literal("")),
});

export async function updateProfile(
  _prev: AccountState,
  formData: FormData,
): Promise<AccountState> {
  const session = await auth();
  if (!session?.user?.id) return { error: "Нэвтэрнэ үү" };

  const parsed = profileSchema.safeParse({
    name: formData.get("name"),
    phone: formData.get("phone") || "",
  });
  if (!parsed.success) return { error: parsed.error.issues[0].message };

  await prisma.user.update({
    where: { id: session.user.id },
    data: {
      name: parsed.data.name,
      phone: parsed.data.phone ? parsed.data.phone : null,
    },
  });

  revalidatePath("/profile");
  revalidatePath("/profile/settings");
  return { success: "Профайл шинэчлэгдлээ" };
}

const passwordSchema = z.object({
  currentPassword: z.string().min(1, "Одоогийн нууц үгээ оруулна уу"),
  newPassword: z.string().min(6, "Шинэ нууц үг дор хаяж 6 тэмдэгт"),
});

export async function changePassword(
  _prev: AccountState,
  formData: FormData,
): Promise<AccountState> {
  const session = await auth();
  if (!session?.user?.id) return { error: "Нэвтэрнэ үү" };

  const parsed = passwordSchema.safeParse({
    currentPassword: formData.get("currentPassword"),
    newPassword: formData.get("newPassword"),
  });
  if (!parsed.success) return { error: parsed.error.issues[0].message };

  const user = await prisma.user.findUnique({
    where: { id: session.user.id },
    select: { passwordHash: true },
  });
  if (!user) return { error: "Хэрэглэгч олдсонгүй" };

  const valid = await bcrypt.compare(
    parsed.data.currentPassword,
    user.passwordHash,
  );
  if (!valid) return { error: "Одоогийн нууц үг буруу байна" };

  const newHash = await bcrypt.hash(parsed.data.newPassword, 10);
  await prisma.user.update({
    where: { id: session.user.id },
    data: { passwordHash: newHash },
  });

  return { success: "Нууц үг амжилттай солигдлоо" };
}
