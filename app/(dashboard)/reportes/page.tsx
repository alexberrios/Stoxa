import { subDays, format } from "date-fns";
import { es } from "date-fns/locale";
import { createClient } from "@/lib/supabase/server";
import { getDisplayCurrencyCode } from "@/lib/currency";
import { ReportsCharts } from "@/components/reports-charts";
import { ExportCsvButtons } from "@/components/export-csv-buttons";
import {
  Card,
  CardContent,
  CardDescription,
  CardHeader,
  CardTitle,
} from "@/components/ui/card";

export default async function ReportesPage() {
  const supabase = await createClient();
  const displayCurrency = await getDisplayCurrencyCode(supabase);
  const since = subDays(new Date(), 30).toISOString();

  const [{ data: products }, { data: movements }] = await Promise.all([
    supabase
      .from("products")
      .select("price, quantity, categories ( name )"),
    supabase
      .from("stock_movements")
      .select("occurred_at, quantity, type")
      .gte("occurred_at", since)
      .order("occurred_at", { ascending: true }),
  ]);

  const catMap = new Map<string, number>();
  for (const p of products ?? []) {
    const cRaw = p.categories as
      | { name: string }
      | { name: string }[]
      | null
      | undefined;
    const c = Array.isArray(cRaw) ? cRaw[0] : cRaw;
    const cat = c?.name ?? "Sin categoría";
    const v = Number(p.price) * p.quantity;
    catMap.set(cat, (catMap.get(cat) ?? 0) + v);
  }
  const valueByCategory = Array.from(catMap.entries()).map(([name, valor]) => ({
    name,
    valor,
  }));

  const dayMap = new Map<
    string,
    { entradas: number; salidas: number }
  >();
  for (const m of movements ?? []) {
    const day = format(new Date(m.occurred_at), "yyyy-MM-dd");
    if (!dayMap.has(day)) {
      dayMap.set(day, { entradas: 0, salidas: 0 });
    }
    const row = dayMap.get(day)!;
    if (m.type === "IN") row.entradas += m.quantity;
    else row.salidas += m.quantity;
  }
  const movementsByDay = Array.from(dayMap.entries())
    .sort(([a], [b]) => a.localeCompare(b))
    .map(([fecha, v]) => ({
      fecha: format(new Date(fecha + "T12:00:00"), "d MMM", { locale: es }),
      entradas: v.entradas,
      salidas: v.salidas,
    }));

  return (
    <div className="mx-auto max-w-6xl space-y-8">
      <div>
        <h1 className="text-2xl font-semibold tracking-tight">Reportes</h1>
        <p className="text-muted-foreground">
          Gráficos resumidos y exportación de datos a CSV.
        </p>
      </div>

      <Card>
        <CardHeader className="flex flex-row flex-wrap items-center justify-between gap-4">
          <div>
            <CardTitle>Exportar</CardTitle>
            <CardDescription>
              Descarga el catálogo o el historial de movimientos.
            </CardDescription>
          </div>
          <ExportCsvButtons />
        </CardHeader>
        <CardContent />
      </Card>

      <ReportsCharts
        valueByCategory={valueByCategory}
        movementsByDay={movementsByDay}
        currencyCode={displayCurrency}
      />
    </div>
  );
}
