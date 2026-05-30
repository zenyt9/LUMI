import Link from "next/link";
import { prisma } from "@/lib/prisma";
import { formatPrice } from "@/lib/utils";
import { StatusBadge } from "@/components/StatusBadge";

export default async function AdminDashboard() {
  const [productCount, orderCount, userCount, paidOrders, recentOrders] =
    await Promise.all([
      prisma.product.count(),
      prisma.order.count(),
      prisma.user.count(),
      prisma.order.findMany({
        where: { status: { in: ["PAID", "SHIPPED", "DELIVERED"] } },
        select: { total: true },
      }),
      prisma.order.findMany({
        orderBy: { createdAt: "desc" },
        take: 5,
        include: { user: { select: { name: true } } },
      }),
    ]);

  const revenue = paidOrders.reduce((s, o) => s + o.total, 0);

  const stats = [
    ["Бүтээгдэхүүн", productCount, "🧴"],
    ["Захиалга", orderCount, "📦"],
    ["Хэрэглэгч", userCount, "👤"],
    ["Орлого", formatPrice(revenue), "💰"],
  ] as const;

  return (
    <div>
      <h1 className="font-serif text-2xl font-bold mb-6">Хяналтын самбар</h1>

      <div className="grid grid-cols-2 lg:grid-cols-4 gap-4 mb-10">
        {stats.map(([label, value, icon]) => (
          <div
            key={label}
            className="bg-surface border border-border rounded-2xl p-5"
          >
            <div className="text-2xl mb-2">{icon}</div>
            <div className="text-2xl font-bold font-serif">{value}</div>
            <div className="text-sm text-muted">{label}</div>
          </div>
        ))}
      </div>

      <div className="flex items-center justify-between mb-4">
        <h2 className="font-semibold text-lg">Сүүлийн захиалгууд</h2>
        <Link
          href="/admin/orders"
          className="text-sm text-blush hover:text-blush-dark"
        >
          Бүгдийг үзэх →
        </Link>
      </div>

      {recentOrders.length === 0 ? (
        <p className="text-muted text-sm">Захиалга алга байна.</p>
      ) : (
        <div className="bg-surface border border-border rounded-2xl divide-y divide-border">
          {recentOrders.map((o) => (
            <Link
              key={o.id}
              href={`/orders/${o.id}`}
              className="flex items-center justify-between p-4 hover:bg-blush-soft/30 transition-colors"
            >
              <div>
                <p className="font-medium text-sm">
                  #{o.id.slice(-6).toUpperCase()} · {o.user.name}
                </p>
                <p className="text-xs text-muted">
                  {new Date(o.createdAt).toLocaleDateString("mn-MN")}
                </p>
              </div>
              <div className="flex items-center gap-3">
                <span className="font-semibold text-sm">
                  {formatPrice(o.total)}
                </span>
                <StatusBadge status={o.status} />
              </div>
            </Link>
          ))}
        </div>
      )}
    </div>
  );
}
