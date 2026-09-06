import {
  getTier,
  getNextTier,
  tierProgress,
  pointsForAmount,
  computePricing,
  maxRedeemablePoints,
} from "../src/lib/loyalty.ts";

let pass = 0;
let fail = 0;
function eq(label: string, got: unknown, want: unknown) {
  const ok = JSON.stringify(got) === JSON.stringify(want);
  if (ok) {
    pass++;
    console.log(`✓ ${label}`);
  } else {
    fail++;
    console.log(`✗ ${label}\n    got:  ${JSON.stringify(got)}\n    want: ${JSON.stringify(want)}`);
  }
}

// --- Түвшин тодорхойлох ---
eq("0 оноо → Хүрэл", getTier(0).key, "BRONZE");
eq("1499 оноо → Хүрэл", getTier(1499).key, "BRONZE");
eq("1500 оноо → Мөнгө", getTier(1500).key, "SILVER");
eq("2999 оноо → Мөнгө", getTier(2999).key, "SILVER");
eq("3000 оноо → Алт", getTier(3000).key, "GOLD");
eq("5000 оноо → Платинум", getTier(5000).key, "PLATINUM");
eq("9999 оноо → Платинум", getTier(9999).key, "PLATINUM");

// --- Дараагийн түвшин ---
eq("0 оноо дараагийнх → Мөнгө", getNextTier(0)?.key, "SILVER");
eq("5000 оноо дараагийнх → байхгүй", getNextTier(5000), null);

// --- Ахиц ---
eq("0 оноо ахиц → 0%", tierProgress(0), 0);
eq("750 оноо ахиц → 50%", tierProgress(750), 50);
eq("5000 оноо ахиц → 100%", tierProgress(5000), 100);

// --- Оноо тооцоо ---
eq("50000₮ → 50 оноо", pointsForAmount(50000), 50);
eq("999₮ → 0 оноо", pointsForAmount(999), 0);
eq("0₮ → 0 оноо", pointsForAmount(0), 0);

// --- Үнийн тооцоо (Хүрэл, хямд захиалга: хүргэлтийн хураамжтай) ---
eq("Хүрэл 50000₮", computePricing(50000, getTier(0)), {
  subtotal: 50000,
  discount: 0,
  pointsRedeemed: 0,
  pointsDiscount: 0,
  shipping: 5000,
  total: 55000,
});
// Хүрэл, 100000₮+ → үнэгүй хүргэлт
eq("Хүрэл 120000₮ үнэгүй хүргэлт", computePricing(120000, getTier(0)), {
  subtotal: 120000,
  discount: 0,
  pointsRedeemed: 0,
  pointsDiscount: 0,
  shipping: 0,
  total: 120000,
});
// Мөнгө: хөнгөлөлтгүй, гэхдээ ҮРГЭЛЖ үнэгүй хүргэлт
eq("Мөнгө 50000₮ (үнэгүй хүргэлт)", computePricing(50000, getTier(1500)), {
  subtotal: 50000,
  discount: 0,
  pointsRedeemed: 0,
  pointsDiscount: 0,
  shipping: 0,
  total: 50000,
});
// Алт 50000₮ → 3% хөнгөлөлт=1500, үнэгүй хүргэлт
eq("Алт 50000₮ (3% + үнэгүй хүргэлт)", computePricing(50000, getTier(3000)), {
  subtotal: 50000,
  discount: 1500,
  pointsRedeemed: 0,
  pointsDiscount: 0,
  shipping: 0,
  total: 48500,
});
// Платинум 200000₮ → 5%=10000, үнэгүй хүргэлт
eq("Платинум 200000₮ (5% + үнэгүй хүргэлт)", computePricing(200000, getTier(5000)), {
  subtotal: 200000,
  discount: 10000,
  pointsRedeemed: 0,
  pointsDiscount: 0,
  shipping: 0,
  total: 190000,
});

// --- Оноо зарцуулах ---
// Хүрэл 50000₮, 100 оноо ашиглах: afterTier=50000, cap=floor(50000*0.5/100)=250, тэнд 100<250 тул 100 оноо=10000₮
eq("Хүрэл 50000₮ + 100 оноо", computePricing(50000, getTier(0), 100, 500), {
  subtotal: 50000,
  discount: 0,
  pointsRedeemed: 100,
  pointsDiscount: 10000,
  shipping: 5000, // afterTier=50000<100000 тул хүргэлттэй
  total: 45000, // 50000-10000+5000
});
// Дээд хязгаар: 60000₮, 1000 оноо өгсөн ч cap=floor(60000*0.5/100)=300 → 300 оноо=30000₮
eq("Дээд хязгаар (50%) 60000₮ 1000 оноо", computePricing(60000, getTier(0), 1000, 1000), {
  subtotal: 60000,
  discount: 0,
  pointsRedeemed: 300,
  pointsDiscount: 30000,
  shipping: 5000,
  total: 35000,
});
// Үлдэгдлээр хязгаарлагдах: 50000₮, balance=20 → 20 оноо
eq("Үлдэгдэл 20 оноо", computePricing(50000, getTier(0), 100, 20), {
  subtotal: 50000,
  discount: 0,
  pointsRedeemed: 20,
  pointsDiscount: 2000,
  shipping: 5000,
  total: 53000,
});

// --- maxRedeemablePoints ---
eq("maxRedeem 50000₮ Хүрэл balance500 → 250", maxRedeemablePoints(50000, getTier(0), 500), 250);
eq("maxRedeem 50000₮ Хүрэл balance20 → 20", maxRedeemablePoints(50000, getTier(0), 20), 20);
eq("maxRedeem 0 balance → 0", maxRedeemablePoints(50000, getTier(0), 0), 0);

console.log(`\n${pass} pass, ${fail} fail`);
if (fail > 0) process.exit(1);
