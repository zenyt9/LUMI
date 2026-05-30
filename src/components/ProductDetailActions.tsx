"use client";

import { useState } from "react";
import { Minus, Plus } from "lucide-react";
import { AddToCartButton } from "./AddToCartButton";
import type { CartItem } from "@/lib/store/cart";

type Props = {
  product: Omit<CartItem, "quantity">;
  maxStock: number;
};

export function ProductDetailActions({ product, maxStock }: Props) {
  const [qty, setQty] = useState(1);

  return (
    <div className="flex flex-wrap items-center gap-4">
      <div className="flex items-center border border-border rounded-full overflow-hidden">
        <button
          onClick={() => setQty((q) => Math.max(1, q - 1))}
          className="p-3 hover:bg-blush-soft transition-colors"
          aria-label="Хасах"
        >
          <Minus className="w-4 h-4" />
        </button>
        <span className="w-10 text-center font-medium">{qty}</span>
        <button
          onClick={() => setQty((q) => Math.min(maxStock, q + 1))}
          className="p-3 hover:bg-blush-soft transition-colors"
          aria-label="Нэмэх"
        >
          <Plus className="w-4 h-4" />
        </button>
      </div>

      <AddToCartButton product={product} quantity={qty} />
    </div>
  );
}
