import { redirect } from "next/navigation";
import { auth } from "@/auth";
import { CheckoutForm } from "@/components/CheckoutForm";

export default async function CheckoutPage() {
  const session = await auth();
  if (!session?.user) {
    redirect("/login?callbackUrl=/checkout");
  }

  return (
    <div className="mx-auto max-w-5xl px-4 py-10">
      <h1 className="font-serif text-3xl font-bold mb-8">
        Захиалга баталгаажуулах
      </h1>
      <CheckoutForm defaultName={session.user.name ?? ""} />
    </div>
  );
}
