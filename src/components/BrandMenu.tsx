"use client";

import { useState, useRef, useEffect } from "react";
import Link from "next/link";
import { ChevronDown } from "lucide-react";

type Brand = { id: string; name: string; slug: string };

export function BrandMenu({ brands }: { brands: Brand[] }) {
  const [open, setOpen] = useState(false);
  const ref = useRef<HTMLDivElement>(null);

  useEffect(() => {
    function onClick(e: MouseEvent) {
      if (ref.current && !ref.current.contains(e.target as Node)) {
        setOpen(false);
      }
    }
    document.addEventListener("mousedown", onClick);
    return () => document.removeEventListener("mousedown", onClick);
  }, []);

  return (
    <div
      ref={ref}
      className="relative"
      onMouseEnter={() => setOpen(true)}
      onMouseLeave={() => setOpen(false)}
    >
      <button
        onClick={() => setOpen((o) => !o)}
        className="flex items-center gap-1 hover:text-blush transition-colors"
        aria-expanded={open}
      >
        Брэнд
        <ChevronDown
          className={`w-4 h-4 transition-transform ${open ? "rotate-180" : ""}`}
        />
      </button>

      {open && (
        <div className="absolute left-0 top-full pt-3 w-56 z-50">
          <div className="bg-surface border border-border rounded-2xl shadow-xl overflow-hidden py-1.5 max-h-80 overflow-y-auto">
            {brands.map((b) => (
              <Link
                key={b.id}
                href={`/products?brand=${b.slug}`}
                onClick={() => setOpen(false)}
                className="block px-4 py-2.5 text-sm hover:bg-blush-soft/40 hover:text-blush transition-colors"
              >
                {b.name}
              </Link>
            ))}
          </div>
        </div>
      )}
    </div>
  );
}
