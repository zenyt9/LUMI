"use client";

import Image from "next/image";
import Link from "next/link";
import { Minus, Plus, Trash2, ShoppingBag } from "lucide-react";
import { useCart } from "@/lib/store/cart";
import { formatPrice } from "@/lib/utils";
import { useEffect, useState } from "react";
import {
  computePricing,
  SHIPPING_FEE,
  FREE_SHIPPING_THRESHOLD,
  type Tier,
} from "@/lib/loyalty";

export function CartClient({ tier }: { tier: Tier | null }) {
  const { items, setQuantity, remove, totalPrice } = useCart();
  const [mounted, setMounted] = useState(false);
  useEffect(() => setMounted(true), []);

  if (!mounted) {
    return (
      <div className="mx-auto max-w-4xl px-4 py-20 text-center text-muted">
        Уншиж байна...
      </div>
    );
  }

  if (items.length === 0) {
    return (
      <div className="mx-auto max-w-4xl px-4 py-24 text-center">
        <ShoppingBag className="w-16 h-16 mx-auto text-blush/50 mb-6" strokeWidth={1} />
        <h1 className="font-serif text-2xl font-bold mb-2">Таны сагс хоосон байна</h1>
        <p className="text-muted mb-8">Дуртай бүтээгдэхүүнээ сагслаарай.</p>
        <Link
          href="/products"
          className="inline-block px-8 py-3 rounded-full bg-blush text-white font-medium hover:bg-blush-dark transition-colors"
        >
          Дэлгүүр хэсэх
        </Link>
      </div>
    );
  }

  const subtotal = totalPrice();
  // Түвшинтэй бол (нэвтэрсэн) түвшингийн хөнгөлөлт/хүргэлтийг тооцно
  const discount = tier ? Math.round(subtotal * tier.discountRate) : 0;
  const afterDiscount = subtotal - discount;
  const freeShip =
    (tier?.freeShipping ?? false) || afterDiscount >= FREE_SHIPPING_THRESHOLD;
  const shipping = freeShip ? 0 : SHIPPING_FEE;
  const total = afterDiscount + shipping;

  return (
    <div className="mx-auto max-w-5xl px-4 py-10">
      <h1 className="font-serif text-3xl font-bold mb-8">Таны сагс</h1>

      <div className="grid lg:grid-cols-3 gap-8">
        {/* Бараанууд */}
        <div className="lg:col-span-2 space-y-4">
          {items.map((item) => (
            <div
              key={item.id}
              className="flex gap-4 bg-surface border border-border rounded-2xl p-4"
            >
              <Link
                href={`/products/${item.slug}`}
                className="relative w-24 h-24 rounded-xl overflow-hidden bg-blush-soft/40 shrink-0"
              >
                <Image src={item.image} alt={item.name} fill sizes="96px" className="object-cover" />
              </Link>

              <div className="flex-1 min-w-0">
                <Link href={`/products/${item.slug}`}>
                  <h3 className="font-medium hover:text-blush transition-colors line-clamp-2">
                    {item.name}
                  </h3>
                </Link>
                <div className="text-blush-dark font-semibold mt-1">
                  {formatPrice(item.price)}
                </div>

                <div className="flex items-center gap-4 mt-3">
                  <div className="flex items-center border border-border rounded-full">
                    <button
                      onClick={() => setQuantity(item.id, item.quantity - 1)}
                      className="p-2 hover:bg-blush-soft rounded-l-full transition-colors"
                      aria-label="Хасах"
                    >
                      <Minus className="w-3.5 h-3.5" />
                    </button>
                    <span className="w-9 text-center text-sm font-medium">
                      {item.quantity}
                    </span>
                    <button
                      onClick={() => setQuantity(item.id, item.quantity + 1)}
                      className="p-2 hover:bg-blush-soft rounded-r-full transition-colors"
                      aria-label="Нэмэх"
                    >
                      <Plus className="w-3.5 h-3.5" />
                    </button>
                  </div>

                  <button
                    onClick={() => remove(item.id)}
                    className="text-muted hover:text-red-500 transition-colors flex items-center gap-1 text-sm"
                  >
                    <Trash2 className="w-4 h-4" /> Устгах
                  </button>
                </div>
              </div>

              <div className="font-semibold text-right whitespace-nowrap">
                {formatPrice(item.price * item.quantity)}
              </div>
            </div>
          ))}
        </div>

        {/* Дүн */}
        <div className="lg:col-span-1">
          <div className="bg-blush-soft/40 border border-border rounded-2xl p-6 sticky top-20">
            <h2 className="font-semibold text-lg mb-4">Захиалгын дүн</h2>
            <div className="space-y-2 text-sm">
              <div className="flex justify-between">
                <span className="text-muted">Барааны дүн</span>
                <span>{formatPrice(subtotal)}</span>
              </div>
              {discount > 0 && tier && (
                <div className="flex justify-between text-green-400">
                  <span>
                    {tier.emoji} {tier.name} ({Math.round(tier.discountRate * 100)}%)
                  </span>
                  <span>−{formatPrice(discount)}</span>
                </div>
              )}
              <div className="flex justify-between">
                <span className="text-muted">Хүргэлт</span>
                <span>{shipping === 0 ? "Үнэгүй" : formatPrice(shipping)}</span>
              </div>
              {shipping > 0 && (
                <p className="text-xs text-muted">
                  100,000₮-с дээш захиалгад хүргэлт үнэгүй
                </p>
              )}
              <div className="border-t border-border my-3" />
              <div className="flex justify-between font-semibold text-base">
                <span>Нийт</span>
                <span className="text-blush-dark">{formatPrice(total)}</span>
              </div>
              <p className="text-xs text-muted pt-1">
                Оноогоо төлбөрийн хуудсанд ашиглаж болно.
              </p>
            </div>

            <Link
              href="/checkout"
              className="mt-6 block text-center px-6 py-3 rounded-full bg-blush text-white font-medium hover:bg-blush-dark transition-colors"
            >
              Захиалга баталгаажуулах
            </Link>
            <Link
              href="/products"
              className="mt-3 block text-center text-sm text-muted hover:text-blush"
            >
              ← Үргэлжлүүлэн дэлгүүр хэсэх
            </Link>
          </div>
        </div>
      </div>
    </div>
  );
}
