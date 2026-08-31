import { auth } from "@/auth";
import { prisma } from "@/lib/prisma";
import { StarRating } from "./StarRating";
import { ReviewForm } from "./ReviewForm";
import { DeleteReviewButton } from "./DeleteReviewButton";
import Link from "next/link";

type Props = {
  productId: string;
  productSlug: string;
  ratingSum: number;
  ratingCount: number;
};

export async function ProductReviews({
  productId,
  productSlug,
  ratingSum,
  ratingCount,
}: Props) {
  const session = await auth();
  const userId = session?.user?.id;
  const isAdmin = session?.user?.role === "ADMIN";

  const [reviews, deliveredOrders] = await Promise.all([
    prisma.review.findMany({
      where: { productId },
      orderBy: { createdAt: "desc" },
      include: { user: { select: { name: true } } },
    }),
    prisma.order.findMany({
      where: { status: "DELIVERED", items: { some: { productId } } },
      select: { userId: true },
    }),
  ]);

  const purchasedSet = new Set(deliveredOrders.map((o) => o.userId));
  const myReview = userId ? reviews.find((r) => r.userId === userId) : undefined;
  const avg = ratingCount > 0 ? ratingSum / ratingCount : 0;

  return (
    <section className="mt-16">
      <h2 className="font-serif text-2xl font-bold mb-6">Үнэлгээ & Сэтгэгдэл</h2>

      {/* Хураангуй */}
      <div className="flex items-center gap-4 mb-8">
        <div className="text-center">
          <div className="font-serif text-4xl font-bold text-blush-dark">
            {avg.toFixed(1)}
          </div>
          <StarRating rating={avg} size="sm" />
          <p className="text-xs text-muted mt-1">{ratingCount} үнэлгээ</p>
        </div>
      </div>

      {/* Форм эсвэл нэвтрэх урилга */}
      <div className="mb-8">
        {userId ? (
          <ReviewForm
            productId={productId}
            defaultRating={myReview?.rating ?? 0}
            defaultComment={myReview?.comment ?? ""}
            isEditing={!!myReview}
          />
        ) : (
          <div className="bg-surface border border-border rounded-2xl p-5 text-sm text-muted">
            Сэтгэгдэл үлдээхийн тулд{" "}
            <Link
              href={`/login?callbackUrl=/products/${productSlug}`}
              className="text-blush font-medium hover:text-blush-dark"
            >
              нэвтэрнэ үү
            </Link>
            .
          </div>
        )}
      </div>

      {/* Сэтгэгдлүүд */}
      {reviews.length === 0 ? (
        <p className="text-muted text-sm">
          Одоогоор сэтгэгдэл алга. Хамгийн түрүүнд үнэлгээ өгөөрэй!
        </p>
      ) : (
        <div className="space-y-4">
          {reviews.map((r) => (
            <div
              key={r.id}
              className="bg-surface border border-border rounded-2xl p-5"
            >
              <div className="flex items-start justify-between gap-3">
                <div>
                  <div className="flex items-center gap-2 flex-wrap">
                    <span className="font-medium">{r.user.name}</span>
                    {purchasedSet.has(r.userId) && (
                      <span className="text-xs text-green-400 bg-green-500/10 px-2 py-0.5 rounded-full">
                        ✓ Худалдаж авсан
                      </span>
                    )}
                  </div>
                  <div className="mt-1">
                    <StarRating rating={r.rating} size="sm" />
                  </div>
                </div>
                <div className="flex items-center gap-3 shrink-0">
                  <span className="text-xs text-muted">
                    {new Date(r.createdAt).toLocaleDateString("mn-MN")}
                  </span>
                  {(r.userId === userId || isAdmin) && (
                    <DeleteReviewButton reviewId={r.id} />
                  )}
                </div>
              </div>
              {r.comment && (
                <p className="text-sm text-muted mt-3 leading-relaxed whitespace-pre-line">
                  {r.comment}
                </p>
              )}
            </div>
          ))}
        </div>
      )}
    </section>
  );
}
