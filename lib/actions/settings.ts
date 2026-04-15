"use server";

import { revalidatePath } from "next/cache";
import { createClient } from "@/lib/supabase/server";
import { exchangeRateSchema, teamUserSchema } from "@/lib/validations";

export async function createTeamUser(input: unknown) {
  const parsed = teamUserSchema.safeParse(input);
  if (!parsed.success) {
    return { error: parsed.error.flatten().fieldErrors };
  }

  const supabase = await createClient();
  const {
    data: { user },
  } = await supabase.auth.getUser();
  if (!user) return { error: "No autenticado" };

  const { error } = await supabase.from("team_users").insert({
    owner_user_id: user.id,
    name: parsed.data.name.trim(),
    email: parsed.data.email.trim().toLowerCase(),
    role: parsed.data.role,
    active: parsed.data.active,
  });
  if (error) return { error: error.message };

  revalidatePath("/configuracion");
  return { success: true };
}

export async function updateTeamUser(id: string, input: unknown) {
  const parsed = teamUserSchema.safeParse(input);
  if (!parsed.success) {
    return { error: parsed.error.flatten().fieldErrors };
  }

  const supabase = await createClient();
  const { error } = await supabase
    .from("team_users")
    .update({
      name: parsed.data.name.trim(),
      email: parsed.data.email.trim().toLowerCase(),
      role: parsed.data.role,
      active: parsed.data.active,
    })
    .eq("id", id);
  if (error) return { error: error.message };

  revalidatePath("/configuracion");
  return { success: true };
}

export async function deleteTeamUser(id: string) {
  const supabase = await createClient();
  const { error } = await supabase.from("team_users").delete().eq("id", id);
  if (error) return { error: error.message };

  revalidatePath("/configuracion");
  return { success: true };
}

export async function createExchangeRate(input: unknown) {
  const parsed = exchangeRateSchema.safeParse(input);
  if (!parsed.success) {
    return { error: parsed.error.flatten().fieldErrors };
  }

  const supabase = await createClient();
  const {
    data: { user },
  } = await supabase.auth.getUser();
  if (!user) return { error: "No autenticado" };

  if (parsed.data.is_base) {
    const { error: resetError } = await supabase
      .from("exchange_rates")
      .update({ is_base: false })
      .eq("user_id", user.id);
    if (resetError) return { error: resetError.message };
  }

  const { error } = await supabase.from("exchange_rates").insert({
    user_id: user.id,
    code: parsed.data.code,
    name: parsed.data.name.trim(),
    rate_to_base: parsed.data.rate_to_base,
    is_base: parsed.data.is_base,
  });
  if (error) return { error: error.message };

  revalidatePath("/configuracion");
  return { success: true };
}

export async function updateExchangeRate(id: string, input: unknown) {
  const parsed = exchangeRateSchema.safeParse(input);
  if (!parsed.success) {
    return { error: parsed.error.flatten().fieldErrors };
  }

  const supabase = await createClient();
  const {
    data: { user },
  } = await supabase.auth.getUser();
  if (!user) return { error: "No autenticado" };

  if (parsed.data.is_base) {
    const { error: resetError } = await supabase
      .from("exchange_rates")
      .update({ is_base: false })
      .eq("user_id", user.id);
    if (resetError) return { error: resetError.message };
  }

  const { error } = await supabase
    .from("exchange_rates")
    .update({
      code: parsed.data.code,
      name: parsed.data.name.trim(),
      rate_to_base: parsed.data.rate_to_base,
      is_base: parsed.data.is_base,
    })
    .eq("id", id);
  if (error) return { error: error.message };

  revalidatePath("/configuracion");
  return { success: true };
}

export async function deleteExchangeRate(id: string) {
  const supabase = await createClient();
  const { error } = await supabase.from("exchange_rates").delete().eq("id", id);
  if (error) return { error: error.message };

  revalidatePath("/configuracion");
  return { success: true };
}
