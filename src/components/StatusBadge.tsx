import { ORDER_STATUS_LABELS } from "@/lib/utils";

const COLORS: Record<string, string> = {
  PENDING: "bg-amber-500/15 text-amber-300",
  PAID: "bg-blue-500/15 text-blue-300",
  SHIPPED: "bg-purple-500/15 text-purple-300",
  DELIVERED: "bg-green-500/15 text-green-300",
  CANCELLED: "bg-red-500/15 text-red-300",
};

export function StatusBadge({ status }: { status: string }) {
  return (
    <span
      className={`inline-block text-xs px-2.5 py-1 rounded-full font-medium ${COLORS[status] ?? "bg-gray-100 text-gray-700"}`}
    >
      {ORDER_STATUS_LABELS[status] ?? status}
    </span>
  );
}
