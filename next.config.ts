import type { NextConfig } from "next";

const nextConfig: NextConfig = {
  images: {
    // Барааны зургийг өгөгдлийн санд data URL хэлбэрээр хадгалдаг тул
    // next/image-ийн оптимизацийг унтрааж, data: болон бусад эх сурвалжийг
    // шууд дамжуулна (serverless хост дээр найдвартай).
    unoptimized: true,
  },
};

export default nextConfig;
