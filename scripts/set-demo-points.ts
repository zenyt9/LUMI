// Демо: туршилтын бүртгэлд Алт түвшний оноо тавьж, урамшууллыг шууд харуулах.
import { PrismaClient } from "@prisma/client";
import { getTier } from "../src/lib/loyalty.ts";

const prisma = new PrismaClient();

async function main() {
  const points = 550; // Алт түвшин (500+)
  const user = await prisma.user.update({
    where: { email: "user@lumi.mn" },
    data: { points },
    select: { email: true, points: true },
  });
  const t = getTier(user.points);
  console.log(`✅ ${user.email} → ${user.points} оноо (${t.emoji} ${t.name})`);
}

main()
  .catch((e) => {
    console.error("❌", e.message);
    process.exit(1);
  })
  .finally(() => prisma.$disconnect());
