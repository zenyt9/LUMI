import { prisma } from "@/lib/prisma";

/** Тухайн хэрэглэгчийн дуртай барааны id-уудыг Set хэлбэрээр буцаана */
export async function getFavoriteProductIds(
  userId?: string,
): Promise<Set<string>> {
  if (!userId) return new Set();
  const favs = await prisma.favorite.findMany({
    where: { userId },
    select: { productId: true },
  });
  return new Set(favs.map((f) => f.productId));
}
