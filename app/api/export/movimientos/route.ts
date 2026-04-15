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
    .from("stock_movements")
    .select(
      `
      type,
      quantity,
      reason,
      occurred_at,
      products ( name, sku )
    `,
    )
    .order("occurred_at", { ascending: false })
    .limit(5000);

  if (error) {
    return NextResponse.json({ error: error.message }, { status: 500 });
  }

  const header = [
    "fecha",
    "tipo",
    "cantidad",
    "producto",
    "sku",
    "motivo",
  ];
  const lines = [
    header.join(","),
    ...(data ?? []).map((m) => {
      const raw = m.products as
        | { name: string; sku: string }
        | { name: string; sku: string }[]
        | null
        | undefined;
      const prod = Array.isArray(raw) ? raw[0] ?? null : raw ?? null;
      return [
        csvEscape(new Date(m.occurred_at).toISOString()),
        csvEscape(m.type === "IN" ? "ENTRADA" : "SALIDA"),
        csvEscape(m.quantity),
        csvEscape(prod?.name ?? ""),
        csvEscape(prod?.sku ?? ""),
        csvEscape(m.reason),
      ].join(",");
    }),
  ];

  const body = lines.join("\r\n");
  return new NextResponse(body, {
    status: 200,
    headers: {
      "Content-Type": "text/csv; charset=utf-8",
      "Content-Disposition":
        'attachment; filename="movimientos.csv"',
    },
  });
}
