import { PrismaClient } from "@prisma/client";
const prisma = new PrismaClient();
async function main() {
  const [products, categories, users] = await Promise.all([
    prisma.product.count(),
    prisma.category.count(),
    prisma.user.count(),
  ]);
  console.log(`Supabase DB: ${products} бараа, ${categories} ангилал, ${users} хэрэглэгч`);
  const sample = await prisma.product.findMany({ take: 3, select: { name: true } });
  console.log("Жишээ:", sample.map((p) => p.name).join(", "));
}
main().catch((e) => console.error("АЛДАА:", e.message)).finally(() => prisma.$disconnect());
