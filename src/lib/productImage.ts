import "server-only";

const PALETTES = [
  ["#f6e4ea", "#d6849b"],
  ["#fdeee2", "#e0a878"],
  ["#e8f0e6", "#7faa6e"],
  ["#ece6f2", "#a98bc4"],
  ["#fce8e6", "#e08a82"],
];

function escapeXml(s: string): string {
  return s.replace(/[<>&'"]/g, (c) =>
    ({ "<": "&lt;", ">": "&gt;", "&": "&amp;", "'": "&apos;", '"': "&quot;" })[c]!,
  );
}

function makeSvg(name: string): string {
  const [bg, accent] = PALETTES[Math.floor(Math.random() * PALETTES.length)];
  const initial = (name.charAt(0) || "L").toUpperCase();
  return `<svg xmlns="http://www.w3.org/2000/svg" width="600" height="600" viewBox="0 0 600 600">
  <defs><linearGradient id="g" x1="0" y1="0" x2="1" y2="1">
    <stop offset="0%" stop-color="${bg}"/><stop offset="100%" stop-color="#ffffff"/>
  </linearGradient></defs>
  <rect width="600" height="600" fill="url(#g)"/>
  <circle cx="300" cy="250" r="130" fill="${accent}" opacity="0.18"/>
  <circle cx="300" cy="250" r="80" fill="${accent}" opacity="0.30"/>
  <text x="300" y="285" font-family="Georgia, serif" font-size="120" font-weight="bold" fill="${accent}" text-anchor="middle">${escapeXml(initial)}</text>
  <text x="300" y="470" font-family="Arial, sans-serif" font-size="30" font-weight="600" fill="#3d2b30" text-anchor="middle">${escapeXml(name)}</text>
  <text x="300" y="515" font-family="Georgia, serif" font-size="22" letter-spacing="6" fill="${accent}" text-anchor="middle">L U M I</text>
</svg>`;
}

/**
 * Барааны нэрээс SVG placeholder зургийг data URL хэлбэрээр үүсгэнэ.
 * Файл системд бичихгүй тул serverless (Vercel) дээр найдвартай ажиллана.
 */
export function generateProductImage(name: string): string {
  const svg = makeSvg(name);
  const base64 = Buffer.from(svg, "utf8").toString("base64");
  return `data:image/svg+xml;base64,${base64}`;
}

const ALLOWED_IMAGE_TYPES = new Set([
  "image/jpeg",
  "image/jpg",
  "image/png",
  "image/webp",
  "image/gif",
  "image/svg+xml",
]);

// data URL-аар DB-д хадгалах тул хэмжээг хязгаарлана (хэт том мөр үүсгэхгүйн тулд)
const MAX_IMAGE_BYTES = 1 * 1024 * 1024; // 1MB

/**
 * Админаас upload хийсэн зургийг data URL болгож буцаана (DB-д хадгална).
 * Зөвшөөрөгдсөн төрөл биш эсвэл хэт том бол алдаа шиднэ.
 */
export async function saveUploadedImage(file: File): Promise<string> {
  if (!ALLOWED_IMAGE_TYPES.has(file.type)) {
    throw new Error("Зөвхөн зураг (JPG, PNG, WEBP, GIF, SVG) оруулна уу");
  }
  if (file.size > MAX_IMAGE_BYTES) {
    throw new Error("Зургийн хэмжээ 1MB-аас бага байх ёстой");
  }

  const buffer = Buffer.from(await file.arrayBuffer());
  const base64 = buffer.toString("base64");
  return `data:${file.type};base64,${base64}`;
}
