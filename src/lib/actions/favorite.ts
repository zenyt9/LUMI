"use server";

import { revalidatePath } from "next/cache";
import { prisma } from "@/lib/prisma";
import { auth } from "@/auth";

export type ToggleResult =
  | { ok: true; favorited: boolean }
  | { ok: false; error: string };

export async function toggleFavorite(productId: string): Promise<ToggleResult> {
  const session = await auth();
  if (!session?.user?.id) {
    return { ok: false, error: "Нэвтэрнэ үү" };
  }
  const userId = session.user.id;

  const existing = await prisma.favorite.findUnique({
    where: { userId_productId: { userId, productId } },
    select: { id: true },
  });

  let favorited: boolean;
  if (existing) {
    await prisma.favorite.delete({ where: { id: existing.id } });
    favorited = false;
  } else {
    await prisma.favorite.create({ data: { userId, productId } });
    favorited = true;
  }

  revalidatePath("/wishlist");
  return { ok: true, favorited };
}
