"use client";

import { useRouter, useSearchParams } from "next/navigation";
import { useMemo, useTransition } from "react";
import { Badge } from "@/components/ui/badge";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from "@/components/ui/select";
import {
  Table,
  TableBody,
  TableCell,
  TableHead,
  TableHeader,
  TableRow,
} from "@/components/ui/table";

export type MovementRow = {
  id: string;
  type: "IN" | "OUT";
  quantity: number;
  reason: string;
  occurred_at: string;
  product_id: string;
  products: { name: string; sku: string } | null;
};

type ProductOption = { id: string; name: string; sku: string };

type Props = {
  initialMovements: MovementRow[];
  products: ProductOption[];
};

export function MovementsHistory({
  initialMovements,
  products,
}: Props) {
  const router = useRouter();
  const searchParams = useSearchParams();
  const [pending, startTransition] = useTransition();

  const productFilter = searchParams.get("producto") ?? "all";
  const from = searchParams.get("desde") ?? "";
  const to = searchParams.get("hasta") ?? "";

  const filtered = useMemo(() => {
    let rows = [...initialMovements];
    if (productFilter && productFilter !== "all") {
      rows = rows.filter((m) => m.product_id === productFilter);
    }
    if (from) {
      const fromT = new Date(from).getTime();
      rows = rows.filter((m) => new Date(m.occurred_at).getTime() >= fromT);
    }
    if (to) {
      const toT = new Date(to);
      toT.setHours(23, 59, 59, 999);
      rows = rows.filter((m) => new Date(m.occurred_at).getTime() <= toT.getTime());
    }
    return rows;
  }, [initialMovements, productFilter, from, to]);

  function pushFilter(updates: Record<string, string | undefined>) {
    const p = new URLSearchParams(searchParams.toString());
    Object.entries(updates).forEach(([k, v]) => {
      if (v === undefined || v === "" || v === "all") p.delete(k);
      else p.set(k, v);
    });
    startTransition(() => {
      router.push(`/movimientos?${p.toString()}`);
    });
  }

  return (
    <div className="space-y-4">
      <div className="flex flex-col gap-3 lg:flex-row lg:flex-wrap lg:items-end">
        <div className="space-y-2 lg:min-w-[220px]">
          <span className="text-sm font-medium">Producto</span>
          <Select
            value={productFilter}
            onValueChange={(v) =>
              pushFilter({
                producto: !v || v === "all" ? undefined : v,
              })
            }
            disabled={pending}
            itemToStringLabel={(id) => {
              if (id === "all") return "Todos";
              const p = products.find((x) => x.id === id);
              return p ? `${p.name} (${p.sku})` : "";
            }}
          >
            <SelectTrigger>
              <SelectValue placeholder="Todos" />
            </SelectTrigger>
            <SelectContent>
              <SelectItem value="all">Todos</SelectItem>
              {products.map((p) => (
                <SelectItem key={p.id} value={p.id}>
                  {p.name} ({p.sku})
                </SelectItem>
              ))}
            </SelectContent>
          </Select>
        </div>
        <div className="space-y-2">
          <span className="text-sm font-medium">Desde</span>
          <Input
            type="date"
            value={from}
            disabled={pending}
            onChange={(e) => pushFilter({ desde: e.target.value || undefined })}
          />
        </div>
        <div className="space-y-2">
          <span className="text-sm font-medium">Hasta</span>
          <Input
            type="date"
            value={to}
            disabled={pending}
            onChange={(e) => pushFilter({ hasta: e.target.value || undefined })}
          />
        </div>
        <Button
          type="button"
          variant="outline"
          size="sm"
          disabled={pending}
          onClick={() => pushFilter({ desde: undefined, hasta: undefined, producto: undefined })}
        >
          Limpiar filtros
        </Button>
      </div>

      <div className="overflow-x-auto rounded-lg border">
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
            {filtered.length === 0 ? (
              <TableRow>
                <TableCell colSpan={5} className="text-center text-muted-foreground">
                  No hay movimientos con estos filtros.
                </TableCell>
              </TableRow>
            ) : (
              filtered.map((m) => (
                <TableRow key={m.id}>
                  <TableCell className="whitespace-nowrap text-muted-foreground">
                    {new Date(m.occurred_at).toLocaleString("es-ES", {
                      dateStyle: "short",
                      timeStyle: "short",
                    })}
                  </TableCell>
                  <TableCell>
                    <span className="font-medium">{m.products?.name ?? "—"}</span>
                    <span className="ml-2 font-mono text-xs text-muted-foreground">
                      {m.products?.sku}
                    </span>
                  </TableCell>
                  <TableCell>
                    {m.type === "IN" ? (
                      <Badge>Entrada</Badge>
                    ) : (
                      <Badge variant="secondary">Salida</Badge>
                    )}
                  </TableCell>
                  <TableCell className="text-right tabular-nums">{m.quantity}</TableCell>
                  <TableCell className="max-w-[240px] truncate text-muted-foreground">
                    {m.reason || "—"}
                  </TableCell>
              </TableRow>
              ))
            )}
          </TableBody>
        </Table>
      </div>
    </div>
  );
}
