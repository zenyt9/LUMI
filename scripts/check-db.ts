import { PrismaClient } from "@prisma/client";
import { getTier } from "../src/lib/loyalty.ts";

const prisma = new PrismaClient();

async function main() {
  const users = await prisma.user.findMany({
    select: { email: true, points: true, role: true },
  });
  console.log("=== Хэрэглэгчид ===");
  for (const u of users) {
    const t = getTier(u.points);
    console.log(`  ${u.email} (${u.role}) — ${u.points} оноо — ${t.emoji} ${t.name}`);
  }

  const orders = await prisma.order.findMany({
    take: 5,
    orderBy: { createdAt: "desc" },
    select: {
      id: true,
      status: true,
      total: true,
      discount: true,
      shipping: true,
      pointsEarned: true,
    },
  });
  console.log(`\n=== Сүүлийн ${orders.length} захиалга (шинэ баганууд ажиллаж байна) ===`);
  for (const o of orders) {
    console.log(
      `  #${o.id.slice(-6)} ${o.status} — нийт:${o.total} хөнг:${o.discount} хүрг:${o.shipping} оноо:${o.pointsEarned}`,
    );
  }
  if (orders.length === 0) console.log("  (захиалга алга — хэвийн)");

  console.log("\n✅ Neon schema + Prisma client бүрэн ажиллаж байна");
}

main()
  .catch((e) => {
    console.error("❌ Алдаа:", e.message);
    process.exit(1);
  })
  .finally(() => prisma.$disconnect());
