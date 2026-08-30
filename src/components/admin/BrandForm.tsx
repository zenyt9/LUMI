"use client";

import { useActionState, useEffect, useRef } from "react";
import { Plus } from "lucide-react";
import { createBrand, type BrandFormState } from "@/lib/actions/admin";

export function BrandForm() {
  const [state, formAction, pending] = useActionState<BrandFormState, FormData>(
    createBrand,
    undefined,
  );
  const formRef = useRef<HTMLFormElement>(null);

  // Амжилттай нэмсэн бол талбарыг цэвэрлэх
  useEffect(() => {
    if (state?.success) {
      formRef.current?.reset();
    }
  }, [state]);

  return (
    <form ref={formRef} action={formAction} className="flex flex-col gap-3">
      <div className="flex gap-2">
        <input
          name="name"
          placeholder="Брэндийн нэр (жишээ: The Ordinary)"
          required
          className="flex-1 px-4 py-2.5 rounded-xl border border-border bg-surface focus:outline-none focus:ring-2 focus:ring-blush/40"
        />
        <button
          type="submit"
          disabled={pending}
          className="inline-flex items-center gap-2 px-5 py-2.5 rounded-full bg-blush text-white text-sm font-medium hover:bg-blush-dark transition-colors disabled:opacity-60 whitespace-nowrap"
        >
          <Plus className="w-4 h-4" />
          {pending ? "Нэмж байна..." : "Нэмэх"}
        </button>
      </div>
      {state?.error && (
        <p className="text-sm text-red-300 bg-red-500/10 border border-red-500/30 rounded-lg p-3">
          {state.error}
        </p>
      )}
    </form>
  );
}
