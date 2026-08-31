"use server";

import { z } from "zod";
import { revalidatePath } from "next/cache";
import { prisma } from "@/lib/prisma";
import { auth } from "@/auth";

export type ReviewFormState =
  | { error?: string; success?: boolean }
  | undefined;

const reviewSchema = z.object({
  productId: z.string().min(1),
  rating: z.coerce.number().int().min(1, "Үнэлгээ өгнө үү").max(5),
  comment: z.string().max(1000, "Сэтгэгдэл хэт урт байна").optional(),
});

export async function submitReview(
  _prev: ReviewFormState,
  formData: FormData,
): Promise<ReviewFormState> {
  const session = await auth();
  if (!session?.user?.id) {
    return { error: "Сэтгэгдэл үлдээхийн тулд нэвтэрнэ үү" };
  }

  const parsed = reviewSchema.safeParse({
    productId: formData.get("productId"),
    rating: formData.get("rating"),
    comment: formData.get("comment") || undefined,
  });
  if (!parsed.success) {
    return { error: parsed.error.issues[0].message };
  }
  const { productId, rating, comment } = parsed.data;
  const userId = session.user.id;

  const existing = await prisma.review.findUnique({
    where: { productId_userId: { productId, userId } },
    select: { id: true, rating: true },
  });

  await prisma.$transaction(async (tx) => {
    if (existing) {
      // Засах — дундажид зөрүүг тусгана
      await tx.review.update({
        where: { id: existing.id },
        data: { rating, comment: comment ?? null },
      });
      await tx.product.update({
        where: { id: productId },
        data: { ratingSum: { increment: rating - existing.rating } },
      });
    } else {
      await tx.review.create({
        data: { productId, userId, rating, comment: comment ?? null },
      });
      await tx.product.update({
        where: { id: productId },
        data: {
          ratingSum: { increment: rating },
          ratingCount: { increment: 1 },
        },
      });
    }
  });

  const product = await prisma.product.findUnique({
    where: { id: productId },
    select: { slug: true },
  });
  if (product) revalidatePath(`/products/${product.slug}`);
  revalidatePath("/products");
  revalidatePath("/");

  return { success: true };
}

export async function deleteReview(reviewId: string) {
  const session = await auth();
  if (!session?.user?.id) throw new Error("Нэвтэрнэ үү");

  const review = await prisma.review.findUnique({
    where: { id: reviewId },
    select: { id: true, userId: true, rating: true, productId: true },
  });
  if (!review) return;

  const isOwner = review.userId === session.user.id;
  const isAdmin = session.user.role === "ADMIN";
  if (!isOwner && !isAdmin) throw new Error("Зөвшөөрөлгүй");

  await prisma.$transaction(async (tx) => {
    await tx.review.delete({ where: { id: review.id } });
    await tx.product.update({
      where: { id: review.productId },
      data: {
        ratingSum: { decrement: review.rating },
        ratingCount: { decrement: 1 },
      },
    });
  });

  const product = await prisma.product.findUnique({
    where: { id: review.productId },
    select: { slug: true },
  });
  if (product) revalidatePath(`/products/${product.slug}`);
  revalidatePath("/products");
  revalidatePath("/");
}
