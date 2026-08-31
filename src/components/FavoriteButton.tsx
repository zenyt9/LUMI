"use client";

import { useState, useTransition } from "react";
import { useRouter } from "next/navigation";
import { Heart } from "lucide-react";
import { toggleFavorite } from "@/lib/actions/favorite";

type Props = {
  productId: string;
  initialFavorited?: boolean;
  callbackUrl?: string;
  variant?: "overlay" | "inline";
};

export function FavoriteButton({
  productId,
  initialFavorited = false,
  callbackUrl = "/products",
  variant = "overlay",
}: Props) {
  const router = useRouter();
  const [favorited, setFavorited] = useState(initialFavorited);
  const [pending, startTransition] = useTransition();

  function onClick(e: React.MouseEvent) {
    e.preventDefault();
    e.stopPropagation();
    startTransition(async () => {
      const prev = favorited;
      setFavorited(!prev); // optimistic
      const res = await toggleFavorite(productId);
      if (!res.ok) {
        setFavorited(prev); // буцаах
        if (res.error === "Нэвтэрнэ үү") {
          router.push(`/login?callbackUrl=${encodeURIComponent(callbackUrl)}`);
        }
      } else {
        setFavorited(res.favorited);
      }
    });
  }

  if (variant === "inline") {
    return (
      <button
        onClick={onClick}
        disabled={pending}
        className="inline-flex items-center gap-2 px-5 py-3 rounded-full border border-border hover:border-blush transition-colors disabled:opacity-60"
        aria-pressed={favorited}
        title={favorited ? "Дуртайгаас хасах" : "Дуртайд нэмэх"}
      >
        <Heart
          className={
            "w-5 h-5 " + (favorited ? "text-blush fill-blush" : "text-muted")
          }
          strokeWidth={1.5}
        />
        {favorited ? "Дуртайд байна" : "Дуртайд нэмэх"}
      </button>
    );
  }

  return (
    <button
      onClick={onClick}
      disabled={pending}
      className="absolute top-3 right-3 z-10 p-2 rounded-full bg-background/80 backdrop-blur hover:bg-background transition-colors disabled:opacity-60"
      aria-pressed={favorited}
      title={favorited ? "Дуртайгаас хасах" : "Дуртайд нэмэх"}
    >
      <Heart
        className={
          "w-4 h-4 " + (favorited ? "text-blush fill-blush" : "text-muted")
        }
        strokeWidth={1.5}
      />
    </button>
  );
}
