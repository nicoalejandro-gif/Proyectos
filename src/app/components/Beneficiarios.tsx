import { useMemo, useState } from "react";
import { Edit2, Eye, Lock, Search, Trash2, UserPlus, X } from "lucide-react";
import { Beneficiario, beneficiariosMock, calcularEdad } from "../data/appData";

type FormState = {
  nombre: string;
  apellido: string;
  dni: string;
  fechaNacimiento: string;
  direccion: string;
  barrio: string;
  localidad: string;
};

const emptyForm: FormState = {
  nombre: "",
  apellido: "",
  dni: "",
  fechaNacimiento: "",
  direccion: "",
  barrio: "",
  localidad: "Oberá",
};

const estadoClass: Record<Beneficiario["estado"], string> = {
  activo: "bg-green-100 text-green-800 border-green-200",
  bloqueado: "bg-yellow-100 text-yellow-800 border-yellow-200",
  baja: "bg-red-100 text-red-800 border-red-200",
};

const formatDni = (dni: string) => dni.replace(/\B(?=(\d{3})+(?!\d))/g, ".");

export function Beneficiarios({ readOnly = false }: { readOnly?: boolean }) {
  const [beneficiarios, setBeneficiarios] = useState<Beneficiario[]>(beneficiariosMock);
  const [busqueda, setBusqueda] = useState("");
  const [showForm, setShowForm] = useState(false);
  const [form, setForm] = useState<FormState>(emptyForm);
  const [errors, setErrors] = useState<Partial<Record<keyof FormState, string>>>({});
  const [editId, setEditId] = useState<string | null>(null);
  const [viewId, setViewId] = useState<string | null>(null);

  const filtered = useMemo(() => {
    const query = busqueda.trim().toLowerCase();
    if (!query) return beneficiarios;

    return beneficiarios.filter((beneficiario) =>
      `${beneficiario.dni} ${beneficiario.nombre} ${beneficiario.apellido} ${beneficiario.localidad}`
        .toLowerCase()
        .includes(query)
    );
  }, [beneficiarios, busqueda]);

  const selected = beneficiarios.find((beneficiario) => beneficiario.id === viewId);

  const validate = () => {
    const nextErrors: Partial<Record<keyof FormState, string>> = {};

    if (!form.nombre.trim()) nextErrors.nombre = "Campo obligatorio";
    if (!form.apellido.trim()) nextErrors.apellido = "Campo obligatorio";
    if (!form.dni.trim()) nextErrors.dni = "Campo obligatorio";
    if (form.dni.trim() && !/^\d{7,8}$/.test(form.dni.trim())) {
      nextErrors.dni = "Ingresá un DNI válido sin puntos";
    }
    if (!form.fechaNacimiento) nextErrors.fechaNacimiento = "Fecha obligatoria";
    if (!form.direccion.trim()) nextErrors.direccion = "Campo obligatorio";
    if (!form.barrio.trim()) nextErrors.barrio = "Campo obligatorio";
    if (!form.localidad.trim()) nextErrors.localidad = "Campo obligatorio";

    return nextErrors;
  };

  const resetForm = () => {
    setForm(emptyForm);
    setErrors({});
    setEditId(null);
    setShowForm(false);
  };

  const handleSubmit = (event: React.FormEvent) => {
    event.preventDefault();
    const nextErrors = validate();

    if (Object.keys(nextErrors).length > 0) {
      setErrors(nextErrors);
      return;
    }

    if (editId) {
      setBeneficiarios((prev) =>
        prev.map((beneficiario) =>
          beneficiario.id === editId ? { ...beneficiario, ...form, dni: form.dni.trim() } : beneficiario
        )
      );
    } else {
      const nuevo: Beneficiario = {
        id: `B${String(Date.now()).slice(-4)}`,
        ...form,
        dni: form.dni.trim(),
        estado: "activo",
        boletosDisponibles: 0,
        fechaAlta: new Date().toISOString().slice(0, 10),
      };

      setBeneficiarios((prev) => [nuevo, ...prev]);
    }

    resetForm();
  };

  const handleEdit = (beneficiario: Beneficiario) => {
    setForm({
      nombre: beneficiario.nombre,
      apellido: beneficiario.apellido,
      dni: beneficiario.dni,
      fechaNacimiento: beneficiario.fechaNacimiento,
      direccion: beneficiario.direccion,
      barrio: beneficiario.barrio,
      localidad: beneficiario.localidad,
    });
    setEditId(beneficiario.id);
    setErrors({});
    setShowForm(true);
  };

  const bloquear = (id: string) => {
    setBeneficiarios((prev) =>
      prev.map((beneficiario) =>
        beneficiario.id === id
          ? { ...beneficiario, estado: beneficiario.estado === "bloqueado" ? "activo" : "bloqueado" }
          : beneficiario
      )
    );
  };

  const eliminar = (id: string) => {
    setBeneficiarios((prev) =>
      prev.map((beneficiario) =>
        beneficiario.id === id ? { ...beneficiario, estado: "baja", boletosDisponibles: 0 } : beneficiario
      )
    );
  };

  const field = (key: keyof FormState, label: string, type = "text") => (
    <div className="space-y-1.5">
      <label className="text-xs text-muted-foreground">{label}</label>
      <input
        type={type}
        value={form[key]}
        onChange={(event) => setForm((prev) => ({ ...prev, [key]: event.target.value }))}
        className={`w-full rounded-lg border bg-background px-3 py-2 text-sm text-foreground outline-none transition focus:ring-2 focus:ring-blue-500 ${
          errors[key] ? "border-destructive" : "border-border"
        }`}
      />
      {errors[key] && <p className="text-xs text-destructive">{errors[key]}</p>}
    </div>
  );

  return (
    <div className="space-y-5">
      <div className="flex flex-col gap-3 sm:flex-row sm:items-center sm:justify-between">
        <div className="relative w-full sm:max-w-sm">
          <Search className="absolute left-3 top-1/2 h-4 w-4 -translate-y-1/2 text-muted-foreground" />
          <input
            value={busqueda}
            onChange={(event) => setBusqueda(event.target.value)}
            placeholder="Buscar por DNI, nombre o localidad"
            className="w-full rounded-xl border border-border bg-background py-2 pl-9 pr-3 text-sm text-foreground outline-none focus:ring-2 focus:ring-blue-500"
          />
        </div>
        {!readOnly && (
          <button
            onClick={() => {
              setForm(emptyForm);
              setEditId(null);
              setErrors({});
              setShowForm(true);
            }}
            className="inline-flex items-center justify-center gap-2 rounded-xl bg-foreground px-4 py-2 text-sm text-background transition hover:opacity-90"
          >
            <UserPlus className="h-4 w-4" />
            Nuevo beneficiario
          </button>
        )}
      </div>

      <div className="overflow-hidden rounded-xl border border-border bg-card">
        <div className="overflow-x-auto">
          <table className="w-full min-w-[760px]">
            <thead className="border-b border-border bg-muted/30">
              <tr>
                {["DNI", "Nombre", "Edad", "Estado", "Boletos disponibles", readOnly ? "Consulta" : "Acciones"].map((header) => (
                  <th key={header} className="px-4 py-3 text-left text-xs uppercase tracking-wide text-muted-foreground">
                    {header}
                  </th>
                ))}
              </tr>
            </thead>
            <tbody className="divide-y divide-border">
              {filtered.map((beneficiario) => (
                <tr key={beneficiario.id} className="hover:bg-accent/20">
                  <td className="px-4 py-3 text-sm tabular-nums">{formatDni(beneficiario.dni)}</td>
                  <td className="px-4 py-3 text-sm">{beneficiario.apellido}, {beneficiario.nombre}</td>
                  <td className="px-4 py-3 text-sm">{calcularEdad(beneficiario.fechaNacimiento)}</td>
                  <td className="px-4 py-3">
                    <span className={`rounded-full border px-2.5 py-1 text-xs capitalize ${estadoClass[beneficiario.estado]}`}>
                      {beneficiario.estado}
                    </span>
                  </td>
                  <td className="px-4 py-3 text-sm tabular-nums">{beneficiario.boletosDisponibles}</td>
                  <td className="px-4 py-3">
                    <div className="flex gap-1.5">
                      <button onClick={() => setViewId(beneficiario.id)} className="rounded-lg p-2 text-muted-foreground hover:bg-accent" title="Ver">
                        <Eye className="h-4 w-4" />
                      </button>
                      {!readOnly && (
                        <>
                          <button onClick={() => handleEdit(beneficiario)} className="rounded-lg p-2 text-muted-foreground hover:bg-accent" title="Editar">
                            <Edit2 className="h-4 w-4" />
                          </button>
                          <button onClick={() => bloquear(beneficiario.id)} className="rounded-lg p-2 text-muted-foreground hover:bg-yellow-50 hover:text-yellow-700" title="Bloquear o desbloquear tarjeta">
                            <Lock className="h-4 w-4" />
                          </button>
                          <button onClick={() => eliminar(beneficiario.id)} className="rounded-lg p-2 text-muted-foreground hover:bg-red-50 hover:text-destructive" title="Dar de baja">
                            <Trash2 className="h-4 w-4" />
                          </button>
                        </>
                      )}
                    </div>
                  </td>
                </tr>
              ))}
            </tbody>
          </table>
        </div>
      </div>

      {showForm && (
        <div className="fixed inset-0 z-50 flex items-center justify-center p-4">
          <div className="absolute inset-0 bg-black/40" onClick={resetForm} />
          <div className="relative w-full max-w-2xl rounded-xl border border-border bg-card shadow-xl">
            <div className="flex items-center justify-between border-b border-border px-6 py-4">
              <h2 className="text-lg">{editId ? "Modificar Beneficiario" : "Alta de Beneficiario"}</h2>
              <button onClick={resetForm} className="rounded-lg p-2 text-muted-foreground hover:bg-accent">
                <X className="h-4 w-4" />
              </button>
            </div>
            <form onSubmit={handleSubmit} className="space-y-5 p-6">
              <section className="space-y-3">
                <h3 className="text-sm text-foreground">Datos personales</h3>
                <div className="grid gap-3 sm:grid-cols-2">
                  {field("nombre", "Nombre *")}
                  {field("apellido", "Apellido *")}
                  {field("dni", "DNI *")}
                  {field("fechaNacimiento", "Fecha de nacimiento *", "date")}
                </div>
              </section>
              <section className="space-y-3">
                <h3 className="text-sm text-foreground">Residencia</h3>
                <div className="grid gap-3 sm:grid-cols-3">
                  {field("direccion", "Dirección *")}
                  {field("barrio", "Barrio *")}
                  {field("localidad", "Localidad *")}
                </div>
              </section>
              <div className="flex justify-end gap-3">
                <button type="button" onClick={resetForm} className="rounded-xl border border-border px-4 py-2 text-sm hover:bg-accent">
                  Cancelar
                </button>
                <button type="submit" className="rounded-xl bg-foreground px-4 py-2 text-sm text-background hover:opacity-90">
                  Registrar Beneficiario
                </button>
              </div>
            </form>
          </div>
        </div>
      )}

      {selected && (
        <div className="fixed inset-0 z-50 flex items-center justify-center p-4">
          <div className="absolute inset-0 bg-black/40" onClick={() => setViewId(null)} />
          <div className="relative w-full max-w-md rounded-xl border border-border bg-card p-6 shadow-xl">
            <div className="mb-4 flex items-start justify-between">
              <div>
                <h2>{selected.apellido}, {selected.nombre}</h2>
                <p className="text-sm text-muted-foreground">DNI {formatDni(selected.dni)}</p>
              </div>
              <button onClick={() => setViewId(null)} className="rounded-lg p-2 text-muted-foreground hover:bg-accent">
                <X className="h-4 w-4" />
              </button>
            </div>
            <dl className="grid grid-cols-2 gap-3 text-sm">
              <div><dt className="text-muted-foreground">Edad</dt><dd>{calcularEdad(selected.fechaNacimiento)} años</dd></div>
              <div><dt className="text-muted-foreground">Estado</dt><dd className="capitalize">{selected.estado}</dd></div>
              <div><dt className="text-muted-foreground">Boletos</dt><dd>{selected.boletosDisponibles}</dd></div>
              <div><dt className="text-muted-foreground">Alta</dt><dd>{selected.fechaAlta}</dd></div>
              <div className="col-span-2"><dt className="text-muted-foreground">Domicilio</dt><dd>{selected.direccion}, {selected.barrio}, {selected.localidad}</dd></div>
            </dl>
          </div>
        </div>
      )}
    </div>
  );
}
