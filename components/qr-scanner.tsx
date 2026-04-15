"use client";

import { Html5Qrcode } from "html5-qrcode";
import { useRouter } from "next/navigation";
import { useEffect, useRef, useState } from "react";
import { createClient } from "@/lib/supabase/client";
import { Button } from "@/components/ui/button";
import {
  Card,
  CardContent,
  CardDescription,
  CardHeader,
  CardTitle,
} from "@/components/ui/card";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { toast } from "sonner";

export function QrScanner() {
  const router = useRouter();
  const [manualSku, setManualSku] = useState("");
  const [running, setRunning] = useState(false);
  const scannerRef = useRef<Html5Qrcode | null>(null);
  const decodedGuard = useRef(false);
  const regionId = "qr-reader-region";

  useEffect(() => {
    return () => {
      void scannerRef.current?.stop().catch(() => {});
      scannerRef.current = null;
    };
  }, []);

  async function findProductBySku(sku: string): Promise<boolean> {
    const trimmed = sku.trim();
    if (!trimmed) return false;
    const supabase = createClient();
    const { data, error } = await supabase
      .from("products")
      .select("id")
      .eq("sku", trimmed)
      .maybeSingle();
    if (error) {
      toast.error(error.message);
      return false;
    }
    if (!data) {
      toast.error("No hay producto con ese SKU");
      return false;
    }
    router.push(`/productos/${data.id}`);
    return true;
  }

  async function handleDecoded(text: string) {
    if (decodedGuard.current) return;
    const trimmed = text.trim();
    if (!trimmed) return;
    decodedGuard.current = true;
    await stopCamera();
    try {
      const u = new URL(trimmed);
      const path = u.pathname;
      const match = path.match(/\/productos\/([0-9a-f-]{36})/i);
      if (match?.[1]) {
        router.push(`/productos/${match[1]}`);
        return;
      }
    } catch {
      /* no es URL */
    }
    const ok = await findProductBySku(trimmed);
    if (!ok) decodedGuard.current = false;
  }

  async function startCamera() {
    decodedGuard.current = false;
    const el = document.getElementById(regionId);
    if (!el) return;
    if (scannerRef.current) {
      await scannerRef.current.stop().catch(() => {});
    }
    const scanner = new Html5Qrcode(regionId);
    scannerRef.current = scanner;
    setRunning(true);
    try {
      await scanner.start(
        { facingMode: "environment" },
        { fps: 10, qrbox: { width: 260, height: 260 } },
        (decoded) => {
          void handleDecoded(decoded);
        },
        () => {},
      );
    } catch (e) {
      setRunning(false);
      scannerRef.current = null;
      toast.error(
        e instanceof Error
          ? e.message
          : "No se pudo acceder a la cámara. Comprueba permisos.",
      );
    }
  }

  async function stopCamera() {
    if (!scannerRef.current) return;
    try {
      await scannerRef.current.stop();
    } catch {
      /* */
    }
    scannerRef.current = null;
    setRunning(false);
  }

  return (
    <div className="space-y-8">
      <Card>
        <CardHeader>
          <CardTitle>Escanear con cámara</CardTitle>
          <CardDescription>
            Apunta al código QR del producto. Si contiene la URL del detalle, se abrirá
            directamente; si es texto, se buscará por SKU.
          </CardDescription>
        </CardHeader>
        <CardContent className="space-y-4">
          <div
            id={regionId}
            className="mx-auto min-h-[260px] max-w-md overflow-hidden rounded-lg border bg-black/5"
          />
          <div className="flex flex-wrap gap-2">
            {!running ? (
              <Button type="button" onClick={() => void startCamera()}>
                Iniciar cámara
              </Button>
            ) : (
              <Button type="button" variant="secondary" onClick={() => void stopCamera()}>
                Detener
              </Button>
            )}
          </div>
        </CardContent>
      </Card>

      <Card>
        <CardHeader>
          <CardTitle>Introducir SKU manualmente</CardTitle>
          <CardDescription>
            Si no puedes usar la cámara, escribe el SKU y busca el producto.
          </CardDescription>
        </CardHeader>
        <CardContent className="flex flex-col gap-4 sm:flex-row sm:items-end">
          <div className="flex-1 space-y-2">
            <Label htmlFor="sku-manual">SKU</Label>
            <Input
              id="sku-manual"
              className="font-mono"
              value={manualSku}
              onChange={(e) => setManualSku(e.target.value)}
              placeholder="Ej.: SKU-001"
            />
          </div>
          <Button
            type="button"
            onClick={() => void findProductBySku(manualSku)}
          >
            Buscar
          </Button>
        </CardContent>
      </Card>
    </div>
  );
}
