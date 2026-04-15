"use client";

import {
  Area,
  Bar,
  BarChart,
  CartesianGrid,
  ComposedChart,
  Legend,
  ResponsiveContainer,
  Tooltip,
  XAxis,
  YAxis,
} from "recharts";
import { CURRENCY_LABEL } from "@/lib/constants";

type CatRow = { name: string; valor: number };
type DayRow = { fecha: string; entradas: number; salidas: number };

type Props = {
  valueByCategory: CatRow[];
  movementsByDay: DayRow[];
  /** Código ISO de la moneda base (ej. USD, CLP). Por defecto el de la app. */
  currencyCode?: string;
};

export function ReportsCharts({
  valueByCategory,
  movementsByDay,
  currencyCode = CURRENCY_LABEL,
}: Props) {
  return (
    <div className="grid gap-8 lg:grid-cols-2">
      <div className="rounded-xl border bg-card p-4">
        <h3 className="mb-4 text-lg font-medium">Valor de stock por categoría</h3>
        <div className="h-[320px] w-full min-w-0">
          {valueByCategory.length === 0 ? (
            <p className="text-sm text-muted-foreground">Sin datos.</p>
          ) : (
            <ResponsiveContainer width="100%" height="100%">
              <BarChart data={valueByCategory} margin={{ top: 8, right: 8, left: 8, bottom: 8 }}>
                <defs>
                  <linearGradient id="inventoryBarCyan" x1="0" y1="0" x2="0" y2="1">
                    <stop offset="0%" stopColor="var(--color-chart-1)" stopOpacity={0.95} />
                    <stop offset="100%" stopColor="var(--color-chart-1)" stopOpacity={0.06} />
                  </linearGradient>
                </defs>
                <CartesianGrid strokeDasharray="3 3" className="stroke-muted" />
                <XAxis dataKey="name" tick={{ fontSize: 12 }} />
                <YAxis
                  tick={{ fontSize: 12 }}
                  tickFormatter={(v) =>
                    new Intl.NumberFormat("es-ES", {
                      notation: "compact",
                      maximumFractionDigits: 0,
                    }).format(v)
                  }
                />
                <Tooltip
                  formatter={(value) => {
                    const n = typeof value === "number" ? value : Number(value);
                    if (value == null || Number.isNaN(n)) return "";
                    return new Intl.NumberFormat("es-ES", {
                      style: "currency",
                      currency: currencyCode,
                    }).format(n);
                  }}
                  labelFormatter={(label) => `Categoría: ${label}`}
                />
                <Bar
                  dataKey="valor"
                  name="Valor"
                  fill="url(#inventoryBarCyan)"
                  radius={[4, 4, 0, 0]}
                />
              </BarChart>
            </ResponsiveContainer>
          )}
        </div>
      </div>

      <div className="rounded-xl border bg-card p-4">
        <h3 className="mb-4 text-lg font-medium">
          Movimientos por día (últimos 30 días)
        </h3>
        <div className="h-[320px] w-full min-w-0">
          {movementsByDay.length === 0 ? (
            <p className="text-sm text-muted-foreground">Sin movimientos en el periodo.</p>
          ) : (
            <ResponsiveContainer width="100%" height="100%">
              <ComposedChart data={movementsByDay} margin={{ top: 8, right: 8, left: 8, bottom: 8 }}>
                <defs>
                  <linearGradient id="entradasAreaFill" x1="0" y1="0" x2="0" y2="1">
                    <stop offset="0%" stopColor="var(--color-chart-2)" stopOpacity={0.4} />
                    <stop offset="100%" stopColor="var(--color-chart-2)" stopOpacity={0} />
                  </linearGradient>
                  <linearGradient id="salidasAreaFill" x1="0" y1="0" x2="0" y2="1">
                    <stop offset="0%" stopColor="var(--color-chart-4)" stopOpacity={0.35} />
                    <stop offset="100%" stopColor="var(--color-chart-4)" stopOpacity={0} />
                  </linearGradient>
                </defs>
                <CartesianGrid strokeDasharray="3 3" className="stroke-muted" />
                <XAxis dataKey="fecha" tick={{ fontSize: 11 }} />
                <YAxis tick={{ fontSize: 12 }} allowDecimals={false} />
                <Tooltip />
                <Legend />
                <Area
                  type="monotone"
                  dataKey="entradas"
                  name="Entradas (uds.)"
                  stroke="var(--color-chart-2)"
                  strokeWidth={2}
                  fill="url(#entradasAreaFill)"
                  dot={false}
                />
                <Area
                  type="monotone"
                  dataKey="salidas"
                  name="Salidas (uds.)"
                  stroke="var(--color-chart-4)"
                  strokeWidth={2}
                  fill="url(#salidasAreaFill)"
                  dot={false}
                />
              </ComposedChart>
            </ResponsiveContainer>
          )}
        </div>
      </div>
    </div>
  );
}
