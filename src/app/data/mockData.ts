export type Role = "admin" | "supervisor";

export interface Beneficiario {
  id: string;
  nombre: string;
  apellido: string;
  dni: string;
  fechaNacimiento: string;
  direccion: string;
  barrio: string;
  localidad: string;
  estado: "activo" | "bloqueado" | "baja";
  boletosDisponibles: number;
  fechaAlta: string;
}

export interface Recarga {
  id: string;
  beneficiarioId: string;
  beneficiario: string;
  dni: string;
  cantidad: number;
  fecha: string;
  operador: string;
}

export interface Anomalia {
  id: string;
  fecha: string;
  beneficiario: string;
  tipo: "Uso duplicado" | "Intento de fraude" | "Tarjeta bloqueada utilizada" | "Error de validación";
  estado: "pendiente" | "revisada" | "resuelta";
  detalle: string;
}

export interface Actividad {
  id: string;
  fecha: string;
  usuario: string;
  accion: string;
  detalle: string;
}

export const beneficiariosMock: Beneficiario[] = [
  {
    id: "B001",
    nombre: "Roberto",
    apellido: "García",
    dni: "12345678",
    fechaNacimiento: "1957-03-20",
    direccion: "Av. Sarmiento 450",
    barrio: "Centro",
    localidad: "Oberá",
    estado: "activo",
    boletosDisponibles: 8,
    fechaAlta: "2026-03-15",
  },
  {
    id: "B002",
    nombre: "María",
    apellido: "López",
    dni: "23456789",
    fechaNacimiento: "1962-08-10",
    direccion: "San Martín 234",
    barrio: "Villa Svea",
    localidad: "Oberá",
    estado: "activo",
    boletosDisponibles: 12,
    fechaAlta: "2026-02-20",
  },
  {
    id: "B003",
    nombre: "Carlos",
    apellido: "Fernández",
    dni: "34567890",
    fechaNacimiento: "1955-12-05",
    direccion: "Mitre 678",
    barrio: "Norte",
    localidad: "Oberá",
    estado: "bloqueado",
    boletosDisponibles: 0,
    fechaAlta: "2026-01-12",
  },
  {
    id: "B004",
    nombre: "Ana",
    apellido: "Martínez",
    dni: "45678901",
    fechaNacimiento: "1964-06-15",
    direccion: "Belgrano 321",
    barrio: "Cien Hectáreas",
    localidad: "Oberá",
    estado: "activo",
    boletosDisponibles: 15,
    fechaAlta: "2026-04-10",
  },
  {
    id: "B005",
    nombre: "Jorge",
    apellido: "Rodríguez",
    dni: "56789012",
    fechaNacimiento: "1956-11-30",
    direccion: "Rivadavia 112",
    barrio: "Centro",
    localidad: "Oberá",
    estado: "baja",
    boletosDisponibles: 0,
    fechaAlta: "2025-11-22",
  },
];

export const recargasMock: Recarga[] = [
  {
    id: "R001",
    beneficiarioId: "B003",
    beneficiario: "Fernández, Carlos",
    dni: "34567890",
    cantidad: 15,
    fecha: "2026-06-19",
    operador: "Administrador Municipal",
  },
  {
    id: "R002",
    beneficiarioId: "B001",
    beneficiario: "García, Roberto",
    dni: "12345678",
    cantidad: 15,
    fecha: "2026-06-19",
    operador: "Administrador Municipal",
  },
  {
    id: "R003",
    beneficiarioId: "B002",
    beneficiario: "López, María",
    dni: "23456789",
    cantidad: 10,
    fecha: "2026-06-18",
    operador: "María González",
  },
];

export const anomaliasMock: Anomalia[] = [
  {
    id: "A001",
    fecha: "2026-06-19 08:17",
    beneficiario: "García, Roberto",
    tipo: "Uso duplicado",
    estado: "pendiente",
    detalle: "Dos validaciones en unidades distintas dentro de una ventana de 5 minutos.",
  },
  {
    id: "A002",
    fecha: "2026-06-19 10:42",
    beneficiario: "Fernández, Carlos",
    tipo: "Tarjeta bloqueada utilizada",
    estado: "pendiente",
    detalle: "Intento de validación con tarjeta bloqueada por extravío.",
  },
  {
    id: "A003",
    fecha: "2026-06-18 18:05",
    beneficiario: "Martínez, Ana",
    tipo: "Intento de fraude",
    estado: "revisada",
    detalle: "Patrón de validaciones incompatible con el uso habitual.",
  },
  {
    id: "A004",
    fecha: "2026-06-17 07:51",
    beneficiario: "López, María",
    tipo: "Error de validación",
    estado: "resuelta",
    detalle: "Falla temporal del lector en unidad de transporte.",
  },
];

export const actividadesMock: Actividad[] = [
  {
    id: "AC001",
    fecha: "2026-06-19 11:20",
    usuario: "Administrador Municipal",
    accion: "Recarga registrada",
    detalle: "García, Roberto recibió 15 boletos.",
  },
  {
    id: "AC002",
    fecha: "2026-06-19 10:42",
    usuario: "Sistema",
    accion: "Anomalía detectada",
    detalle: "Tarjeta bloqueada utilizada por Fernández, Carlos.",
  },
  {
    id: "AC003",
    fecha: "2026-06-19 09:30",
    usuario: "María González",
    accion: "Beneficiario modificado",
    detalle: "Actualización de domicilio de López, María.",
  },
  {
    id: "AC004",
    fecha: "2026-06-19 08:17",
    usuario: "Sistema",
    accion: "Uso duplicado",
    detalle: "Validaciones detectadas en menos de 5 minutos.",
  },
];

export const calcularEdad = (fechaNacimiento: string) => {
  const hoy = new Date();
  const nacimiento = new Date(fechaNacimiento);
  let edad = hoy.getFullYear() - nacimiento.getFullYear();
  const mes = hoy.getMonth() - nacimiento.getMonth();

  if (mes < 0 || (mes === 0 && hoy.getDate() < nacimiento.getDate())) {
    edad -= 1;
  }

  return edad;
};
