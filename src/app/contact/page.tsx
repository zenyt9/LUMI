import type { Metadata } from "next";
import { Phone, Mail, MapPin, Clock } from "lucide-react";
import { SITE } from "@/lib/site";

export const metadata: Metadata = {
  title: "Холбоо барих — LumiBeauty",
  description: "LumiBeauty-тэй холбогдох мэдээлэл.",
};

export default function ContactPage() {
  const items = [
    { icon: Phone, label: "Утас", value: SITE.phone, href: `tel:${SITE.phone.replace(/\s/g, "")}` },
    { icon: Mail, label: "Имэйл", value: SITE.email, href: `mailto:${SITE.email}` },
    { icon: MapPin, label: "Хаяг", value: SITE.address },
    { icon: Clock, label: "Ажиллах цаг", value: SITE.hours },
  ];

  return (
    <div className="mx-auto max-w-2xl px-4 py-16">
      <p className="text-blush font-medium tracking-widest text-sm mb-3 text-center">
        ХОЛБОО БАРИХ
      </p>
      <h1 className="font-serif text-4xl font-bold mb-4 text-center">
        Бидэнтэй холбогдоорой
      </h1>
      <p className="text-muted text-center mb-10">
        Асуулт, захиалга, хамтын ажиллагааны талаар доорх сувгуудаар холбогдоно уу.
      </p>

      <div className="space-y-3">
        {items.map(({ icon: Icon, label, value, href }) => (
          <div
            key={label}
            className="flex items-center gap-4 bg-surface border border-border rounded-2xl p-5"
          >
            <div className="w-11 h-11 rounded-full bg-blush-soft/50 flex items-center justify-center shrink-0">
              <Icon className="w-5 h-5 text-blush" strokeWidth={1.5} />
            </div>
            <div>
              <p className="text-xs text-muted">{label}</p>
              {href ? (
                <a href={href} className="font-medium hover:text-blush">
                  {value}
                </a>
              ) : (
                <p className="font-medium">{value}</p>
              )}
            </div>
          </div>
        ))}
      </div>

      {(SITE.facebook || SITE.instagram) && (
        <div className="flex items-center justify-center gap-4 mt-8">
          {SITE.facebook && (
            <a
              href={SITE.facebook}
              target="_blank"
              rel="noopener noreferrer"
              className="inline-flex items-center gap-2 px-5 py-2.5 rounded-full border border-border hover:border-blush transition-colors"
            >
              📘 Facebook
            </a>
          )}
          {SITE.instagram && (
            <a
              href={SITE.instagram}
              target="_blank"
              rel="noopener noreferrer"
              className="inline-flex items-center gap-2 px-5 py-2.5 rounded-full border border-border hover:border-blush transition-colors"
            >
              📷 Instagram
            </a>
          )}
        </div>
      )}
    </div>
  );
}
