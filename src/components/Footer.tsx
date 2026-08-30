import Link from "next/link";

export function Footer() {
  return (
    <footer className="border-t border-border bg-blush-soft/40 mt-20">
      <div className="mx-auto max-w-6xl px-4 py-12 grid gap-8 sm:grid-cols-3">
        <div>
          <div className="font-serif text-xl font-bold mb-2">
            LumiBeauty <span className="text-blush">✦</span>
          </div>
          <p className="text-sm text-muted leading-relaxed">
            Танай гоо сайхны өдөр тутмын хэрэгцээг хангах чанартай
            бүтээгдэхүүний онлайн дэлгүүр.
          </p>
        </div>

        <div>
          <h4 className="font-semibold mb-3 text-sm">Холбоосууд</h4>
          <ul className="space-y-2 text-sm text-muted">
            <li>
              <Link href="/" className="hover:text-blush">
                Нүүр
              </Link>
            </li>
            <li>
              <Link href="/products" className="hover:text-blush">
                Бүтээгдэхүүн
              </Link>
            </li>
            <li>
              <Link href="/cart" className="hover:text-blush">
                Сагс
              </Link>
            </li>
          </ul>
        </div>

        <div>
          <h4 className="font-semibold mb-3 text-sm">Холбоо барих</h4>
          <ul className="space-y-2 text-sm text-muted">
            <li>📍 Улаанбаатар, Монгол</li>
            <li>📞 +976 7000-0000</li>
            <li>✉️ info@lumi.mn</li>
          </ul>
        </div>
      </div>
      <div className="border-t border-border py-4 text-center text-xs text-muted">
        © {new Date().getFullYear()} LumiBeauty. Бүх эрх хуулиар хамгаалагдсан.
      </div>
    </footer>
  );
}
