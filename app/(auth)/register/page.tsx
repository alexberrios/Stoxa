"use client";

import Link from "next/link";
import { useRouter } from "next/navigation";
import { useState } from "react";
import { createClient } from "@/lib/supabase/client";
import { Button } from "@/components/ui/button";
import {
  Card,
  CardContent,
  CardDescription,
  CardFooter,
  CardHeader,
  CardTitle,
} from "@/components/ui/card";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { toast } from "sonner";

export default function RegisterPage() {
  const router = useRouter();
  const [email, setEmail] = useState("");
  const [password, setPassword] = useState("");
  const [loading, setLoading] = useState(false);

  async function handleSubmit(e: React.FormEvent) {
    e.preventDefault();
    if (password.length < 6) {
      toast.error("La contraseña debe tener al menos 6 caracteres");
      return;
    }
    setLoading(true);
    const supabase = createClient();
    const { error } = await supabase.auth.signUp({
      email: email.trim(),
      password,
    });
    setLoading(false);
    if (error) {
      toast.error(error.message);
      return;
    }
    toast.success("Cuenta creada. Te enviaremos un email de confirmación.");
    router.push("/login");
    router.refresh();
  }

  return (
    <Card className="mx-auto w-full max-w-md border-primary/15 shadow-xl shadow-primary/5 ring-1 ring-foreground/5 backdrop-blur-sm dark:ring-foreground/10">
      <CardHeader className="space-y-1">
        <CardTitle className="font-heading text-2xl">Crear cuenta</CardTitle>
        <CardDescription>
          Registra tu negocio para empezar a controlar stock y movimientos.
        </CardDescription>
        <p className="text-xs text-muted-foreground">
          Al registrarte, se enviará un email de confirmación a tu correo.
        </p>
      </CardHeader>
      <form onSubmit={handleSubmit}>
        <CardContent className="flex flex-col gap-4">
          <div className="space-y-2">
            <Label htmlFor="email">Correo electrónico</Label>
            <Input
              id="email"
              type="email"
              autoComplete="email"
              required
              value={email}
              onChange={(e) => setEmail(e.target.value)}
              placeholder="tu@empresa.com"
            />
          </div>
          <div className="space-y-2">
            <Label htmlFor="password">Contraseña (mín. 6 caracteres)</Label>
            <Input
              id="password"
              type="password"
              autoComplete="new-password"
              required
              minLength={6}
              value={password}
              onChange={(e) => setPassword(e.target.value)}
            />
          </div>
        </CardContent>
        <CardFooter className="flex flex-col gap-4 border-t pt-6">
          <Button type="submit" className="w-full" disabled={loading}>
            {loading ? "Creando…" : "Registrarse"}
          </Button>
          <p className="text-center text-sm text-muted-foreground">
            ¿Ya tienes cuenta?{" "}
            <Link href="/login" className="font-medium text-primary underline-offset-4 hover:underline">
              Iniciar sesión
            </Link>
          </p>
        </CardFooter>
      </form>
    </Card>
  );
}
