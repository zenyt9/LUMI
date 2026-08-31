// LumiBeauty урамшууллын систем — оноо, түвшин, хөнгөлөлт
// Энэ файл сервер болон клиент хоёуланд ашиглагдана (цэвэр функцууд).

export type TierKey = "BRONZE" | "SILVER" | "GOLD" | "PLATINUM";

export type Tier = {
  key: TierKey;
  name: string; // Монгол нэр
  emoji: string;
  minPoints: number; // энэ түвшинд хүрэх доод оноо
  discountRate: number; // 0..1 (захиалгын хөнгөлөлт)
  freeShipping: boolean; // үнэгүй хүргэлт эсэх
  perks: string[]; // харуулах урамшууллын жагсаалт
};

export const TIERS: Tier[] = [
  {
    key: "BRONZE",
    name: "Хүрэл",
    emoji: "🥉",
    minPoints: 0,
    discountRate: 0,
    freeShipping: false,
    perks: ["Оноо цуглуулж эхлэх", "100,000₮-с дээш үнэгүй хүргэлт"],
  },
  {
    key: "SILVER",
    name: "Мөнгө",
    emoji: "🥈",
    minPoints: 200,
    discountRate: 0.03,
    freeShipping: false,
    perks: ["Захиалга бүрт 3% хөнгөлөлт", "100,000₮-с дээш үнэгүй хүргэлт"],
  },
  {
    key: "GOLD",
    name: "Алт",
    emoji: "🥇",
    minPoints: 500,
    discountRate: 0.05,
    freeShipping: true,
    perks: ["Захиалга бүрт 5% хөнгөлөлт", "Үргэлж үнэгүй хүргэлт"],
  },
  {
    key: "PLATINUM",
    name: "Платинум",
    emoji: "💎",
    minPoints: 1000,
    discountRate: 0.08,
    freeShipping: true,
    perks: [
      "Захиалга бүрт 8% хөнгөлөлт",
      "Үргэлж үнэгүй хүргэлт",
      "Онцгой саналууд эрт",
    ],
  },
];

export const SHIPPING_FEE = 5000;
export const FREE_SHIPPING_THRESHOLD = 100000;
// Хэдэн төгрөгт 1 оноо (1000₮ = 1 оноо)
export const TOGROG_PER_POINT = 1000;

/** Оноогоор одоогийн түвшинг тодорхойлно */
export function getTier(points: number): Tier {
  let current = TIERS[0];
  for (const t of TIERS) {
    if (points >= t.minPoints) current = t;
  }
  return current;
}

/** Дараагийн түвшин (байхгүй бол хамгийн дээд түвшинд байна) */
export function getNextTier(points: number): Tier | null {
  return TIERS.find((t) => t.minPoints > points) ?? null;
}

/** Одоогийн түвшний хүрээнд дараагийн түвшин хүртэлх ахицын хувь (0..100) */
export function tierProgress(points: number): number {
  const current = getTier(points);
  const next = getNextTier(points);
  if (!next) return 100;
  const span = next.minPoints - current.minPoints;
  if (span <= 0) return 100;
  return Math.min(100, Math.round(((points - current.minPoints) / span) * 100));
}

/** Төлсөн дүнгээс олгох оноог тооцно */
export function pointsForAmount(amount: number): number {
  if (amount <= 0) return 0;
  return Math.floor(amount / TOGROG_PER_POINT);
}

// Оноо зарцуулах: 1 оноо = 100₮. Захиалгын (түвшингийн хөнгөлөлтийн дараах)
// дүнгийн дээд тал нь 50%-ийг оноогоор төлж болно.
export const POINT_VALUE = 100;
export const REDEEM_MAX_RATIO = 0.5;

/** Тухайн захиалгад ашиглаж болох оноо (үлдэгдэл ба 50% дээд хязгаараар) */
export function maxRedeemablePoints(
  subtotal: number,
  tier: Tier,
  balance: number,
): number {
  const afterTier = Math.max(0, subtotal - Math.round(subtotal * tier.discountRate));
  const capByOrder = Math.floor((afterTier * REDEEM_MAX_RATIO) / POINT_VALUE);
  return Math.max(0, Math.min(balance, capByOrder));
}

export type OrderPricing = {
  subtotal: number;
  discount: number; // түвшингийн хөнгөлөлт (₮)
  pointsRedeemed: number; // зарцуулсан оноо
  pointsDiscount: number; // оноогоор хассан дүн (₮)
  shipping: number;
  total: number;
};

/**
 * Барааны дүн + түвшин + зарцуулах оноогоор захиалгын эцсийн үнийг тооцно.
 * Сервер (createOrder) болон клиент (CheckoutForm) ижил логик ашиглана.
 * pointsToRedeem-ийг дотор нь хязгаарлана (хэт их өгсөн ч аюулгүй).
 */
export function computePricing(
  subtotal: number,
  tier: Tier,
  pointsToRedeem = 0,
  balance = 0,
): OrderPricing {
  const discount = Math.round(subtotal * tier.discountRate);
  const afterTier = Math.max(0, subtotal - discount);

  const capByOrder = Math.floor((afterTier * REDEEM_MAX_RATIO) / POINT_VALUE);
  const pointsRedeemed = Math.max(
    0,
    Math.min(pointsToRedeem, balance, capByOrder),
  );
  const pointsDiscount = pointsRedeemed * POINT_VALUE;
  const afterPoints = Math.max(0, afterTier - pointsDiscount);

  const freeShip = tier.freeShipping || afterTier >= FREE_SHIPPING_THRESHOLD;
  const shipping = freeShip ? 0 : SHIPPING_FEE;
  const total = afterPoints + shipping;

  return { subtotal, discount, pointsRedeemed, pointsDiscount, shipping, total };
}
