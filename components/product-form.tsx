"use client";

import { useRouter } from "next/navigation";
import { useEffect, useMemo, useRef, useState } from "react";
import { createClient } from "@/lib/supabase/client";
import { cn } from "@/lib/utils";
import type { Category, Product } from "@/lib/types";
import { createProduct, updateProduct } from "@/lib/actions/products";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { FormattedNumberInput } from "@/components/formatted-number-input";
import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from "@/components/ui/select";
import { ProductImage } from "@/components/product-image";
import { toast } from "sonner";
import { CURRENCY_LABEL } from "@/lib/constants";

type Props = {
  categories: Category[];
  userId: string;
  product?: Product | null;
  /** Moneda en la que se guardan y muestran los precios (moneda base en Configuración). */
  currencyCode?: string;
};

export function ProductForm({
  categories,
  userId,
  product,
  currencyCode = CURRENCY_LABEL,
}: Props) {
  const router = useRouter();
  const [loading, setLoading] = useState(false);
  const [name, setName] = useState(product?.name ?? "");
  const [sku, setSku] = useState(product?.sku ?? "");
  const [categoryId, setCategoryId] = useState(product?.category_id ?? "");
  const [price, setPrice] = useState(String(product?.price ?? "0"));
  const [quantity, setQuantity] = useState(String(product?.quantity ?? "0"));
  const [minStock, setMinStock] = useState(String(product?.min_stock ?? "0"));
  const [file, setFile] = useState<File | null>(null);
  const [dragActive, setDragActive] = useState(false);
  const fileInputRef = useRef<HTMLInputElement>(null);

  const previewUrl = useMemo(
    () => (file ? URL.createObjectURL(file) : null),
    [file],
  );
  useEffect(() => {
    if (!previewUrl) return;
    return () => URL.revokeObjectURL(previewUrl);
  }, [previewUrl]);

  const effectiveCategoryId =
    categoryId && categories.some((c) => c.id === categoryId) ? categoryId : "";

  function handleImageFile(next: File | null) {
    if (!next) {
      setFile(null);
      return;
    }
    if (!next.type.startsWith("image/")) {
      toast.error("El archivo debe ser una imagen");
      return;
    }
    setFile(next);
  }

  async function uploadIfNeeded(): Promise<string | null> {
    if (!file) return product?.image_url ?? null;
    const supabase = createClient();
    const ext = file.name.split(".").pop() ?? "jpg";
    const path = `${userId}/${crypto.randomUUID()}.${ext}`;
    const { error } = await supabase.storage
      .from("product-images")
      .upload(path, file, { upsert: false });
    if (error) {
      toast.error(error.message);
      throw error;
    }
    return path;
  }

  async function handleSubmit(e: React.FormEvent) {
    e.preventDefault();
    if (!effectiveCategoryId) {
      toast.error("Selecciona una categoría");
      return;
    }
    setLoading(true);
    try {
      const path = await uploadIfNeeded();
      const payload = {
        name,
        sku,
        category_id: effectiveCategoryId,
        price: Number(price),
        quantity: Number(quantity),
        min_stock: Number(minStock),
        image_url: path,
      };
      const res = product
        ? await updateProduct(product.id, payload)
        : await createProduct(payload);
      if ("error" in res && res.error) {
        const err = res.error;
        toast.error(typeof err === "string" ? err : "Revisa los campos");
        setLoading(false);
        return;
      }
      toast.success(product ? "Producto actualizado" : "Producto creado");
      router.push("/productos");
      router.refresh();
    } catch {
      setLoading(false);
    }
    setLoading(false);
  }

  if (categories.length === 0) {
    return (
      <p className="text-sm text-muted-foreground">
        Primero debes crear al menos una{" "}
        <a href="/categorias" className="font-medium text-primary underline">
          categoría
        </a>
        .
      </p>
    );
  }

  return (
    <form onSubmit={handleSubmit} className="mx-auto max-w-xl space-y-6">
      <div className="grid gap-4 sm:grid-cols-2">
        <div className="space-y-2 sm:col-span-2">
          <Label htmlFor="name">Nombre</Label>
          <Input
            id="name"
            value={name}
            onChange={(e) => setName(e.target.value)}
            required
            maxLength={200}
          />
        </div>
        <div className="space-y-2">
          <Label htmlFor="sku">SKU</Label>
          <Input
            id="sku"
            value={sku}
            onChange={(e) => setSku(e.target.value)}
            required
            maxLength={80}
            className="font-mono"
          />
        </div>
        <div className="space-y-2">
          <Label>Categoría</Label>
          <Select
            value={effectiveCategoryId}
            onValueChange={(v) => v != null && setCategoryId(v)}
            required
            itemToStringLabel={(id) =>
              categories.find((c) => c.id === id)?.name ?? ""
            }
          >
            <SelectTrigger className="w-full">
              <SelectValue placeholder="Seleccionar…" />
            </SelectTrigger>
            <SelectContent>
              {categories.map((c) => (
                <SelectItem key={c.id} value={c.id}>
                  <span className="flex items-center gap-2">
                    <span
                      className="size-2 rounded-full"
                      style={{ backgroundColor: c.color }}
                    />
                    {c.name}
                  </span>
                </SelectItem>
              ))}
            </SelectContent>
          </Select>
        </div>
        <div className="space-y-2">
          <Label htmlFor="price">Precio ({currencyCode})</Label>
          <FormattedNumberInput
            id="price"
            mode="decimal"
            maxFractionDigits={2}
            min={0}
            value={price}
            onValueChange={setPrice}
            required
          />
        </div>
        <div className="space-y-2">
          <Label htmlFor="qty">Cantidad en stock</Label>
          <FormattedNumberInput
            id="qty"
            mode="integer"
            min={0}
            value={quantity}
            onValueChange={setQuantity}
            required
          />
        </div>
        <div className="space-y-2">
          <Label htmlFor="min">Umbral mínimo de stock</Label>
          <FormattedNumberInput
            id="min"
            mode="integer"
            min={0}
            value={minStock}
            onValueChange={setMinStock}
            required
          />
        </div>
        <div className="space-y-2 sm:col-span-2">
          <Label htmlFor="img">Imagen del producto</Label>
          <div
            role="presentation"
            onClick={() => fileInputRef.current?.click()}
            onKeyDown={(e) => {
              if (e.key === "Enter" || e.key === " ") {
                e.preventDefault();
                fileInputRef.current?.click();
              }
            }}
            onDragOver={(e) => {
              e.preventDefault();
              e.stopPropagation();
              e.dataTransfer.dropEffect = "copy";
            }}
            onDragEnter={(e) => {
              e.preventDefault();
              setDragActive(true);
            }}
            onDragLeave={(e) => {
              e.preventDefault();
              if (!e.currentTarget.contains(e.relatedTarget as Node | null)) {
                setDragActive(false);
              }
            }}
            onDrop={(e) => {
              e.preventDefault();
              e.stopPropagation();
              setDragActive(false);
              const dropped = e.dataTransfer.files?.[0];
              if (dropped) handleImageFile(dropped);
            }}
            tabIndex={0}
            className={cn(
              "cursor-pointer rounded-lg border-2 border-dashed p-8 text-center outline-none transition-colors focus-visible:ring-2 focus-visible:ring-ring focus-visible:ring-offset-2",
              dragActive
                ? "border-primary bg-primary/5"
                : "border-muted-foreground/25 hover:bg-muted/30",
            )}
          >
            <input
              ref={fileInputRef}
              id="img"
              type="file"
              accept="image/*"
              className="sr-only"
              onChange={(e) => handleImageFile(e.target.files?.[0] ?? null)}
            />
            <p className="text-sm text-muted-foreground">
              Arrastra una imagen aquí o haz clic para elegir un archivo.
            </p>
            <p className="mt-1 text-xs text-muted-foreground">PNG, JPG, WebP…</p>
          </div>
          {(previewUrl || product?.image_url) && (
            <div className="flex items-center gap-3 rounded-lg border p-2">
              {previewUrl ? (
                // eslint-disable-next-line @next/next/no-img-element
                <img
                  src={previewUrl}
                  alt="Vista previa"
                  className="size-16 rounded object-cover"
                />
              ) : (
                <ProductImage
                  pathOrUrl={product?.image_url ?? null}
                  alt="Producto"
                  width={64}
                  height={64}
                />
              )}
              <span className="text-xs text-muted-foreground">
                {file ? file.name : "Imagen actual"}
              </span>
            </div>
          )}
          <p className="text-xs text-muted-foreground">
            Se guardará de forma privada en tu espacio de almacenamiento.
          </p>
        </div>
      </div>
      <div className="flex gap-3">
        <Button type="submit" disabled={loading}>
          {loading ? "Guardando…" : product ? "Guardar cambios" : "Crear producto"}
        </Button>
        <Button
          type="button"
          variant="outline"
          onClick={() => router.push("/productos")}
        >
          Cancelar
        </Button>
      </div>
    </form>
  );
}
