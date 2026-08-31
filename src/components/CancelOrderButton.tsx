"use client";

import { useState, useTransition } from "react";
import { useRouter } from "next/navigation";
import { cancelOwnOrder } from "@/lib/actions/order";

export function CancelOrderButton({ orderId }: { orderId: string }) {
  const router = useRouter();
  const [confirming, setConfirming] = useState(false);
  const [error, setError] = useState<string | null>(null);
  const [pending, startTransition] = useTransition();

  if (confirming) {
    return (
      <div className="flex flex-col gap-2">
        <p className="text-sm">Захиалгаа цуцлахдаа итгэлтэй байна уу?</p>
        <div className="flex items-center gap-3">
          <button
            onClick={() =>
              startTransition(async () => {
                const res = await cancelOwnOrder(orderId);
                if (res.ok) {
                  router.refresh();
                } else {
                  setError(res.error ?? "Алдаа гарлаа");
                  setConfirming(false);
                }
              })
            }
            disabled={pending}
            className="px-4 py-2 rounded-full bg-red-500/90 text-white text-sm font-medium hover:bg-red-500 transition-colors disabled:opacity-60"
          >
            {pending ? "Цуцалж байна..." : "Тийм, цуцлах"}
          </button>
          <button
            onClick={() => setConfirming(false)}
            className="text-sm text-muted hover:text-foreground"
          >
            Болих
          </button>
        </div>
      </div>
    );
  }

  return (
    <div>
      <button
        onClick={() => setConfirming(true)}
        className="text-sm text-red-400 hover:text-red-500 font-medium"
      >
        Захиалга цуцлах
      </button>
      {error && <p className="text-xs text-red-400 mt-1">{error}</p>}
    </div>
  );
}
