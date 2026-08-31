import { auth } from "@/auth";
import { prisma } from "@/lib/prisma";
import { getTier } from "@/lib/loyalty";
import { CartClient } from "@/components/CartClient";

export default async function CartPage() {
  const session = await auth();
  let tier = null;
  if (session?.user?.id) {
    const dbUser = await prisma.user.findUnique({
      where: { id: session.user.id },
      select: { points: true },
    });
    tier = getTier(dbUser?.points ?? 0);
  }

  return <CartClient tier={tier} />;
}
