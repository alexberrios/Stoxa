import Link from "next/link";
import { ArrowRight, Package, TrendingDown, Wallet } from "lucide-react";
import { createClient } from "@/lib/supabase/server";
import { getDisplayCurrencyCode } from "@/lib/currency";
import {
  Card,
  CardContent,
  CardDescription,
  CardHeader,
  CardTitle,
} from "@/components/ui/card";
import { buttonVariants } from "@/components/ui/button";
import { cn } from "@/lib/utils";
import { Badge } from "@/components/ui/badge";
import {
  Table,
  TableBody,
  TableCell,
  TableHead,
  TableHeader,
  TableRow,
} from "@/components/ui/table";

export default async function DashboardPage() {
  const supabase = await createClient();
  const displayCurrency = await getDisplayCurrencyCode(supabase);

  const [{ count: totalProducts }, { data: productsRows }, lowRpc, movementsRes] =
    await Promise.all([
      supabase.from("products").select("*", { count: "exact", head: true }),
      supabase.from("products").select("price, quantity, min_stock"),
      supabase.rpc("count_low_stock"),
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
        .limit(10),
    ]);

  const stockValue =
    productsRows?.reduce(
      (sum, p) => sum + Number(p.price) * p.quantity,
      0,
    ) ?? 0;

  const lowStock =
    productsRows?.filter((p) => p.quantity <= p.min_stock).length ?? 0;
  const lowFromRpc =
    typeof lowRpc.data === "number" ? lowRpc.data : lowStock;

  const movements = (movementsRes.data ?? []).map((m) => {
    const raw = m.products as
      | { name: string; sku: string }
      | { name: string; sku: string }[]
      | null
      | undefined;
    const products = Array.isArray(raw) ? raw[0] ?? null : raw ?? null;
    return { ...m, products };
  });

  return (
    <div className="mx-auto flex max-w-6xl flex-col gap-8">
      <div className="space-y-1">
        <h1 className="font-heading text-3xl font-semibold tracking-tight md:text-4xl">
          Inicio
        </h1>
        <p className="max-w-xl text-muted-foreground">
          Resumen de tu inventario y última actividad.
        </p>
      </div>

      <div className="grid gap-4 sm:grid-cols-2 lg:grid-cols-4">
        <Card className="shadow-sm transition-shadow hover:shadow-md">
          <CardHeader className="flex flex-row items-center justify-between pb-2">
            <CardTitle className="text-sm font-medium">Productos</CardTitle>
            <Package className="size-4 text-muted-foreground" />
          </CardHeader>
          <CardContent>
            <p className="text-2xl font-bold tabular-nums">{totalProducts ?? 0}</p>
            <CardDescription>Total de artículos en catálogo</CardDescription>
          </CardContent>
        </Card>
        <Card className="shadow-sm transition-shadow hover:shadow-md">
          <CardHeader className="flex flex-row items-center justify-between pb-2">
            <CardTitle className="text-sm font-medium">Valor del stock</CardTitle>
            <Wallet className="size-4 text-muted-foreground" />
          </CardHeader>
          <CardContent>
            <p className="text-2xl font-bold tabular-nums">
              {stockValue.toLocaleString("es-ES", {
                style: "currency",
                currency: displayCurrency,
              })}
            </p>
            <CardDescription>Precio × cantidad en almacén</CardDescription>
          </CardContent>
        </Card>
        <Card className="shadow-sm transition-shadow hover:shadow-md">
          <CardHeader className="flex flex-row items-center justify-between pb-2">
            <CardTitle className="text-sm font-medium">Bajo stock</CardTitle>
            <TrendingDown className="size-4 text-amber-600" />
          </CardHeader>
          <CardContent>
            <p className="text-2xl font-bold tabular-nums text-amber-700 dark:text-amber-500">
              {lowFromRpc}
            </p>
            <CardDescription>
              Unidades en o por debajo del umbral mínimo
            </CardDescription>
          </CardContent>
        </Card>
        <Card className="flex flex-col justify-center border-dashed border-primary/25 bg-primary/[0.03] shadow-sm dark:bg-primary/[0.06]">
          <CardContent className="flex flex-col gap-2 pt-6">
            <Link
              href="/productos?estado=low"
              className={cn(
                buttonVariants({ variant: "outline" }),
                "inline-flex w-full gap-2",
              )}
            >
              Ver alertas
              <ArrowRight className="size-4" />
            </Link>
            <Link
              href="/movimientos"
              className={cn(buttonVariants({ variant: "secondary" }), "w-full")}
            >
              Registrar movimiento
            </Link>
          </CardContent>
        </Card>
      </div>

      <Card className="shadow-sm">
        <CardHeader>
          <CardTitle>Actividad reciente</CardTitle>
          <CardDescription>
            Últimas entradas y salidas de almacén
          </CardDescription>
        </CardHeader>
        <CardContent>
          {movements.length === 0 ? (
            <p className="text-sm text-muted-foreground">
              Aún no hay movimientos. Registra entradas o salidas desde{" "}
              <Link href="/movimientos" className="font-medium text-primary underline">
                Movimientos
              </Link>
              .
            </p>
          ) : (
            <Table>
              <TableHeader>
                <TableRow>
                  <TableHead>Fecha</TableHead>
                  <TableHead>Producto</TableHead>
                  <TableHead>Tipo</TableHead>
                  <TableHead className="text-right">Cantidad</TableHead>
                  <TableHead>Motivo</TableHead>
                </TableRow>
              </TableHeader>
              <TableBody>
                {movements.map((m) => {
                  const prod = m.products;
                  return (
                    <TableRow key={m.id}>
                      <TableCell className="whitespace-nowrap text-muted-foreground">
                        {new Date(m.occurred_at).toLocaleString("es-ES", {
                          dateStyle: "short",
                          timeStyle: "short",
                        })}
                      </TableCell>
                      <TableCell>
                        <span className="font-medium">
                          {prod?.name ?? "—"}
                        </span>
                        <span className="ml-2 text-xs text-muted-foreground">
                          {prod?.sku}
                        </span>
                      </TableCell>
                      <TableCell>
                        {m.type === "IN" ? (
                          <Badge>Entrada</Badge>
                        ) : (
                          <Badge variant="secondary">Salida</Badge>
                        )}
                      </TableCell>
                      <TableCell className="text-right tabular-nums">
                        {m.quantity}
                      </TableCell>
                      <TableCell className="max-w-[200px] truncate text-muted-foreground">
                        {m.reason || "—"}
                      </TableCell>
                    </TableRow>
                  );
                })}
              </TableBody>
            </Table>
          )}
        </CardContent>
      </Card>
    </div>
  );
}
