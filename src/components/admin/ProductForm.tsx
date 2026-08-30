"use client";

import { useActionState, useState } from "react";
import Link from "next/link";
import { ImagePlus } from "lucide-react";
import type { ProductFormState } from "@/lib/actions/admin";

type Category = { id: string; name: string };
type Brand = { id: string; name: string };

type ProductDefaults = {
  name: string;
  description: string;
  price: number;
  stock: number;
  categoryId: string;
  brandId?: string | null;
  featured: boolean;
  image: string;
};

type Props = {
  action: (
    state: ProductFormState,
    formData: FormData,
  ) => Promise<ProductFormState>;
  categories: Category[];
  brands: Brand[];
  product?: ProductDefaults;
  submitLabel: string;
};

export function ProductForm({ action, categories, brands, product, submitLabel }: Props) {
  const [state, formAction, pending] = useActionState<ProductFormState, FormData>(
    action,
    undefined,
  );

  // Сонгосон зургийн урьдчилан харах
  const [preview, setPreview] = useState<string | null>(product?.image ?? null);

  function handleFileChange(e: React.ChangeEvent<HTMLInputElement>) {
    const file = e.target.files?.[0];
    if (file) {
      setPreview(URL.createObjectURL(file));
    }
  }

  return (
    <form action={formAction} className="space-y-4 max-w-xl">
      <Field label="Барааны нэр" name="name" defaultValue={product?.name} />

      <label className="block">
        <span className="text-sm font-medium block mb-1.5">Тайлбар</span>
        <textarea
          name="description"
          rows={3}
          defaultValue={product?.description}
          required
          className="w-full px-4 py-2.5 rounded-xl border border-border bg-surface focus:outline-none focus:ring-2 focus:ring-blush/40 resize-none"
        />
      </label>

      <div className="grid grid-cols-2 gap-4">
        <Field
          label="Үнэ (₮)"
          name="price"
          type="number"
          defaultValue={product?.price?.toString()}
        />
        <Field
          label="Үлдэгдэл"
          name="stock"
          type="number"
          defaultValue={product?.stock?.toString()}
        />
      </div>

      <label className="block">
        <span className="text-sm font-medium block mb-1.5">Ангилал</span>
        <select
          name="categoryId"
          defaultValue={product?.categoryId ?? ""}
          required
          className="w-full px-4 py-2.5 rounded-xl border border-border bg-surface focus:outline-none focus:ring-2 focus:ring-blush/40"
        >
          <option value="" disabled>
            Сонгоно уу
          </option>
          {categories.map((c) => (
            <option key={c.id} value={c.id}>
              {c.name}
            </option>
          ))}
        </select>
      </label>

      <label className="block">
        <span className="text-sm font-medium block mb-1.5">
          Брэнд <span className="text-muted font-normal">(заавал биш)</span>
        </span>
        <select
          name="brandId"
          defaultValue={product?.brandId ?? ""}
          className="w-full px-4 py-2.5 rounded-xl border border-border bg-surface focus:outline-none focus:ring-2 focus:ring-blush/40"
        >
          <option value="">— Брэндгүй —</option>
          {brands.map((b) => (
            <option key={b.id} value={b.id}>
              {b.name}
            </option>
          ))}
        </select>
      </label>

      {/* Барааны зураг */}
      <div>
        <span className="text-sm font-medium block mb-1.5">Барааны зураг</span>
        <div className="flex items-center gap-4">
          {/* Урьдчилан харах */}
          <div className="relative w-24 h-24 rounded-xl overflow-hidden bg-blush-soft/40 border border-border shrink-0 flex items-center justify-center">
            {preview ? (
              // eslint-disable-next-line @next/next/no-img-element
              <img
                src={preview}
                alt="Урьдчилан харах"
                className="w-full h-full object-cover"
              />
            ) : (
              <ImagePlus className="w-7 h-7 text-blush/60" strokeWidth={1.5} />
            )}
          </div>

          <div className="flex-1">
            <label className="inline-flex items-center gap-2 px-4 py-2 rounded-full border border-border bg-surface text-sm font-medium cursor-pointer hover:border-blush transition-colors">
              <ImagePlus className="w-4 h-4" />
              Зураг сонгох
              <input
                type="file"
                name="imageFile"
                accept="image/*"
                onChange={handleFileChange}
                className="hidden"
              />
            </label>
            <p className="text-xs text-muted mt-1.5">
              JPG, PNG, WEBP — 5MB хүртэл. Хоосон бол автоматаар үүснэ.
            </p>
          </div>
        </div>
      </div>

      {/* Эсвэл зургийн URL */}
      <Field
        label="Эсвэл зургийн URL (заавал биш)"
        name="image"
        defaultValue={product?.image?.startsWith("http") ? product.image : ""}
        required={false}
        placeholder="https://..."
      />

      <label className="flex items-center gap-2">
        <input
          type="checkbox"
          name="featured"
          defaultChecked={product?.featured}
          className="w-4 h-4 accent-blush"
        />
        <span className="text-sm font-medium">Онцлох бараа болгох</span>
      </label>

      {state?.error && (
        <p className="text-sm text-red-300 bg-red-500/10 border border-red-500/30 rounded-lg p-3">
          {state.error}
        </p>
      )}

      <div className="flex items-center gap-3 pt-2">
        <button
          type="submit"
          disabled={pending}
          className="px-6 py-2.5 rounded-full bg-blush text-white font-medium hover:bg-blush-dark transition-colors disabled:opacity-60"
        >
          {pending ? "Хадгалж байна..." : submitLabel}
        </button>
        <Link
          href="/admin/products"
          className="text-sm text-muted hover:text-blush"
        >
          Болих
        </Link>
      </div>
    </form>
  );
}

function Field({
  label,
  name,
  type = "text",
  defaultValue,
  placeholder,
  required = true,
}: {
  label: string;
  name: string;
  type?: string;
  defaultValue?: string;
  placeholder?: string;
  required?: boolean;
}) {
  return (
    <label className="block">
      <span className="text-sm font-medium block mb-1.5">{label}</span>
      <input
        name={name}
        type={type}
        defaultValue={defaultValue}
        placeholder={placeholder}
        required={required}
        min={type === "number" ? 0 : undefined}
        className="w-full px-4 py-2.5 rounded-xl border border-border bg-surface focus:outline-none focus:ring-2 focus:ring-blush/40"
      />
    </label>
  );
}
