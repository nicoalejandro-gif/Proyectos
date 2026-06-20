import { useMemo, useState } from "react";
import { Search, Ticket } from "lucide-react";
import { beneficiariosMock, recargasMock, Recarga } from "../data/mockData";

export function Recargas() {
  const [dni, setDni] = useState("");
  const [cantidad, setCantidad] = useState("15");
  const [recargas, setRecargas] = useState<Recarga[]>(recargasMock);
  const [mensaje, setMensaje] = useState("");

  const beneficiario = useMemo(
    () => beneficiariosMock.find((item) => item.dni === dni.trim()),
    [dni]
  );

  const handleRecargar = (event: React.FormEvent) => {
    event.preventDefault();
    setMensaje("");

    if (!beneficiario) {
      setMensaje("Buscá un beneficiario válido por DNI antes de recargar.");
      return;
    }

    const cantidadNumerica = Number(cantidad);
    if (!Number.isInteger(cantidadNumerica) || cantidadNumerica <= 0) {
      setMensaje("La cantidad de boletos debe ser mayor a cero.");
      return;
    }

    const nuevaRecarga: Recarga = {
      id: `R${String(Date.now()).slice(-4)}`,
      beneficiarioId: beneficiario.id,
      beneficiario: `${beneficiario.apellido}, ${beneficiario.nombre}`,
      dni: beneficiario.dni,
      cantidad: cantidadNumerica,
      fecha: new Date().toISOString().slice(0, 10),
      operador: "Administrador Municipal",
    };

    setRecargas((prev) => [nuevaRecarga, ...prev]);
    setMensaje("Recarga registrada correctamente.");
    setCantidad("15");
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
              value={cantidad}
              onChange={(event) => setCantidad(event.target.value)}
              className="w-full rounded-xl border border-border bg-background px-3 py-2.5 text-sm outline-none focus:ring-2 focus:ring-blue-500"
            />
          </div>

          <button className="self-end rounded-xl bg-foreground px-5 py-2.5 text-sm text-background hover:opacity-90">
            Recargar
          </button>
        </div>

        {beneficiario && (
          <div className="mt-4 rounded-xl border border-green-200 bg-green-50 p-4 text-sm text-green-900">
            <strong>{beneficiario.apellido}, {beneficiario.nombre}</strong>
            <p>Saldo actual: {beneficiario.boletosDisponibles} boletos.</p>
          </div>
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
              {recargas.map((recarga) => (
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
