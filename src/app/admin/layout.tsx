import Link from "next/link";
import { redirect } from "next/navigation";
import { LayoutDashboard, Package, ClipboardList, Tag } from "lucide-react";
import { auth } from "@/auth";

export default async function AdminLayout({
  children,
}: {
  children: React.ReactNode;
}) {
  const session = await auth();
  if (session?.user?.role !== "ADMIN") {
    redirect("/login?callbackUrl=/admin");
  }

  return (
    <div className="mx-auto max-w-6xl px-4 py-8">
      <div className="flex flex-col sm:flex-row gap-8">
        {/* Хажуугийн цэс */}
        <aside className="sm:w-56 shrink-0">
          <h2 className="font-serif text-xl font-bold mb-4">Админ</h2>
          <nav className="flex sm:flex-col gap-1">
            <AdminLink href="/admin" icon={<LayoutDashboard className="w-4 h-4" />}>
              Хяналтын самбар
            </AdminLink>
            <AdminLink href="/admin/products" icon={<Package className="w-4 h-4" />}>
              Бүтээгдэхүүн
            </AdminLink>
            <AdminLink href="/admin/brands" icon={<Tag className="w-4 h-4" />}>
              Брэнд
            </AdminLink>
            <AdminLink href="/admin/orders" icon={<ClipboardList className="w-4 h-4" />}>
              Захиалгууд
            </AdminLink>
          </nav>
        </aside>

        <div className="flex-1 min-w-0">{children}</div>
      </div>
    </div>
  );
}

function AdminLink({
  href,
  icon,
  children,
}: {
  href: string;
  icon: React.ReactNode;
  children: React.ReactNode;
}) {
  return (
    <Link
      href={href}
      className="flex items-center gap-2 px-3 py-2 rounded-lg text-sm font-medium hover:bg-blush-soft transition-colors"
    >
      {icon}
      {children}
    </Link>
  );
}
