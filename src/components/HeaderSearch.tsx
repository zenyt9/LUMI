import { Search } from "lucide-react";

/** Толгойн хайлт — энгийн GET форм (/products?q=...). Client JS шаардахгүй. */
export function HeaderSearch({ className = "" }: { className?: string }) {
  return (
    <form action="/products" className={`relative ${className}`}>
      <Search className="absolute left-3 top-1/2 -translate-y-1/2 w-4 h-4 text-muted pointer-events-none" />
      <input
        name="q"
        type="search"
        placeholder="Бүтээгдэхүүн хайх..."
        aria-label="Бүтээгдэхүүн хайх"
        className="w-full pl-9 pr-3 py-2 rounded-full border border-border bg-surface text-sm focus:outline-none focus:ring-2 focus:ring-blush/40"
      />
    </form>
  );
}
