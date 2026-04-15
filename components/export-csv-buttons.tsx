"use client";

import { Download } from "lucide-react";
import { Button } from "@/components/ui/button";
import { toast } from "sonner";

export function ExportCsvButtons() {
  async function download(kind: "productos" | "movimientos") {
    try {
      const res = await fetch(`/api/export/${kind}`);
      if (!res.ok) {
        const t = await res.text();
        throw new Error(t || res.statusText);
      }
      const blob = await res.blob();
      const cd = res.headers.get("Content-Disposition");
      let filename = `${kind}.csv`;
      const m = cd?.match(/filename="?([^";\n]+)"?/);
      if (m?.[1]) filename = m[1];
      const url = URL.createObjectURL(blob);
      const a = document.createElement("a");
      a.href = url;
      a.download = filename;
      a.click();
      URL.revokeObjectURL(url);
      toast.success("Descarga iniciada");
    } catch (e) {
      toast.error(e instanceof Error ? e.message : "Error al exportar");
    }
  }

  return (
    <div className="flex flex-wrap gap-2">
      <Button type="button" variant="outline" onClick={() => void download("productos")}>
        <Download className="size-4" />
        Productos (CSV)
      </Button>
      <Button type="button" variant="outline" onClick={() => void download("movimientos")}>
        <Download className="size-4" />
        Movimientos (CSV)
      </Button>
    </div>
  );
}
