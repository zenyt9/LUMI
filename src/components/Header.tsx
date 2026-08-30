import Link from "next/link";
import { User, LayoutDashboard } from "lucide-react";
import { auth } from "@/auth";
import { prisma } from "@/lib/prisma";
import { getTier } from "@/lib/loyalty";
import { CartBadge } from "./CartBadge";
import { CategoryMenu } from "./CategoryMenu";
import { BrandMenu } from "./BrandMenu";
import { MobileMenu } from "./MobileMenu";
import { logout } from "@/lib/actions/auth";

export async function Header() {
  const session = await auth();
  const user = session?.user;

  const [categories, brands, dbUser] = await Promise.all([
    prisma.category.findMany({
      orderBy: { name: "asc" },
      select: { id: true, name: true, slug: true },
    }),
    prisma.brand.findMany({
      orderBy: { name: "asc" },
      select: { id: true, name: true, slug: true },
    }),
    user?.id
      ? prisma.user.findUnique({
          where: { id: user.id },
          select: { points: true },
        })
      : null,
  ]);

  const tier = dbUser ? getTier(dbUser.points) : null;

  return (
    <header className="sticky top-0 z-40 bg-background/90 backdrop-blur border-b border-border">
      <div className="mx-auto max-w-6xl px-4 h-16 flex items-center justify-between gap-4">
        {/* Зүүн тал: лого + цэс */}
        <div className="flex items-center gap-8">
          {/* Лого */}
          <Link href="/" className="flex items-baseline gap-1">
            <span className="font-serif text-2xl font-bold tracking-wide text-foreground">
              LumiBeauty
            </span>
            <span className="text-blush text-lg">✦</span>
          </Link>

          {/* Цэс */}
          <nav className="hidden sm:flex items-center gap-7 text-sm font-medium">
            <Link href="/" className="hover:text-blush transition-colors">
              Нүүр
            </Link>
            <CategoryMenu categories={categories} />
            {brands.length > 0 && <BrandMenu brands={brands} />}
            <Link href="/products" className="hover:text-blush transition-colors">
              Бүтээгдэхүүн
            </Link>
          </nav>
        </div>

        {/* Баруун тал */}
        <div className="flex items-center gap-2">
          <CartBadge />

          {user ? (
            <div className="flex items-center gap-1">
              {tier && (
                <Link
                  href="/profile"
                  title={`${tier.name} түвшин · ${dbUser!.points} оноо`}
                  className="hidden sm:inline-flex items-center gap-1 px-2.5 py-1 rounded-full bg-blush-soft/50 border border-border text-xs font-medium hover:border-blush transition-colors"
                >
                  <span>{tier.emoji}</span>
                  <span>{dbUser!.points}</span>
                </Link>
              )}
              {user.role === "ADMIN" && (
                <Link
                  href="/admin"
                  className="p-2 text-foreground hover:text-blush transition-colors"
                  title="Админ"
                >
                  <LayoutDashboard className="w-5 h-5" strokeWidth={1.5} />
                </Link>
              )}
              <Link
                href="/profile"
                className="p-2 text-foreground hover:text-blush transition-colors"
                title="Профайл"
              >
                <User className="w-5 h-5" strokeWidth={1.5} />
              </Link>
              <form action={logout}>
                <button
                  type="submit"
                  className="text-sm text-muted hover:text-blush transition-colors px-2"
                >
                  Гарах
                </button>
              </form>
            </div>
          ) : (
            <Link
              href="/login"
              className="text-sm font-medium px-4 py-2 rounded-full bg-blush text-white hover:bg-blush-dark transition-colors"
            >
              Нэвтрэх
            </Link>
          )}

          {/* Гар утасны цэс */}
          <MobileMenu categories={categories} brands={brands} />
        </div>
      </div>
    </header>
  );
}
