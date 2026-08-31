import Link from "next/link";
import { SITE } from "@/lib/site";

export function Footer() {
  return (
    <footer className="border-t border-border bg-blush-soft/40 mt-20">
      <div className="mx-auto max-w-6xl px-4 py-12 grid gap-8 sm:grid-cols-3">
        <div>
          <div className="font-serif text-xl font-bold mb-2">
            LumiBeauty <span className="text-blush">✦</span>
          </div>
          <p className="text-sm text-muted leading-relaxed mb-4">
            Танай гоо сайхны өдөр тутмын хэрэгцээг хангах чанартай
            бүтээгдэхүүний онлайн дэлгүүр.
          </p>
          {(SITE.facebook || SITE.instagram) && (
            <div className="flex items-center gap-3">
              {SITE.facebook && (
                <a
                  href={SITE.facebook}
                  target="_blank"
                  rel="noopener noreferrer"
                  aria-label="Facebook"
                  className="w-9 h-9 rounded-full bg-surface border border-border flex items-center justify-center text-base hover:text-blush hover:border-blush transition-colors"
                >
                  📘
                </a>
              )}
              {SITE.instagram && (
                <a
                  href={SITE.instagram}
                  target="_blank"
                  rel="noopener noreferrer"
                  aria-label="Instagram"
                  className="w-9 h-9 rounded-full bg-surface border border-border flex items-center justify-center text-base hover:text-blush hover:border-blush transition-colors"
                >
                  📷
                </a>
              )}
            </div>
          )}
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
              <Link href="/about" className="hover:text-blush">
                Тухай
              </Link>
            </li>
            <li>
              <Link href="/contact" className="hover:text-blush">
                Холбоо барих
              </Link>
            </li>
            <li>
              <Link href="/terms" className="hover:text-blush">
                Үйлчилгээний нөхцөл
              </Link>
            </li>
          </ul>
        </div>

        <div>
          <h4 className="font-semibold mb-3 text-sm">Холбоо барих</h4>
          <ul className="space-y-2 text-sm text-muted">
            <li>📍 {SITE.address}</li>
            <li>
              📞{" "}
              <a
                href={`tel:${SITE.phone.replace(/\s/g, "")}`}
                className="hover:text-blush"
              >
                {SITE.phone}
              </a>
            </li>
            <li>
              ✉️{" "}
              <a href={`mailto:${SITE.email}`} className="hover:text-blush">
                {SITE.email}
              </a>
            </li>
          </ul>
        </div>
      </div>
      <div className="border-t border-border py-4 text-center text-xs text-muted">
        © {new Date().getFullYear()} {SITE.name}. Бүх эрх хуулиар хамгаалагдсан.
      </div>
    </footer>
  );
}
