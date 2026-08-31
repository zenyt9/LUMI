// Нэг удаагийн: pointsBalance-ийг одоо байгаа points-тэй тэнцүүлнэ.
// (Хэн ч оноо зарцуулаагүй тул цуглуулсан оноо = зарцуулах үлдэгдэл.)
import { PrismaClient } from "@prisma/client";

const prisma = new PrismaClient();

async function main() {
  const users = await prisma.user.findMany({
    select: { id: true, email: true, points: true, pointsBalance: true },
  });
  let updated = 0;
  for (const u of users) {
    // Зөвхөн үлдэгдэл 0 бөгөөд оноотой хэрэглэгчдэд (анхны миграци)
    if (u.pointsBalance === 0 && u.points > 0) {
      await prisma.user.update({
        where: { id: u.id },
        data: { pointsBalance: u.points },
      });
      updated++;
      console.log(`  ${u.email}: pointsBalance → ${u.points}`);
    }
  }
  console.log(`\n✅ ${updated} хэрэглэгчийн зарцуулах үлдэгдэл тохируулсан`);
}

main()
  .catch((e) => {
    console.error("❌", e.message);
    process.exit(1);
  })
  .finally(() => prisma.$disconnect());
