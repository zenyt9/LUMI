import Image from "next/image";
import Link from "next/link";
import { Plus, Pencil } from "lucide-react";
import { prisma } from "@/lib/prisma";
import { formatPrice, cn } from "@/lib/utils";
import { DeleteProductButton } from "@/components/admin/DeleteProductButton";

export default async function AdminProductsPage({
  searchParams,
}: {
  searchParams: Promise<{ category?: string }>;
}) {
  const { category } = await searchParams;

  const [products, categories, totalCount] = await Promise.all([
    prisma.product.findMany({
      where: category ? { category: { slug: category } } : undefined,
      orderBy: { createdAt: "desc" },
      include: { category: true },
    }),
    prisma.category.findMany({
      orderBy: { name: "asc" },
      include: { _count: { select: { products: true } } },
    }),
    prisma.product.count(),
  ]);

  return (
    <div>
      <div className="flex items-center justify-between mb-6">
        <h1 className="font-serif text-2xl font-bold">Бүтээгдэхүүн</h1>
        <Link
          href="/admin/products/new"
          className="inline-flex items-center gap-2 px-4 py-2 rounded-full bg-blush text-white text-sm font-medium hover:bg-blush-dark transition-colors"
        >
          <Plus className="w-4 h-4" /> Шинэ бараа
        </Link>
      </div>

      {/* Ангиллаар шүүх цэс */}
      <div className="flex flex-wrap gap-2 mb-6">
        <Link
          href="/admin/products"
          className={cn(
            "px-4 py-1.5 rounded-full text-sm border transition-colors",
            !category
              ? "bg-blush text-white border-blush"
              : "bg-surface border-border hover:border-blush",
          )}
        >
          Бүгд ({totalCount})
        </Link>
        {categories.map((c) => (
          <Link
            key={c.id}
            href={`/admin/products?category=${c.slug}`}
            className={cn(
              "px-4 py-1.5 rounded-full text-sm border transition-colors",
              category === c.slug
                ? "bg-blush text-white border-blush"
                : "bg-surface border-border hover:border-blush",
            )}
          >
            {c.name} ({c._count.products})
          </Link>
        ))}
      </div>

      <div className="bg-surface border border-border rounded-2xl overflow-hidden">
        <table className="w-full text-sm">
          <thead className="bg-blush-soft/40 text-left">
            <tr>
              <th className="p-3 font-medium">Бараа</th>
              <th className="p-3 font-medium hidden sm:table-cell">Ангилал</th>
              <th className="p-3 font-medium">Үнэ</th>
              <th className="p-3 font-medium">Үлдэгдэл</th>
              <th className="p-3 font-medium text-right">Үйлдэл</th>
            </tr>
          </thead>
          <tbody className="divide-y divide-border">
            {products.map((p) => (
              <tr key={p.id} className="hover:bg-blush-soft/20">
                <td className="p-3">
                  <div className="flex items-center gap-3">
                    <div className="relative w-10 h-10 rounded-lg overflow-hidden bg-blush-soft/40 shrink-0">
                      <Image src={p.image} alt={p.name} fill sizes="40px" className="object-cover" />
                    </div>
                    <span className="font-medium line-clamp-1">{p.name}</span>
                    {p.featured && <span title="Онцлох">⭐</span>}
                  </div>
                </td>
                <td className="p-3 hidden sm:table-cell text-muted">
                  {p.category.name}
                </td>
                <td className="p-3 whitespace-nowrap">{formatPrice(p.price)}</td>
                <td className="p-3">
                  <span className={p.stock <= 0 ? "text-red-500" : ""}>
                    {p.stock}
                  </span>
                </td>
                <td className="p-3">
                  <div className="flex items-center gap-3 justify-end">
                    <Link
                      href={`/admin/products/${p.id}`}
                      className="text-muted hover:text-blush transition-colors"
                      title="Засах"
                    >
                      <Pencil className="w-4 h-4" />
                    </Link>
                    <DeleteProductButton id={p.id} name={p.name} />
                  </div>
                </td>
              </tr>
            ))}
          </tbody>
        </table>
        {products.length === 0 && (
          <p className="p-6 text-center text-muted">Бараа алга байна.</p>
        )}
      </div>
    </div>
  );
}
