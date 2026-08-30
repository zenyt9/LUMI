import Image from "next/image";
import Link from "next/link";
import { notFound } from "next/navigation";
import { prisma } from "@/lib/prisma";
import { formatPrice } from "@/lib/utils";
import { ProductDetailActions } from "@/components/ProductDetailActions";
import { ProductCard } from "@/components/ProductCard";

export default async function ProductDetailPage({
  params,
}: {
  params: Promise<{ slug: string }>;
}) {
  const { slug } = await params;

  const product = await prisma.product.findUnique({
    where: { slug },
    include: { category: true },
  });

  if (!product) notFound();

  const related = await prisma.product.findMany({
    where: { categoryId: product.categoryId, NOT: { id: product.id } },
    take: 4,
  });

  const outOfStock = product.stock <= 0;

  return (
    <div className="mx-auto max-w-6xl px-4 py-10">
      {/* Замчлал */}
      <nav className="text-sm text-muted mb-6 flex gap-2">
        <Link href="/" className="hover:text-blush">
          Нүүр
        </Link>
        <span>/</span>
        <Link
          href={`/products?category=${product.category.slug}`}
          className="hover:text-blush"
        >
          {product.category.name}
        </Link>
        <span>/</span>
        <span className="text-foreground">{product.name}</span>
      </nav>

      <div className="grid md:grid-cols-2 gap-10">
        {/* Зураг */}
        <div className="relative aspect-square rounded-3xl overflow-hidden bg-blush-soft/40 border border-border">
          <Image
            src={product.image}
            alt={product.name}
            fill
            sizes="(max-width: 768px) 100vw, 50vw"
            className="object-cover"
            priority
          />
        </div>

        {/* Мэдээлэл */}
        <div className="flex flex-col">
          <Link
            href={`/products?category=${product.category.slug}`}
            className="text-sm text-blush font-medium mb-2"
          >
            {product.category.name}
          </Link>
          <h1 className="font-serif text-3xl sm:text-4xl font-bold mb-4">
            {product.name}
          </h1>
          <div className="flex items-center gap-3 mb-6">
            <span className="font-serif text-3xl font-bold text-blush-dark">
              {formatPrice(product.price)}
            </span>
            {product.oldPrice && product.oldPrice > product.price && (
              <>
                <span className="text-lg text-muted line-through">
                  {formatPrice(product.oldPrice)}
                </span>
                <span className="bg-blush text-white text-sm font-semibold px-2.5 py-1 rounded-full">
                  -{Math.round((1 - product.price / product.oldPrice) * 100)}%
                </span>
              </>
            )}
          </div>
          <p className="text-muted leading-relaxed mb-6">
            {product.description}
          </p>

          <div className="mb-6 text-sm">
            {outOfStock ? (
              <span className="text-red-500 font-medium">● Дууссан</span>
            ) : (
              <span className="text-green-600 font-medium">
                ● Бэлэн байгаа ({product.stock} ширхэг)
              </span>
            )}
          </div>

          {!outOfStock && (
            <ProductDetailActions
              product={{
                id: product.id,
                name: product.name,
                slug: product.slug,
                price: product.price,
                image: product.image,
              }}
              maxStock={product.stock}
            />
          )}
        </div>
      </div>

      {/* Холбоотой бараа */}
      {related.length > 0 && (
        <section className="mt-20">
          <h2 className="font-serif text-2xl font-bold mb-8">
            Төстэй бүтээгдэхүүн
          </h2>
          <div className="grid grid-cols-2 lg:grid-cols-4 gap-4 sm:gap-6">
            {related.map((p) => (
              <ProductCard key={p.id} product={p} />
            ))}
          </div>
        </section>
      )}
    </div>
  );
}
