import { actividadesMock } from "../data/appData";

export function Auditoria() {
  return (
    <div className="overflow-hidden rounded-xl border border-border bg-card">
      <div className="border-b border-border bg-muted/30 px-5 py-4">
        <h2 className="text-sm">Auditoria</h2>
        <p className="text-xs text-muted-foreground">Registro de solo lectura de acciones del sistema.</p>
      </div>
      <div className="overflow-x-auto">
        <table className="w-full min-w-[720px]">
          <thead className="border-b border-border">
            <tr>{["Fecha", "Hora", "Usuario", "Accion", "Detalle"].map((header) => <th key={header} className="px-5 py-3 text-left text-xs uppercase tracking-wide text-muted-foreground">{header}</th>)}</tr>
          </thead>
          <tbody className="divide-y divide-border">
            {actividadesMock.map((actividad) => {
              const [fecha, hora = ""] = actividad.fecha.split(" ");
              return (
                <tr key={actividad.id} className="hover:bg-accent/20">
                  <td className="px-5 py-3 text-sm">{fecha}</td>
                  <td className="px-5 py-3 text-sm">{hora}</td>
                  <td className="px-5 py-3 text-sm">{actividad.usuario}</td>
                  <td className="px-5 py-3 text-sm">{actividad.accion}</td>
                  <td className="px-5 py-3 text-sm text-muted-foreground">{actividad.detalle}</td>
                </tr>
              );
            })}
          </tbody>
        </table>
      </div>
    </div>
  );
}
