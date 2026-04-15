import { Suspense } from "react";
import { createClient } from "@/lib/supabase/server";
import { MovementForm } from "@/components/movement-form";
import {
  MovementsHistory,
  type MovementRow,
} from "@/components/movements-history";
import {
  Card,
  CardContent,
  CardDescription,
  CardHeader,
  CardTitle,
} from "@/components/ui/card";

export default async function MovimientosPage() {
  const supabase = await createClient();

  const [{ data: products }, { data: movements, error }] = await Promise.all([
    supabase
      .from("products")
      .select("id, name, sku")
      .order("name"),
    supabase
      .from("stock_movements")
      .select(
        `
        id,
        type,
        quantity,
        reason,
        occurred_at,
        product_id,
        products ( name, sku )
      `,
      )
      .order("occurred_at", { ascending: false })
      .limit(500),
  ]);

  if (error) {
    return (
      <div className="rounded-lg border border-destructive/50 bg-destructive/10 p-4 text-sm">
        Error al cargar movimientos: {error.message}
      </div>
    );
  }

  const normalizedMovements: MovementRow[] = (movements ?? []).map((m) => {
    const raw = m.products as
      | { name: string; sku: string }
      | { name: string; sku: string }[]
      | null
      | undefined;
    const products = Array.isArray(raw) ? raw[0] ?? null : raw ?? null;
    return {
      id: m.id,
      type: m.type as "IN" | "OUT",
      quantity: m.quantity,
      reason: m.reason,
      occurred_at: m.occurred_at,
      product_id: m.product_id,
      products,
    };
  });

  const productOptions =
    products?.map((p) => ({
      id: p.id,
      name: p.name,
      sku: p.sku,
    })) ?? [];

  return (
    <div className="mx-auto max-w-6xl space-y-8">
      <div>
        <h1 className="text-2xl font-semibold tracking-tight">Movimientos</h1>
        <p className="text-muted-foreground">
          Registra entradas y salidas y consulta el historial.
        </p>
      </div>

      <Card>
        <CardHeader>
          <CardTitle>Nuevo movimiento</CardTitle>
          <CardDescription>
            Las cantidades son siempre positivas; el tipo indica si suma o resta del
            almacén.
          </CardDescription>
        </CardHeader>
        <CardContent>
          <MovementForm products={productOptions} />
        </CardContent>
      </Card>

      <Card>
        <CardHeader>
          <CardTitle>Historial</CardTitle>
          <CardDescription>
            Últimos 500 movimientos. Filtra por producto o fechas.
          </CardDescription>
        </CardHeader>
        <CardContent>
          <Suspense
            fallback={
              <div className="h-32 animate-pulse rounded-lg bg-muted" />
            }
          >
            <MovementsHistory
              initialMovements={normalizedMovements}
              products={productOptions}
            />
          </Suspense>
        </CardContent>
      </Card>
    </div>
  );
}
