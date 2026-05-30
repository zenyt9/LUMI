"use client";

import { useState } from "react";
import { ShoppingBag, Check } from "lucide-react";
import { useCart, type CartItem } from "@/lib/store/cart";

type Props = {
  product: Omit<CartItem, "quantity">;
  quantity?: number;
  className?: string;
  full?: boolean;
};

export function AddToCartButton({ product, quantity = 1, className, full }: Props) {
  const add = useCart((s) => s.add);
  const [added, setAdded] = useState(false);

  function handleClick() {
    add(product, quantity);
    setAdded(true);
    setTimeout(() => setAdded(false), 1500);
  }

  return (
    <button
      onClick={handleClick}
      className={
        "inline-flex items-center justify-center gap-2 rounded-full font-medium transition-colors " +
        (full ? "w-full px-6 py-3 " : "px-4 py-2 text-sm ") +
        "bg-blush text-white hover:bg-blush-dark " +
        (className ?? "")
      }
    >
      {added ? (
        <>
          <Check className="w-4 h-4" /> Нэмэгдлээ
        </>
      ) : (
        <>
          <ShoppingBag className="w-4 h-4" /> Сагсанд нэмэх
        </>
      )}
    </button>
  );
}
