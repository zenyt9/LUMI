"use server";

import { z } from "zod";
import { prisma } from "@/lib/prisma";
import { auth } from "@/auth";

const checkoutSchema = z.object({
  fullName: z.string().min(2, "Нэрээ оруулна уу"),
  phone: z
    .string()
    .regex(/^\d{8}$/, "Утасны дугаар 8 оронтой байх ёстой"),
  address: z.string().min(5, "Хүргэлтийн хаягаа дэлгэрэнгүй оруулна уу"),
  note: z.string().optional(),
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
  const { fullName, phone, address, note, items } = parsed.data;

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
  let total = 0;

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
    total += product.price * item.quantity;
    orderItems.push({
      productId: product.id,
      name: product.name,
      price: product.price,
      quantity: item.quantity,
    });
  }

  // Захиалга үүсгэх + үлдэгдэл хорогдуулах (нэг гүйлгээнд)
  const order = await prisma.$transaction(async (tx) => {
    const created = await tx.order.create({
      data: {
        userId: session.user.id,
        status: "PENDING",
        total,
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

    return created;
  });

  return { ok: true, orderId: order.id };
}
