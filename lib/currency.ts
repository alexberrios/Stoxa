import type { SupabaseClient } from "@supabase/supabase-js";
import { CURRENCY_LABEL } from "@/lib/constants";

/**
 * Código ISO de la moneda base del usuario (tabla exchange_rates).
 * Si no hay moneda base configurada, usa el valor por defecto de la app.
 */
export async function getDisplayCurrencyCode(
  supabase: SupabaseClient,
): Promise<string> {
  const {
    data: { user },
  } = await supabase.auth.getUser();
  if (!user) return CURRENCY_LABEL;

  const { data, error } = await supabase
    .from("exchange_rates")
    .select("code")
    .eq("user_id", user.id)
    .eq("is_base", true)
    .maybeSingle();

  if (error || !data?.code) return CURRENCY_LABEL;
  return data.code;
}
