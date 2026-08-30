import Link from "next/link";
import { prisma } from "@/lib/prisma";
import { formatPrice, cn, ORDER_STATUS_LABELS } from "@/lib/utils";
import { OrderStatusSelect } from "@/components/admin/OrderStatusSelect";

const STATUSES = ["PENDING", "PAID", "SHIPPED", "DELIVERED", "CANCELLED"];

export default async function AdminOrdersPage({
  searchParams,
}: {
  searchParams: Promise<{ status?: string }>;
}) {
  const { status } = await searchParams;
  const active = status && STATUSES.includes(status) ? status : undefined;

  const [orders, grouped, totalCount] = await Promise.all([
    prisma.order.findMany({
      where: active ? { status: active } : undefined,
      orderBy: { createdAt: "desc" },
      include: {
        user: { select: { name: true, email: true } },
        _count: { select: { items: true } },
      },
    }),
    prisma.order.groupBy({ by: ["status"], _count: { _all: true } }),
    prisma.order.count(),
  ]);

  const countFor = (s: string) =>
    grouped.find((g) => g.status === s)?._count._all ?? 0;

  return (
    <div>
      <h1 className="font-serif text-2xl font-bold mb-6">Захиалгууд</h1>

      {/* Төлвөөр шүүх */}
      <div className="flex flex-wrap gap-2 mb-6">
        <Link
          href="/admin/orders"
          className={cn(
            "px-4 py-1.5 rounded-full text-sm border transition-colors",
            !active
              ? "bg-blush text-white border-blush"
              : "bg-surface border-border hover:border-blush",
          )}
        >
          Бүгд ({totalCount})
        </Link>
        {STATUSES.map((s) => (
          <Link
            key={s}
            href={`/admin/orders?status=${s}`}
            className={cn(
              "px-4 py-1.5 rounded-full text-sm border transition-colors",
              active === s
                ? "bg-blush text-white border-blush"
                : "bg-surface border-border hover:border-blush",
            )}
          >
            {ORDER_STATUS_LABELS[s]} ({countFor(s)})
          </Link>
        ))}
      </div>

      {orders.length === 0 ? (
        <p className="text-muted">Энэ төлөвт захиалга алга байна.</p>
      ) : (
        <div className="space-y-3">
          {orders.map((o) => (
            <div
              key={o.id}
              className="bg-surface border border-border rounded-2xl p-4 flex flex-wrap items-center justify-between gap-4"
            >
              <div className="min-w-0">
                <Link
                  href={`/orders/${o.id}`}
                  className="font-medium hover:text-blush"
                >
                  #{o.id.slice(-6).toUpperCase()}
                </Link>
                <p className="text-sm text-muted">
                  {o.user.name} · {o.phone}
                </p>
                <p className="text-xs text-muted">
                  {new Date(o.createdAt).toLocaleString("mn-MN")} ·{" "}
                  {o._count.items} төрөл
                  {o.status === "DELIVERED" && o.pointsEarned > 0 && (
                    <span className="text-blush"> · +{o.pointsEarned} оноо</span>
                  )}
                </p>
              </div>

              <div className="flex items-center gap-4">
                <span className="font-semibold whitespace-nowrap">
                  {formatPrice(o.total)}
                </span>
                <OrderStatusSelect orderId={o.id} status={o.status} />
              </div>
            </div>
          ))}
        </div>
      )}
    </div>
  );
}
