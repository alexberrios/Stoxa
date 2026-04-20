import Link from "next/link";
import { Suspense } from "react";
import { Plus } from "lucide-react";
import { createClient } from "@/lib/supabase/server";
import { getDisplayCurrencyCode } from "@/lib/currency";
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
import { ProductImage } from "@/components/product-image";
import { ProductosFilters } from "@/components/productos-filters";
import { buildIlikeOrPattern } from "@/lib/search";
import type { Category } from "@/lib/types";

type Row = {
  id: string;
  name: string;
  sku: string;
  price: number;
  quantity: number;
  min_stock: number;
  image_url: string | null;
  categories: { name: string; color: string } | null;
};

function estadoLabel(p: { quantity: number; min_stock: number }) {
  if (p.quantity === 0)
    return <Badge variant="destructive">Sin stock</Badge>;
  if (p.quantity <= p.min_stock)
    return <Badge variant="warning">Bajo stock</Badge>;
  return <Badge variant="success">OK</Badge>;
}

export default async function ProductosPage({
  searchParams,
}: {
  searchParams: Promise<Record<string, string | string[] | undefined>>;
}) {
  const sp = await searchParams;
  const q = typeof sp.q === "string" ? sp.q.trim() : "";
  const categoria =
    typeof sp.categoria === "string" ? sp.categoria : undefined;
  const estado = typeof sp.estado === "string" ? sp.estado : undefined;

  const supabase = await createClient();
  const displayCurrency = await getDisplayCurrencyCode(supabase);

  const { data: categories } = await supabase
    .from("categories")
    .select("id, name")
    .order("name");

  let query = supabase
    .from("products")
    .select("id, name, sku, price, quantity, min_stock, image_url, categories ( name, color )")
    .order("name");

  if (q) {
    query = query.or(buildIlikeOrPattern(q, ["name", "sku"]));
  }
  if (categoria && categoria !== "all") {
    query = query.eq("category_id", categoria);
  }

  const { data: raw, error } = await query;

  if (error) {
    return (
      <div className="rounded-lg border border-destructive/50 bg-destructive/10 p-4 text-sm">
        Error al cargar productos: {error.message}
      </div>
    );
  }

  let rows: Row[] = (raw ?? []).map((p) => {
    const cRaw = p.categories as
      | { name: string; color: string }
      | { name: string; color: string }[]
      | null
      | undefined;
    const categories = Array.isArray(cRaw) ? cRaw[0] ?? null : cRaw ?? null;
    return {
      id: p.id,
      name: p.name,
      sku: p.sku,
      price: p.price,
      quantity: p.quantity,
      min_stock: p.min_stock,
      image_url: p.image_url,
      categories,
    };
  });
  if (estado === "ok") {
    rows = rows.filter((p) => p.quantity > p.min_stock);
  } else if (estado === "low") {
    rows = rows.filter((p) => p.quantity <= p.min_stock);
  } else if (estado === "out") {
    rows = rows.filter((p) => p.quantity === 0);
  }

  return (
    <div className="mx-auto max-w-6xl space-y-6">
      <div className="flex flex-col gap-4 sm:flex-row sm:items-center sm:justify-between">
        <div>
          <h1 className="text-2xl font-semibold tracking-tight">Productos</h1>
          <p className="text-muted-foreground">
            Catálogo, stock y alertas por umbral.
          </p>
        </div>
        <Link
          href="/productos/nuevo"
          className={cn(buttonVariants(), "inline-flex gap-2")}
        >
          <Plus className="size-4" />
          Nuevo producto
        </Link>
      </div>

      <Suspense
        fallback={
          <div className="h-10 max-w-md animate-pulse rounded-md bg-muted" />
        }
      >
        <ProductosFilters categories={(categories ?? []) as Category[]} />
      </Suspense>

      {rows.length === 0 ? (
        <p className="text-sm text-muted-foreground">
          No hay productos que coincidan.{" "}
          <Link href="/productos/nuevo" className="font-medium text-primary underline">
            Crear uno
          </Link>
        </p>
      ) : (
        <div className="overflow-x-auto rounded-lg border">
          <Table>
            <TableHeader>
              <TableRow>
                <TableHead className="w-[72px]" />
                <TableHead>Nombre</TableHead>
                <TableHead>SKU</TableHead>
                <TableHead>Categoría</TableHead>
                <TableHead className="text-right">Precio</TableHead>
                <TableHead className="text-right">Stock</TableHead>
                <TableHead>Estado</TableHead>
                <TableHead className="w-[100px]" />
              </TableRow>
            </TableHeader>
            <TableBody>
              {rows.map((p) => (
                <TableRow key={p.id}>
                  <TableCell>
                    <ProductImage
                      pathOrUrl={p.image_url}
                      alt={p.name}
                      width={48}
                      height={48}
                    />
                  </TableCell>
                  <TableCell className="font-medium">{p.name}</TableCell>
                  <TableCell className="font-mono text-sm">{p.sku}</TableCell>
                  <TableCell>
                    {p.categories ? (
                      <span className="inline-flex items-center gap-2">
                        <span
                          className="size-2 rounded-full"
                          style={{
                            backgroundColor: p.categories.color,
                          }}
                        />
                        {p.categories.name}
                      </span>
                    ) : (
                      "—"
                    )}
                  </TableCell>
                  <TableCell className="text-right tabular-nums">
                    {Number(p.price).toLocaleString("es-ES", {
                      style: "currency",
                      currency: displayCurrency,
                    })}
                  </TableCell>
                  <TableCell className="text-right tabular-nums">
                    {p.quantity}
                  </TableCell>
                  <TableCell>{estadoLabel(p)}</TableCell>
                  <TableCell>
                    <Link
                      href={`/productos/${p.id}`}
                      className={cn(
                        buttonVariants({ variant: "link" }),
                        "h-auto p-0",
                      )}
                    >
                      Ver / editar
                    </Link>
                  </TableCell>
                </TableRow>
              ))}
            </TableBody>
          </Table>
        </div>
      )}
    </div>
  );
}
