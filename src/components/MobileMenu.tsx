"use client";

import { useState, useEffect } from "react";
import Link from "next/link";
import { Menu, X, ChevronDown } from "lucide-react";

type Category = { id: string; name: string; slug: string };
type Brand = { id: string; name: string; slug: string };

export function MobileMenu({
  categories,
  brands,
}: {
  categories: Category[];
  brands: Brand[];
}) {
  const [open, setOpen] = useState(false);
  const [catOpen, setCatOpen] = useState(false);
  const [brandOpen, setBrandOpen] = useState(false);

  // Меню нээлттэй үед арын гүйлтийг түгжих
  useEffect(() => {
    document.body.style.overflow = open ? "hidden" : "";
    return () => {
      document.body.style.overflow = "";
    };
  }, [open]);

  const close = () => setOpen(false);

  return (
    <div className="sm:hidden">
      <button
        onClick={() => setOpen((o) => !o)}
        aria-label="Цэс"
        aria-expanded={open}
        className="p-2 text-foreground hover:text-blush transition-colors"
      >
        {open ? (
          <X className="w-6 h-6" strokeWidth={1.5} />
        ) : (
          <Menu className="w-6 h-6" strokeWidth={1.5} />
        )}
      </button>

      {open && (
        <>
          {/* Бүрхүүл */}
          <div
            className="fixed inset-x-0 top-16 bottom-0 bg-black/50 z-40"
            onClick={close}
          />
          {/* Цэсний хавтан */}
          <div className="fixed top-16 inset-x-0 bg-background border-b border-border z-50 shadow-xl animate-fade-up">
            <nav className="flex flex-col p-4 gap-1 text-sm font-medium max-h-[calc(100vh-4rem)] overflow-y-auto">
              <Link
                href="/"
                onClick={close}
                className="py-3 px-3 rounded-xl hover:bg-blush-soft/40 hover:text-blush transition-colors"
              >
                Нүүр
              </Link>
              <Link
                href="/products"
                onClick={close}
                className="py-3 px-3 rounded-xl hover:bg-blush-soft/40 hover:text-blush transition-colors"
              >
                Бүх бараа
              </Link>

              {/* Ангилал (задардаг) */}
              <button
                onClick={() => setCatOpen((o) => !o)}
                className="flex items-center justify-between py-3 px-3 rounded-xl hover:bg-blush-soft/40 hover:text-blush transition-colors"
                aria-expanded={catOpen}
              >
                Ангилал
                <ChevronDown
                  className={`w-4 h-4 transition-transform ${catOpen ? "rotate-180" : ""}`}
                />
              </button>
              {catOpen && (
                <div className="flex flex-col pl-3 border-l border-border ml-3">
                  {categories.map((c) => (
                    <Link
                      key={c.id}
                      href={`/products?category=${c.slug}`}
                      onClick={close}
                      className="py-2.5 px-3 rounded-xl text-muted hover:text-blush hover:bg-blush-soft/40 transition-colors"
                    >
                      {c.name}
                    </Link>
                  ))}
                </div>
              )}

              {/* Брэнд (задардаг) — брэнд байгаа үед */}
              {brands.length > 0 && (
                <>
                  <button
                    onClick={() => setBrandOpen((o) => !o)}
                    className="flex items-center justify-between py-3 px-3 rounded-xl hover:bg-blush-soft/40 hover:text-blush transition-colors"
                    aria-expanded={brandOpen}
                  >
                    Брэнд
                    <ChevronDown
                      className={`w-4 h-4 transition-transform ${brandOpen ? "rotate-180" : ""}`}
                    />
                  </button>
                  {brandOpen && (
                    <div className="flex flex-col pl-3 border-l border-border ml-3">
                      {brands.map((b) => (
                        <Link
                          key={b.id}
                          href={`/products?brand=${b.slug}`}
                          onClick={close}
                          className="py-2.5 px-3 rounded-xl text-muted hover:text-blush hover:bg-blush-soft/40 transition-colors"
                        >
                          {b.name}
                        </Link>
                      ))}
                    </div>
                  )}
                </>
              )}
            </nav>
          </div>
        </>
      )}
    </div>
  );
}
