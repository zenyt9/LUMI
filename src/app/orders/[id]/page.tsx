import Image from "next/image";
import Link from "next/link";
import { notFound, redirect } from "next/navigation";
import { CheckCircle2 } from "lucide-react";
import { auth } from "@/auth";
import { prisma } from "@/lib/prisma";
import { formatPrice } from "@/lib/utils";
import { StatusBadge } from "@/components/StatusBadge";

export default async function OrderDetailPage({
  params,
  searchParams,
}: {
  params: Promise<{ id: string }>;
  searchParams: Promise<{ success?: string }>;
}) {
  const session = await auth();
  if (!session?.user?.id) {
    redirect("/login");
  }

  const { id } = await params;
  const { success } = await searchParams;

  const order = await prisma.order.findUnique({
    where: { id },
    include: { items: { include: { product: true } } },
  });

  if (!order) notFound();

  // Зөвхөн эзэн нь эсвэл админ үзэх боломжтой
  if (order.userId !== session.user.id && session.user.role !== "ADMIN") {
    redirect("/profile");
  }

  const itemsTotal = order.items.reduce((s, i) => s + i.price * i.quantity, 0);

  return (
    <div className="mx-auto max-w-3xl px-4 py-10">
      {success && (
        <div className="flex items-center gap-3 bg-green-500/10 border border-green-500/30 text-green-300 rounded-2xl p-5 mb-8 animate-fade-up">
          <CheckCircle2 className="w-8 h-8 shrink-0" />
          <div>
            <p className="font-semibold">Захиалга амжилттай!</p>
            <p className="text-sm">
              Хүргэлтийн ажилтан барааг авчрахдаа төлбөрийг тань дээр газар дээр
              нь авна. Бид тантай удахгүй холбогдоно. Баярлалаа 💕
            </p>
          </div>
        </div>
      )}

      <div className="flex items-center justify-between mb-6">
        <div>
          <h1 className="font-serif text-2xl font-bold">
            Захиалга #{order.id.slice(-6).toUpperCase()}
          </h1>
          <p className="text-muted text-sm">
            {new Date(order.createdAt).toLocaleString("mn-MN")}
          </p>
        </div>
        <StatusBadge status={order.status} />
      </div>

      {/* Бараанууд */}
      <div className="bg-surface border border-border rounded-2xl divide-y divide-border mb-6">
        {order.items.map((item) => (
          <div key={item.id} className="flex gap-4 p-4 items-center">
            <div className="relative w-16 h-16 rounded-xl overflow-hidden bg-blush-soft/40 shrink-0">
              <Image
                src={item.product.image}
                alt={item.name}
                fill
                sizes="64px"
                className="object-cover"
              />
            </div>
            <div className="flex-1 min-w-0">
              <Link
                href={`/products/${item.product.slug}`}
                className="font-medium hover:text-blush line-clamp-1"
              >
                {item.name}
              </Link>
              <p className="text-sm text-muted">
                {item.quantity} × {formatPrice(item.price)}
              </p>
            </div>
            <div className="font-semibold whitespace-nowrap">
              {formatPrice(item.price * item.quantity)}
            </div>
          </div>
        ))}
      </div>

      <div className="grid sm:grid-cols-2 gap-6">
        {/* Хүргэлт */}
        <div className="bg-blush-soft/30 rounded-2xl p-5 text-sm">
          <h3 className="font-semibold mb-3">Хүргэлтийн мэдээлэл</h3>
          <p className="mb-1">
            <span className="text-muted">Хүлээн авагч: </span>
            {order.fullName}
          </p>
          <p className="mb-1">
            <span className="text-muted">Утас: </span>
            {order.phone}
          </p>
          <p className="mb-1">
            <span className="text-muted">Хаяг: </span>
            {order.address}
          </p>
          {order.note && (
            <p>
              <span className="text-muted">Тэмдэглэл: </span>
              {order.note}
            </p>
          )}
        </div>

        {/* Дүн */}
        <div className="bg-blush-soft/30 rounded-2xl p-5 text-sm">
          <h3 className="font-semibold mb-3">Төлбөрийн дүн</h3>
          <div className="flex justify-between mb-1">
            <span className="text-muted">Барааны дүн</span>
            <span>{formatPrice(itemsTotal)}</span>
          </div>
          {order.discount > 0 && (
            <div className="flex justify-between mb-1 text-green-400">
              <span>Түвшингийн хөнгөлөлт</span>
              <span>−{formatPrice(order.discount)}</span>
            </div>
          )}
          <div className="flex justify-between mb-1">
            <span className="text-muted">Хүргэлт</span>
            <span>
              {order.shipping <= 0 ? "Үнэгүй" : formatPrice(order.shipping)}
            </span>
          </div>
          <div className="border-t border-border mt-2 pt-2 flex justify-between font-semibold text-base">
            <span>Нийт</span>
            <span className="text-blush-dark">{formatPrice(order.total)}</span>
          </div>
          <div className="border-t border-border mt-2 pt-2 flex justify-between">
            <span className="text-muted">Төлбөрийн нөхцөл</span>
            <span className="text-right">💵 Хүргэлтийн үед бэлнээр</span>
          </div>
          {order.status === "DELIVERED" ? (
            <p className="text-xs text-green-300 mt-1">
              ✔ Хүргэгдсэн — төлбөр хүлээн авсан
              {order.pointsEarned > 0 && ` · +${order.pointsEarned} оноо`}
            </p>
          ) : (
            <p className="text-xs text-muted mt-1">
              Барааг хүлээн авахдаа хүргэлтийн ажилтанд төлнө
            </p>
          )}
        </div>
      </div>

      <div className="mt-8">
        <Link href="/profile" className="text-blush hover:text-blush-dark font-medium">
          ← Захиалгууд руу буцах
        </Link>
      </div>
    </div>
  );
}
