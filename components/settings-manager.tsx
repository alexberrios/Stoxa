"use client";

import { useMemo, useState } from "react";
import { Pencil, Plus, Trash2 } from "lucide-react";
import type { ExchangeRate, TeamUser } from "@/lib/types";
import {
  createExchangeRate,
  createTeamUser,
  deleteExchangeRate,
  deleteTeamUser,
  updateExchangeRate,
  updateTeamUser,
} from "@/lib/actions/settings";
import { Badge } from "@/components/ui/badge";
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
import { FormattedNumberInput } from "@/components/formatted-number-input";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from "@/components/ui/select";
import {
  Table,
  TableBody,
  TableCell,
  TableHead,
  TableHeader,
  TableRow,
} from "@/components/ui/table";
import { Tabs, TabsContent, TabsList, TabsTrigger } from "@/components/ui/tabs";
import { toast } from "sonner";

type Props = {
  initialTeamUsers: TeamUser[];
  initialExchangeRates: ExchangeRate[];
};

type TeamRole = TeamUser["role"];

const roleLabel: Record<TeamRole, string> = {
  ADMIN: "Administrador",
  OPERADOR: "Operador",
  LECTOR: "Lector",
};

export function SettingsManager({ initialTeamUsers, initialExchangeRates }: Props) {
  const [teamUsers, setTeamUsers] = useState(initialTeamUsers);
  const [exchangeRates, setExchangeRates] = useState(initialExchangeRates);

  const [teamOpen, setTeamOpen] = useState(false);
  const [editingTeam, setEditingTeam] = useState<TeamUser | null>(null);
  const [teamName, setTeamName] = useState("");
  const [teamEmail, setTeamEmail] = useState("");
  const [teamRole, setTeamRole] = useState<TeamRole>("OPERADOR");
  const [teamActive, setTeamActive] = useState(true);
  const [teamLoading, setTeamLoading] = useState(false);

  const [rateOpen, setRateOpen] = useState(false);
  const [editingRate, setEditingRate] = useState<ExchangeRate | null>(null);
  const [rateCode, setRateCode] = useState("EUR");
  const [rateName, setRateName] = useState("Euro");
  const [rateValue, setRateValue] = useState("1");
  const [rateIsBase, setRateIsBase] = useState(true);
  const [rateLoading, setRateLoading] = useState(false);

  const sortedRates = useMemo(
    () =>
      [...exchangeRates].sort((a, b) => {
        if (a.is_base === b.is_base) return a.code.localeCompare(b.code);
        return a.is_base ? -1 : 1;
      }),
    [exchangeRates],
  );

  function openTeamCreate() {
    setEditingTeam(null);
    setTeamName("");
    setTeamEmail("");
    setTeamRole("OPERADOR");
    setTeamActive(true);
    setTeamOpen(true);
  }

  function openTeamEdit(row: TeamUser) {
    setEditingTeam(row);
    setTeamName(row.name);
    setTeamEmail(row.email);
    setTeamRole(row.role);
    setTeamActive(row.active);
    setTeamOpen(true);
  }

  function openRateCreate() {
    setEditingRate(null);
    setRateCode("EUR");
    setRateName("Euro");
    setRateValue("1");
    setRateIsBase(exchangeRates.length === 0);
    setRateOpen(true);
  }

  function openRateEdit(row: ExchangeRate) {
    setEditingRate(row);
    setRateCode(row.code);
    setRateName(row.name);
    setRateValue(String(row.rate_to_base));
    setRateIsBase(row.is_base);
    setRateOpen(true);
  }

  async function handleSubmitTeam(e: React.FormEvent) {
    e.preventDefault();
    setTeamLoading(true);

    const payload = {
      name: teamName,
      email: teamEmail,
      role: teamRole,
      active: teamActive,
    };
    const res = editingTeam
      ? await updateTeamUser(editingTeam.id, payload)
      : await createTeamUser(payload);
    setTeamLoading(false);

    if ("error" in res && res.error) {
      toast.error(typeof res.error === "string" ? res.error : "Revisa el formulario");
      return;
    }

    toast.success(editingTeam ? "Usuario actualizado" : "Usuario añadido");
    setTeamOpen(false);
    window.location.reload();
  }

  async function handleDeleteTeam(id: string) {
    if (!confirm("¿Eliminar este usuario de la configuración?")) return;
    const res = await deleteTeamUser(id);
    if ("error" in res && res.error) {
      toast.error(typeof res.error === "string" ? res.error : "No se pudo eliminar");
      return;
    }
    toast.success("Usuario eliminado");
    setTeamUsers((prev) => prev.filter((row) => row.id !== id));
  }

  async function handleSubmitRate(e: React.FormEvent) {
    e.preventDefault();
    setRateLoading(true);

    const payload = {
      code: rateCode,
      name: rateName,
      rate_to_base: rateValue,
      is_base: rateIsBase,
    };
    const res = editingRate
      ? await updateExchangeRate(editingRate.id, payload)
      : await createExchangeRate(payload);
    setRateLoading(false);

    if ("error" in res && res.error) {
      toast.error(typeof res.error === "string" ? res.error : "Revisa el formulario");
      return;
    }

    toast.success(editingRate ? "Tipo de cambio actualizado" : "Tipo de cambio creado");
    setRateOpen(false);
    window.location.reload();
  }

  async function handleDeleteRate(id: string) {
    if (!confirm("¿Eliminar esta moneda?")) return;
    const res = await deleteExchangeRate(id);
    if ("error" in res && res.error) {
      toast.error(typeof res.error === "string" ? res.error : "No se pudo eliminar");
      return;
    }
    toast.success("Moneda eliminada");
    setExchangeRates((prev) => prev.filter((row) => row.id !== id));
  }

  return (
    <Tabs defaultValue="usuarios" className="space-y-4">
      <TabsList>
        <TabsTrigger value="usuarios">Usuarios</TabsTrigger>
        <TabsTrigger value="cambio">Tipo de cambio</TabsTrigger>
      </TabsList>

      <TabsContent value="usuarios">
        <Card>
          <CardHeader className="flex flex-row flex-wrap items-center justify-between gap-4">
            <div>
              <CardTitle>Usuarios del negocio</CardTitle>
              <CardDescription>
                Define las personas que participan en la operación y su rol interno.
              </CardDescription>
            </div>
            <Button onClick={openTeamCreate}>
              <Plus className="size-4" />
              Añadir usuario
            </Button>
          </CardHeader>
          <CardContent>
            {teamUsers.length === 0 ? (
              <p className="text-sm text-muted-foreground">
                No hay usuarios configurados. Añade el primero para empezar.
              </p>
            ) : (
              <div className="overflow-x-auto rounded-lg border">
                <Table>
                  <TableHeader>
                    <TableRow>
                      <TableHead>Nombre</TableHead>
                      <TableHead>Email</TableHead>
                      <TableHead>Rol</TableHead>
                      <TableHead>Estado</TableHead>
                      <TableHead className="w-[120px] text-right">Acciones</TableHead>
                    </TableRow>
                  </TableHeader>
                  <TableBody>
                    {teamUsers.map((row) => (
                      <TableRow key={row.id}>
                        <TableCell className="font-medium">{row.name}</TableCell>
                        <TableCell>{row.email}</TableCell>
                        <TableCell>{roleLabel[row.role]}</TableCell>
                        <TableCell>
                          {row.active ? (
                            <Badge>Activo</Badge>
                          ) : (
                            <Badge variant="secondary">Inactivo</Badge>
                          )}
                        </TableCell>
                        <TableCell className="text-right">
                          <Button
                            type="button"
                            variant="ghost"
                            size="icon-sm"
                            onClick={() => openTeamEdit(row)}
                            aria-label="Editar usuario"
                          >
                            <Pencil className="size-4" />
                          </Button>
                          <Button
                            type="button"
                            variant="ghost"
                            size="icon-sm"
                            onClick={() => void handleDeleteTeam(row.id)}
                            aria-label="Eliminar usuario"
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
      </TabsContent>

      <TabsContent value="cambio">
        <Card>
          <CardHeader className="flex flex-row flex-wrap items-center justify-between gap-4">
            <div>
              <CardTitle>Tipos de cambio</CardTitle>
              <CardDescription>
                Define monedas como EUR, USD o CLP y su equivalencia respecto a la base. La
                fila con insignia «Moneda base» define el símbolo en precios, valor de stock e
                informes.
              </CardDescription>
            </div>
            <Button onClick={openRateCreate}>
              <Plus className="size-4" />
              Añadir moneda
            </Button>
          </CardHeader>
          <CardContent>
            {exchangeRates.length === 0 ? (
              <p className="text-sm text-muted-foreground">
                No hay monedas configuradas. Añade una moneda base para comenzar.
              </p>
            ) : (
              <div className="overflow-x-auto rounded-lg border">
                <Table>
                  <TableHeader>
                    <TableRow>
                      <TableHead>Moneda</TableHead>
                      <TableHead>Nombre</TableHead>
                      <TableHead>Tipo de cambio</TableHead>
                      <TableHead>Base</TableHead>
                      <TableHead className="w-[120px] text-right">Acciones</TableHead>
                    </TableRow>
                  </TableHeader>
                  <TableBody>
                    {sortedRates.map((row) => (
                      <TableRow key={row.id}>
                        <TableCell className="font-medium">{row.code}</TableCell>
                        <TableCell>{row.name}</TableCell>
                        <TableCell className="tabular-nums">
                          {Number(row.rate_to_base).toLocaleString("es-ES", {
                            minimumFractionDigits: 2,
                            maximumFractionDigits: 6,
                          })}
                        </TableCell>
                        <TableCell>
                          {row.is_base ? (
                            <Badge>Moneda base</Badge>
                          ) : (
                            <Badge variant="secondary">Secundaria</Badge>
                          )}
                        </TableCell>
                        <TableCell className="text-right">
                          <Button
                            type="button"
                            variant="ghost"
                            size="icon-sm"
                            onClick={() => openRateEdit(row)}
                            aria-label="Editar tipo de cambio"
                          >
                            <Pencil className="size-4" />
                          </Button>
                          <Button
                            type="button"
                            variant="ghost"
                            size="icon-sm"
                            onClick={() => void handleDeleteRate(row.id)}
                            aria-label="Eliminar tipo de cambio"
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
      </TabsContent>

      <Dialog open={teamOpen} onOpenChange={setTeamOpen}>
        <DialogContent>
          <form onSubmit={handleSubmitTeam}>
            <DialogHeader>
              <DialogTitle>
                {editingTeam ? "Editar usuario" : "Añadir usuario"}
              </DialogTitle>
            </DialogHeader>
            <div className="space-y-4 py-4">
              <div className="space-y-2">
                <Label htmlFor="team-name">Nombre</Label>
                <Input
                  id="team-name"
                  value={teamName}
                  onChange={(e) => setTeamName(e.target.value)}
                  required
                  maxLength={120}
                />
              </div>
              <div className="space-y-2">
                <Label htmlFor="team-email">Email</Label>
                <Input
                  id="team-email"
                  type="email"
                  value={teamEmail}
                  onChange={(e) => setTeamEmail(e.target.value)}
                  required
                  maxLength={160}
                />
              </div>
              <div className="space-y-2">
                <Label>Rol</Label>
                <Select value={teamRole} onValueChange={(v) => setTeamRole(v as TeamRole)}>
                  <SelectTrigger className="w-full">
                    <SelectValue />
                  </SelectTrigger>
                  <SelectContent>
                    <SelectItem value="ADMIN">Administrador</SelectItem>
                    <SelectItem value="OPERADOR">Operador</SelectItem>
                    <SelectItem value="LECTOR">Lector</SelectItem>
                  </SelectContent>
                </Select>
              </div>
              <div className="space-y-2">
                <Label>Estado</Label>
                <Select
                  value={teamActive ? "true" : "false"}
                  onValueChange={(v) => setTeamActive(v === "true")}
                >
                  <SelectTrigger className="w-full">
                    <SelectValue />
                  </SelectTrigger>
                  <SelectContent>
                    <SelectItem value="true">Activo</SelectItem>
                    <SelectItem value="false">Inactivo</SelectItem>
                  </SelectContent>
                </Select>
              </div>
            </div>
            <DialogFooter>
              <Button type="submit" disabled={teamLoading}>
                {teamLoading ? "Guardando..." : "Guardar"}
              </Button>
            </DialogFooter>
          </form>
        </DialogContent>
      </Dialog>

      <Dialog open={rateOpen} onOpenChange={setRateOpen}>
        <DialogContent>
          <form onSubmit={handleSubmitRate}>
            <DialogHeader>
              <DialogTitle>
                {editingRate ? "Editar moneda" : "Añadir moneda"}
              </DialogTitle>
            </DialogHeader>
            <div className="space-y-4 py-4">
              <div className="space-y-2">
                <Label htmlFor="currency-code">Código</Label>
                <Input
                  id="currency-code"
                  value={rateCode}
                  onChange={(e) => setRateCode(e.target.value.toUpperCase())}
                  maxLength={3}
                  required
                  placeholder="EUR"
                />
              </div>
              <div className="space-y-2">
                <Label htmlFor="currency-name">Nombre</Label>
                <Input
                  id="currency-name"
                  value={rateName}
                  onChange={(e) => setRateName(e.target.value)}
                  required
                  maxLength={80}
                />
              </div>
              <div className="space-y-2">
                <Label htmlFor="currency-rate">Tipo de cambio</Label>
                <FormattedNumberInput
                  id="currency-rate"
                  mode="decimal"
                  maxFractionDigits={12}
                  min="0.000001"
                  value={rateValue}
                  onValueChange={setRateValue}
                  required
                />
                <p className="text-xs text-muted-foreground">
                  Valor relativo a la moneda base (ejemplo: si EUR es base, USD puede ser 1.09).
                </p>
              </div>
              <div className="space-y-2">
                <Label>¿Es moneda base?</Label>
                <Select
                  value={rateIsBase ? "true" : "false"}
                  onValueChange={(v) => setRateIsBase(v === "true")}
                >
                  <SelectTrigger className="w-full">
                    <SelectValue />
                  </SelectTrigger>
                  <SelectContent>
                    <SelectItem value="true">Sí</SelectItem>
                    <SelectItem value="false">No</SelectItem>
                  </SelectContent>
                </Select>
              </div>
            </div>
            <DialogFooter>
              <Button type="submit" disabled={rateLoading}>
                {rateLoading ? "Guardando..." : "Guardar"}
              </Button>
            </DialogFooter>
          </form>
        </DialogContent>
      </Dialog>
    </Tabs>
  );
}
