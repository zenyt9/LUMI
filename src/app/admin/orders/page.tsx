import Link from "next/link";
import { prisma } from "@/lib/prisma";
import { formatPrice } from "@/lib/utils";
import { OrderStatusSelect } from "@/components/admin/OrderStatusSelect";

export default async function AdminOrdersPage() {
  const orders = await prisma.order.findMany({
    orderBy: { createdAt: "desc" },
    include: {
      user: { select: { name: true, email: true } },
      _count: { select: { items: true } },
    },
  });

  return (
    <div>
      <h1 className="font-serif text-2xl font-bold mb-6">Захиалгууд</h1>

      {orders.length === 0 ? (
        <p className="text-muted">Захиалга алга байна.</p>
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
