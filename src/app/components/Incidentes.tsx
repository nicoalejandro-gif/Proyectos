import { useState } from "react";
import { Plus, Wrench } from "lucide-react";
import { Incidente, incidentesMock } from "../data/appData";

const prioridadClass: Record<Incidente["prioridad"], string> = {
  baja: "bg-slate-100 text-slate-700 border-slate-200",
  media: "bg-yellow-100 text-yellow-800 border-yellow-200",
  alta: "bg-red-100 text-red-800 border-red-200",
};

export function Incidentes() {
  const [incidentes, setIncidentes] = useState<Incidente[]>(incidentesMock);
  const [titulo, setTitulo] = useState("");
  const [linea, setLinea] = useState("Linea 1");
  const [descripcion, setDescripcion] = useState("");

  const crearIncidente = (event: React.FormEvent) => {
    event.preventDefault();
    if (!titulo.trim() || !descripcion.trim()) return;
    setIncidentes((prev) => [{ id: `I${String(Date.now()).slice(-4)}`, fecha: new Date().toISOString().slice(0, 16).replace("T", " "), titulo: titulo.trim(), linea, prioridad: "media", estado: "abierto", responsable: "Supervisor de Transporte", descripcion: descripcion.trim() }, ...prev]);
    setTitulo("");
    setDescripcion("");
  };

  const cambiarPrioridad = (id: string, prioridad: Incidente["prioridad"]) => setIncidentes((prev) => prev.map((incidente) => incidente.id === id ? { ...incidente, prioridad } : incidente));
  const cerrar = (id: string) => setIncidentes((prev) => prev.map((incidente) => incidente.id === id ? { ...incidente, estado: "cerrado" } : incidente));

  return (
    <div className="space-y-5">
      <form onSubmit={crearIncidente} className="rounded-xl border border-border bg-card p-5">
        <div className="mb-4 flex items-center gap-2"><Wrench className="h-5 w-5 text-blue-700" /><h2 className="text-sm">Crear incidente</h2></div>
        <div className="grid gap-3 md:grid-cols-[1fr_160px_1fr_auto]">
          <input value={titulo} onChange={(event) => setTitulo(event.target.value)} placeholder="Titulo" className="rounded-xl border border-border bg-background px-3 py-2 text-sm outline-none focus:ring-2 focus:ring-blue-500" />
          <select value={linea} onChange={(event) => setLinea(event.target.value)} className="rounded-xl border border-border bg-background px-3 py-2 text-sm outline-none"><option>Linea 1</option><option>Linea 2</option><option>Linea 3</option></select>
          <input value={descripcion} onChange={(event) => setDescripcion(event.target.value)} placeholder="Descripcion" className="rounded-xl border border-border bg-background px-3 py-2 text-sm outline-none focus:ring-2 focus:ring-blue-500" />
          <button className="inline-flex items-center justify-center gap-2 rounded-xl bg-foreground px-4 py-2 text-sm text-background hover:opacity-90"><Plus className="h-4 w-4" />Crear</button>
        </div>
      </form>

      <div className="overflow-hidden rounded-xl border border-border bg-card">
        <div className="overflow-x-auto">
          <table className="w-full min-w-[820px]">
            <thead className="border-b border-border bg-muted/30"><tr>{["Fecha", "Incidente", "Linea", "Prioridad", "Estado", "Acciones"].map((header) => <th key={header} className="px-5 py-3 text-left text-xs uppercase tracking-wide text-muted-foreground">{header}</th>)}</tr></thead>
            <tbody className="divide-y divide-border">
              {incidentes.map((incidente) => (
                <tr key={incidente.id} className="hover:bg-accent/20">
                  <td className="px-5 py-3 text-sm">{incidente.fecha}</td>
                  <td className="px-5 py-3 text-sm"><p>{incidente.titulo}</p><p className="text-xs text-muted-foreground">{incidente.descripcion}</p></td>
                  <td className="px-5 py-3 text-sm">{incidente.linea}</td>
                  <td className="px-5 py-3"><span className={`rounded-full border px-2.5 py-1 text-xs capitalize ${prioridadClass[incidente.prioridad]}`}>{incidente.prioridad}</span></td>
                  <td className="px-5 py-3 text-sm capitalize">{incidente.estado}</td>
                  <td className="px-5 py-3"><div className="flex gap-2"><select value={incidente.prioridad} onChange={(event) => cambiarPrioridad(incidente.id, event.target.value as Incidente["prioridad"])} className="rounded-lg border border-border bg-background px-2 py-1.5 text-xs outline-none"><option value="baja">baja</option><option value="media">media</option><option value="alta">alta</option></select><button onClick={() => cerrar(incidente.id)} disabled={incidente.estado === "cerrado"} className="rounded-lg border border-border px-3 py-1.5 text-xs hover:bg-accent disabled:opacity-50">Cerrar</button></div></td>
                </tr>
              ))}
            </tbody>
          </table>
        </div>
      </div>
    </div>
  );
}
