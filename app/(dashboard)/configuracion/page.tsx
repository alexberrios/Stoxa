import { SettingsManager } from "@/components/settings-manager";
import { createClient } from "@/lib/supabase/server";
import type { ExchangeRate, TeamUser } from "@/lib/types";

export default async function ConfiguracionPage() {
  const supabase = await createClient();
  const [{ data: teamUsers, error: usersError }, { data: rates, error: ratesError }] =
    await Promise.all([
      supabase.from("team_users").select("*").order("created_at", { ascending: false }),
      supabase.from("exchange_rates").select("*").order("code", { ascending: true }),
    ]);

  if (usersError || ratesError) {
    return (
      <div className="rounded-lg border border-destructive/50 bg-destructive/10 p-4 text-sm">
        No se pudo cargar la configuración: {usersError?.message ?? ratesError?.message}
      </div>
    );
  }

  return (
    <div className="mx-auto max-w-6xl space-y-6">
      <div>
        <h1 className="text-2xl font-semibold tracking-tight">Configuración</h1>
        <p className="text-muted-foreground">
          Gestiona usuarios internos y monedas con sus tipos de cambio.
        </p>
      </div>

      <SettingsManager
        initialTeamUsers={(teamUsers ?? []) as TeamUser[]}
        initialExchangeRates={(rates ?? []) as ExchangeRate[]}
      />
    </div>
  );
}
