"use client";

import { ShoppingBag } from "lucide-react";
import Link from "next/link";
import { useEffect, useState } from "react";
import { useCart } from "@/lib/store/cart";

export function CartBadge() {
  const count = useCart((s) => s.items.reduce((a, i) => a + i.quantity, 0));
  // Hydration зөрчлөөс сэргийлж эхний рендэрт тоог нуух
  const [mounted, setMounted] = useState(false);
  useEffect(() => setMounted(true), []);

  return (
    <Link
      href="/cart"
      className="relative p-2 text-foreground hover:text-blush transition-colors"
      aria-label="Сагс"
    >
      <ShoppingBag className="w-6 h-6" strokeWidth={1.5} />
      {mounted && count > 0 && (
        <span className="absolute -top-0.5 -right-0.5 bg-blush text-white text-[11px] font-semibold w-5 h-5 rounded-full flex items-center justify-center">
          {count}
        </span>
      )}
    </Link>
  );
}
