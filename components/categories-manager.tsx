"use client";

import { useState } from "react";
import { Pencil, Plus, Trash2 } from "lucide-react";
import type { Category } from "@/lib/types";
import {
  createCategory,
  deleteCategory,
  updateCategory,
} from "@/lib/actions/categories";
import { Button } from "@/components/ui/button";
import {
  Card,
  CardContent,
  CardDescription,
  CardHeader,
  CardTitle,
} from "@/components/ui/card";
import {
  Dialog,
  DialogContent,
  DialogFooter,
  DialogHeader,
  DialogTitle,
} from "@/components/ui/dialog";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import {
  Table,
  TableBody,
  TableCell,
  TableHead,
  TableHeader,
  TableRow,
} from "@/components/ui/table";
import { toast } from "sonner";

type Props = {
  initialCategories: Category[];
};

export function CategoriesManager({ initialCategories }: Props) {
  const [categories, setCategories] = useState(initialCategories);
  const [open, setOpen] = useState(false);
  const [editing, setEditing] = useState<Category | null>(null);
  const [name, setName] = useState("");
  const [color, setColor] = useState("#6366f1");
  const [loading, setLoading] = useState(false);

  function openCreate() {
    setEditing(null);
    setName("");
    setColor("#6366f1");
    setOpen(true);
  }

  function handleOpenChange(next: boolean) {
    setOpen(next);
    if (!next) setEditing(null);
  }

  function openEdit(c: Category) {
    setEditing(c);
    setName(c.name);
    setColor(c.color);
    setOpen(true);
  }

  async function handleSubmit(e: React.FormEvent) {
    e.preventDefault();
    setLoading(true);
    const payload = { name, color };
    const res = editing
      ? await updateCategory(editing.id, payload)
      : await createCategory(payload);
    setLoading(false);
    if ("error" in res && res.error) {
      const err = res.error;
      toast.error(typeof err === "string" ? err : "Revisa el formulario");
      return;
    }
    toast.success(editing ? "Categoría actualizada" : "Categoría creada");
    setOpen(false);
    window.location.reload();
  }

  async function handleDelete(id: string) {
    if (!confirm("¿Eliminar esta categoría?")) return;
    const res = await deleteCategory(id);
    if ("error" in res && res.error) {
      toast.error(
        typeof res.error === "string" ? res.error : "No se pudo eliminar",
      );
      return;
    }
    toast.success("Categoría eliminada");
    setCategories((prev) => prev.filter((c) => c.id !== id));
  }

  return (
    <Card>
      <CardHeader className="flex flex-row flex-wrap items-center justify-between gap-4">
        <div>
          <CardTitle>Categorías</CardTitle>
          <CardDescription>
            Agrupa productos por tipo y asígnale un color para identificarlos.
          </CardDescription>
        </div>
        <Button onClick={openCreate}>
          <Plus className="size-4" />
          Nueva categoría
        </Button>
        <Dialog open={open} onOpenChange={handleOpenChange}>
          <DialogContent>
            <form onSubmit={handleSubmit}>
              <DialogHeader>
                <DialogTitle>
                  {editing ? "Editar categoría" : "Nueva categoría"}
                </DialogTitle>
              </DialogHeader>
              <div className="flex flex-col gap-4 py-4">
                <div className="space-y-2">
                  <Label htmlFor="cat-name">Nombre</Label>
                  <Input
                    id="cat-name"
                    value={name}
                    onChange={(e) => setName(e.target.value)}
                    required
                    maxLength={120}
                  />
                </div>
                <div className="space-y-2">
                  <Label htmlFor="cat-color">Color</Label>
                  <div className="flex items-center gap-3">
                    <Input
                      id="cat-color"
                      type="color"
                      value={color}
                      onChange={(e) => setColor(e.target.value)}
                      className="h-10 w-16 cursor-pointer p-1"
                    />
                    <Input
                      value={color}
                      onChange={(e) => setColor(e.target.value)}
                      className="font-mono text-sm"
                      pattern="^#[0-9A-Fa-f]{6}$"
                    />
                  </div>
                </div>
              </div>
              <DialogFooter>
                <Button type="submit" disabled={loading}>
                  {loading ? "Guardando…" : "Guardar"}
                </Button>
              </DialogFooter>
            </form>
          </DialogContent>
        </Dialog>
      </CardHeader>
      <CardContent>
        {categories.length === 0 ? (
          <p className="text-sm text-muted-foreground">
            No hay categorías. Crea la primera para poder añadir productos.
          </p>
        ) : (
          <div className="overflow-x-auto rounded-lg border">
            <Table>
              <TableHeader>
                <TableRow>
                  <TableHead>Nombre</TableHead>
                  <TableHead>Color</TableHead>
                  <TableHead className="w-[120px] text-right">Acciones</TableHead>
                </TableRow>
              </TableHeader>
              <TableBody>
                {categories.map((c) => (
                  <TableRow key={c.id}>
                    <TableCell className="font-medium">{c.name}</TableCell>
                    <TableCell>
                      <span className="inline-flex items-center gap-2">
                        <span
                          className="size-4 rounded border"
                          style={{ backgroundColor: c.color }}
                          title={c.color}
                        />
                        <span className="font-mono text-xs text-muted-foreground">
                          {c.color}
                        </span>
                      </span>
                    </TableCell>
                    <TableCell className="text-right">
                      <Button
                        type="button"
                        variant="ghost"
                        size="icon-sm"
                        onClick={() => openEdit(c)}
                        aria-label="Editar"
                      >
                        <Pencil className="size-4" />
                      </Button>
                      <Button
                        type="button"
                        variant="ghost"
                        size="icon-sm"
                        onClick={() => void handleDelete(c.id)}
                        aria-label="Eliminar"
                      >
                        <Trash2 className="size-4" />
                      </Button>
                    </TableCell>
                  </TableRow>
                ))}
              </TableBody>
            </Table>
          </div>
        )}
      </CardContent>
    </Card>
  );
}
