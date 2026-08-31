"use client";

import { useActionState } from "react";
import { updateProfile, type AccountState } from "@/lib/actions/account";

export function ProfileForm({
  defaultName,
  defaultPhone,
}: {
  defaultName: string;
  defaultPhone: string;
}) {
  const [state, formAction, pending] = useActionState<AccountState, FormData>(
    updateProfile,
    undefined,
  );

  return (
    <form action={formAction} className="space-y-4">
      <label className="block">
        <span className="text-sm font-medium block mb-1.5">Нэр</span>
        <input
          name="name"
          defaultValue={defaultName}
          required
          className="w-full px-4 py-2.5 rounded-xl border border-border bg-background focus:outline-none focus:ring-2 focus:ring-blush/40"
        />
      </label>
      <label className="block">
        <span className="text-sm font-medium block mb-1.5">
          Утас <span className="text-muted font-normal">(заавал биш)</span>
        </span>
        <input
          name="phone"
          type="tel"
          defaultValue={defaultPhone}
          placeholder="99112233"
          className="w-full px-4 py-2.5 rounded-xl border border-border bg-background focus:outline-none focus:ring-2 focus:ring-blush/40"
        />
      </label>

      {state?.error && (
        <p className="text-sm text-red-300 bg-red-500/10 border border-red-500/30 rounded-lg p-3">
          {state.error}
        </p>
      )}
      {state?.success && (
        <p className="text-sm text-green-300 bg-green-500/10 border border-green-500/30 rounded-lg p-3">
          {state.success}
        </p>
      )}

      <button
        type="submit"
        disabled={pending}
        className="px-6 py-2.5 rounded-full bg-blush text-white font-medium hover:bg-blush-dark transition-colors disabled:opacity-60"
      >
        {pending ? "Хадгалж байна..." : "Хадгалах"}
      </button>
    </form>
  );
}
