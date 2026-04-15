import { createClient } from "@/lib/supabase/server";
import { getDisplayCurrencyCode } from "@/lib/currency";
import { ProductForm } from "@/components/product-form";
import type { Category } from "@/lib/types";

export default async function NuevoProductoPage() {
  const supabase = await createClient();
  const {
    data: { user },
  } = await supabase.auth.getUser();
  if (!user) return null;

  const { data: categories } = await supabase
    .from("categories")
    .select("*")
    .order("name");

  const displayCurrency = await getDisplayCurrencyCode(supabase);

  return (
    <div className="mx-auto max-w-4xl space-y-6">
      <div>
        <h1 className="text-2xl font-semibold tracking-tight">Nuevo producto</h1>
        <p className="text-muted-foreground">
          Añade un artículo al inventario con SKU único en tu cuenta.
        </p>
      </div>
      <ProductForm
        userId={user.id}
        categories={(categories ?? []) as Category[]}
        currencyCode={displayCurrency}
      />
    </div>
  );
}
