# 🚀 Lumi-г Vercel + Neon дээр deploy хийх заавар

Энэ апп нь **Vercel** (хостинг) + **Neon** (PostgreSQL өгөгдлийн сан) дээр ажиллахаар бэлдсэн.
Зургийг өгөгдлийн санд хадгалдаг тул нэмэлт файл сервер шаардахгүй.

> ⚠️ Бүртгэлүүдийг та өөрөө үүсгэнэ (Neon, GitHub, Vercel). Бүгд **үнэгүй** эхлэх боломжтой.

---

## 1️⃣ Neon өгөгдлийн сан үүсгэх

1. https://neon.tech руу орж бүртгүүлнэ (GitHub-аар нэвтэрч болно)
2. **"Create project"** → нэр өгөөд бүс (region) сонгоно (Европ/Ази ойр нь)
3. Үүсмэгц **Connection string** харагдана. Жишээ:
   ```
   postgresql://user:password@ep-xxx-123.eu-central-1.aws.neon.tech/neondb?sslmode=require
   ```
4. Энэ мөрийг **хуулж авна** (нууц тул хэн нэгэнтэй хуваалцахгүй).

---

## 2️⃣ Өгөгдлийн санг бэлдэх (локалд нэг удаа)

1. Төслийн `.env` файлд хуулсан холболтоо тавина:
   ```
   DATABASE_URL="postgresql://...neon.tech/neondb?sslmode=require"
   ```
2. Хүснэгтүүдийг үүсгэх:
   ```bash
   npm run db:push
   ```
3. Жишээ өгөгдөл (бараа, ангилал, админ) нэмэх:
   ```bash
   npm run db:seed
   ```
4. (Шалгах) локалд ажиллуулж үзэх:
   ```bash
   npm run dev
   ```

---

## 3️⃣ Кодыг GitHub-д тавих

1. https://github.com/new → шинэ хувийн (private) repo үүсгэнэ (жишээ нэр: `lumi-shop`)
2. Төслийн хавтсанд (`lumi-shop`) дараах командуудыг ажиллуулна:
   ```bash
   git remote add origin https://github.com/<таны-нэр>/lumi-shop.git
   git branch -M main
   git push -u origin main
   ```
   > Код аль хэдийн `git commit` хийгдсэн байгаа. Зөвхөн remote залгаад push хийнэ.

---

## 4️⃣ Vercel дээр deploy хийх

1. https://vercel.com руу орж **GitHub-аар** нэвтэрнэ
2. **"Add New… → Project"** → дээрх GitHub repo-гоо сонгож **Import** дарна
3. **Environment Variables** хэсэгт дараах 3-ыг нэмнэ:

   | Нэр | Утга |
   |-----|------|
   | `DATABASE_URL` | Neon-ийн холболтын мөр (2-р алхамтай ижил) |
   | `AUTH_SECRET` | Шинэ нууц утга — `npx auth secret` командаар үүсгэнэ |
   | `AUTH_TRUST_HOST` | `true` |

4. **Deploy** дарна. 1-2 минутын дараа `https://lumi-shop-xxx.vercel.app` хаяг гарна 🎉

---

## 5️⃣ Deploy дараа

- **Админаар нэвтрэх:** `admin@lumi.mn` / `admin123`
  - ⚠️ Аюулгүй байдлын үүднээс эхний нэвтрэлтийн дараа шинэ админ бүртгэл үүсгэж, хуучин туршилтынхыг солих нь зүйтэй.
- **Өөрийн домейн залгах:** Vercel → Project → Settings → Domains → домейноо нэмнэ.

---

## 📌 Цаашид сайжруулах (хэрэгцээ гарвал)

- **Зураг:** одоо өгөгдлийн санд (data URL) хадгалагдана — жижиг дэлгүүрт хангалттай.
  Их хэмжээний бараатай бол **Vercel Blob** эсвэл **Cloudinary** руу шилжүүлэх.
- **Төлбөр:** одоо "хүргэлтийн үед бэлнээр". Дараа **QPay** холбож болно.
- **Имэйл мэдэгдэл:** захиалга баталгаажсан үед имэйл илгээх (Resend г.м.).
