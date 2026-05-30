"use client";

import { Suspense, useActionState } from "react";
import { useSearchParams } from "next/navigation";
import Link from "next/link";
import { registerUser, type AuthFormState } from "@/lib/actions/auth";

export default function RegisterPage() {
  return (
    <Suspense>
      <RegisterForm />
    </Suspense>
  );
}

function RegisterForm() {
  const searchParams = useSearchParams();
  const callbackUrl = searchParams.get("callbackUrl") ?? "/";
  const [state, formAction, pending] = useActionState<AuthFormState, FormData>(
    registerUser,
    undefined,
  );

  return (
    <div className="mx-auto max-w-md px-4 py-16">
      <div className="text-center mb-8">
        <h1 className="font-serif text-3xl font-bold">Бүртгүүлэх</h1>
        <p className="text-muted mt-2">Lumi-д тавтай морил</p>
      </div>

      <form action={formAction} className="space-y-4">
        <input type="hidden" name="callbackUrl" value={callbackUrl} />
        <label className="block">
          <span className="text-sm font-medium block mb-1.5">Нэр</span>
          <input
            name="name"
            required
            placeholder="Таны нэр"
            className="w-full px-4 py-2.5 rounded-xl border border-border bg-surface focus:outline-none focus:ring-2 focus:ring-blush/40"
          />
        </label>
        <label className="block">
          <span className="text-sm font-medium block mb-1.5">Имэйл</span>
          <input
            name="email"
            type="email"
            required
            placeholder="name@example.com"
            className="w-full px-4 py-2.5 rounded-xl border border-border bg-surface focus:outline-none focus:ring-2 focus:ring-blush/40"
          />
        </label>
        <label className="block">
          <span className="text-sm font-medium block mb-1.5">Нууц үг</span>
          <input
            name="password"
            type="password"
            required
            minLength={6}
            placeholder="Дор хаяж 6 тэмдэгт"
            className="w-full px-4 py-2.5 rounded-xl border border-border bg-surface focus:outline-none focus:ring-2 focus:ring-blush/40"
          />
        </label>

        {state?.error && (
          <p className="text-sm text-red-300 bg-red-500/10 border border-red-500/30 rounded-lg p-3">
            {state.error}
          </p>
        )}

        <button
          type="submit"
          disabled={pending}
          className="w-full px-6 py-3 rounded-full bg-blush text-white font-medium hover:bg-blush-dark transition-colors disabled:opacity-60"
        >
          {pending ? "Бүртгэж байна..." : "Бүртгүүлэх"}
        </button>
      </form>

      <p className="text-center text-sm text-muted mt-6">
        Бүртгэлтэй юу?{" "}
        <Link href="/login" className="text-blush font-medium hover:underline">
          Нэвтрэх
        </Link>
      </p>
    </div>
  );
}
