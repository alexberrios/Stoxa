import Link from "next/link";
import { notFound } from "next/navigation";
import { createClient } from "@/lib/supabase/server";
import { getDisplayCurrencyCode } from "@/lib/currency";
import { ProductForm } from "@/components/product-form";
import { ProductQrSection } from "@/components/product-qr-section";
import type { Category, Product } from "@/lib/types";
import { buttonVariants } from "@/components/ui/button";
import { cn } from "@/lib/utils";

export default async function EditarProductoPage({
  params,
}: {
  params: Promise<{ id: string }>;
}) {
  const { id } = await params;
  const supabase = await createClient();
  const {
    data: { user },
  } = await supabase.auth.getUser();
  if (!user) return null;

  const { data: product, error } = await supabase
    .from("products")
    .select("*")
    .eq("id", id)
    .maybeSingle();

  if (error || !product) notFound();

  const { data: categories } = await supabase
    .from("categories")
    .select("*")
    .order("name");

  const displayCurrency = await getDisplayCurrencyCode(supabase);

  const appUrl =
    process.env.NEXT_PUBLIC_APP_URL?.replace(/\/$/, "") ?? "http://localhost:3000";
  const qrPayload = `${appUrl}/productos/${id}`;

  return (
    <div className="mx-auto max-w-4xl space-y-10">
      <div className="flex flex-wrap items-center justify-between gap-4">
        <div>
          <h1 className="text-2xl font-semibold tracking-tight">
            Editar producto
          </h1>
          <p className="text-muted-foreground">{product.name}</p>
        </div>
        <Link
          href="/productos"
          className={cn(buttonVariants({ variant: "outline" }))}
        >
          Volver al listado
        </Link>
      </div>

      <ProductQrSection
        productName={product.name}
        sku={product.sku}
        qrPayload={qrPayload}
      />

      <ProductForm
        userId={user.id}
        categories={(categories ?? []) as Category[]}
        product={product as Product}
        currencyCode={displayCurrency}
      />
    </div>
  );
}
