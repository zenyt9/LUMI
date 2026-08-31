import Image from "next/image";
import Link from "next/link";
import { formatPrice } from "@/lib/utils";
import { AddToCartButton } from "./AddToCartButton";
import { StarRating } from "./StarRating";

export type ProductCardData = {
  id: string;
  name: string;
  slug: string;
  price: number;
  oldPrice?: number | null;
  image: string;
  stock: number;
  ratingSum?: number;
  ratingCount?: number;
};

export function ProductCard({ product }: { product: ProductCardData }) {
  const outOfStock = product.stock <= 0;
  const onSale = !!product.oldPrice && product.oldPrice > product.price;
  const discountPct = onSale
    ? Math.round((1 - product.price / product.oldPrice!) * 100)
    : 0;

  return (
    <div className="group flex flex-col bg-surface rounded-2xl border border-border overflow-hidden hover:shadow-lg hover:shadow-blush/10 transition-shadow">
      <Link href={`/products/${product.slug}`} className="relative block aspect-square overflow-hidden bg-blush-soft/40">
        <Image
          src={product.image}
          alt={product.name}
          fill
          sizes="(max-width: 640px) 50vw, 25vw"
          className="object-cover group-hover:scale-105 transition-transform duration-300"
        />
        {onSale && (
          <span className="absolute top-3 left-3 bg-blush text-white text-xs font-semibold px-2 py-1 rounded-full">
            -{discountPct}%
          </span>
        )}
        {outOfStock && (
          <span className="absolute top-3 right-3 bg-black/70 text-white text-xs px-2 py-1 rounded-full">
            Дууссан
          </span>
        )}
      </Link>

      <div className="flex flex-col flex-1 p-4">
        <Link href={`/products/${product.slug}`}>
          <h3 className="font-medium leading-snug hover:text-blush transition-colors line-clamp-2">
            {product.name}
          </h3>
        </Link>
        {product.ratingCount != null && product.ratingCount > 0 && (
          <div className="mt-1.5">
            <StarRating
              rating={(product.ratingSum ?? 0) / product.ratingCount}
              count={product.ratingCount}
              size="sm"
            />
          </div>
        )}
        <div className="mt-2 mb-4 flex items-baseline gap-2">
          <span className="font-serif text-lg font-semibold text-blush-dark">
            {formatPrice(product.price)}
          </span>
          {onSale && (
            <span className="text-sm text-muted line-through">
              {formatPrice(product.oldPrice!)}
            </span>
          )}
        </div>
        <div className="mt-auto">
          {outOfStock ? (
            <button
              disabled
              className="w-full px-4 py-2 text-sm rounded-full bg-border text-muted cursor-not-allowed"
            >
              Дууссан
            </button>
          ) : (
            <AddToCartButton
              full
              product={{
                id: product.id,
                name: product.name,
                slug: product.slug,
                price: product.price,
                image: product.image,
              }}
            />
          )}
        </div>
      </div>
    </div>
  );
}
