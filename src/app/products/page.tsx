import { auth } from "@/auth";
import { prisma } from "@/lib/prisma";
import { getFavoriteProductIds } from "@/lib/favorites";
import { ProductCard } from "@/components/ProductCard";
import { ProductFilters } from "@/components/ProductFilters";
import type { Prisma } from "@prisma/client";

type SearchParams = {
  q?: string;
  category?: string;
  brand?: string;
  sort?: string;
};

export default async function ProductsPage({
  searchParams,
}: {
  searchParams: Promise<SearchParams>;
}) {
  const { q, category, brand, sort } = await searchParams;

  const where: Prisma.ProductWhereInput = {};
  if (q) where.name = { contains: q };
  if (category) where.category = { slug: category };
  if (brand) where.brand = { slug: brand };

  let orderBy: Prisma.ProductOrderByWithRelationInput = { createdAt: "desc" };
  if (sort === "price-asc") orderBy = { price: "asc" };
  else if (sort === "price-desc") orderBy = { price: "desc" };
  else if (sort === "name") orderBy = { name: "asc" };

  const session = await auth();
  const [products, categories, activeBrand, favoritedIds] = await Promise.all([
    prisma.product.findMany({ where, orderBy }),
    prisma.category.findMany({ orderBy: { name: "asc" } }),
    brand ? prisma.brand.findUnique({ where: { slug: brand } }) : null,
    getFavoriteProductIds(session?.user?.id),
  ]);

  return (
    <div className="mx-auto max-w-6xl px-4 py-10">
      <h1 className="font-serif text-3xl font-bold mb-2">
        {activeBrand ? activeBrand.name : "Бүтээгдэхүүн"}
      </h1>
      <p className="text-muted mb-8">Нийт {products.length} бүтээгдэхүүн</p>

      <ProductFilters
        categories={categories}
        current={{ q, category, brand, sort }}
        activeBrandName={activeBrand?.name}
      />

      {products.length === 0 ? (
        <div className="text-center py-20 text-muted">
          <p className="text-5xl mb-4">🔍</p>
          <p>Бүтээгдэхүүн олдсонгүй. Өөр хайлт оролдоно уу.</p>
        </div>
      ) : (
        <div className="grid grid-cols-2 lg:grid-cols-4 gap-4 sm:gap-6 mt-8">
          {products.map((p) => (
            <ProductCard
              key={p.id}
              product={p}
              favorited={favoritedIds.has(p.id)}
            />
          ))}
        </div>
      )}
    </div>
  );
}
