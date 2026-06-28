import { useEffect, useState } from "react";
import { Edit2, Eye, Lock, Search, Trash2, UserPlus, X } from "lucide-react";
import { Beneficiario, calcularEdad } from "../data/appData";
import { supabase } from "../lib/supabase";

type FormState = {
  nombre: string;
  apellido: string;
  dni: string;
  fechaNacimiento: string;
  direccion: string;
  barrio: string;
  localidad: string;
};

type BeneficiaryRow = {
  id: string;
  first_name: string;
  last_name: string;
  dni: string;
  birth_date: string;
  street_address: string;
  neighborhood: string;
  city: string;
  status_code: Beneficiario["estado"];
  available_tickets: number;
  enrolled_at: string;
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

const mapBeneficiary = (row: BeneficiaryRow): Beneficiario => ({
  id: row.id,
  nombre: row.first_name,
  apellido: row.last_name,
  dni: row.dni,
  fechaNacimiento: row.birth_date,
  direccion: row.street_address,
  barrio: row.neighborhood,
  localidad: row.city,
  estado: row.status_code,
  boletosDisponibles: row.available_tickets,
  fechaAlta: row.enrolled_at,
});

const beneficiarySelect = "id, first_name, last_name, dni, birth_date, street_address, neighborhood, city, status_code, available_tickets, enrolled_at";

export function Beneficiarios({ readOnly = false }: { readOnly?: boolean }) {
  const [beneficiarios, setBeneficiarios] = useState<Beneficiario[]>([]);
  const [busqueda, setBusqueda] = useState("");
  const [showForm, setShowForm] = useState(false);
  const [form, setForm] = useState<FormState>(emptyForm);
  const [errors, setErrors] = useState<Partial<Record<keyof FormState, string>>>({});
  const [editId, setEditId] = useState<string | null>(null);
  const [viewId, setViewId] = useState<string | null>(null);
  const [loading, setLoading] = useState(true);
  const [saving, setSaving] = useState(false);
  const [message, setMessage] = useState("");

  const loadBeneficiarios = async (search = busqueda) => {
    setLoading(true);
    setMessage("");

    let query = supabase
      .from("beneficiaries")
      .select(beneficiarySelect)
      .order("last_name", { ascending: true })
      .order("first_name", { ascending: true });

    const trimmedSearch = search.trim();
    if (trimmedSearch) {
      const pattern = `%${trimmedSearch}%`;
      query = query.or(`dni.ilike.${pattern},first_name.ilike.${pattern},last_name.ilike.${pattern},city.ilike.${pattern}`);
    }

    const { data, error } = await query.returns<BeneficiaryRow[]>();

    if (error) {
      setMessage("No se pudo cargar el padron de beneficiarios.");
      setBeneficiarios([]);
    } else {
      setBeneficiarios((data ?? []).map(mapBeneficiary));
    }

    setLoading(false);
  };

  useEffect(() => {
    const timeout = window.setTimeout(() => {
      loadBeneficiarios(busqueda);
    }, 250);

    return () => window.clearTimeout(timeout);
  }, [busqueda]);

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

  const handleSubmit = async (event: React.FormEvent) => {
    event.preventDefault();
    if (readOnly) return;

    const nextErrors = validate();

    if (Object.keys(nextErrors).length > 0) {
      setErrors(nextErrors);
      return;
    }

    setSaving(true);
    setMessage("");

    if (editId) {
      const { error } = await supabase
        .from("beneficiaries")
        .update({
          first_name: form.nombre.trim(),
          last_name: form.apellido.trim(),
          dni: form.dni.trim(),
          birth_date: form.fechaNacimiento,
          street_address: form.direccion.trim(),
          neighborhood: form.barrio.trim(),
          city: form.localidad.trim(),
        })
        .eq("id", editId);

      if (error) {
        setMessage(error.code === "23505" ? "Ya existe un beneficiario con ese DNI." : "No se pudo actualizar el beneficiario.");
        setSaving(false);
        return;
      }
    } else {
      const { error } = await supabase
        .from("beneficiaries")
        .insert({
          first_name: form.nombre.trim(),
          last_name: form.apellido.trim(),
          dni: form.dni.trim(),
          birth_date: form.fechaNacimiento,
          street_address: form.direccion.trim(),
          neighborhood: form.barrio.trim(),
          city: form.localidad.trim(),
          status_code: "activo",
          available_tickets: 0,
        });

      if (error) {
        setMessage(error.code === "23505" ? "Ya existe un beneficiario con ese DNI." : "No se pudo crear el beneficiario.");
        setSaving(false);
        return;
      }
    }

    resetForm();
    setSaving(false);
    await loadBeneficiarios();
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

  const bloquear = async (beneficiario: Beneficiario) => {
    if (readOnly) return;

    const nextStatus = beneficiario.estado === "bloqueado" ? "activo" : "bloqueado";
    setMessage("");

    const { error } = await supabase
      .from("beneficiaries")
      .update({ status_code: nextStatus })
      .eq("id", beneficiario.id);

    if (error) {
      setMessage("No se pudo cambiar el estado del beneficiario.");
      return;
    }

    setBeneficiarios((prev) => prev.map((item) => (item.id === beneficiario.id ? { ...item, estado: nextStatus } : item)));
  };

  const eliminar = async (id: string) => {
    if (readOnly) return;

    setMessage("");

    const { error } = await supabase
      .from("beneficiaries")
      .update({ status_code: "baja", available_tickets: 0 })
      .eq("id", id);

    if (error) {
      setMessage("No se pudo dar de baja el beneficiario.");
      return;
    }

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

      {message && (
        <div className="rounded-xl border border-red-200 bg-red-50 p-3 text-sm text-red-800">
          {message}
        </div>
      )}

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
              {loading && (
                <tr>
                  <td colSpan={6} className="px-4 py-8 text-center text-sm text-muted-foreground">
                    Cargando beneficiarios...
                  </td>
                </tr>
              )}
              {!loading && beneficiarios.length === 0 && (
                <tr>
                  <td colSpan={6} className="px-4 py-8 text-center text-sm text-muted-foreground">
                    No se encontraron beneficiarios.
                  </td>
                </tr>
              )}
              {!loading && beneficiarios.map((beneficiario) => (
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
                          <button onClick={() => bloquear(beneficiario)} className="rounded-lg p-2 text-muted-foreground hover:bg-yellow-50 hover:text-yellow-700" title="Bloquear o desbloquear tarjeta">
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
                <button type="submit" disabled={saving} className="rounded-xl bg-foreground px-4 py-2 text-sm text-background hover:opacity-90 disabled:cursor-not-allowed disabled:opacity-50">
                  {saving ? "Guardando..." : editId ? "Guardar cambios" : "Registrar Beneficiario"}
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
