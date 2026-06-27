import { useMemo, useState } from "react";
import { AlertTriangle, Eye, Search } from "lucide-react";
import { Anomalia, anomaliasMock } from "../data/appData";

const estadoClass: Record<Anomalia["estado"], string> = {
  pendiente: "bg-red-100 text-red-800 border-red-200",
  "en revision": "bg-yellow-100 text-yellow-800 border-yellow-200",
  resuelta: "bg-green-100 text-green-800 border-green-200",
  descartada: "bg-slate-100 text-slate-700 border-slate-200",
};

const estados: Anomalia["estado"][] = ["pendiente", "en revision", "resuelta", "descartada"];

export function Anomalias() {
  const [anomalias, setAnomalias] = useState<Anomalia[]>(anomaliasMock);
  const [detalleId, setDetalleId] = useState<string | null>(null);
  const [busqueda, setBusqueda] = useState("");
  const [estadoFiltro, setEstadoFiltro] = useState<"todos" | Anomalia["estado"]>("todos");
  const [observacion, setObservacion] = useState("");

  const filtradas = useMemo(() => {
    const query = busqueda.trim().toLowerCase();
    return anomalias.filter((anomalia) => {
      const coincideTexto = !query || `${anomalia.beneficiario} ${anomalia.tipo} ${anomalia.detalle}`.toLowerCase().includes(query);
      const coincideEstado = estadoFiltro === "todos" || anomalia.estado === estadoFiltro;
      return coincideTexto && coincideEstado;
    });
  }, [anomalias, busqueda, estadoFiltro]);

  const cambiarEstado = (id: string, estado: Anomalia["estado"]) => {
    setAnomalias((prev) => prev.map((anomalia) => (anomalia.id === id ? { ...anomalia, estado } : anomalia)));
  };

  const agregarObservacion = (id: string) => {
    const texto = observacion.trim();
    if (!texto) return;
    setAnomalias((prev) => prev.map((anomalia) => (anomalia.id === id ? { ...anomalia, observaciones: [...anomalia.observaciones, texto] } : anomalia)));
    setObservacion("");
  };

  return (
    <div className="space-y-5">
      <div className="grid gap-4 sm:grid-cols-4">
        <div className="rounded-xl border border-border bg-card p-4">
          <p className="text-xs uppercase tracking-wide text-muted-foreground">Pendientes</p>
          <p className="mt-2 text-2xl">{anomalias.filter((item) => item.estado === "pendiente").length}</p>
        </div>
        <div className="rounded-xl border border-border bg-card p-4">
          <p className="text-xs uppercase tracking-wide text-muted-foreground">En revision</p>
          <p className="mt-2 text-2xl">{anomalias.filter((item) => item.estado === "en revision").length}</p>
        </div>
        <div className="rounded-xl border border-border bg-card p-4">
          <p className="text-xs uppercase tracking-wide text-muted-foreground">Resueltas</p>
          <p className="mt-2 text-2xl">{anomalias.filter((item) => item.estado === "resuelta").length}</p>
        </div>
        <div className="rounded-xl border border-border bg-card p-4">
          <p className="text-xs uppercase tracking-wide text-muted-foreground">Tipos controlados</p>
          <p className="mt-2 text-2xl">5</p>
        </div>
      </div>

      <div className="overflow-hidden rounded-xl border border-border bg-card">
        <div className="space-y-4 border-b border-border bg-muted/30 px-5 py-4">
          <h2 className="flex items-center gap-2 text-sm">
            <AlertTriangle className="h-4 w-4 text-yellow-600" />
            Gestion de anomalias
          </h2>
          <div className="grid gap-3 md:grid-cols-[1fr_220px]">
            <div className="relative">
              <Search className="absolute left-3 top-1/2 h-4 w-4 -translate-y-1/2 text-muted-foreground" />
              <input value={busqueda} onChange={(event) => setBusqueda(event.target.value)} placeholder="Buscar por beneficiario, tipo o detalle" className="w-full rounded-xl border border-border bg-background py-2 pl-9 pr-3 text-sm outline-none focus:ring-2 focus:ring-blue-500" />
            </div>
            <select value={estadoFiltro} onChange={(event) => setEstadoFiltro(event.target.value as "todos" | Anomalia["estado"])} className="rounded-xl border border-border bg-background px-3 py-2 text-sm outline-none focus:ring-2 focus:ring-blue-500">
              <option value="todos">Todos los estados</option>
              {estados.map((estado) => <option key={estado} value={estado}>{estado}</option>)}
            </select>
          </div>
        </div>
        <div className="overflow-x-auto">
          <table className="w-full min-w-[860px]">
            <thead className="border-b border-border">
              <tr>
                {["Fecha", "Beneficiario", "Tipo", "Estado", "Accion"].map((header) => <th key={header} className="px-5 py-3 text-left text-xs uppercase tracking-wide text-muted-foreground">{header}</th>)}
              </tr>
            </thead>
            <tbody className="divide-y divide-border">
              {filtradas.map((anomalia) => (
                <tr key={anomalia.id} className="hover:bg-accent/20">
                  <td className="px-5 py-3 text-sm">{anomalia.fecha}</td>
                  <td className="px-5 py-3 text-sm">{anomalia.beneficiario}</td>
                  <td className="px-5 py-3 text-sm">{anomalia.tipo}</td>
                  <td className="px-5 py-3"><span className={`rounded-full border px-2.5 py-1 text-xs capitalize ${estadoClass[anomalia.estado]}`}>{anomalia.estado}</span></td>
                  <td className="px-5 py-3">
                    <div className="flex items-center gap-2">
                      <button onClick={() => setDetalleId(detalleId === anomalia.id ? null : anomalia.id)} className="rounded-lg p-2 text-muted-foreground hover:bg-accent" title="Ver detalle"><Eye className="h-4 w-4" /></button>
                      <select value={anomalia.estado} onChange={(event) => cambiarEstado(anomalia.id, event.target.value as Anomalia["estado"])} className="rounded-lg border border-border bg-background px-2 py-1.5 text-xs outline-none">
                        {estados.map((estado) => <option key={estado} value={estado}>{estado}</option>)}
                      </select>
                    </div>
                    {detalleId === anomalia.id && (
                      <div className="mt-2 max-w-xl space-y-2 rounded-lg bg-muted/50 p-2 text-xs text-muted-foreground">
                        <p>{anomalia.detalle}</p>
                        {anomalia.observaciones.map((item, index) => <p key={`${anomalia.id}-${index}`} className="border-l-2 border-border pl-2">{item}</p>)}
                        <div className="flex gap-2">
                          <input value={observacion} onChange={(event) => setObservacion(event.target.value)} placeholder="Agregar observacion" className="min-w-0 flex-1 rounded-lg border border-border bg-background px-2 py-1.5 text-xs text-foreground outline-none" />
                          <button onClick={() => agregarObservacion(anomalia.id)} className="rounded-lg border border-border px-2 py-1.5 text-xs text-foreground hover:bg-accent">Guardar</button>
                        </div>
                      </div>
                    )}
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
