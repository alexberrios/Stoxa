"use client";

import Link from "next/link";
import { useRouter } from "next/navigation";
import { useState } from "react";
import { applyStockMovement } from "@/lib/actions/movements";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { FormattedNumberInput } from "@/components/formatted-number-input";
import { Textarea } from "@/components/ui/textarea";
import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from "@/components/ui/select";
import { toast } from "sonner";

type ProductOption = { id: string; name: string; sku: string };

type Props = {
  products: ProductOption[];
};

export function MovementForm({ products }: Props) {
  const router = useRouter();
  const [loading, setLoading] = useState(false);
  const [productId, setProductId] = useState(products[0]?.id ?? "");
  const [type, setType] = useState<"IN" | "OUT">("IN");
  const [quantity, setQuantity] = useState("1");
  const [reason, setReason] = useState("");
  const [occurredAt, setOccurredAt] = useState(() => {
    const d = new Date();
    d.setMinutes(d.getMinutes() - d.getTimezoneOffset());
    return d.toISOString().slice(0, 16);
  });

  async function handleSubmit(e: React.FormEvent) {
    e.preventDefault();
    if (!productId) {
      toast.error("Selecciona un producto");
      return;
    }
    setLoading(true);
    const iso = new Date(occurredAt).toISOString();
    const res = await applyStockMovement({
      product_id: productId,
      type,
      quantity: Number(quantity),
      reason: reason.trim(),
      occurred_at: iso,
    });
    setLoading(false);
    if ("error" in res && res.error) {
      const err = res.error;
      toast.error(typeof err === "string" ? err : "No se pudo registrar el movimiento");
      return;
    }
    toast.success("Movimiento registrado");
    setReason("");
    setQuantity("1");
    router.refresh();
  }

  if (products.length === 0) {
    return (
      <p className="text-sm text-muted-foreground">
        Necesitas al menos un producto.{" "}
        <Link href="/productos/nuevo" className="font-medium text-primary underline">
          Crear producto
        </Link>
      </p>
    );
  }

  return (
    <form onSubmit={handleSubmit} className="grid gap-4 sm:grid-cols-2 lg:grid-cols-3">
      <div className="space-y-2 sm:col-span-2 lg:col-span-1">
        <Label>Producto</Label>
        <Select
          value={productId}
          onValueChange={(v) => v != null && setProductId(v)}
          itemToStringLabel={(id) =>
            products.find((p) => p.id === id)?.name ?? ""
          }
        >
          <SelectTrigger className="w-full">
            <SelectValue placeholder="Seleccionar…" />
          </SelectTrigger>
          <SelectContent>
            {products.map((p) => (
              <SelectItem key={p.id} value={p.id}>
                <span className="font-medium">{p.name}</span>
                <span className="ml-2 font-mono text-xs text-muted-foreground">
                  {p.sku}
                </span>
              </SelectItem>
            ))}
          </SelectContent>
        </Select>
      </div>
      <div className="space-y-2">
        <Label>Tipo</Label>
        <Select
          value={type}
          onValueChange={(v) => v && setType(v as "IN" | "OUT")}
        >
          <SelectTrigger>
            <SelectValue />
          </SelectTrigger>
          <SelectContent>
            <SelectItem value="IN">Entrada</SelectItem>
            <SelectItem value="OUT">Salida</SelectItem>
          </SelectContent>
        </Select>
      </div>
      <div className="space-y-2">
        <Label htmlFor="qty-m">Cantidad</Label>
        <FormattedNumberInput
          id="qty-m"
          mode="integer"
          min={1}
          required
          value={quantity}
          onValueChange={setQuantity}
        />
      </div>
      <div className="space-y-2 sm:col-span-2">
        <Label htmlFor="reason">Motivo</Label>
        <Textarea
          id="reason"
          placeholder="Ej.: Compra proveedor, venta mostrador, ajuste inventario…"
          value={reason}
          onChange={(e) => setReason(e.target.value)}
          rows={2}
          maxLength={500}
        />
      </div>
      <div className="space-y-2">
        <Label htmlFor="when">Fecha y hora</Label>
        <Input
          id="when"
          type="datetime-local"
          required
          value={occurredAt}
          onChange={(e) => setOccurredAt(e.target.value)}
        />
      </div>
      <div className="flex items-end sm:col-span-2 lg:col-span-3">
        <Button type="submit" disabled={loading}>
          {loading ? "Guardando…" : "Registrar movimiento"}
        </Button>
      </div>
    </form>
  );
}
