import Link from "next/link";
import { prisma } from "@/lib/prisma";
import { ProductCard } from "@/components/ProductCard";
import { Faq } from "@/components/Faq";

export default async function HomePage() {
  const [featured, categories, saleRaw] = await Promise.all([
    prisma.product.findMany({
      where: { featured: true },
      take: 8,
      orderBy: { createdAt: "desc" },
    }),
    prisma.category.findMany({
      orderBy: { name: "asc" },
      include: {
        _count: { select: { products: true } },
        products: { take: 4, orderBy: { createdAt: "desc" } },
      },
    }),
    prisma.product.findMany({
      where: { oldPrice: { not: null } },
      orderBy: { createdAt: "desc" },
      take: 12,
    }),
  ]);

  // Хямдралтай бараа (хуучин үнэ > одоогийн үнэ)
  const saleProducts = saleRaw
    .filter((p) => p.oldPrice != null && p.oldPrice > p.price)
    .slice(0, 8);

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

      {/* Итгэлийн зурвас */}
      <section className="border-y border-border bg-blush-soft/30">
        <div className="mx-auto max-w-6xl px-4 py-5 grid grid-cols-2 sm:grid-cols-4 gap-4 text-center text-sm">
          {[
            ["🚚", "Хурдан хүргэлт"],
            ["✨", "100% жинхэнэ"],
            ["💵", "Хүргэлтэд төлөх"],
            ["💬", "24/7 тусламж"],
          ].map(([icon, title]) => (
            <div key={title} className="flex items-center justify-center gap-2">
              <span className="text-xl">{icon}</span>
              <span className="font-medium">{title}</span>
            </div>
          ))}
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

      {/* Хямдралтай бараа */}
      {saleProducts.length > 0 && (
        <section className="mx-auto max-w-6xl px-4 pb-8">
          <div className="flex items-center justify-between mb-8">
            <h2 className="font-serif text-3xl font-bold">
              🔥 Хямдралтай бараа
            </h2>
            <Link
              href="/products"
              className="text-sm text-blush hover:text-blush-dark font-medium"
            >
              Бүгдийг үзэх →
            </Link>
          </div>
          <div className="grid grid-cols-2 lg:grid-cols-4 gap-4 sm:gap-6">
            {saleProducts.map((p) => (
              <ProductCard key={p.id} product={p} />
            ))}
          </div>
        </section>
      )}

      {/* Онцлох бараа */}
      {featured.length > 0 && (
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
      )}

      {/* Ангилал бүрээр */}
      {categories
        .filter((c) => c.products.length > 0)
        .map((c) => (
          <section key={c.id} className="mx-auto max-w-6xl px-4 pb-8">
            <div className="flex items-center justify-between mb-8">
              <h2 className="font-serif text-3xl font-bold">
                {categoryEmoji(c.slug)} {c.name}
              </h2>
              <Link
                href={`/products?category=${c.slug}`}
                className="text-sm text-blush hover:text-blush-dark font-medium"
              >
                Бүгдийг үзэх →
              </Link>
            </div>
            <div className="grid grid-cols-2 lg:grid-cols-4 gap-4 sm:gap-6">
              {c.products.map((p) => (
                <ProductCard key={p.id} product={p} />
              ))}
            </div>
          </section>
        ))}

      {/* Давуу талууд */}
      <section className="mx-auto max-w-6xl px-4 py-16">
        <div className="grid sm:grid-cols-3 gap-6 text-center">
          {[
            ["🚚", "Хурдан хүргэлт", "Улаанбаатар хотод 24 цагт"],
            ["✨", "Чанарын баталгаа", "100% жинхэнэ бүтээгдэхүүн"],
            ["💵", "Хялбар төлбөр", "Хүргэлтийн үед бэлнээр"],
          ].map(([icon, title, desc]) => (
            <div key={title} className="p-6 rounded-2xl border border-border">
              <div className="text-3xl mb-3">{icon}</div>
              <h3 className="font-semibold mb-1">{title}</h3>
              <p className="text-sm text-muted">{desc}</p>
            </div>
          ))}
        </div>
      </section>

      {/* Түгээмэл асуултууд */}
      <section className="mx-auto max-w-3xl px-4 pb-20">
        <h2 className="font-serif text-3xl font-bold mb-8 text-center">
          Түгээмэл асуултууд
        </h2>
        <Faq />
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
