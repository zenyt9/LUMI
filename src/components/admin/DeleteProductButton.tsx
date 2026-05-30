"use client";

import { useState, useTransition } from "react";
import { Trash2 } from "lucide-react";
import { deleteProduct } from "@/lib/actions/admin";

export function DeleteProductButton({ id, name }: { id: string; name: string }) {
  const [confirming, setConfirming] = useState(false);
  const [pending, startTransition] = useTransition();

  if (confirming) {
    return (
      <span className="flex items-center gap-2 text-sm">
        <button
          onClick={() => startTransition(() => deleteProduct(id))}
          disabled={pending}
          className="text-red-500 font-medium hover:underline disabled:opacity-60"
        >
          {pending ? "..." : "Тийм"}
        </button>
        <button
          onClick={() => setConfirming(false)}
          className="text-muted hover:underline"
        >
          Үгүй
        </button>
      </span>
    );
  }

  return (
    <button
      onClick={() => setConfirming(true)}
      title={`"${name}" устгах`}
      className="text-muted hover:text-red-500 transition-colors"
    >
      <Trash2 className="w-4 h-4" />
    </button>
  );
}
