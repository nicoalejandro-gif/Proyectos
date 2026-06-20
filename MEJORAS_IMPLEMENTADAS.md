# Sistema Administrativo de Gestión de Boletos

## Alcance actual

La aplicación web quedó definida como un sistema interno para la Municipalidad de Oberá. Los beneficiarios no utilizan esta web; en una etapa futura podrán contar con una aplicación móvil separada.

## Roles y permisos

- Administrador: Dashboard, Beneficiarios y Recargas, además de Anomalías y Reportes.
- Supervisor: Dashboard, Anomalías y Reportes.

El control de acceso se mantiene basado en roles desde el login y la navegación filtra las opciones disponibles según el perfil autenticado.

## Módulos implementados

- `Dashboard`: métricas administrativas y tabla de actividad reciente.
- `Beneficiarios`: padrón administrativo con alta, edición, vista de detalle, bloqueo y baja lógica.
- `Recargas`: búsqueda por DNI, visualización de saldo actual y registro de recarga de boletos.
- `Anomalías`: gestión separada de incidentes con regla de duplicados de 5 minutos.
- `Reportes`: indicadores independientes sobre beneficiarios registrados, boletos utilizados, recargas y anomalías.

## Cambios principales

- Se eliminó la vista web destinada al beneficiario.
- Se reemplazó la funcionalidad de carga de archivos por recarga manual administrativa.
- Se normalizó la terminología a Beneficiarios.
- Se separaron Anomalías y Reportes en pantallas independientes.
- Se centralizaron datos mock y tipos compartidos en `src/app/data/mockData.ts`.
- Se corrigieron textos con problemas de codificación en las pantallas principales.

## Credenciales de prueba

- Administrador: `admin` / `admin123`
- Supervisor: `supervisor` / `super123`
