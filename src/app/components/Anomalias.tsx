import { useState } from "react";
import { AlertTriangle, Eye } from "lucide-react";
import { Anomalia, anomaliasMock } from "../data/mockData";

const estadoClass: Record<Anomalia["estado"], string> = {
  pendiente: "bg-red-100 text-red-800 border-red-200",
  revisada: "bg-yellow-100 text-yellow-800 border-yellow-200",
  resuelta: "bg-green-100 text-green-800 border-green-200",
};

export function Anomalias() {
  const [anomalias, setAnomalias] = useState<Anomalia[]>(anomaliasMock);
  const [detalleId, setDetalleId] = useState<string | null>(null);

  const cambiarEstado = (id: string) => {
    setAnomalias((prev) =>
      prev.map((anomalia) =>
        anomalia.id === id
          ? { ...anomalia, estado: anomalia.estado === "pendiente" ? "revisada" : "resuelta" }
          : anomalia
      )
    );
  };

  return (
    <div className="space-y-5">
      <div className="grid gap-4 sm:grid-cols-3">
        <div className="rounded-xl border border-border bg-card p-4">
          <p className="text-xs uppercase tracking-wide text-muted-foreground">Pendientes</p>
          <p className="mt-2 text-2xl">{anomalias.filter((item) => item.estado === "pendiente").length}</p>
        </div>
        <div className="rounded-xl border border-border bg-card p-4">
          <p className="text-xs uppercase tracking-wide text-muted-foreground">Revisadas</p>
          <p className="mt-2 text-2xl">{anomalias.filter((item) => item.estado === "revisada").length}</p>
        </div>
        <div className="rounded-xl border border-border bg-card p-4">
          <p className="text-xs uppercase tracking-wide text-muted-foreground">Regla de duplicados</p>
          <p className="mt-2 text-2xl">5 min</p>
        </div>
      </div>

      <div className="overflow-hidden rounded-xl border border-border bg-card">
        <div className="border-b border-border bg-muted/30 px-5 py-4">
          <h2 className="flex items-center gap-2 text-sm">
            <AlertTriangle className="h-4 w-4 text-yellow-600" />
            Gestión de anomalías
          </h2>
        </div>
        <div className="overflow-x-auto">
          <table className="w-full min-w-[760px]">
            <thead className="border-b border-border">
              <tr>
                {["Fecha", "Beneficiario", "Tipo", "Estado", "Acción"].map((header) => (
                  <th key={header} className="px-5 py-3 text-left text-xs uppercase tracking-wide text-muted-foreground">
                    {header}
                  </th>
                ))}
              </tr>
            </thead>
            <tbody className="divide-y divide-border">
              {anomalias.map((anomalia) => (
                <tr key={anomalia.id} className="hover:bg-accent/20">
                  <td className="px-5 py-3 text-sm">{anomalia.fecha}</td>
                  <td className="px-5 py-3 text-sm">{anomalia.beneficiario}</td>
                  <td className="px-5 py-3 text-sm">{anomalia.tipo}</td>
                  <td className="px-5 py-3">
                    <span className={`rounded-full border px-2.5 py-1 text-xs capitalize ${estadoClass[anomalia.estado]}`}>
                      {anomalia.estado}
                    </span>
                  </td>
                  <td className="px-5 py-3">
                    <div className="flex items-center gap-2">
                      <button
                        onClick={() => setDetalleId(detalleId === anomalia.id ? null : anomalia.id)}
                        className="rounded-lg p-2 text-muted-foreground hover:bg-accent"
                        title="Ver detalle"
                      >
                        <Eye className="h-4 w-4" />
                      </button>
                      <button
                        onClick={() => cambiarEstado(anomalia.id)}
                        className="rounded-lg border border-border px-3 py-1.5 text-xs hover:bg-accent"
                      >
                        Marcar avance
                      </button>
                    </div>
                    {detalleId === anomalia.id && (
                      <p className="mt-2 max-w-md rounded-lg bg-muted/50 p-2 text-xs text-muted-foreground">
                        {anomalia.detalle}
                      </p>
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
