"use client";

import { useState } from "react";
import { ChevronDown } from "lucide-react";

const ITEMS: { q: string; a: string }[] = [
  {
    q: "Хүргэлт хэр хугацаанд ирэх вэ?",
    a: "Улаанбаатар хотод захиалгыг ажлын 24 цагт багтаан хүргэнэ. Орон нутагт унаанаас хамаарч 2-5 хоног.",
  },
  {
    q: "Төлбөрөө яаж төлөх вэ?",
    a: "Одоогоор хүргэлтийн үед бэлнээр төлнө — хүргэлтийн ажилтан барааг өгөхдөө тооцоог тань дээр газар дээр нь хийнэ.",
  },
  {
    q: "Бүтээгдэхүүн жинхэнэ эсэхэд итгэлтэй байж болох уу?",
    a: "Тийм. Бид зөвхөн албан ёсны эх сурвалжаас нийлүүлсэн 100% жинхэнэ бүтээгдэхүүнийг санал болгодог.",
  },
  {
    q: "Захиалгаа хэрхэн цуцлах вэ?",
    a: "Хүргэлт гарахаас өмнө бидэнтэй утсаар холбогдож захиалгаа цуцлах боломжтой.",
  },
  {
    q: "Буцаалт хийж болох уу?",
    a: "Барааны чанарын гэмтэлтэй тохиолдолд хүлээн авснаас хойш 48 цагийн дотор бидэнтэй холбогдоно уу.",
  },
];

export function Faq() {
  const [open, setOpen] = useState<number | null>(0);

  return (
    <div className="space-y-3">
      {ITEMS.map((item, i) => {
        const isOpen = open === i;
        return (
          <div
            key={i}
            className="bg-surface border border-border rounded-2xl overflow-hidden"
          >
            <button
              onClick={() => setOpen(isOpen ? null : i)}
              className="w-full flex items-center justify-between gap-4 p-5 text-left font-medium hover:text-blush transition-colors"
              aria-expanded={isOpen}
            >
              {item.q}
              <ChevronDown
                className={`w-5 h-5 shrink-0 transition-transform ${isOpen ? "rotate-180 text-blush" : "text-muted"}`}
              />
            </button>
            {isOpen && (
              <div className="px-5 pb-5 -mt-1 text-sm text-muted leading-relaxed">
                {item.a}
              </div>
            )}
          </div>
        );
      })}
    </div>
  );
}
