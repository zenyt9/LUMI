import {
  getTier,
  getNextTier,
  tierProgress,
  pointsForAmount,
  computePricing,
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
eq("199 оноо → Хүрэл", getTier(199).key, "BRONZE");
eq("200 оноо → Мөнгө", getTier(200).key, "SILVER");
eq("499 оноо → Мөнгө", getTier(499).key, "SILVER");
eq("500 оноо → Алт", getTier(500).key, "GOLD");
eq("1000 оноо → Платинум", getTier(1000).key, "PLATINUM");
eq("5000 оноо → Платинум", getTier(5000).key, "PLATINUM");

// --- Дараагийн түвшин ---
eq("0 оноо дараагийнх → Мөнгө", getNextTier(0)?.key, "SILVER");
eq("1000 оноо дараагийнх → байхгүй", getNextTier(1000), null);

// --- Ахиц ---
eq("0 оноо ахиц → 0%", tierProgress(0), 0);
eq("100 оноо ахиц → 50%", tierProgress(100), 50);
eq("1000 оноо ахиц → 100%", tierProgress(1000), 100);

// --- Оноо тооцоо ---
eq("50000₮ → 50 оноо", pointsForAmount(50000), 50);
eq("999₮ → 0 оноо", pointsForAmount(999), 0);
eq("0₮ → 0 оноо", pointsForAmount(0), 0);

// --- Үнийн тооцоо (Хүрэл, хямд захиалга: хүргэлтийн хураамжтай) ---
eq("Хүрэл 50000₮", computePricing(50000, getTier(0)), {
  subtotal: 50000,
  discount: 0,
  shipping: 5000,
  total: 55000,
});
// Хүрэл, 100000₮+ → үнэгүй хүргэлт
eq("Хүрэл 120000₮ үнэгүй хүргэлт", computePricing(120000, getTier(0)), {
  subtotal: 120000,
  discount: 0,
  shipping: 0,
  total: 120000,
});
// Мөнгө 100000₮ → 3% хөнгөлөлт=3000, дараа нь 97000 < 100000 тул хүргэлт 5000
eq("Мөнгө 100000₮ (3% хөнгөлөлт)", computePricing(100000, getTier(200)), {
  subtotal: 100000,
  discount: 3000,
  shipping: 5000,
  total: 102000,
});
// Алт 50000₮ → 5% хөнгөлөлт=2500, үргэлж үнэгүй хүргэлт
eq("Алт 50000₮ (5% + үнэгүй хүргэлт)", computePricing(50000, getTier(500)), {
  subtotal: 50000,
  discount: 2500,
  shipping: 0,
  total: 47500,
});
// Платинум 200000₮ → 8%=16000, үнэгүй хүргэлт
eq("Платинум 200000₮ (8% + үнэгүй хүргэлт)", computePricing(200000, getTier(1000)), {
  subtotal: 200000,
  discount: 16000,
  shipping: 0,
  total: 184000,
});

console.log(`\n${pass} pass, ${fail} fail`);
if (fail > 0) process.exit(1);
