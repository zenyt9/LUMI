"use client";

import { useTransition } from "react";
import { updateOrderStatus } from "@/lib/actions/admin";
import { ORDER_STATUS_LABELS } from "@/lib/utils";

const STATUSES = ["PENDING", "PAID", "SHIPPED", "DELIVERED", "CANCELLED"];

export function OrderStatusSelect({
  orderId,
  status,
}: {
  orderId: string;
  status: string;
}) {
  const [pending, startTransition] = useTransition();

  return (
    <select
      defaultValue={status}
      disabled={pending}
      onChange={(e) =>
        startTransition(() => updateOrderStatus(orderId, e.target.value))
      }
      className="px-3 py-1.5 rounded-full text-xs font-medium border border-border bg-surface focus:outline-none focus:ring-2 focus:ring-blush/40 disabled:opacity-60"
    >
      {STATUSES.map((s) => (
        <option key={s} value={s}>
          {ORDER_STATUS_LABELS[s]}
        </option>
      ))}
    </select>
  );
}
