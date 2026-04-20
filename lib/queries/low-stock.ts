import { cache } from "react";
import { createClient } from "@/lib/supabase/server";

/**
 * Lee el número de productos en o por debajo del umbral mínimo del usuario
 * actual. Memoizado por request con `react/cache` para evitar llamadas
 * duplicadas (p. ej. sidebar + dashboard en la misma navegación).
 */
export const getLowStockCount = cache(async (): Promise<number> => {
  const supabase = await createClient();
  const { data, error } = await supabase.rpc("count_low_stock");
  if (error || typeof data !== "number") return 0;
  return data;
});
