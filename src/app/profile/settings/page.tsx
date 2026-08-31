import Link from "next/link";
import { redirect } from "next/navigation";
import { auth } from "@/auth";
import { prisma } from "@/lib/prisma";
import { ProfileForm } from "@/components/account/ProfileForm";
import { PasswordForm } from "@/components/account/PasswordForm";

export default async function SettingsPage() {
  const session = await auth();
  if (!session?.user?.id) {
    redirect("/login?callbackUrl=/profile/settings");
  }

  const user = await prisma.user.findUnique({
    where: { id: session.user.id },
    select: { name: true, email: true, phone: true },
  });

  return (
    <div className="mx-auto max-w-2xl px-4 py-10">
      <Link
        href="/profile"
        className="text-sm text-blush hover:text-blush-dark font-medium"
      >
        ← Профайл руу буцах
      </Link>
      <h1 className="font-serif text-2xl font-bold mt-3 mb-8">
        Бүртгэлийн тохиргоо
      </h1>

      <div className="bg-surface border border-border rounded-2xl p-6 mb-6">
        <h2 className="font-semibold mb-1">Хувийн мэдээлэл</h2>
        <p className="text-sm text-muted mb-4">{user?.email}</p>
        <ProfileForm
          defaultName={user?.name ?? ""}
          defaultPhone={user?.phone ?? ""}
        />
      </div>

      <div className="bg-surface border border-border rounded-2xl p-6">
        <h2 className="font-semibold mb-4">Нууц үг солих</h2>
        <PasswordForm />
      </div>
    </div>
  );
}
