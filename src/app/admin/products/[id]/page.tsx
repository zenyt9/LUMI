import { notFound } from "next/navigation";
import { prisma } from "@/lib/prisma";
import { updateProduct } from "@/lib/actions/admin";
import { ProductForm } from "@/components/admin/ProductForm";

export default async function EditProductPage({
  params,
}: {
  params: Promise<{ id: string }>;
}) {
  const { id } = await params;

  const [product, categories] = await Promise.all([
    prisma.product.findUnique({ where: { id } }),
    prisma.category.findMany({ orderBy: { name: "asc" } }),
  ]);

  if (!product) notFound();

  // updateProduct(id, state, formData) -> (state, formData)
  const action = updateProduct.bind(null, product.id);

  return (
    <div>
      <h1 className="font-serif text-2xl font-bold mb-6">Бараа засах</h1>
      <ProductForm
        action={action}
        categories={categories}
        submitLabel="Хадгалах"
        product={{
          name: product.name,
          description: product.description,
          price: product.price,
          stock: product.stock,
          categoryId: product.categoryId,
          featured: product.featured,
          image: product.image,
        }}
      />
    </div>
  );
}
