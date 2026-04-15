"use client";

import Link from "next/link";
import { usePathname, useRouter } from "next/navigation";
import { useState } from "react";
import {
  ArrowLeftRight,
  BarChart3,
  Settings,
  LayoutDashboard,
  LogOut,
  Menu,
  Package,
  ScanLine,
  Tags,
} from "lucide-react";
import { createClient } from "@/lib/supabase/client";
import { Button, buttonVariants } from "@/components/ui/button";
import { Badge } from "@/components/ui/badge";
import { Sheet, SheetContent, SheetTrigger } from "@/components/ui/sheet";
import { cn } from "@/lib/utils";
import { toast } from "sonner";

const nav = [
  { href: "/", label: "Inicio", icon: LayoutDashboard },
  { href: "/productos", label: "Productos", icon: Package, alertKey: "products" as const },
  { href: "/categorias", label: "Categorías", icon: Tags },
  { href: "/movimientos", label: "Movimientos", icon: ArrowLeftRight },
  { href: "/reportes", label: "Reportes", icon: BarChart3 },
  { href: "/escanear", label: "Escanear QR", icon: ScanLine },
  { href: "/configuracion", label: "Configuración", icon: Settings },
];

type Props = {
  lowStockCount: number;
};

type NavLinksProps = {
  pathname: string;
  lowStockCount: number;
  onNavigate?: () => void;
};

function SidebarNavLinks({
  pathname,
  lowStockCount,
  onNavigate,
}: NavLinksProps) {
  return (
    <nav className="flex flex-col gap-1">
      {nav.map(({ href, label, icon: Icon, alertKey }) => {
        const active =
          href === "/"
            ? pathname === "/"
            : pathname === href || pathname.startsWith(`${href}/`);
        const showBadge = alertKey === "products" && lowStockCount > 0;
        return (
          <Link
            key={href}
            href={href}
            onClick={() => onNavigate?.()}
            className={cn(
              "flex items-center gap-3 rounded-lg px-3 py-2 text-sm font-medium transition-[color,background-color,transform,box-shadow] duration-200",
              active
                ? "bg-sidebar-primary/12 text-sidebar-primary shadow-sm ring-1 ring-sidebar-primary/20 dark:bg-sidebar-primary/18 dark:ring-sidebar-primary/25"
                : "text-sidebar-foreground hover:bg-sidebar-accent/90 hover:translate-x-0.5",
            )}
          >
            <Icon className="size-4 shrink-0" />
            <span className="flex-1">{label}</span>
            {showBadge ? (
              <Badge variant="destructive" className="text-xs">
                {lowStockCount > 99 ? "99+" : lowStockCount}
              </Badge>
            ) : null}
          </Link>
        );
      })}
    </nav>
  );
}

export function AppSidebar({ lowStockCount }: Props) {
  const pathname = usePathname();
  const router = useRouter();
  const [mobileOpen, setMobileOpen] = useState(false);

  async function handleSignOut() {
    const supabase = createClient();
    await supabase.auth.signOut();
    toast.success("Sesión cerrada");
    router.push("/login");
    router.refresh();
  }

  return (
    <>
      <aside className="hidden w-64 shrink-0 flex-col border-r border-sidebar-border bg-sidebar/95 text-sidebar-foreground shadow-[4px_0_24px_-8px_oklch(0.3_0.04_250/0.12)] backdrop-blur-sm dark:shadow-[4px_0_28px_-6px_oklch(0_0_0/0.35)] md:flex">
        <div className="flex h-16 items-center border-b border-sidebar-border px-4">
          <Link
            href="/"
            className="font-heading text-lg font-semibold tracking-tight text-sidebar-foreground"
          >
            <span className="text-sidebar-primary">Inventario</span>
            <span className="ml-1.5 text-xs font-sans font-normal text-muted-foreground">
              PYMES
            </span>
          </Link>
        </div>
        <div className="flex flex-1 flex-col gap-4 p-3">
          <SidebarNavLinks pathname={pathname} lowStockCount={lowStockCount} />
        </div>
        <div className="border-t border-sidebar-border p-3">
          <Button
            variant="ghost"
            className="w-full justify-start gap-3 text-sidebar-foreground"
            onClick={() => void handleSignOut()}
          >
            <LogOut className="size-4" />
            Cerrar sesión
          </Button>
        </div>
      </aside>

      <div className="flex h-14 items-center justify-between border-b bg-background/80 px-4 backdrop-blur-md md:hidden">
        <Sheet open={mobileOpen} onOpenChange={setMobileOpen}>
          <SheetTrigger
            className={cn(
              buttonVariants({ variant: "outline", size: "icon" }),
            )}
            aria-label="Abrir menú"
          >
            <Menu className="size-4" />
          </SheetTrigger>
          <SheetContent side="left" className="w-72 bg-sidebar p-0 text-sidebar-foreground">
            <div className="flex h-14 items-center border-b border-sidebar-border px-4">
              <span className="font-semibold">Inventario</span>
            </div>
            <div className="p-3">
              <SidebarNavLinks
                pathname={pathname}
                lowStockCount={lowStockCount}
                onNavigate={() => setMobileOpen(false)}
              />
            </div>
            <div className="border-t border-sidebar-border p-3">
              <Button
                variant="ghost"
                className="w-full justify-start gap-3"
                onClick={() => void handleSignOut()}
              >
                <LogOut className="size-4" />
                Cerrar sesión
              </Button>
            </div>
          </SheetContent>
        </Sheet>
        <Link href="/" className="font-heading font-semibold tracking-tight">
          Inventario
        </Link>
        {lowStockCount > 0 ? (
          <Badge variant="destructive">{lowStockCount > 99 ? "99+" : lowStockCount}</Badge>
        ) : (
          <span className="w-8" />
        )}
      </div>
    </>
  );
}
