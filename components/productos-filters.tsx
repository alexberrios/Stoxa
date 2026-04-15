"use client";

import { useRouter, useSearchParams } from "next/navigation";
import { useEffect, useState, useTransition } from "react";
import { Input } from "@/components/ui/input";
import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from "@/components/ui/select";
import type { Category } from "@/lib/types";

type Props = {
  categories: Pick<Category, "id" | "name">[];
};

export function ProductosFilters({ categories }: Props) {
  const router = useRouter();
  const searchParams = useSearchParams();
  const [pending, startTransition] = useTransition();
  const qParam = searchParams.get("q") ?? "";
  const [q, setQ] = useState(qParam);

  const categoria = searchParams.get("categoria") ?? "all";
  const estado = searchParams.get("estado") ?? "all";

  useEffect(() => {
    setQ(qParam);
  }, [qParam]);

  useEffect(() => {
    const t = setTimeout(() => {
      const trimmed = q.trim();
      const current = (qParam ?? "").trim();
      if (trimmed === current) return;
      const p = new URLSearchParams(searchParams.toString());
      if (trimmed) p.set("q", trimmed);
      else p.delete("q");
      startTransition(() => {
        router.push(`/productos?${p.toString()}`);
      });
    }, 400);
    return () => clearTimeout(t);
  }, [q, qParam, router, searchParams]);

  function pushParams(updates: Record<string, string | undefined>) {
    const p = new URLSearchParams(searchParams.toString());
    Object.entries(updates).forEach(([k, v]) => {
      if (v === undefined || v === "" || v === "all") p.delete(k);
      else p.set(k, v);
    });
    startTransition(() => {
      router.push(`/productos?${p.toString()}`);
    });
  }

  return (
    <div className="flex flex-col gap-3 sm:flex-row sm:flex-wrap sm:items-center">
      <Input
        placeholder="Buscar por nombre o SKU…"
        value={q}
        disabled={pending}
        className="max-w-md"
        onChange={(e) => setQ(e.target.value)}
      />
      <Select
        value={categoria}
        onValueChange={(v) =>
          pushParams({
            categoria: !v || v === "all" ? undefined : v,
          })
        }
        disabled={pending}
        itemToStringLabel={(id) => {
          if (id === "all") return "Todas las categorías";
          return categories.find((c) => c.id === id)?.name ?? "";
        }}
      >
        <SelectTrigger className="w-full sm:w-[200px]">
          <SelectValue placeholder="Categoría" />
        </SelectTrigger>
        <SelectContent>
          <SelectItem value="all">Todas las categorías</SelectItem>
          {categories.map((c) => (
            <SelectItem key={c.id} value={c.id}>
              {c.name}
            </SelectItem>
          ))}
        </SelectContent>
      </Select>
      <Select
        value={estado}
        onValueChange={(v) =>
          pushParams({
            estado: !v || v === "all" ? undefined : v,
          })
        }
        disabled={pending}
      >
        <SelectTrigger className="w-full sm:w-[200px]">
          <SelectValue placeholder="Estado" />
        </SelectTrigger>
        <SelectContent>
          <SelectItem value="all">Todos los estados</SelectItem>
          <SelectItem value="ok">Stock OK</SelectItem>
          <SelectItem value="low">Bajo stock</SelectItem>
          <SelectItem value="out">Sin stock</SelectItem>
        </SelectContent>
      </Select>
    </div>
  );
}
