"use server";

import { z } from "zod";
import { revalidatePath } from "next/cache";
import { prisma } from "@/lib/prisma";
import { auth } from "@/auth";
import { getTier, computePricing } from "@/lib/loyalty";

const checkoutSchema = z.object({
  fullName: z.string().min(2, "Нэрээ оруулна уу"),
  phone: z
    .string()
    .regex(/^\d{8}$/, "Утасны дугаар 8 оронтой байх ёстой"),
  address: z.string().min(5, "Хүргэлтийн хаягаа дэлгэрэнгүй оруулна уу"),
  note: z.string().optional(),
  pointsToRedeem: z.number().int().min(0).optional(),
  items: z
    .array(
      z.object({
        productId: z.string(),
        quantity: z.number().int().positive(),
      }),
    )
    .min(1, "Сагс хоосон байна"),
});

export type CheckoutInput = z.infer<typeof checkoutSchema>;

type CreateOrderResult =
  | { ok: true; orderId: string }
  | { ok: false; error: string };

export async function createOrder(
  input: CheckoutInput,
): Promise<CreateOrderResult> {
  const session = await auth();
  if (!session?.user?.id) {
    return { ok: false, error: "Захиалга хийхийн тулд нэвтэрнэ үү" };
  }

  const parsed = checkoutSchema.safeParse(input);
  if (!parsed.success) {
    return { ok: false, error: parsed.error.issues[0].message };
  }
  const { fullName, phone, address, note, items, pointsToRedeem } = parsed.data;

  // Барааг өгөгдлийн сангаас дахин уншиж үнэ/үлдэгдлийг баталгаажуулна
  const products = await prisma.product.findMany({
    where: { id: { in: items.map((i) => i.productId) } },
  });

  const orderItems: {
    productId: string;
    name: string;
    price: number;
    quantity: number;
  }[] = [];
  let subtotal = 0;

  for (const item of items) {
    const product = products.find((p) => p.id === item.productId);
    if (!product) {
      return { ok: false, error: "Зарим бараа олдсонгүй" };
    }
    if (product.stock < item.quantity) {
      return {
        ok: false,
        error: `"${product.name}" хүрэлцэхгүй байна (үлдэгдэл: ${product.stock})`,
      };
    }
    subtotal += product.price * item.quantity;
    orderItems.push({
      productId: product.id,
      name: product.name,
      price: product.price,
      quantity: item.quantity,
    });
  }

  // Хэрэглэгчийн түвшин + зарцуулах оноог сервер талд баталгаажуулан тооцно
  const dbUser = await prisma.user.findUnique({
    where: { id: session.user.id },
    select: { points: true, pointsBalance: true },
  });
  const tier = getTier(dbUser?.points ?? 0);
  const balance = dbUser?.pointsBalance ?? 0;
  const pricing = computePricing(subtotal, tier, pointsToRedeem ?? 0, balance);

  // Захиалга үүсгэх + үлдэгдэл хорогдуулах + оноо зарцуулах (нэг гүйлгээнд)
  const order = await prisma.$transaction(async (tx) => {
    const created = await tx.order.create({
      data: {
        userId: session.user.id,
        status: "PENDING",
        total: pricing.total,
        discount: pricing.discount,
        pointsRedeemed: pricing.pointsRedeemed,
        pointsDiscount: pricing.pointsDiscount,
        shipping: pricing.shipping,
        fullName,
        phone,
        address,
        note: note || null,
        items: { create: orderItems },
      },
    });

    for (const item of orderItems) {
      await tx.product.update({
        where: { id: item.productId },
        data: { stock: { decrement: item.quantity } },
      });
    }

    // Зарцуулсан оноог үлдэгдлээс хасна
    if (pricing.pointsRedeemed > 0) {
      await tx.user.update({
        where: { id: session.user.id },
        data: { pointsBalance: { decrement: pricing.pointsRedeemed } },
      });
    }

    return created;
  });

  return { ok: true, orderId: order.id };
}

/** Хэрэглэгч зөвхөн "Хүлээгдэж буй" захиалгаа цуцална (үлдэгдэл сэргэнэ) */
export async function cancelOwnOrder(
  orderId: string,
): Promise<{ ok: boolean; error?: string }> {
  const session = await auth();
  if (!session?.user?.id) return { ok: false, error: "Нэвтэрнэ үү" };

  const order = await prisma.order.findUnique({
    where: { id: orderId },
    select: {
      userId: true,
      status: true,
      pointsRedeemed: true,
      items: { select: { productId: true, quantity: true } },
    },
  });
  if (!order) return { ok: false, error: "Захиалга олдсонгүй" };
  if (order.userId !== session.user.id) {
    return { ok: false, error: "Зөвшөөрөлгүй" };
  }
  if (order.status !== "PENDING") {
    return {
      ok: false,
      error: "Зөвхөн хүлээгдэж буй захиалгыг цуцлах боломжтой",
    };
  }

  await prisma.$transaction(async (tx) => {
    await tx.order.update({
      where: { id: orderId },
      data: { status: "CANCELLED" },
    });
    for (const it of order.items) {
      await tx.product.updateMany({
        where: { id: it.productId },
        data: { stock: { increment: it.quantity } },
      });
    }
    // Зарцуулсан оноог буцаана
    if (order.pointsRedeemed > 0) {
      await tx.user.update({
        where: { id: order.userId },
        data: { pointsBalance: { increment: order.pointsRedeemed } },
      });
    }
  });

  revalidatePath(`/orders/${orderId}`);
  revalidatePath("/profile");
  revalidatePath("/products");
  return { ok: true };
}
