import Link from "next/link";
import { redirect } from "next/navigation";
import { auth } from "@/auth";
import { prisma } from "@/lib/prisma";
import { formatPrice } from "@/lib/utils";
import { StatusBadge } from "@/components/StatusBadge";

export default async function ProfilePage() {
  const session = await auth();
  if (!session?.user?.id) {
    redirect("/login?callbackUrl=/profile");
  }

  const orders = await prisma.order.findMany({
    where: { userId: session.user.id },
    orderBy: { createdAt: "desc" },
    include: { _count: { select: { items: true } } },
  });

  return (
    <div className="mx-auto max-w-4xl px-4 py-10">
      <div className="flex items-center gap-4 mb-10">
        <div className="w-16 h-16 rounded-full bg-blush text-white flex items-center justify-center font-serif text-2xl font-bold">
          {(session.user.name ?? "?").charAt(0).toUpperCase()}
        </div>
        <div>
          <h1 className="font-serif text-2xl font-bold">{session.user.name}</h1>
          <p className="text-muted text-sm">{session.user.email}</p>
        </div>
      </div>

      <h2 className="font-semibold text-lg mb-4">Миний захиалгууд</h2>

      {orders.length === 0 ? (
        <div className="text-center py-16 bg-blush-soft/30 rounded-2xl">
          <p className="text-muted mb-4">Та одоогоор захиалга хийгээгүй байна.</p>
          <Link
            href="/products"
            className="text-blush font-medium hover:text-blush-dark"
          >
            Дэлгүүр хэсэх →
          </Link>
        </div>
      ) : (
        <div className="space-y-3">
          {orders.map((order) => (
            <Link
              key={order.id}
              href={`/orders/${order.id}`}
              className="flex items-center justify-between bg-surface border border-border rounded-2xl p-5 hover:border-blush transition-colors"
            >
              <div>
                <p className="font-medium">
                  Захиалга #{order.id.slice(-6).toUpperCase()}
                </p>
                <p className="text-sm text-muted">
                  {new Date(order.createdAt).toLocaleDateString("mn-MN")} ·{" "}
                  {order._count.items} төрлийн бараа
                </p>
              </div>
              <div className="text-right">
                <p className="font-semibold text-blush-dark">
                  {formatPrice(order.total)}
                </p>
                <div className="mt-1">
                  <StatusBadge status={order.status} />
                </div>
              </div>
            </Link>
          ))}
        </div>
      )}
    </div>
  );
}
