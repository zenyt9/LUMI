import Link from "next/link";
import { prisma } from "@/lib/prisma";
import { ProductCard } from "@/components/ProductCard";

export default async function HomePage() {
  const [featured, categories] = await Promise.all([
    prisma.product.findMany({
      where: { featured: true },
      take: 8,
      orderBy: { createdAt: "desc" },
    }),
    prisma.category.findMany({
      include: { _count: { select: { products: true } } },
    }),
  ]);

  return (
    <div>
      {/* Hero */}
      <section className="relative overflow-hidden bg-gradient-to-br from-blush-soft via-background to-background">
        <div className="mx-auto max-w-6xl px-4 py-20 sm:py-28 text-center animate-fade-up">
          <p className="text-blush font-medium tracking-widest text-sm mb-4">
            ГОО САЙХАН ✦ ИТГЭЛ ✦ ЭРХЭМ ЧАНАР
          </p>
          <h1 className="font-serif text-4xl sm:text-6xl font-bold leading-tight mb-6">
            Таны гоо сайхныг
            <br />
            <span className="text-blush">гэрэлтүүлэх</span> газар
          </h1>
          <p className="text-muted max-w-xl mx-auto mb-8 text-lg">
            Арьс арчилгаа, нүүр будалт, үнэртэн — чанартай бүтээгдэхүүнийг нэг
            дороос. LumiBeauty-тэй хамт өөрийгөө хайрла.
          </p>
          <Link
            href="/products"
            className="inline-block px-8 py-3.5 rounded-full bg-blush text-white font-medium hover:bg-blush-dark transition-colors shadow-lg shadow-blush/20"
          >
            Дэлгүүр хэсэх
          </Link>
        </div>
      </section>

      {/* Ангилал */}
      <section className="mx-auto max-w-6xl px-4 py-16">
        <h2 className="font-serif text-3xl font-bold mb-8 text-center">
          Ангилалууд
        </h2>
        <div className="grid grid-cols-2 sm:grid-cols-3 lg:grid-cols-5 gap-4">
          {categories.map((c) => (
            <Link
              key={c.id}
              href={`/products?category=${c.slug}`}
              className="group flex flex-col items-center justify-center text-center p-6 rounded-2xl bg-blush-soft/40 hover:bg-blush-soft transition-colors"
            >
              <span className="text-3xl mb-2">{categoryEmoji(c.slug)}</span>
              <span className="font-medium text-sm group-hover:text-blush-dark transition-colors">
                {c.name}
              </span>
              <span className="text-xs text-muted mt-1">
                {c._count.products} бүтээгдэхүүн
              </span>
            </Link>
          ))}
        </div>
      </section>

      {/* Онцлох бараа */}
      <section className="mx-auto max-w-6xl px-4 pb-8">
        <div className="flex items-center justify-between mb-8">
          <h2 className="font-serif text-3xl font-bold">Онцлох бүтээгдэхүүн</h2>
          <Link
            href="/products"
            className="text-sm text-blush hover:text-blush-dark font-medium"
          >
            Бүгдийг үзэх →
          </Link>
        </div>
        <div className="grid grid-cols-2 lg:grid-cols-4 gap-4 sm:gap-6">
          {featured.map((p) => (
            <ProductCard key={p.id} product={p} />
          ))}
        </div>
      </section>

      {/* Давуу талууд */}
      <section className="mx-auto max-w-6xl px-4 py-16">
        <div className="grid sm:grid-cols-3 gap-6 text-center">
          {[
            ["🚚", "Хурдан хүргэлт", "Улаанбаатар хотод 24 цагт"],
            ["✨", "Чанарын баталгаа", "100% жинхэнэ бүтээгдэхүүн"],
            ["💳", "Найдвартай төлбөр", "QPay болон картаар"],
          ].map(([icon, title, desc]) => (
            <div key={title} className="p-6 rounded-2xl border border-border">
              <div className="text-3xl mb-3">{icon}</div>
              <h3 className="font-semibold mb-1">{title}</h3>
              <p className="text-sm text-muted">{desc}</p>
            </div>
          ))}
        </div>
      </section>
    </div>
  );
}

function categoryEmoji(slug: string): string {
  const map: Record<string, string> = {
    "aris-archilgaa": "🧴",
    "nuur-budalt": "💄",
    "us-archilgaa": "💇",
    unerten: "🌸",
    "biyiin-archilgaa": "🧼",
  };
  return map[slug] ?? "✦";
}
