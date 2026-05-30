"use client";

import { useRouter } from "next/navigation";
import { useState } from "react";
import { Search } from "lucide-react";
import { cn } from "@/lib/utils";

type Category = { id: string; name: string; slug: string };

type Props = {
  categories: Category[];
  current: { q?: string; category?: string; sort?: string };
};

export function ProductFilters({ categories, current }: Props) {
  const router = useRouter();
  const [q, setQ] = useState(current.q ?? "");

  function buildUrl(next: Partial<Props["current"]>) {
    const params = new URLSearchParams();
    const merged = { ...current, ...next };
    if (merged.q) params.set("q", merged.q);
    if (merged.category) params.set("category", merged.category);
    if (merged.sort) params.set("sort", merged.sort);
    const qs = params.toString();
    return qs ? `/products?${qs}` : "/products";
  }

  return (
    <div className="space-y-4">
      {/* Хайлт */}
      <form
        onSubmit={(e) => {
          e.preventDefault();
          router.push(buildUrl({ q }));
        }}
        className="relative max-w-md"
      >
        <Search className="absolute left-3 top-1/2 -translate-y-1/2 w-4 h-4 text-muted" />
        <input
          value={q}
          onChange={(e) => setQ(e.target.value)}
          placeholder="Бүтээгдэхүүн хайх..."
          className="w-full pl-10 pr-4 py-2.5 rounded-full border border-border bg-surface focus:outline-none focus:ring-2 focus:ring-blush/40"
        />
      </form>

      <div className="flex flex-wrap items-center gap-2 justify-between">
        {/* Ангилал шүүлт */}
        <div className="flex flex-wrap gap-2">
          <button
            onClick={() => router.push(buildUrl({ category: undefined }))}
            className={cn(
              "px-4 py-1.5 rounded-full text-sm border transition-colors",
              !current.category
                ? "bg-blush text-white border-blush"
                : "bg-surface border-border hover:border-blush",
            )}
          >
            Бүгд
          </button>
          {categories.map((c) => (
            <button
              key={c.id}
              onClick={() => router.push(buildUrl({ category: c.slug }))}
              className={cn(
                "px-4 py-1.5 rounded-full text-sm border transition-colors",
                current.category === c.slug
                  ? "bg-blush text-white border-blush"
                  : "bg-surface border-border hover:border-blush",
              )}
            >
              {c.name}
            </button>
          ))}
        </div>

        {/* Эрэмбэлэлт */}
        <select
          value={current.sort ?? ""}
          onChange={(e) => router.push(buildUrl({ sort: e.target.value || undefined }))}
          className="px-4 py-1.5 rounded-full text-sm border border-border bg-surface focus:outline-none focus:ring-2 focus:ring-blush/40"
        >
          <option value="">Шинэ нь эхэнд</option>
          <option value="price-asc">Үнэ: бага → их</option>
          <option value="price-desc">Үнэ: их → бага</option>
          <option value="name">Нэрээр (А-Я)</option>
        </select>
      </div>
    </div>
  );
}
