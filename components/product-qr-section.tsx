"use client";

import QRCode from "qrcode";
import { Printer } from "lucide-react";
import { useEffect, useState } from "react";
import { Button } from "@/components/ui/button";
import {
  Card,
  CardContent,
  CardDescription,
  CardHeader,
  CardTitle,
} from "@/components/ui/card";

type Props = {
  productName: string;
  sku: string;
  qrPayload: string;
};

export function ProductQrSection({ productName, sku, qrPayload }: Props) {
  const [dataUrl, setDataUrl] = useState<string | null>(null);

  useEffect(() => {
    let cancelled = false;
    QRCode.toDataURL(qrPayload, {
      width: 220,
      margin: 2,
      color: { dark: "#171717", light: "#ffffff" },
    }).then((url) => {
      if (!cancelled) setDataUrl(url);
    });
    return () => {
      cancelled = true;
    };
  }, [qrPayload]);

  function handlePrint() {
    const w = window.open("", "_blank", "width=400,height=520");
    if (!w) return;
    w.document.write(`
      <!DOCTYPE html>
      <html lang="es">
        <head>
          <meta charset="utf-8" />
          <title>QR — ${productName}</title>
          <style>
            body { font-family: system-ui, sans-serif; text-align: center; padding: 24px; }
            h1 { font-size: 18px; margin: 0 0 8px; }
            p { margin: 4px 0; color: #444; font-size: 14px; }
            img { margin: 16px auto; display: block; }
          </style>
        </head>
        <body>
          <h1>${productName}</h1>
          <p>SKU: <strong>${sku}</strong></p>
          ${dataUrl ? `<img src="${dataUrl}" alt="QR" width="220" height="220" />` : ""}
          <p style="font-size:11px;word-break:break-all;">${qrPayload}</p>
          <script>window.onload = () => { window.print(); }</script>
        </body>
      </html>
    `);
    w.document.close();
  }

  return (
    <Card>
      <CardHeader className="flex flex-row flex-wrap items-center justify-between gap-4">
        <div>
          <CardTitle>Código QR</CardTitle>
          <CardDescription>
            Enlaza al detalle del producto. Imprime una etiqueta para el almacén.
          </CardDescription>
        </div>
        <Button type="button" variant="outline" onClick={handlePrint} disabled={!dataUrl}>
          <Printer className="size-4" />
          Imprimir etiqueta
        </Button>
      </CardHeader>
      <CardContent className="flex flex-wrap items-center gap-8">
        {dataUrl ? (
          // eslint-disable-next-line @next/next/no-img-element
          <img
            src={dataUrl}
            alt={`Código QR de ${productName}`}
            width={220}
            height={220}
            className="rounded-lg border bg-white p-2"
          />
        ) : (
          <div className="flex size-[220px] items-center justify-center rounded-lg border bg-muted text-sm text-muted-foreground">
            Generando…
          </div>
        )}
        <div className="max-w-md space-y-2 text-sm text-muted-foreground">
          <p>
            <span className="font-medium text-foreground">Contenido:</span>{" "}
            <code className="break-all rounded bg-muted px-1 py-0.5 text-xs">
              {qrPayload}
            </code>
          </p>
        </div>
      </CardContent>
    </Card>
  );
}
