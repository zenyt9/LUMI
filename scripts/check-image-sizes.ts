import { PrismaClient } from "@prisma/client";
const prisma = new PrismaClient();

async function main() {
  const products = await prisma.product.findMany({
    select: { name: true, image: true },
    orderBy: { createdAt: "desc" },
  });

  let totalKb = 0;
  let bigCount = 0;
  console.log(`Нийт ${products.length} бараа:\n`);
  for (const p of products) {
    const kb = Math.round((p.image.length / 1024) * 10) / 10;
    totalKb += kb;
    const type = p.image.startsWith("data:image/svg")
      ? "SVG(жижиг)"
      : p.image.startsWith("data:")
        ? "РАСТЕР(том!)"
        : "URL";
    if (kb > 50) bigCount++;
    console.log(`  ${kb}KB  ${type}  — ${p.name}`);
  }
  console.log(
    `\n=== Нийт зургийн хэмжээ: ${Math.round(totalKb)}KB (${bigCount} том зураг) ===`,
  );
  console.log("(Эдгээр бүгд HTML/DB дотор base64-ээр орно)");
}

main()
  .catch((e) => console.error(e.message))
  .finally(() => prisma.$disconnect());
