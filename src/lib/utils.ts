// Үнийг монгол төгрөгийн форматаар харуулна: 45000 -> "45,000₮"
export function formatPrice(value: number): string {
  return value.toLocaleString("mn-MN") + "₮";
}

// className-уудыг нэгтгэх энгийн туслах
export function cn(...classes: (string | false | null | undefined)[]): string {
  return classes.filter(Boolean).join(" ");
}

// Монгол (кирилл) нэрийг URL-д тохирох latin slug болгох
export function slugify(s: string): string {
  const map: Record<string, string> = {
    а: "a", б: "b", в: "v", г: "g", д: "d", е: "e", ё: "yo", ж: "j", з: "z",
    и: "i", й: "i", к: "k", л: "l", м: "m", н: "n", о: "o", ө: "o", п: "p",
    р: "r", с: "s", т: "t", у: "u", ү: "u", ф: "f", х: "h", ц: "ts", ч: "ch",
    ш: "sh", щ: "sh", ъ: "", ы: "y", ь: "", э: "e", ю: "yu", я: "ya",
  };
  return s
    .toLowerCase()
    .split("")
    .map((c) => map[c] ?? c)
    .join("")
    .replace(/[^a-z0-9]+/g, "-")
    .replace(/^-+|-+$/g, "");
}

// Захиалгын төлвийн монгол нэр
// COD (хүргэлтийн үед бэлнээр) урсгал: PENDING → SHIPPED → DELIVERED(төлбөр авсан)
export const ORDER_STATUS_LABELS: Record<string, string> = {
  PENDING: "Хүлээгдэж буй",
  PAID: "Урьдчилж төлсөн",
  SHIPPED: "Хүргэлтэд гарсан",
  DELIVERED: "Хүргэгдсэн (төлсөн)",
  CANCELLED: "Цуцлагдсан",
};
