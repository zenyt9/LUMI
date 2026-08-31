import Link from "next/link";
import type { Metadata } from "next";

export const metadata: Metadata = {
  title: "Тухай — LumiBeauty",
  description: "LumiBeauty гоо сайхны онлайн дэлгүүрийн тухай.",
};

export default function AboutPage() {
  return (
    <div className="mx-auto max-w-3xl px-4 py-16">
      <p className="text-blush font-medium tracking-widest text-sm mb-3 text-center">
        БИДНИЙ ТУХАЙ
      </p>
      <h1 className="font-serif text-4xl font-bold mb-8 text-center">
        LumiBeauty <span className="text-blush">✦</span>
      </h1>

      <p className="text-muted leading-relaxed text-lg mb-6">
        LumiBeauty бол таны өдөр тутмын гоо сайхны хэрэгцээг хангах, зөвхөн
        чанартай, найдвартай бүтээгдэхүүнийг санал болгодог онлайн дэлгүүр юм.
        Арьс арчилгаа, нүүр будалт, үнэртэн, үс арчилгаа — таны гоо сайхныг
        гэрэлтүүлэх бүх зүйлийг нэг дороос.
      </p>

      <p className="text-muted leading-relaxed mb-10">
        Бид итгэл, чанар, үйлчилгээг эрхэмлэдэг. Захиалга бүрийг анхааралтай
        бэлдэж, хурдан шуурхай хүргэхийг зорьдог.
      </p>

      <div className="grid sm:grid-cols-3 gap-6 mb-12">
        {[
          ["✨", "100% жинхэнэ", "Зөвхөн албан ёсны эх сурвалжаас"],
          ["🚚", "Хурдан хүргэлт", "Улаанбаатар хотод 24 цагт"],
          ["💛", "Найдвартай үйлчилгээ", "Таны сэтгэл ханамж нэн тэргүүнд"],
        ].map(([icon, title, desc]) => (
          <div
            key={title}
            className="text-center p-6 rounded-2xl border border-border bg-surface"
          >
            <div className="text-3xl mb-3">{icon}</div>
            <h3 className="font-semibold mb-1">{title}</h3>
            <p className="text-sm text-muted">{desc}</p>
          </div>
        ))}
      </div>

      <div className="text-center">
        <Link
          href="/products"
          className="inline-block px-8 py-3 rounded-full bg-blush text-white font-medium hover:bg-blush-dark transition-colors"
        >
          Бүтээгдэхүүн үзэх
        </Link>
      </div>
    </div>
  );
}
