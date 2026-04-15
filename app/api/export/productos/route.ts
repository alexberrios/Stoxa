import { createClient } from "@/lib/supabase/server";
import { NextResponse } from "next/server";

function csvEscape(s: string | number | null | undefined) {
  const v = s == null ? "" : String(s);
  if (/[",\n\r]/.test(v)) return `"${v.replace(/"/g, '""')}"`;
  return v;
}

export async function GET() {
  const supabase = await createClient();
  const {
    data: { user },
  } = await supabase.auth.getUser();
  if (!user) {
    return NextResponse.json({ error: "No autorizado" }, { status: 401 });
  }

  const { data, error } = await supabase
    .from("products")
    .select("name, sku, price, quantity, min_stock, categories ( name )")
    .order("name");

  if (error) {
    return NextResponse.json({ error: error.message }, { status: 500 });
  }

  const header = [
    "nombre",
    "sku",
    "categoria",
    "precio",
    "cantidad",
    "umbral_minimo",
  ];
  const lines = [
    header.join(","),
    ...(data ?? []).map((p) => {
      const cRaw = p.categories as
        | { name: string }
        | { name: string }[]
        | null
        | undefined;
      const c = Array.isArray(cRaw) ? cRaw[0] : cRaw;
      const cat = c?.name ?? "";
      return [
        csvEscape(p.name),
        csvEscape(p.sku),
        csvEscape(cat),
        csvEscape(p.price),
        csvEscape(p.quantity),
        csvEscape(p.min_stock),
      ].join(",");
    }),
  ];

  const body = lines.join("\r\n");
  return new NextResponse(body, {
    status: 200,
    headers: {
      "Content-Type": "text/csv; charset=utf-8",
      "Content-Disposition":
        'attachment; filename="productos.csv"',
    },
  });
}
