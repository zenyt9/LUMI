import { prisma } from "@/lib/prisma";
import { createProduct } from "@/lib/actions/admin";
import { ProductForm } from "@/components/admin/ProductForm";

export default async function NewProductPage() {
  const categories = await prisma.category.findMany({
    orderBy: { name: "asc" },
  });

  return (
    <div>
      <h1 className="font-serif text-2xl font-bold mb-6">Шинэ бараа нэмэх</h1>
      <ProductForm
        action={createProduct}
        categories={categories}
        submitLabel="Нэмэх"
      />
    </div>
  );
}
