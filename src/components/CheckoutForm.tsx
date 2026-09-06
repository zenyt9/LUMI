"use client";

import { useEffect, useState } from "react";
import { useRouter } from "next/navigation";
import Image from "next/image";
import { useCart } from "@/lib/store/cart";
import { formatPrice } from "@/lib/utils";
import { createOrder } from "@/lib/actions/order";
import { computePricing, pointsForAmount, type Tier } from "@/lib/loyalty";

export function CheckoutForm({
  defaultName,
  defaultPhone = "",
  tier,
}: {
  defaultName: string;
  defaultPhone?: string;
  tier: Tier;
}) {
  const router = useRouter();
  const { items, totalPrice, clear } = useCart();
  const [mounted, setMounted] = useState(false);
  const [error, setError] = useState<string | null>(null);
  const [loading, setLoading] = useState(false);

  useEffect(() => setMounted(true), []);

  if (mounted && items.length === 0) {
    return (
      <div className="text-center py-20 text-muted">
        <p className="mb-4">Сагс хоосон байна.</p>
        <button
          onClick={() => router.push("/products")}
          className="text-blush hover:text-blush-dark font-medium"
        >
          Дэлгүүр хэсэх →
        </button>
      </div>
    );
  }

  const subtotal = totalPrice();
  const pricing = computePricing(subtotal, tier);
  const earnPoints = pointsForAmount(pricing.total);

  async function handleSubmit(e: React.FormEvent<HTMLFormElement>) {
    e.preventDefault();
    setError(null);
    setLoading(true);

    const formData = new FormData(e.currentTarget);
    const result = await createOrder({
      fullName: String(formData.get("fullName") ?? ""),
      phone: String(formData.get("phone") ?? ""),
      address: String(formData.get("address") ?? ""),
      note: String(formData.get("note") ?? ""),
      items: items.map((i) => ({ productId: i.id, quantity: i.quantity })),
    });

    setLoading(false);

    if (result.ok) {
      clear();
      router.push(`/orders/${result.orderId}?success=1`);
    } else {
      setError(result.error);
    }
  }

  return (
    <div className="grid lg:grid-cols-3 gap-8">
      {/* Хүргэлтийн мэдээлэл */}
      <form onSubmit={handleSubmit} className="lg:col-span-2 space-y-4">
        <h2 className="font-semibold text-lg">Хүргэлтийн мэдээлэл</h2>

        <Field label="Хүлээн авагчийн нэр" name="fullName" defaultValue={defaultName} placeholder="Овог нэр" />
        <Field label="Утасны дугаар" name="phone" type="tel" placeholder="99112233" defaultValue={defaultPhone} />
        <Field label="Хүргэлтийн хаяг" name="address" placeholder="Дүүрэг, хороо, байр, тоот" textarea />
        <Field label="Нэмэлт тэмдэглэл (заавал биш)" name="note" placeholder="Жишээ: ажлын цагаар залгаарай" textarea required={false} />

        {/* Төлбөрийн нөхцөл — хүргэлтийн үед бэлнээр */}
        <div className="flex items-start gap-3 bg-blush-soft/40 border border-border rounded-xl p-4">
          <span className="text-xl leading-none">💵</span>
          <div className="text-sm">
            <p className="font-medium">Хүргэлтийн үед бэлнээр төлөх</p>
            <p className="text-muted mt-0.5">
              Захиалгаа баталгаажуулсны дараа хүргэлтийн ажилтан барааг авчирч,
              тооцоог тань дээр газар дээр нь хийнэ.
            </p>
          </div>
        </div>

        {error && (
          <p className="text-sm text-red-300 bg-red-500/10 border border-red-500/30 rounded-lg p-3">{error}</p>
        )}

        <button
          type="submit"
          disabled={loading}
          className="w-full sm:w-auto px-8 py-3 rounded-full bg-blush text-white font-medium hover:bg-blush-dark transition-colors disabled:opacity-60"
        >
          {loading ? "Илгээж байна..." : "Захиалга баталгаажуулах"}
        </button>
        <p className="text-xs text-muted">
          Захиалга өгснөөр та хүргэлтийн үед бэлнээр төлөхийг зөвшөөрч байна.
        </p>
      </form>

      {/* Дүн */}
      <div className="lg:col-span-1">
        <div className="bg-blush-soft/40 border border-border rounded-2xl p-6">
          <h2 className="font-semibold text-lg mb-4">Таны захиалга</h2>
          {mounted && (
            <div className="space-y-3 mb-4">
              {items.map((i) => (
                <div key={i.id} className="flex gap-3 items-center">
                  <div className="relative w-12 h-12 rounded-lg overflow-hidden bg-surface shrink-0">
                    <Image src={i.image} alt={i.name} fill sizes="48px" className="object-cover" />
                  </div>
                  <div className="flex-1 min-w-0 text-sm">
                    <p className="line-clamp-1">{i.name}</p>
                    <p className="text-muted">
                      {i.quantity} × {formatPrice(i.price)}
                    </p>
                  </div>
                </div>
              ))}
            </div>
          )}
          <div className="border-t border-border pt-3 space-y-1 text-sm">
            <div className="flex justify-between">
              <span className="text-muted">Барааны дүн</span>
              <span>{formatPrice(subtotal)}</span>
            </div>
            {pricing.discount > 0 && (
              <div className="flex justify-between text-green-400">
                <span>
                  {tier.emoji} {tier.name} хөнгөлөлт (
                  {Math.round(tier.discountRate * 100)}%)
                </span>
                <span>−{formatPrice(pricing.discount)}</span>
              </div>
            )}
            <div className="flex justify-between">
              <span className="text-muted">Хүргэлт</span>
              <span>
                {pricing.shipping === 0 ? "Үнэгүй" : formatPrice(pricing.shipping)}
              </span>
            </div>
            <div className="flex justify-between font-semibold text-base pt-2">
              <span>Нийт</span>
              <span className="text-blush-dark">
                {formatPrice(pricing.total)}
              </span>
            </div>
            {earnPoints > 0 && (
              <div className="flex items-center gap-1.5 text-xs text-blush pt-2 mt-1 border-t border-border">
                <span>✦</span>
                <span>
                  Энэ захиалгаар{" "}
                  <span className="font-semibold">{earnPoints} оноо</span>{" "}
                  цуглуулна (хүргэгдсэний дараа)
                </span>
              </div>
            )}
          </div>
        </div>
      </div>
    </div>
  );
}

function Field({
  label,
  name,
  type = "text",
  placeholder,
  defaultValue,
  textarea,
  required = true,
}: {
  label: string;
  name: string;
  type?: string;
  placeholder?: string;
  defaultValue?: string;
  textarea?: boolean;
  required?: boolean;
}) {
  return (
    <label className="block">
      <span className="text-sm font-medium block mb-1.5">{label}</span>
      {textarea ? (
        <textarea
          name={name}
          placeholder={placeholder}
          required={required}
          rows={3}
          className="w-full px-4 py-2.5 rounded-xl border border-border bg-surface focus:outline-none focus:ring-2 focus:ring-blush/40 resize-none"
        />
      ) : (
        <input
          name={name}
          type={type}
          placeholder={placeholder}
          defaultValue={defaultValue}
          required={required}
          className="w-full px-4 py-2.5 rounded-xl border border-border bg-surface focus:outline-none focus:ring-2 focus:ring-blush/40"
        />
      )}
    </label>
  );
}
