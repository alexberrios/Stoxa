import { AppSidebar } from "@/components/app-sidebar";
import { createClient } from "@/lib/supabase/server";

export default async function DashboardLayout({
  children,
}: {
  children: React.ReactNode;
}) {
  const supabase = await createClient();
  let lowStockCount = 0;
  const { data, error } = await supabase.rpc("count_low_stock");
  if (!error && typeof data === "number") {
    lowStockCount = data;
  }

  return (
    <div className="flex min-h-screen flex-col bg-transparent md:flex-row">
      <AppSidebar lowStockCount={lowStockCount} />
      <main className="relative flex min-h-0 flex-1 flex-col overflow-auto p-4 md:p-6 md:pl-8 md:pr-10 md:py-8">
        <div
          className="pointer-events-none absolute inset-x-0 top-0 h-32 bg-gradient-to-b from-primary/[0.06] to-transparent dark:from-primary/[0.12]"
          aria-hidden
        />
        <div className="relative z-10 flex-1">{children}</div>
      </main>
    </div>
  );
}
