"use server";

import { z } from "zod";
import { revalidatePath } from "next/cache";
import { redirect } from "next/navigation";
import { prisma } from "@/lib/prisma";
import { auth } from "@/auth";
import { slugify } from "@/lib/utils";
import { generateProductImage, saveUploadedImage } from "@/lib/productImage";
import { pointsForAmount } from "@/lib/loyalty";

async function requireAdmin() {
  const session = await auth();
  if (session?.user?.role !== "ADMIN") {
    throw new Error("Зөвшөөрөлгүй хандалт");
  }
  return session;
}

const productSchema = z.object({
  name: z.string().min(2, "Нэр оруулна уу"),
  description: z.string().min(5, "Тайлбар оруулна уу"),
  price: z.coerce.number().int().positive("Үнэ эерэг тоо байх ёстой"),
  oldPrice: z.coerce.number().int().positive().optional(),
  stock: z.coerce.number().int().min(0, "Үлдэгдэл 0-ээс багагүй"),
  categoryId: z.string().min(1, "Ангилал сонгоно уу"),
  brandId: z.string().optional(),
  featured: z.boolean().optional(),
  image: z.string().optional(),
});

// formData-аас brandId авах туслах (хоосон бол null)
function readBrandId(formData: FormData): string | null {
  const v = formData.get("brandId");
  return typeof v === "string" && v.trim().length > 0 ? v : null;
}

export type ProductFormState = { error?: string } | undefined;

export async function createProduct(
  _prev: ProductFormState,
  formData: FormData,
): Promise<ProductFormState> {
  await requireAdmin();

  const parsed = productSchema.safeParse({
    name: formData.get("name"),
    description: formData.get("description"),
    price: formData.get("price"),
    oldPrice: formData.get("oldPrice") || undefined,
    stock: formData.get("stock"),
    categoryId: formData.get("categoryId"),
    featured: formData.get("featured") === "on",
    image: formData.get("image"),
  });

  if (!parsed.success) {
    return { error: parsed.error.issues[0].message };
  }
  const data = parsed.data;
  // Хуучин үнэ зөвхөн одоогийн үнээс их бол хямдрал гэж хадгална
  const oldPrice =
    data.oldPrice && data.oldPrice > data.price ? data.oldPrice : null;

  // Давхцахгүй slug үүсгэх
  const base = slugify(data.name) || "buteegdehuun";
  let slug = base;
  let n = 1;
  while (await prisma.product.findUnique({ where: { slug } })) {
    slug = `${base}-${n++}`;
  }

  // Зургийн эрэмбэ: upload файл → URL → автомат SVG
  let image: string;
  const file = formData.get("imageFile");
  try {
    if (file instanceof File && file.size > 0) {
      image = await saveUploadedImage(file);
    } else if (data.image && data.image.trim().length > 0) {
      image = data.image.trim();
    } else {
      image = generateProductImage(data.name);
    }
  } catch (e) {
    return { error: e instanceof Error ? e.message : "Зураг хадгалахад алдаа гарлаа" };
  }

  await prisma.product.create({
    data: {
      name: data.name,
      slug,
      description: data.description,
      price: data.price,
      oldPrice,
      stock: data.stock,
      categoryId: data.categoryId,
      brandId: readBrandId(formData),
      featured: data.featured ?? false,
      image,
    },
  });

  revalidatePath("/admin/products");
  revalidatePath("/products");
  redirect("/admin/products");
}

export async function updateProduct(
  id: string,
  _prev: ProductFormState,
  formData: FormData,
): Promise<ProductFormState> {
  await requireAdmin();

  const parsed = productSchema.safeParse({
    name: formData.get("name"),
    description: formData.get("description"),
    price: formData.get("price"),
    oldPrice: formData.get("oldPrice") || undefined,
    stock: formData.get("stock"),
    categoryId: formData.get("categoryId"),
    featured: formData.get("featured") === "on",
    image: formData.get("image"),
  });

  if (!parsed.success) {
    return { error: parsed.error.issues[0].message };
  }
  const data = parsed.data;
  const oldPrice =
    data.oldPrice && data.oldPrice > data.price ? data.oldPrice : null;

  // Зураг: шинэ файл upload хийсэн бол хадгална, эсвэл URL өгсөн бол солино,
  // аль аль нь байхгүй бол хуучин зургийг хэвээр үлдээнэ.
  let newImage: string | undefined;
  const file = formData.get("imageFile");
  try {
    if (file instanceof File && file.size > 0) {
      newImage = await saveUploadedImage(file);
    } else if (data.image && data.image.trim().length > 0) {
      newImage = data.image.trim();
    }
  } catch (e) {
    return { error: e instanceof Error ? e.message : "Зураг хадгалахад алдаа гарлаа" };
  }

  await prisma.product.update({
    where: { id },
    data: {
      name: data.name,
      description: data.description,
      price: data.price,
      oldPrice,
      stock: data.stock,
      categoryId: data.categoryId,
      brandId: readBrandId(formData),
      featured: data.featured ?? false,
      ...(newImage ? { image: newImage } : {}),
    },
  });

  revalidatePath("/admin/products");
  revalidatePath("/products");
  redirect("/admin/products");
}

export async function deleteProduct(id: string) {
  await requireAdmin();
  // Захиалгад орсон бараа байж болзошгүй тул шалгана
  const inOrders = await prisma.orderItem.count({ where: { productId: id } });
  if (inOrders > 0) {
    // Захиалгатай бол устгахын оронд үлдэгдлийг 0 болгож "нуух"
    await prisma.product.update({
      where: { id },
      data: { stock: 0, featured: false },
    });
  } else {
    await prisma.product.delete({ where: { id } });
  }
  revalidatePath("/admin/products");
  revalidatePath("/products");
}

const VALID_STATUSES = [
  "PENDING",
  "PAID",
  "SHIPPED",
  "DELIVERED",
  "CANCELLED",
];

export async function updateOrderStatus(orderId: string, status: string) {
  await requireAdmin();
  if (!VALID_STATUSES.includes(status)) {
    throw new Error("Буруу төлөв");
  }

  // Хүргэгдсэн болоход урамшууллын оноог нэг удаа олгоно
  await prisma.$transaction(async (tx) => {
    const order = await tx.order.findUnique({
      where: { id: orderId },
      select: { userId: true, total: true, pointsEarned: true, status: true },
    });
    if (!order) throw new Error("Захиалга олдсонгүй");

    await tx.order.update({ where: { id: orderId }, data: { status } });

    if (status === "DELIVERED" && order.pointsEarned === 0) {
      const earned = pointsForAmount(order.total);
      if (earned > 0) {
        await tx.order.update({
          where: { id: orderId },
          data: { pointsEarned: earned },
        });
        await tx.user.update({
          where: { id: order.userId },
          data: { points: { increment: earned } },
        });
      }
    }
  });

  revalidatePath("/admin/orders");
  revalidatePath(`/orders/${orderId}`);
  revalidatePath("/profile");
}

// ===== Брэнд =====

export type BrandFormState = { error?: string; success?: boolean } | undefined;

export async function createBrand(
  _prev: BrandFormState,
  formData: FormData,
): Promise<BrandFormState> {
  await requireAdmin();

  const name = (formData.get("name") as string | null)?.trim() ?? "";
  if (name.length < 2) {
    return { error: "Брэндийн нэр дор хаяж 2 тэмдэгт байх ёстой" };
  }

  // Давхцахгүй slug үүсгэх
  const base = slugify(name) || "brand";
  let slug = base;
  let n = 1;
  while (await prisma.brand.findUnique({ where: { slug } })) {
    slug = `${base}-${n++}`;
  }

  await prisma.brand.create({ data: { name, slug } });

  revalidatePath("/admin/brands");
  revalidatePath("/products");
  return { success: true };
}

export async function deleteBrand(id: string) {
  await requireAdmin();
  // Барааны brandId-г null болгож, дараа нь брэндийг устгана
  await prisma.product.updateMany({
    where: { brandId: id },
    data: { brandId: null },
  });
  await prisma.brand.delete({ where: { id } });
  revalidatePath("/admin/brands");
  revalidatePath("/products");
}
