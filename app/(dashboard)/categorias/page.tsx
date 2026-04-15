import { createClient } from "@/lib/supabase/server";
import { CategoriesManager } from "@/components/categories-manager";
import type { Category } from "@/lib/types";

export default async function CategoriasPage() {
  const supabase = await createClient();
  const { data, error } = await supabase
    .from("categories")
    .select("*")
    .order("name");

  if (error) {
    return (
      <div className="rounded-lg border border-destructive/50 bg-destructive/10 p-4 text-sm">
        No se pudieron cargar las categorías: {error.message}
      </div>
    );
  }

  return (
    <div className="mx-auto max-w-4xl space-y-6">
      <div>
        <h1 className="text-2xl font-semibold tracking-tight">Categorías</h1>
        <p className="text-muted-foreground">
          Organiza el catálogo por familias de producto.
        </p>
      </div>
      <CategoriesManager initialCategories={(data ?? []) as Category[]} />
    </div>
  );
}
