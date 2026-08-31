import Link from "next/link";
import { redirect } from "next/navigation";
import { auth } from "@/auth";
import { prisma } from "@/lib/prisma";
import { formatPrice } from "@/lib/utils";
import { StatusBadge } from "@/components/StatusBadge";
import {
  TIERS,
  getTier,
  getNextTier,
  tierProgress,
  pointsForAmount,
  POINT_VALUE,
} from "@/lib/loyalty";

export default async function ProfilePage() {
  const session = await auth();
  if (!session?.user?.id) {
    redirect("/login?callbackUrl=/profile");
  }

  const [user, orders] = await Promise.all([
    prisma.user.findUnique({
      where: { id: session.user.id },
      select: { name: true, email: true, points: true, pointsBalance: true },
    }),
    prisma.order.findMany({
      where: { userId: session.user.id },
      orderBy: { createdAt: "desc" },
      include: { _count: { select: { items: true } } },
    }),
  ]);

  const points = user?.points ?? 0;
  const pointsBalance = user?.pointsBalance ?? 0;
  const tier = getTier(points);
  const nextTier = getNextTier(points);
  const progress = tierProgress(points);
  const pointsToNext = nextTier ? nextTier.minPoints - points : 0;

  // Хүлээгдэж буй оноо (хүргэгдээгүй, цуцлагдаагүй захиалгуудаас)
  const pendingPoints = orders
    .filter((o) => o.status !== "DELIVERED" && o.status !== "CANCELLED")
    .reduce((s, o) => s + pointsForAmount(o.total), 0);

  const deliveredCount = orders.filter((o) => o.status === "DELIVERED").length;

  return (
    <div className="mx-auto max-w-4xl px-4 py-10">
      {/* Хэрэглэгчийн толгой */}
      <div className="flex items-center gap-4 mb-8">
        <div className="w-16 h-16 rounded-full bg-blush text-white flex items-center justify-center font-serif text-2xl font-bold">
          {(user?.name ?? "?").charAt(0).toUpperCase()}
        </div>
        <div>
          <h1 className="font-serif text-2xl font-bold">{user?.name}</h1>
          <p className="text-muted text-sm">{user?.email}</p>
        </div>
        <div className="ml-auto flex flex-col items-end gap-2">
          <span className="inline-flex items-center gap-1.5 px-3 py-1.5 rounded-full bg-blush-soft/50 border border-border text-sm font-medium">
            {tier.emoji} {tier.name} гишүүн
          </span>
          <div className="flex items-center gap-3 text-sm">
            <Link href="/wishlist" className="text-muted hover:text-blush">
              ♥ Дуртай
            </Link>
            <Link
              href="/profile/settings"
              className="text-muted hover:text-blush"
            >
              ⚙ Тохиргоо
            </Link>
          </div>
        </div>
      </div>

      {/* Урамшууллын карт */}
      <div className="bg-gradient-to-br from-blush-soft/60 via-surface to-surface border border-border rounded-2xl p-6 mb-6">
        <div className="flex flex-wrap items-start justify-between gap-4 mb-5">
          <div>
            <p className="text-sm text-muted mb-1">Зарцуулах боломжтой оноо</p>
            <p className="font-serif text-4xl font-bold text-blush-dark">
              {pointsBalance.toLocaleString("mn-MN")}{" "}
              <span className="text-lg text-muted">оноо</span>
            </p>
            <p className="text-xs text-muted mt-1">
              ≈ {formatPrice(pointsBalance * POINT_VALUE)} хямдрал ·{" "}
              <Link href="/checkout" className="text-blush hover:underline">
                захиалгад ашиглах
              </Link>
            </p>
            {pendingPoints > 0 && (
              <p className="text-xs text-muted mt-1">
                +{pendingPoints} оноо хүлээгдэж байна (хүргэгдэхэд нэмэгдэнэ)
              </p>
            )}
          </div>
          <div className="text-right">
            <div className="text-3xl">{tier.emoji}</div>
            <p className="font-semibold">{tier.name} түвшин</p>
          </div>
        </div>

        {/* Ахицын мөр */}
        {nextTier ? (
          <div>
            <div className="flex justify-between text-xs text-muted mb-1.5">
              <span>{tier.name}</span>
              <span>
                {nextTier.emoji} {nextTier.name} хүртэл {pointsToNext} оноо
              </span>
            </div>
            <div className="h-2.5 rounded-full bg-border overflow-hidden">
              <div
                className="h-full bg-blush rounded-full transition-all"
                style={{ width: `${progress}%` }}
              />
            </div>
          </div>
        ) : (
          <p className="text-sm text-blush font-medium">
            🎉 Та хамгийн дээд түвшинд хүрсэн байна!
          </p>
        )}

        {/* Одоогийн түвшний урамшуулал */}
        <div className="mt-5 pt-5 border-t border-border">
          <p className="text-sm font-medium mb-2">Таны эдлэх урамшуулал:</p>
          <ul className="space-y-1.5">
            {tier.perks.map((perk) => (
              <li key={perk} className="flex items-center gap-2 text-sm">
                <span className="text-green-400">✓</span>
                {perk}
              </li>
            ))}
          </ul>
        </div>
      </div>

      {/* Хураангуй тоонууд */}
      <div className="grid grid-cols-3 gap-3 mb-10">
        {[
          ["Нийт захиалга", orders.length.toString()],
          ["Хүргэгдсэн", deliveredCount.toString()],
          ["Цуглуулсан оноо", points.toLocaleString("mn-MN")],
        ].map(([label, value]) => (
          <div
            key={label}
            className="bg-surface border border-border rounded-2xl p-4 text-center"
          >
            <p className="font-serif text-2xl font-bold text-blush-dark">
              {value}
            </p>
            <p className="text-xs text-muted mt-1">{label}</p>
          </div>
        ))}
      </div>

      {/* Түвшингүүд */}
      <h2 className="font-semibold text-lg mb-4">Түвшингүүд ба урамшуулал</h2>
      <div className="grid sm:grid-cols-2 lg:grid-cols-4 gap-3 mb-10">
        {TIERS.map((t) => {
          const isCurrent = t.key === tier.key;
          const reached = points >= t.minPoints;
          return (
            <div
              key={t.key}
              className={
                "rounded-2xl border p-4 " +
                (isCurrent
                  ? "border-blush bg-blush-soft/40"
                  : "border-border bg-surface")
              }
            >
              <div className="flex items-center justify-between mb-2">
                <span className="text-2xl">{t.emoji}</span>
                {isCurrent && (
                  <span className="text-xs font-medium text-blush">
                    Таны түвшин
                  </span>
                )}
                {!isCurrent && reached && (
                  <span className="text-xs text-green-400">✓</span>
                )}
              </div>
              <p className="font-semibold">{t.name}</p>
              <p className="text-xs text-muted mb-2">{t.minPoints}+ оноо</p>
              <ul className="space-y-1">
                {t.perks.map((perk) => (
                  <li key={perk} className="text-xs text-muted leading-snug">
                    • {perk}
                  </li>
                ))}
              </ul>
            </div>
          );
        })}
      </div>
      <p className="text-xs text-muted -mt-6 mb-10">
        Захиалга хүргэгдэхэд төлсөн дүнгийн 1,000₮ тутамд 1 оноо цуглуулна.
      </p>

      {/* Захиалгууд */}
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
                  {order.status === "DELIVERED" && order.pointsEarned > 0 && (
                    <span className="text-blush"> · +{order.pointsEarned} оноо</span>
                  )}
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
