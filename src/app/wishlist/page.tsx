import Link from "next/link";
import { redirect } from "next/navigation";
import { Heart } from "lucide-react";
import { auth } from "@/auth";
import { prisma } from "@/lib/prisma";
import { ProductCard } from "@/components/ProductCard";

export default async function WishlistPage() {
  const session = await auth();
  if (!session?.user?.id) {
    redirect("/login?callbackUrl=/wishlist");
  }

  const favorites = await prisma.favorite.findMany({
    where: { userId: session.user.id },
    orderBy: { createdAt: "desc" },
    include: { product: true },
  });

  const products = favorites.map((f) => f.product);
  const favoritedIds = new Set(products.map((p) => p.id));

  return (
    <div className="mx-auto max-w-6xl px-4 py-10">
      <h1 className="font-serif text-3xl font-bold mb-2 flex items-center gap-2">
        <Heart className="w-6 h-6 text-blush fill-blush" strokeWidth={1.5} />
        Дуртай бараа
      </h1>
      <p className="text-muted mb-8">Нийт {products.length} бүтээгдэхүүн</p>

      {products.length === 0 ? (
        <div className="text-center py-20 bg-blush-soft/30 rounded-2xl">
          <Heart
            className="w-14 h-14 mx-auto text-blush/40 mb-4"
            strokeWidth={1}
          />
          <p className="text-muted mb-4">
            Танд дуртай бараа алга байна. Зүрх дээр дарж хадгална уу.
          </p>
          <Link
            href="/products"
            className="text-blush font-medium hover:text-blush-dark"
          >
            Дэлгүүр хэсэх →
          </Link>
        </div>
      ) : (
        <div className="grid grid-cols-2 lg:grid-cols-4 gap-4 sm:gap-6">
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
