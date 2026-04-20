"use server";

import { revalidatePath } from "next/cache";
import { createClient } from "@/lib/supabase/server";
import { stockMovementSchema } from "@/lib/validations";

export async function applyStockMovement(input: unknown) {
  const parsed = stockMovementSchema.safeParse(input);
  if (!parsed.success) {
    return { error: parsed.error.flatten().fieldErrors };
  }
  const supabase = await createClient();
  const { occurred_at, ...rest } = parsed.data;
  if (Number.isNaN(Date.parse(occurred_at))) {
    return { error: "Fecha inválida" };
  }
  const iso = new Date(occurred_at).toISOString();

  const { error } = await supabase.rpc("apply_stock_movement", {
    p_product_id: rest.product_id,
    p_type: rest.type,
    p_quantity: rest.quantity,
    p_reason: rest.reason ?? "",
    p_occurred_at: iso,
  });

  if (error) {
    return { error: error.message };
  }
  revalidatePath("/movimientos");
  revalidatePath("/productos");
  revalidatePath("/");
  revalidatePath("/reportes");
  return { success: true };
}
