import { useMemo, useState } from "react";
import { CreditCard, Search } from "lucide-react";
import { Tarjeta, tarjetasMock } from "../data/appData";

const estadoClass: Record<Tarjeta["estado"], string> = {
  activa: "bg-green-100 text-green-800 border-green-200",
  pendiente: "bg-yellow-100 text-yellow-800 border-yellow-200",
  bloqueada: "bg-red-100 text-red-800 border-red-200",
};

export function Tarjetas() {
  const [tarjetas, setTarjetas] = useState<Tarjeta[]>(tarjetasMock);
  const [busqueda, setBusqueda] = useState("");

  const filtradas = useMemo(() => {
    const query = busqueda.trim().toLowerCase();
    if (!query) return tarjetas;
    return tarjetas.filter((tarjeta) => `${tarjeta.beneficiario} ${tarjeta.numero} ${tarjeta.estado}`.toLowerCase().includes(query));
  }, [tarjetas, busqueda]);

  const cambiarBloqueo = (id: string) => {
    setTarjetas((prev) => prev.map((tarjeta) => tarjeta.id === id ? { ...tarjeta, estado: tarjeta.estado === "bloqueada" ? "activa" : "bloqueada", motivoBloqueo: tarjeta.estado === "bloqueada" ? undefined : "Bloqueo administrativo" } : tarjeta));
  };

  const reemplazarTarjeta = (id: string) => {
    setTarjetas((prev) => prev.map((tarjeta) => tarjeta.id === id ? { ...tarjeta, numero: "Pendiente", estado: "pendiente", fechaEmision: undefined, motivoBloqueo: "Reemplazo solicitado" } : tarjeta));
  };

  const solicitarEmision = () => {
    const pendiente = tarjetas.find((tarjeta) => tarjeta.estado === "pendiente");
    if (!pendiente) return;
    setTarjetas((prev) => prev.map((tarjeta) => tarjeta.id === pendiente.id ? { ...tarjeta, numero: `6060-${String(prev.length + 1).padStart(4, "0")}`, estado: "activa", fechaEmision: new Date().toISOString().slice(0, 10) } : tarjeta));
  };

  return (
    <div className="space-y-5">
      <div className="flex flex-col gap-3 sm:flex-row sm:items-center sm:justify-between">
        <div className="relative w-full sm:max-w-sm">
          <Search className="absolute left-3 top-1/2 h-4 w-4 -translate-y-1/2 text-muted-foreground" />
          <input value={busqueda} onChange={(event) => setBusqueda(event.target.value)} placeholder="Buscar tarjeta o beneficiario" className="w-full rounded-xl border border-border bg-background py-2 pl-9 pr-3 text-sm outline-none focus:ring-2 focus:ring-blue-500" />
        </div>
        <button onClick={solicitarEmision} className="inline-flex items-center justify-center gap-2 rounded-xl bg-foreground px-4 py-2 text-sm text-background hover:opacity-90">
          <CreditCard className="h-4 w-4" />
          Solicitar emision
        </button>
      </div>

      <div className="overflow-hidden rounded-xl border border-border bg-card">
        <div className="overflow-x-auto">
          <table className="w-full min-w-[760px]">
            <thead className="border-b border-border bg-muted/30">
              <tr>{["Numero", "Beneficiario", "Estado", "Emision", "Acciones"].map((header) => <th key={header} className="px-5 py-3 text-left text-xs uppercase tracking-wide text-muted-foreground">{header}</th>)}</tr>
            </thead>
            <tbody className="divide-y divide-border">
              {filtradas.map((tarjeta) => (
                <tr key={tarjeta.id} className="hover:bg-accent/20">
                  <td className="px-5 py-3 text-sm tabular-nums">{tarjeta.numero}</td>
                  <td className="px-5 py-3 text-sm">{tarjeta.beneficiario}</td>
                  <td className="px-5 py-3"><span className={`rounded-full border px-2.5 py-1 text-xs capitalize ${estadoClass[tarjeta.estado]}`}>{tarjeta.estado}</span></td>
                  <td className="px-5 py-3 text-sm text-muted-foreground">{tarjeta.fechaEmision ?? "Pendiente"}</td>
                  <td className="px-5 py-3">
                    <div className="flex gap-2">
                      <button onClick={() => cambiarBloqueo(tarjeta.id)} disabled={tarjeta.estado === "pendiente"} className="rounded-lg border border-border px-3 py-1.5 text-xs hover:bg-accent disabled:cursor-not-allowed disabled:opacity-50">{tarjeta.estado === "bloqueada" ? "Desbloquear" : "Bloquear"}</button>
                      <button onClick={() => reemplazarTarjeta(tarjeta.id)} disabled={tarjeta.estado === "pendiente"} className="rounded-lg border border-border px-3 py-1.5 text-xs hover:bg-accent disabled:cursor-not-allowed disabled:opacity-50">Reemplazar</button>
                    </div>
                  </td>
                </tr>
              ))}
            </tbody>
          </table>
        </div>
      </div>
    </div>
  );
}
