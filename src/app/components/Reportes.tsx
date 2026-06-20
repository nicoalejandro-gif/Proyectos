import { AlertTriangle, BarChart3, ClipboardList, Ticket, Users } from "lucide-react";
import { anomaliasMock, beneficiariosMock, recargasMock } from "../data/mockData";

const metricas = [
  { label: "Beneficiarios registrados", value: beneficiariosMock.length, detail: "Total en padrón municipal", icon: Users, color: "text-blue-700 bg-blue-50" },
  { label: "Boletos utilizados", value: 1284, detail: "Mock mensual", icon: Ticket, color: "text-green-700 bg-green-50" },
  { label: "Recargas realizadas", value: recargasMock.length, detail: "Operaciones registradas", icon: ClipboardList, color: "text-purple-700 bg-purple-50" },
  { label: "Anomalías detectadas", value: anomaliasMock.length, detail: "Últimos 30 días", icon: AlertTriangle, color: "text-red-700 bg-red-50" },
];

const barras = [
  { label: "Ene", boletos: 920 },
  { label: "Feb", boletos: 1040 },
  { label: "Mar", boletos: 1180 },
  { label: "Abr", boletos: 1110 },
  { label: "May", boletos: 1260 },
  { label: "Jun", boletos: 1284 },
];

export function Reportes() {
  const max = Math.max(...barras.map((item) => item.boletos));

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
                <div className={`rounded-xl p-2 ${metric.color}`}>
                  <Icon className="h-5 w-5" />
                </div>
              </div>
            </div>
          );
        })}
      </div>

      <div className="rounded-xl border border-border bg-card p-5">
        <div className="mb-6 flex items-center gap-2">
          <BarChart3 className="h-5 w-5 text-blue-700" />
          <h2 className="text-sm">Boletos utilizados por mes</h2>
        </div>
        <div className="flex h-64 items-end gap-4">
          {barras.map((item) => (
            <div key={item.label} className="flex h-full flex-1 flex-col justify-end gap-2">
              <div className="flex flex-1 items-end rounded-lg bg-muted/60 px-2">
                <div className="w-full rounded-t-lg bg-blue-600 transition-all" style={{ height: `${(item.boletos / max) * 100}%` }} title={`${item.boletos} boletos`} />
              </div>
              <div className="text-center">
                <p className="text-xs text-muted-foreground">{item.label}</p>
                <p className="text-xs tabular-nums">{item.boletos}</p>
              </div>
            </div>
          ))}
        </div>
      </div>

      <div className="overflow-hidden rounded-xl border border-border bg-card">
        <div className="border-b border-border bg-muted/30 px-5 py-4">
          <h2 className="text-sm">Resumen operativo</h2>
        </div>
        <div className="overflow-x-auto">
          <table className="w-full min-w-[640px]">
            <thead className="border-b border-border">
              <tr>
                {["Indicador", "Valor", "Observación"].map((header) => (
                  <th key={header} className="px-5 py-3 text-left text-xs uppercase tracking-wide text-muted-foreground">{header}</th>
                ))}
              </tr>
            </thead>
            <tbody className="divide-y divide-border">
              <tr>
                <td className="px-5 py-3 text-sm">Beneficiarios activos</td>
                <td className="px-5 py-3 text-sm">{beneficiariosMock.filter((item) => item.estado === "activo").length}</td>
                <td className="px-5 py-3 text-sm text-muted-foreground">Disponibles para uso del beneficio</td>
              </tr>
              <tr>
                <td className="px-5 py-3 text-sm">Recargas estándar</td>
                <td className="px-5 py-3 text-sm">15 boletos</td>
                <td className="px-5 py-3 text-sm text-muted-foreground">Carga habitual cuando corresponde</td>
              </tr>
              <tr>
                <td className="px-5 py-3 text-sm">Detección de duplicados</td>
                <td className="px-5 py-3 text-sm">5 minutos</td>
                <td className="px-5 py-3 text-sm text-muted-foreground">Ventana de control para anomalías</td>
              </tr>
            </tbody>
          </table>
        </div>
      </div>
    </div>
  );
}
