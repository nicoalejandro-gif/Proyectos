import { Settings } from "lucide-react";
import { Role } from "../data/appData";

export function Configuracion({ role }: { role: Role }) {
  const items = role === "admin"
    ? ["Parametros del programa", "Usuarios internos", "Politicas de recarga", "Notificaciones municipales"]
    : ["Preferencias de monitoreo", "Alertas operativas", "Lineas supervisadas", "Notificaciones de incidentes"];

  return (
    <div className="rounded-xl border border-border bg-card p-5">
      <div className="mb-5 flex items-center gap-2">
        <Settings className="h-5 w-5 text-blue-700" />
        <h2 className="text-sm">Configuracion</h2>
      </div>
      <div className="grid gap-3 sm:grid-cols-2">
        {items.map((item) => (
          <div key={item} className="rounded-lg border border-border bg-background p-4">
            <p className="text-sm">{item}</p>
            <p className="mt-1 text-xs text-muted-foreground">Disponible para gestion interna segun perfil.</p>
          </div>
        ))}
      </div>
    </div>
  );
}
