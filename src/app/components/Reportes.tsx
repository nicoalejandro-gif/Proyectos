import { AlertTriangle, BarChart3, ClipboardList, CreditCard, Ticket, Users, Wrench } from "lucide-react";
import { anomaliasMock, beneficiariosMock, incidentesMock, recargasMock, Role, tarjetasMock, viajesMock } from "../data/appData";

const barras = [
  { label: "Ene", boletos: 920 },
  { label: "Feb", boletos: 1040 },
  { label: "Mar", boletos: 1180 },
  { label: "Abr", boletos: 1110 },
  { label: "May", boletos: 1260 },
  { label: "Jun", boletos: 1284 },
];

export function Reportes({ role }: { role: Role }) {
  const max = Math.max(...barras.map((item) => item.boletos));
  const boletosUtilizados = viajesMock.reduce((total, viaje) => total + viaje.boletosUtilizados, 0);
  const viajesRegistrados = viajesMock.length;
  const incidentesAbiertos = incidentesMock.filter((item) => item.estado === "abierto").length;

  const metricas = role === "admin"
    ? [
        { label: "Beneficiarios activos", value: beneficiariosMock.filter((item) => item.estado === "activo").length, detail: "Habilitados", icon: Users, color: "text-green-700 bg-green-50" },
        { label: "Beneficiarios registrados", value: beneficiariosMock.length, detail: "Total en padron", icon: Users, color: "text-blue-700 bg-blue-50" },
        { label: "Recargas realizadas", value: recargasMock.length, detail: "Operaciones", icon: ClipboardList, color: "text-purple-700 bg-purple-50" },
        { label: "Tarjetas bloqueadas", value: tarjetasMock.filter((item) => item.estado === "bloqueada").length, detail: "Control administrativo", icon: CreditCard, color: "text-red-700 bg-red-50" },
      ]
    : [
        { label: "Boletos utilizados", value: boletosUtilizados, detail: "Validaciones aceptadas", icon: Ticket, color: "text-green-700 bg-green-50" },
        { label: "Viajes registrados", value: viajesRegistrados, detail: "Servicios reportados", icon: BarChart3, color: "text-blue-700 bg-blue-50" },
        { label: "Anomalias", value: anomaliasMock.length, detail: "Ultimos registros", icon: AlertTriangle, color: "text-red-700 bg-red-50" },
        { label: "Incidentes abiertos", value: incidentesAbiertos, detail: "Requieren seguimiento", icon: Wrench, color: "text-yellow-700 bg-yellow-50" },
      ];

  return (
    <div className="space-y-6">
      <div className="grid gap-4 sm:grid-cols-2 xl:grid-cols-4">
        {metricas.map((metric) => {
          const Icon = metric.icon;
          return (
            <div key={metric.label} className="rounded-xl border border-border bg-card p-5">
              <div className="flex items-start justify-between gap-3">
                <div>
                  <p className="text-xs uppercase tracking-wide text-muted-foreground">{metric.label}</p>
                  <p className="mt-3 text-3xl">{metric.value.toLocaleString("es-AR")}</p>
                  <p className="mt-1 text-xs text-muted-foreground">{metric.detail}</p>
                </div>
                <div className={`rounded-xl p-2 ${metric.color}`}><Icon className="h-5 w-5" /></div>
              </div>
            </div>
          );
        })}
      </div>

      <div className="rounded-xl border border-border bg-card p-5">
        <div className="mb-6 flex items-center gap-2"><BarChart3 className="h-5 w-5 text-blue-700" /><h2 className="text-sm">{role === "admin" ? "Recargas y altas por mes" : "Uso por horario"}</h2></div>
        <div className="flex h-64 items-end gap-4">
          {barras.map((item) => <div key={item.label} className="flex h-full flex-1 flex-col justify-end gap-2"><div className="flex flex-1 items-end rounded-lg bg-muted/60 px-2"><div className="w-full rounded-t-lg bg-blue-600 transition-all" style={{ height: `${(item.boletos / max) * 100}%` }} title={`${item.boletos} boletos`} /></div><div className="text-center"><p className="text-xs text-muted-foreground">{item.label}</p><p className="text-xs tabular-nums">{item.boletos}</p></div></div>)}
        </div>
      </div>

      <div className="overflow-hidden rounded-xl border border-border bg-card">
        <div className="border-b border-border bg-muted/30 px-5 py-4"><h2 className="text-sm">{role === "admin" ? "Resumen administrativo" : "Resumen operativo"}</h2></div>
        <div className="overflow-x-auto">
          <table className="w-full min-w-[640px]"><thead className="border-b border-border"><tr>{["Indicador", "Valor", "Observacion"].map((header) => <th key={header} className="px-5 py-3 text-left text-xs uppercase tracking-wide text-muted-foreground">{header}</th>)}</tr></thead><tbody className="divide-y divide-border">
            {role === "admin" ? (
              <>
                <tr><td className="px-5 py-3 text-sm">Altas</td><td className="px-5 py-3 text-sm">{beneficiariosMock.filter((item) => item.fechaAlta.startsWith("2026-06")).length}</td><td className="px-5 py-3 text-sm text-muted-foreground">Mes actual</td></tr>
                <tr><td className="px-5 py-3 text-sm">Bajas</td><td className="px-5 py-3 text-sm">{beneficiariosMock.filter((item) => item.estado === "baja").length}</td><td className="px-5 py-3 text-sm text-muted-foreground">Beneficio inactivo</td></tr>
                <tr><td className="px-5 py-3 text-sm">Tarjetas emitidas</td><td className="px-5 py-3 text-sm">{tarjetasMock.filter((item) => item.fechaEmision).length}</td><td className="px-5 py-3 text-sm text-muted-foreground">Con numero asignado</td></tr>
              </>
            ) : (
              <>
                <tr><td className="px-5 py-3 text-sm">Uso por linea</td><td className="px-5 py-3 text-sm">Linea 3</td><td className="px-5 py-3 text-sm text-muted-foreground">Mayor volumen del dia</td></tr>
                <tr><td className="px-5 py-3 text-sm">Tiempo promedio de resolucion</td><td className="px-5 py-3 text-sm">18 h</td><td className="px-5 py-3 text-sm text-muted-foreground">Incidentes cerrados</td></tr>
                <tr><td className="px-5 py-3 text-sm">Validaciones rechazadas</td><td className="px-5 py-3 text-sm">{viajesMock.reduce((total, viaje) => total + viaje.validacionesRechazadas, 0)}</td><td className="px-5 py-3 text-sm text-muted-foreground">Control operativo</td></tr>
              </>
            )}
          </tbody></table>
        </div>
      </div>
    </div>
  );
}
