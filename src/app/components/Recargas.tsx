import { useEffect, useState } from "react";
import { Search, Ticket } from "lucide-react";
import { supabase } from "../lib/supabase";

type BeneficiarioRecarga = {
  id: string;
  nombre: string;
  apellido: string;
  dni: string;
  boletosDisponibles: number;
};

type RecargaView = {
  id: string;
  beneficiarioId: string;
  beneficiario: string;
  dni: string;
  cantidad: number;
  fecha: string;
  operador: string;
};

type RechargePolicy = {
  id: string;
  max_tickets_per_operation: number;
  monthly_ticket_quota: number | null;
};

type RechargeRow = {
  id: string;
  quantity: number;
  performed_at: string;
  beneficiaries: { id: string; first_name: string; last_name: string; dni: string } | { id: string; first_name: string; last_name: string; dni: string }[] | null;
  profiles: { full_name: string } | { full_name: string }[] | null;
};

const DEFAULT_MAX_BOLETOS_POR_RECARGA = 15;

const firstRelation = <T,>(value: T | T[] | null) => (Array.isArray(value) ? value[0] : value);

export function Recargas() {
  const [dni, setDni] = useState("");
  const [cantidad, setCantidad] = useState(String(DEFAULT_MAX_BOLETOS_POR_RECARGA));
  const [recargas, setRecargas] = useState<RecargaView[]>([]);
  const [beneficiario, setBeneficiario] = useState<BeneficiarioRecarga | null>(null);
  const [policy, setPolicy] = useState<RechargePolicy | null>(null);
  const [mensaje, setMensaje] = useState("");
  const [loading, setLoading] = useState(true);
  const [saving, setSaving] = useState(false);
  const [searching, setSearching] = useState(false);

  const maxBoletos = policy?.max_tickets_per_operation ?? DEFAULT_MAX_BOLETOS_POR_RECARGA;

  const loadPolicy = async () => {
    const { data, error } = await supabase
      .from("recharge_policies")
      .select("id, max_tickets_per_operation, monthly_ticket_quota")
      .eq("active", true)
      .order("valid_from", { ascending: false })
      .limit(1)
      .maybeSingle<RechargePolicy>();

    if (error || !data) {
      setMensaje("No se encontro una politica de recarga activa.");
      setPolicy(null);
      return;
    }

    setPolicy(data);
    setCantidad(String(data.max_tickets_per_operation));
  };

  const mapRecarga = (row: RechargeRow): RecargaView => {
    const beneficiarioData = firstRelation(row.beneficiaries);
    const operadorData = firstRelation(row.profiles);

    return {
      id: row.id,
      beneficiarioId: beneficiarioData?.id ?? "",
      beneficiario: beneficiarioData ? `${beneficiarioData.last_name}, ${beneficiarioData.first_name}` : "Beneficiario no disponible",
      dni: beneficiarioData?.dni ?? "",
      cantidad: row.quantity,
      fecha: row.performed_at.slice(0, 10),
      operador: operadorData?.full_name ?? "Operador no disponible",
    };
  };

  const loadRecargas = async () => {
    setLoading(true);

    const { data, error } = await supabase
      .from("recharges")
      .select("id, quantity, performed_at, beneficiaries(id, first_name, last_name, dni), profiles(full_name)")
      .order("performed_at", { ascending: false })
      .limit(50)
      .returns<RechargeRow[]>();

    if (error) {
      setMensaje("No se pudo cargar el historial de recargas.");
      setRecargas([]);
    } else {
      setRecargas((data ?? []).map(mapRecarga));
    }

    setLoading(false);
  };

  const buscarBeneficiario = async (dniValue: string) => {
    const cleanDni = dniValue.trim();
    setBeneficiario(null);

    if (cleanDni.length < 7) return;

    setSearching(true);
    const { data, error } = await supabase
      .from("beneficiaries")
      .select("id, first_name, last_name, dni, available_tickets")
      .eq("dni", cleanDni)
      .maybeSingle();

    if (!error && data) {
      setBeneficiario({
        id: data.id,
        nombre: data.first_name,
        apellido: data.last_name,
        dni: data.dni,
        boletosDisponibles: data.available_tickets,
      });
    }

    setSearching(false);
  };

  useEffect(() => {
    loadPolicy();
    loadRecargas();
  }, []);

  useEffect(() => {
    const timeout = window.setTimeout(() => {
      buscarBeneficiario(dni);
    }, 250);

    return () => window.clearTimeout(timeout);
  }, [dni]);

  const handleRecargar = async (event: React.FormEvent) => {
    event.preventDefault();
    setMensaje("");

    if (!policy) {
      setMensaje("No hay una politica de recarga activa.");
      return;
    }

    if (!beneficiario) {
      setMensaje("Buscá un beneficiario válido por DNI antes de recargar.");
      return;
    }

    const cantidadNumerica = Number(cantidad);
    if (!Number.isInteger(cantidadNumerica) || cantidadNumerica <= 0) {
      setMensaje("La cantidad de boletos debe ser mayor a cero.");
      return;
    }

    if (cantidadNumerica > maxBoletos) {
      setMensaje(`La recarga no puede superar los ${maxBoletos} boletos por operacion.`);
      return;
    }

    setSaving(true);

    const { data: userData, error: userError } = await supabase.auth.getUser();
    if (userError || !userData.user) {
      setMensaje("No se pudo identificar el operador autenticado.");
      setSaving(false);
      return;
    }

    const { error } = await supabase
      .from("recharges")
      .insert({
        beneficiary_id: beneficiario.id,
        policy_id: policy.id,
        quantity: cantidadNumerica,
        operator_id: userData.user.id,
      });

    if (error) {
      setMensaje(error.message || "No se pudo registrar la recarga.");
      setSaving(false);
      return;
    }

    setMensaje("Recarga registrada correctamente.");
    setCantidad(String(maxBoletos));
    setBeneficiario((prev) => prev ? { ...prev, boletosDisponibles: prev.boletosDisponibles + cantidadNumerica } : prev);
    await loadRecargas();
    setSaving(false);
  };

  return (
    <div className="space-y-6">
      <form onSubmit={handleRecargar} className="rounded-xl border border-border bg-card p-5">
        <div className="mb-5 flex items-center gap-3">
          <div className="rounded-xl bg-blue-100 p-2 text-blue-700">
            <Ticket className="h-5 w-5" />
          </div>
          <div>
            <h2 className="text-lg">Recargar boletos</h2>
            <p className="text-sm text-muted-foreground">Buscar beneficiario por DNI y acreditar boletos.</p>
          </div>
        </div>

        <div className="grid gap-4 lg:grid-cols-[1fr_1fr_auto]">
          <div className="space-y-1.5">
            <label className="text-xs text-muted-foreground">DNI</label>
            <div className="relative">
              <Search className="absolute left-3 top-1/2 h-4 w-4 -translate-y-1/2 text-muted-foreground" />
              <input
                value={dni}
                onChange={(event) => setDni(event.target.value.replace(/\D/g, ""))}
                placeholder="Ej: 12345678"
                className="w-full rounded-xl border border-border bg-background py-2.5 pl-9 pr-3 text-sm outline-none focus:ring-2 focus:ring-blue-500"
              />
            </div>
          </div>

          <div className="space-y-1.5">
            <label className="text-xs text-muted-foreground">Cantidad de boletos</label>
            <input
              type="number"
              min="1"
              max={maxBoletos}
              value={cantidad}
              onChange={(event) => {
                const value = event.target.value;

                if (!value) {
                  setCantidad(value);
                  setMensaje("");
                  return;
                }

                const cantidadNumerica = Number(value);

                setCantidad(value);
                setMensaje(
                  cantidadNumerica > maxBoletos
                    ? `La recarga no puede superar los ${maxBoletos} boletos por operacion.`
                    : ""
                );
              }}
              className="w-full rounded-xl border border-border bg-background px-3 py-2.5 text-sm outline-none focus:ring-2 focus:ring-blue-500"
            />
            <p className="text-xs text-muted-foreground">Maximo {maxBoletos} boletos por operacion.</p>
          </div>

          <button disabled={saving || !policy} className="self-end rounded-xl bg-foreground px-5 py-2.5 text-sm text-background hover:opacity-90 disabled:cursor-not-allowed disabled:opacity-50">
            {saving ? "Registrando..." : "Recargar"}
          </button>
        </div>

        {beneficiario && (
          <div className="mt-4 rounded-xl border border-green-200 bg-green-50 p-4 text-sm text-green-900">
            <strong>{beneficiario.apellido}, {beneficiario.nombre}</strong>
            <p>Saldo actual: {beneficiario.boletosDisponibles} boletos.</p>
          </div>
        )}

        {searching && (
          <p className="mt-4 text-sm text-muted-foreground">Buscando beneficiario...</p>
        )}

        {mensaje && (
          <p className={`mt-4 text-sm ${mensaje.includes("correctamente") ? "text-green-700" : "text-destructive"}`}>
            {mensaje}
          </p>
        )}
      </form>

      <div className="overflow-hidden rounded-xl border border-border bg-card">
        <div className="border-b border-border bg-muted/30 px-5 py-4">
          <h3 className="text-sm">Historial de recargas</h3>
        </div>
        <div className="overflow-x-auto">
          <table className="w-full min-w-[680px]">
            <thead className="border-b border-border">
              <tr>
                {["Fecha", "Beneficiario", "DNI", "Cantidad", "Operador"].map((header) => (
                  <th key={header} className="px-5 py-3 text-left text-xs uppercase tracking-wide text-muted-foreground">
                    {header}
                  </th>
                ))}
              </tr>
            </thead>
            <tbody className="divide-y divide-border">
              {loading && (
                <tr>
                  <td colSpan={5} className="px-5 py-8 text-center text-sm text-muted-foreground">
                    Cargando historial...
                  </td>
                </tr>
              )}
              {!loading && recargas.length === 0 && (
                <tr>
                  <td colSpan={5} className="px-5 py-8 text-center text-sm text-muted-foreground">
                    Todavia no hay recargas registradas.
                  </td>
                </tr>
              )}
              {!loading && recargas.map((recarga) => (
                <tr key={recarga.id} className="hover:bg-accent/20">
                  <td className="px-5 py-3 text-sm">{recarga.fecha}</td>
                  <td className="px-5 py-3 text-sm">{recarga.beneficiario}</td>
                  <td className="px-5 py-3 text-sm tabular-nums">{recarga.dni}</td>
                  <td className="px-5 py-3 text-sm">+{recarga.cantidad}</td>
                  <td className="px-5 py-3 text-sm text-muted-foreground">{recarga.operador}</td>
                </tr>
              ))}
            </tbody>
          </table>
        </div>
      </div>
    </div>
  );
}
