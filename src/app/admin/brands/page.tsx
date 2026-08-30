import { prisma } from "@/lib/prisma";
import { BrandForm } from "@/components/admin/BrandForm";
import { DeleteBrandButton } from "@/components/admin/DeleteBrandButton";

export default async function AdminBrandsPage() {
  const brands = await prisma.brand.findMany({
    orderBy: { name: "asc" },
    include: { _count: { select: { products: true } } },
  });

  return (
    <div>
      <h1 className="font-serif text-2xl font-bold mb-6">Брэндүүд</h1>

      {/* Нэмэх форм */}
      <div className="bg-surface border border-border rounded-2xl p-5 mb-8">
        <h2 className="font-semibold mb-3">Шинэ брэнд нэмэх</h2>
        <BrandForm />
      </div>

      {/* Жагсаалт */}
      {brands.length === 0 ? (
        <p className="text-muted text-sm">Брэнд алга байна. Дээрээс нэмнэ үү.</p>
      ) : (
        <div className="bg-surface border border-border rounded-2xl divide-y divide-border">
          {brands.map((b) => (
            <div
              key={b.id}
              className="flex items-center justify-between p-4 gap-4"
            >
              <div className="min-w-0">
                <p className="font-medium truncate">{b.name}</p>
                <p className="text-xs text-muted">
                  {b._count.products} бараа · /{b.slug}
                </p>
              </div>
              <DeleteBrandButton id={b.id} name={b.name} />
            </div>
          ))}
        </div>
      )}
    </div>
  );
}
