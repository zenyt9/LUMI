"use client";

import { useActionState, useEffect, useState } from "react";
import { useRouter } from "next/navigation";
import { Star } from "lucide-react";
import { submitReview, type ReviewFormState } from "@/lib/actions/review";

type Props = {
  productId: string;
  defaultRating?: number;
  defaultComment?: string;
  isEditing?: boolean;
};

export function ReviewForm({
  productId,
  defaultRating = 0,
  defaultComment = "",
  isEditing = false,
}: Props) {
  const router = useRouter();
  const [state, formAction, pending] = useActionState<ReviewFormState, FormData>(
    submitReview,
    undefined,
  );
  const [rating, setRating] = useState(defaultRating);
  const [hover, setHover] = useState(0);

  useEffect(() => {
    if (state?.success) router.refresh();
  }, [state, router]);

  return (
    <form
      action={formAction}
      className="bg-surface border border-border rounded-2xl p-5"
    >
      <input type="hidden" name="productId" value={productId} />
      <input type="hidden" name="rating" value={rating} />

      <p className="font-medium mb-3">
        {isEditing ? "Үнэлгээгээ засах" : "Үнэлгээ өгөх"}
      </p>

      {/* Од сонгох */}
      <div className="flex items-center gap-1 mb-4">
        {[1, 2, 3, 4, 5].map((i) => (
          <button
            key={i}
            type="button"
            onClick={() => setRating(i)}
            onMouseEnter={() => setHover(i)}
            onMouseLeave={() => setHover(0)}
            className="p-0.5"
            aria-label={`${i} од`}
          >
            <Star
              className={
                "w-7 h-7 transition-colors " +
                (i <= (hover || rating)
                  ? "text-blush fill-blush"
                  : "text-border fill-transparent")
              }
              strokeWidth={1.5}
            />
          </button>
        ))}
      </div>

      <textarea
        name="comment"
        rows={3}
        defaultValue={defaultComment}
        placeholder="Барааны талаарх сэтгэгдлээ бичнэ үү (заавал биш)"
        className="w-full px-4 py-2.5 rounded-xl border border-border bg-background focus:outline-none focus:ring-2 focus:ring-blush/40 resize-none mb-3"
      />

      {state?.error && (
        <p className="text-sm text-red-300 bg-red-500/10 border border-red-500/30 rounded-lg p-3 mb-3">
          {state.error}
        </p>
      )}
      {state?.success && (
        <p className="text-sm text-green-300 bg-green-500/10 border border-green-500/30 rounded-lg p-3 mb-3">
          Баярлалаа! Таны үнэлгээг хүлээн авлаа.
        </p>
      )}

      <button
        type="submit"
        disabled={pending}
        className="px-6 py-2.5 rounded-full bg-blush text-white font-medium hover:bg-blush-dark transition-colors disabled:opacity-60"
      >
        {pending ? "Илгээж байна..." : isEditing ? "Шинэчлэх" : "Сэтгэгдэл үлдээх"}
      </button>
    </form>
  );
}
