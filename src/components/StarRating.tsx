import { Star } from "lucide-react";

type Props = {
  rating: number; // 0..5 (аравтын оронтой байж болно)
  count?: number; // үнэлгээний тоо (өгвөл хажууд харуулна)
  size?: "sm" | "md" | "lg";
  className?: string;
};

const SIZES = { sm: "w-3.5 h-3.5", md: "w-4 h-4", lg: "w-5 h-5" };

/** Зөвхөн харуулах од (интерактив биш) */
export function StarRating({ rating, count, size = "md", className = "" }: Props) {
  const rounded = Math.round(rating);
  const cls = SIZES[size];

  return (
    <div className={`inline-flex items-center gap-1.5 ${className}`}>
      <div className="inline-flex">
        {[1, 2, 3, 4, 5].map((i) => (
          <Star
            key={i}
            className={
              cls +
              " " +
              (i <= rounded
                ? "text-blush fill-blush"
                : "text-border fill-transparent")
            }
            strokeWidth={1.5}
          />
        ))}
      </div>
      {count !== undefined && (
        <span className="text-xs text-muted">
          {count > 0 ? `${rating.toFixed(1)} (${count})` : "Үнэлгээгүй"}
        </span>
      )}
    </div>
  );
}
