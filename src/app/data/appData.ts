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

export interface Tarjeta {
  id: string;
  beneficiarioId: string;
  beneficiario: string;
  numero: string;
  estado: "activa" | "pendiente" | "bloqueada";
  fechaEmision?: string;
  motivoBloqueo?: string;
}

export interface Anomalia {
  id: string;
  fecha: string;
  beneficiario: string;
  tipo: "Uso duplicado" | "Intento de fraude" | "Tarjeta bloqueada utilizada" | "Error de validacion" | "Error de lectura";
  estado: "pendiente" | "en revision" | "resuelta" | "descartada";
  detalle: string;
  observaciones: string[];
}

export interface Incidente {
  id: string;
  fecha: string;
  titulo: string;
  linea: string;
  prioridad: "baja" | "media" | "alta";
  estado: "abierto" | "cerrado";
  responsable: string;
  descripcion: string;
}

export interface Actividad {
  id: string;
  fecha: string;
  usuario: string;
  accion: string;
  detalle: string;
}

export interface Viaje {
  id: string;
  fecha: string;
  linea: string;
  horario: string;
  boletosUtilizados: number;
  validacionesExitosas: number;
  validacionesRechazadas: number;
}

export const beneficiariosMock: Beneficiario[] = [
  {
    id: "B001",
    nombre: "Roberto",
    apellido: "Garcia",
    dni: "12345678",
    fechaNacimiento: "1957-03-20",
    direccion: "Av. Sarmiento 450",
    barrio: "Centro",
    localidad: "Obera",
    estado: "activo",
    boletosDisponibles: 8,
    fechaAlta: "2026-03-15",
  },
  {
    id: "B002",
    nombre: "Maria",
    apellido: "Lopez",
    dni: "23456789",
    fechaNacimiento: "1962-08-10",
    direccion: "San Martin 234",
    barrio: "Villa Svea",
    localidad: "Obera",
    estado: "activo",
    boletosDisponibles: 12,
    fechaAlta: "2026-02-20",
  },
  {
    id: "B003",
    nombre: "Carlos",
    apellido: "Fernandez",
    dni: "34567890",
    fechaNacimiento: "1955-12-05",
    direccion: "Mitre 678",
    barrio: "Norte",
    localidad: "Obera",
    estado: "bloqueado",
    boletosDisponibles: 0,
    fechaAlta: "2026-01-12",
  },
  {
    id: "B004",
    nombre: "Ana",
    apellido: "Martinez",
    dni: "45678901",
    fechaNacimiento: "1964-06-15",
    direccion: "Belgrano 321",
    barrio: "Cien Hectareas",
    localidad: "Obera",
    estado: "activo",
    boletosDisponibles: 15,
    fechaAlta: "2026-04-10",
  },
  {
    id: "B005",
    nombre: "Jorge",
    apellido: "Rodriguez",
    dni: "56789012",
    fechaNacimiento: "1956-11-30",
    direccion: "Rivadavia 112",
    barrio: "Centro",
    localidad: "Obera",
    estado: "baja",
    boletosDisponibles: 0,
    fechaAlta: "2025-11-22",
  },
];

export const recargasMock: Recarga[] = [
  { id: "R001", beneficiarioId: "B003", beneficiario: "Fernandez, Carlos", dni: "34567890", cantidad: 15, fecha: "2026-06-19", operador: "Administrador Municipal" },
  { id: "R002", beneficiarioId: "B001", beneficiario: "Garcia, Roberto", dni: "12345678", cantidad: 15, fecha: "2026-06-19", operador: "Administrador Municipal" },
  { id: "R003", beneficiarioId: "B002", beneficiario: "Lopez, Maria", dni: "23456789", cantidad: 10, fecha: "2026-06-18", operador: "Maria Gonzalez" },
];

export const tarjetasMock: Tarjeta[] = [
  { id: "T001", beneficiarioId: "B001", beneficiario: "Garcia, Roberto", numero: "6060-0001", estado: "activa", fechaEmision: "2026-03-16" },
  { id: "T002", beneficiarioId: "B002", beneficiario: "Lopez, Maria", numero: "6060-0002", estado: "activa", fechaEmision: "2026-02-21" },
  { id: "T003", beneficiarioId: "B003", beneficiario: "Fernandez, Carlos", numero: "6060-0003", estado: "bloqueada", fechaEmision: "2026-01-13", motivoBloqueo: "Extravio informado" },
  { id: "T004", beneficiarioId: "B004", beneficiario: "Martinez, Ana", numero: "Pendiente", estado: "pendiente" },
];

export const anomaliasMock: Anomalia[] = [
  { id: "A001", fecha: "2026-06-19 08:17", beneficiario: "Garcia, Roberto", tipo: "Uso duplicado", estado: "pendiente", detalle: "Dos validaciones en unidades distintas dentro de una ventana de 5 minutos.", observaciones: [] },
  { id: "A002", fecha: "2026-06-19 10:42", beneficiario: "Fernandez, Carlos", tipo: "Tarjeta bloqueada utilizada", estado: "pendiente", detalle: "Intento de validacion con tarjeta bloqueada por extravio.", observaciones: ["Se notifico al operador de la linea 3."] },
  { id: "A003", fecha: "2026-06-18 18:05", beneficiario: "Martinez, Ana", tipo: "Intento de fraude", estado: "en revision", detalle: "Patron de validaciones incompatible con el uso habitual.", observaciones: [] },
  { id: "A004", fecha: "2026-06-17 07:51", beneficiario: "Lopez, Maria", tipo: "Error de validacion", estado: "resuelta", detalle: "Falla temporal del lector en unidad de transporte.", observaciones: ["Lector reemplazado en cabecera."] },
  { id: "A005", fecha: "2026-06-16 12:10", beneficiario: "Garcia, Roberto", tipo: "Error de lectura", estado: "descartada", detalle: "Lectura incompleta por aproximacion insuficiente de tarjeta.", observaciones: ["No se detecto uso indebido."] },
];

export const incidentesMock: Incidente[] = [
  { id: "I001", fecha: "2026-06-19 09:15", titulo: "Validador sin conexion", linea: "Linea 3", prioridad: "alta", estado: "abierto", responsable: "Supervisor de Transporte", descripcion: "Unidad 12 reporta validaciones en modo offline." },
  { id: "I002", fecha: "2026-06-18 17:40", titulo: "Demora en sincronizacion", linea: "Linea 1", prioridad: "media", estado: "abierto", responsable: "Juan Perez", descripcion: "Las validaciones se sincronizan con una demora mayor a la habitual." },
  { id: "I003", fecha: "2026-06-17 11:05", titulo: "Lector reemplazado", linea: "Linea 2", prioridad: "baja", estado: "cerrado", responsable: "Supervisor de Transporte", descripcion: "Se completo el reemplazo del lector defectuoso." },
];

export const viajesMock: Viaje[] = [
  { id: "V001", fecha: "2026-06-19", linea: "Linea 1", horario: "07:00", boletosUtilizados: 132, validacionesExitosas: 128, validacionesRechazadas: 4 },
  { id: "V002", fecha: "2026-06-19", linea: "Linea 2", horario: "12:00", boletosUtilizados: 96, validacionesExitosas: 92, validacionesRechazadas: 4 },
  { id: "V003", fecha: "2026-06-19", linea: "Linea 3", horario: "18:00", boletosUtilizados: 151, validacionesExitosas: 144, validacionesRechazadas: 7 },
  { id: "V004", fecha: "2026-06-18", linea: "Linea 1", horario: "08:00", boletosUtilizados: 118, validacionesExitosas: 116, validacionesRechazadas: 2 },
];

export const actividadesMock: Actividad[] = [
  { id: "AC001", fecha: "2026-06-19 11:20", usuario: "Administrador Municipal", accion: "Recarga registrada", detalle: "Garcia, Roberto recibio 15 boletos." },
  { id: "AC002", fecha: "2026-06-19 10:42", usuario: "Sistema", accion: "Anomalia detectada", detalle: "Tarjeta bloqueada utilizada por Fernandez, Carlos." },
  { id: "AC003", fecha: "2026-06-19 09:30", usuario: "Maria Gonzalez", accion: "Beneficiario modificado", detalle: "Actualizacion de domicilio de Lopez, Maria." },
  { id: "AC004", fecha: "2026-06-19 08:17", usuario: "Sistema", accion: "Uso duplicado", detalle: "Validaciones detectadas en menos de 5 minutos." },
  { id: "AC005", fecha: "2026-06-18 16:12", usuario: "Supervisor de Transporte", accion: "Incidente actualizado", detalle: "Cambio de prioridad en Validador sin conexion." },
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
