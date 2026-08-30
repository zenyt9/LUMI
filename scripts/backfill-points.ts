// Нэг удаагийн backfill: loyalty гарахаас өмнө хүргэгдсэн захиалгуудын оноог олгоно.
// Идемпотент — pointsEarned > 0 байвал алгасна (давхар олгохгүй).
import { PrismaClient } from "@prisma/client";
import { pointsForAmount } from "../src/lib/loyalty.ts";

const prisma = new PrismaClient();

async function main() {
  const orders = await prisma.order.findMany({
    where: { status: "DELIVERED", pointsEarned: 0 },
    select: { id: true, userId: true, total: true },
  });

  console.log(`${orders.length} хүргэгдсэн захиалгад оноо олгоно...`);
  let credited = 0;

  for (const o of orders) {
    const earned = pointsForAmount(o.total);
    if (earned <= 0) continue;
    await prisma.$transaction([
      prisma.order.update({
        where: { id: o.id },
        data: { pointsEarned: earned },
      }),
      prisma.user.update({
        where: { id: o.userId },
        data: { points: { increment: earned } },
      }),
    ]);
    credited += earned;
    console.log(`  #${o.id.slice(-6)} → +${earned} оноо`);
  }

  console.log(`\n✅ Нийт ${credited} оноо олгосон`);
}

main()
  .catch((e) => {
    console.error("❌ Алдаа:", e.message);
    process.exit(1);
  })
  .finally(() => prisma.$disconnect());
