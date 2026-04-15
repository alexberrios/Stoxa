"use server";

import { revalidatePath } from "next/cache";
import { createClient } from "@/lib/supabase/server";
import { categorySchema } from "@/lib/validations";

export async function createCategory(input: unknown) {
  const parsed = categorySchema.safeParse(input);
  if (!parsed.success) {
    return { error: parsed.error.flatten().fieldErrors };
  }
  const supabase = await createClient();
  const {
    data: { user },
  } = await supabase.auth.getUser();
  if (!user) return { error: "No autenticado" };

  const { error } = await supabase.from("categories").insert({
    user_id: user.id,
    name: parsed.data.name.trim(),
    color: parsed.data.color,
  });
  if (error) return { error: error.message };
  revalidatePath("/categorias");
  return { success: true };
}

export async function updateCategory(id: string, input: unknown) {
  const parsed = categorySchema.safeParse(input);
  if (!parsed.success) {
    return { error: parsed.error.flatten().fieldErrors };
  }
  const supabase = await createClient();
  const { error } = await supabase
    .from("categories")
    .update({
      name: parsed.data.name.trim(),
      color: parsed.data.color,
    })
    .eq("id", id);
  if (error) return { error: error.message };
  revalidatePath("/categorias");
  revalidatePath("/productos");
  return { success: true };
}

export async function deleteCategory(id: string) {
  const supabase = await createClient();
  const { count, error: countError } = await supabase
    .from("products")
    .select("*", { count: "exact", head: true })
    .eq("category_id", id);
  if (countError) return { error: countError.message };
  if (count && count > 0) {
    return {
      error:
        "No se puede eliminar: hay productos en esta categoría. Reasígnalos o elimínalos primero.",
    };
  }
  const { error } = await supabase.from("categories").delete().eq("id", id);
  if (error) return { error: error.message };
  revalidatePath("/categorias");
  return { success: true };
}
