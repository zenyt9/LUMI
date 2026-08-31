import { redirect } from "next/navigation";
import { auth } from "@/auth";
import { prisma } from "@/lib/prisma";
import { CheckoutForm } from "@/components/CheckoutForm";
import { getTier } from "@/lib/loyalty";

export default async function CheckoutPage() {
  const session = await auth();
  if (!session?.user?.id) {
    redirect("/login?callbackUrl=/checkout");
  }

  const dbUser = await prisma.user.findUnique({
    where: { id: session.user.id },
    select: { points: true, pointsBalance: true, phone: true },
  });
  const tier = getTier(dbUser?.points ?? 0);

  return (
    <div className="mx-auto max-w-5xl px-4 py-10">
      <h1 className="font-serif text-3xl font-bold mb-8">
        Захиалга баталгаажуулах
      </h1>
      <CheckoutForm
        defaultName={session.user.name ?? ""}
        defaultPhone={dbUser?.phone ?? ""}
        tier={tier}
        pointsBalance={dbUser?.pointsBalance ?? 0}
      />
    </div>
  );
}
