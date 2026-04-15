"use server";

import { revalidatePath } from "next/cache";
import { createClient } from "@/lib/supabase/server";
import { productSchema } from "@/lib/validations";

function normalizeImageUrl(url: string | null | undefined) {
  if (!url || url === "") return null;
  return url;
}

export async function createProduct(input: unknown) {
  const parsed = productSchema.safeParse(input);
  if (!parsed.success) {
    return { error: parsed.error.flatten().fieldErrors };
  }
  const supabase = await createClient();
  const {
    data: { user },
  } = await supabase.auth.getUser();
  if (!user) return { error: "No autenticado" };

  const { error } = await supabase.from("products").insert({
    user_id: user.id,
    name: parsed.data.name.trim(),
    sku: parsed.data.sku.trim(),
    category_id: parsed.data.category_id,
    price: parsed.data.price,
    quantity: parsed.data.quantity,
    min_stock: parsed.data.min_stock,
    image_url: normalizeImageUrl(parsed.data.image_url ?? null),
  });
  if (error) {
    if (error.code === "23505") {
      return { error: "Ya existe un producto con ese SKU" };
    }
    return { error: error.message };
  }
  revalidatePath("/productos");
  revalidatePath("/");
  return { success: true };
}

export async function updateProduct(id: string, input: unknown) {
  const parsed = productSchema.safeParse(input);
  if (!parsed.success) {
    return { error: parsed.error.flatten().fieldErrors };
  }
  const supabase = await createClient();
  const { error } = await supabase
    .from("products")
    .update({
      name: parsed.data.name.trim(),
      sku: parsed.data.sku.trim(),
      category_id: parsed.data.category_id,
      price: parsed.data.price,
      quantity: parsed.data.quantity,
      min_stock: parsed.data.min_stock,
      image_url: normalizeImageUrl(parsed.data.image_url ?? null),
      updated_at: new Date().toISOString(),
    })
    .eq("id", id);
  if (error) {
    if (error.code === "23505") {
      return { error: "Ya existe un producto con ese SKU" };
    }
    return { error: error.message };
  }
  revalidatePath("/productos");
  revalidatePath(`/productos/${id}`);
  revalidatePath("/");
  return { success: true };
}

export async function deleteProduct(id: string) {
  const supabase = await createClient();
  const { error } = await supabase.from("products").delete().eq("id", id);
  if (error) return { error: error.message };
  revalidatePath("/productos");
  revalidatePath("/");
  return { success: true };
}
