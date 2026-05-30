import { PrismaClient } from "@prisma/client";
import bcrypt from "bcryptjs";

const prisma = new PrismaClient();

// ===== Барааны зураг: бүтээгдэхүүн бүрт цэвэрхэн SVG placeholder үүсгэнэ =====
const PALETTES = [
  ["#f6e4ea", "#d6849b"],
  ["#fdeee2", "#e0a878"],
  ["#e8f0e6", "#7faa6e"],
  ["#ece6f2", "#a98bc4"],
  ["#fce8e6", "#e08a82"],
];

function makeImageDataUrl(name: string, idx: number): string {
  const [bg, accent] = PALETTES[idx % PALETTES.length];
  const initial = name.charAt(0).toUpperCase();
  const svg = `<svg xmlns="http://www.w3.org/2000/svg" width="600" height="600" viewBox="0 0 600 600">
  <defs>
    <linearGradient id="g" x1="0" y1="0" x2="1" y2="1">
      <stop offset="0%" stop-color="${bg}"/>
      <stop offset="100%" stop-color="#ffffff"/>
    </linearGradient>
  </defs>
  <rect width="600" height="600" fill="url(#g)"/>
  <circle cx="300" cy="250" r="130" fill="${accent}" opacity="0.18"/>
  <circle cx="300" cy="250" r="80" fill="${accent}" opacity="0.30"/>
  <text x="300" y="285" font-family="Georgia, serif" font-size="120" font-weight="bold"
        fill="${accent}" text-anchor="middle">${initial}</text>
  <text x="300" y="470" font-family="Arial, sans-serif" font-size="30" font-weight="600"
        fill="#3d2b30" text-anchor="middle">${escapeXml(name)}</text>
  <text x="300" y="515" font-family="Georgia, serif" font-size="22" letter-spacing="6"
        fill="${accent}" text-anchor="middle">L U M I</text>
</svg>`;
  return `data:image/svg+xml;base64,${Buffer.from(svg, "utf8").toString("base64")}`;
}

function escapeXml(s: string): string {
  return s.replace(/[<>&'"]/g, (c) =>
    ({ "<": "&lt;", ">": "&gt;", "&": "&amp;", "'": "&apos;", '"': "&quot;" })[c]!,
  );
}

type SeedProduct = {
  name: string;
  description: string;
  price: number;
  stock: number;
  featured?: boolean;
};

const DATA: { category: string; slug: string; products: SeedProduct[] }[] = [
  {
    category: "Арьс арчилгаа",
    slug: "aris-archilgaa",
    products: [
      { name: "Чийгшүүлэгч тос", description: "Хуурай арьсыг гүн чийгшүүлэх, гиалуроны хүчил агуулсан өдөр тутмын тос.", price: 48000, stock: 30, featured: true },
      { name: "Цэвэрлэгч хөөс", description: "Арьсыг зөөлөн цэвэрлэж, тослог илүүдлийг арилгах хөөс.", price: 32000, stock: 45 },
      { name: "Нүдний эргэн тойрны крем", description: "Нүдний доорх хаван, бараан толбыг бууруулах тэжээллэг крем.", price: 56000, stock: 20, featured: true },
      { name: "C витаминт сийвэн", description: "Арьсыг гэрэлтүүлж, гялбаа нэмэх антиоксидант сийвэн.", price: 72000, stock: 18 },
    ],
  },
  {
    category: "Нүүр будалт",
    slug: "nuur-budalt",
    products: [
      { name: "Тон крем (Foundation)", description: "Байгалийн төрхийг хадгалсан, бүтэн өдөр тогтвортой суурь крем.", price: 65000, stock: 25, featured: true },
      { name: "Уруулын будаг", description: "Хуурайшилгүй, тод өнгөтэй матте уруулын будаг.", price: 28000, stock: 60 },
      { name: "Сормуусны будаг", description: "Эзэлхүүн нэмж, бөөгнөрөлгүй сунгадаг сормуусны будаг.", price: 34000, stock: 40 },
      { name: "Нүүрний нунтаг", description: "Тослог шингээж, матте төгсгөл өгөх компакт нунтаг.", price: 42000, stock: 22 },
    ],
  },
  {
    category: "Үс арчилгаа",
    slug: "us-archilgaa",
    products: [
      { name: "Тэжээллэг шампунь", description: "Сульфатгүй, үсний үндсийг бэхжүүлэх тэжээллэг шампунь.", price: 38000, stock: 35, featured: true },
      { name: "Үсний маск", description: "Гэмтсэн үсийг сэргээх, гялалзуулах долоо хоног тутмын маск.", price: 46000, stock: 28 },
      { name: "Арган тос", description: "Үсний үзүүрийг хамгаалж, зөөлрүүлэх цэвэр арган тос.", price: 52000, stock: 19 },
    ],
  },
  {
    category: "Үнэртэн",
    slug: "unerten",
    products: [
      { name: "Цэцгийн анхилуун үнэртэн", description: "Сараана, цээнэ цэцгийн зөөлөн эмэгтэйлэг анхилуун үнэр.", price: 120000, stock: 15, featured: true },
      { name: "Цитрус сэргэг үнэртэн", description: "Citrus болон бергамотын сэргэг, өдрийн үнэртэн.", price: 98000, stock: 17 },
    ],
  },
  {
    category: "Биеийн арчилгаа",
    slug: "biyiin-archilgaa",
    products: [
      { name: "Биеийн чийгшүүлэгч лосьон", description: "Ши тос агуулсан, ширхэг шингэдэг биеийн лосьон.", price: 36000, stock: 50 },
      { name: "Гар тос", description: "Хуурайшилаас хамгаалах, хурдан шингэдэг тэжээллэг гар тос.", price: 22000, stock: 70, featured: true },
      { name: "Скраб", description: "Үхсэн эсийг зөөлөн арилгаж, арьсыг гялалзуулах биеийн скраб.", price: 40000, stock: 26 },
    ],
  },
];

async function main() {
  console.log("🌱 Seed эхэлж байна...");

  // Хуучин өгөгдлийг цэвэрлэх (дахин ажиллуулахад давхцахгүй)
  await prisma.orderItem.deleteMany();
  await prisma.order.deleteMany();
  await prisma.product.deleteMany();
  await prisma.category.deleteMany();
  await prisma.user.deleteMany();

  let imgIdx = 0;
  for (const block of DATA) {
    const category = await prisma.category.create({
      data: { name: block.category, slug: block.slug },
    });

    for (const p of block.products) {
      const slug = slugify(p.name) + "-" + imgIdx;

      await prisma.product.create({
        data: {
          name: p.name,
          slug,
          description: p.description,
          price: p.price,
          stock: p.stock,
          featured: p.featured ?? false,
          image: makeImageDataUrl(p.name, imgIdx),
          categoryId: category.id,
        },
      });
      imgIdx++;
    }
  }

  // Хэрэглэгчид
  const adminHash = await bcrypt.hash("admin123", 10);
  await prisma.user.create({
    data: {
      name: "Админ",
      email: "admin@lumi.mn",
      passwordHash: adminHash,
      role: "ADMIN",
    },
  });

  const userHash = await bcrypt.hash("user123", 10);
  await prisma.user.create({
    data: {
      name: "Туяа",
      email: "user@lumi.mn",
      passwordHash: userHash,
      role: "USER",
    },
  });

  console.log(`✅ ${imgIdx} бараа, 5 ангилал, 2 хэрэглэгч үүслээ.`);
  console.log("   Админ:    admin@lumi.mn / admin123");
  console.log("   Хэрэглэгч: user@lumi.mn / user123");
}

function slugify(s: string): string {
  // Кирилл болон тусгай тэмдэгтийг латин руу хялбараар хувиргах
  const map: Record<string, string> = {
    а: "a", б: "b", в: "v", г: "g", д: "d", е: "e", ё: "yo", ж: "j", з: "z",
    и: "i", й: "i", к: "k", л: "l", м: "m", н: "n", о: "o", ө: "o", п: "p",
    р: "r", с: "s", т: "t", у: "u", ү: "u", ф: "f", х: "h", ц: "ts", ч: "ch",
    ш: "sh", щ: "sh", ъ: "", ы: "y", ь: "", э: "e", ю: "yu", я: "ya",
  };
  return s
    .toLowerCase()
    .split("")
    .map((c) => map[c] ?? c)
    .join("")
    .replace(/[^a-z0-9]+/g, "-")
    .replace(/^-+|-+$/g, "");
}

main()
  .catch((e) => {
    console.error(e);
    process.exit(1);
  })
  .finally(async () => {
    await prisma.$disconnect();
  });
