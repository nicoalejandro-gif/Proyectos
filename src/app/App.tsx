import { useEffect, useMemo, useState } from "react";
import { AlertTriangle, BarChart3, Bell, ChevronRight, ClipboardCheck, CreditCard, LayoutDashboard, LogOut, Settings, Shield, Ticket, User as UserIcon, Users, Wrench } from "lucide-react";
import type { ReactNode } from "react";
import { Anomalias } from "./components/Anomalias";
import { Auditoria } from "./components/Auditoria";
import { Beneficiarios } from "./components/Beneficiarios";
import { Configuracion } from "./components/Configuracion";
import { Incidentes } from "./components/Incidentes";
import { Login } from "./components/Login";
import { Recargas } from "./components/Recargas";
import { Reportes } from "./components/Reportes";
import { Tarjetas } from "./components/Tarjetas";
import { actividadesMock, anomaliasMock, beneficiariosMock, incidentesMock, recargasMock, tarjetasMock, viajesMock, type Role } from "./data/appData";
import { fetchProfile, type AppUser } from "./lib/auth";
import { supabase } from "./lib/supabase";
import bannerUrl from "../../imagenes/Banner.png";
import logoUrl from "../../imagenes/Logo.PNG";

type Tab = "dashboard" | "beneficiarios" | "recargas" | "tarjetas" | "anomalias" | "incidentes" | "reportes" | "auditoria" | "configuracion";

interface NavItem {
  id: Tab;
  label: string;
  icon: ReactNode;
  desc: string;
  roles: Role[];
}

const navItems: NavItem[] = [
  { id: "dashboard", label: "Dashboard", icon: <LayoutDashboard className="h-5 w-5" />, desc: "Resumen del perfil", roles: ["admin", "supervisor"] },
  { id: "beneficiarios", label: "Beneficiarios", icon: <Users className="h-5 w-5" />, desc: "Padron y consulta", roles: ["admin", "supervisor"] },
  { id: "recargas", label: "Recargas", icon: <Ticket className="h-5 w-5" />, desc: "Acreditacion de boletos", roles: ["admin"] },
  { id: "tarjetas", label: "Tarjetas", icon: <CreditCard className="h-5 w-5" />, desc: "Emision y bloqueo", roles: ["admin"] },
  { id: "anomalias", label: "Anomalias", icon: <AlertTriangle className="h-5 w-5" />, desc: "Control operativo", roles: ["supervisor"] },
  { id: "incidentes", label: "Incidentes", icon: <Wrench className="h-5 w-5" />, desc: "Seguimiento tecnico", roles: ["supervisor"] },
  { id: "reportes", label: "Reportes", icon: <BarChart3 className="h-5 w-5" />, desc: "Indicadores", roles: ["admin", "supervisor"] },
  { id: "auditoria", label: "Auditoria", icon: <ClipboardCheck className="h-5 w-5" />, desc: "Registro solo lectura", roles: ["admin", "supervisor"] },
  { id: "configuracion", label: "Configuracion", icon: <Settings className="h-5 w-5" />, desc: "Preferencias internas", roles: ["admin", "supervisor"] },
];

function getNavItems(role: Role) {
  return navItems.filter((item) => item.roles.includes(role));
}

function getDefaultTab(role: Role): Tab {
  return "dashboard";
}

function canAccessTab(role: Role, tab: Tab) {
  return getNavItems(role).some((item) => item.id === tab);
}

function isTab(value: string): value is Tab {
  return navItems.some((item) => item.id === value);
}

function MetricCard({ label, value, detail, color }: { label: string; value: number | string; detail: string; color: string }) {
  return (
    <div className="rounded-xl border border-border bg-card p-5">
      <p className="text-xs uppercase tracking-wide text-muted-foreground">{label}</p>
      <p className={`mt-3 text-3xl ${color}`}>{typeof value === "number" ? value.toLocaleString("es-AR") : value}</p>
      <p className="mt-1 text-xs text-muted-foreground">{detail}</p>
    </div>
  );
}

function Dashboard({ userRole }: { userRole: Role }) {
  const metrics = useMemo(() => {
    if (userRole === "admin") {
      return [
        { label: "Beneficiarios activos", value: beneficiariosMock.filter((item) => item.estado === "activo").length, detail: "Habilitados para operar", color: "text-green-700" },
        { label: "Beneficiarios inactivos", value: beneficiariosMock.filter((item) => item.estado === "baja").length, detail: "Dados de baja", color: "text-slate-700" },
        { label: "Beneficiarios bloqueados", value: beneficiariosMock.filter((item) => item.estado === "bloqueado").length, detail: "Tarjetas o cuentas bloqueadas", color: "text-yellow-700" },
        { label: "Recargas realizadas hoy", value: recargasMock.filter((item) => item.fecha === "2026-06-19").length, detail: "Operaciones registradas", color: "text-blue-700" },
        { label: "Altas del mes", value: beneficiariosMock.filter((item) => item.fechaAlta.startsWith("2026-06")).length, detail: "Nuevos beneficiarios", color: "text-green-700" },
        { label: "Bajas del mes", value: beneficiariosMock.filter((item) => item.estado === "baja").length, detail: "Beneficios desactivados", color: "text-red-700" },
        { label: "Tarjetas pendientes", value: tarjetasMock.filter((item) => item.estado === "pendiente").length, detail: "Pendientes de emision", color: "text-purple-700" },
        { label: "Tarjetas bloqueadas", value: tarjetasMock.filter((item) => item.estado === "bloqueada").length, detail: "Requieren seguimiento", color: "text-red-700" },
      ];
    }

    return [
      { label: "Viajes registrados", value: viajesMock.length, detail: "Servicios informados", color: "text-blue-700" },
      { label: "Validaciones exitosas", value: viajesMock.reduce((total, viaje) => total + viaje.validacionesExitosas, 0), detail: "Boletos aceptados", color: "text-green-700" },
      { label: "Validaciones rechazadas", value: viajesMock.reduce((total, viaje) => total + viaje.validacionesRechazadas, 0), detail: "Controles fallidos", color: "text-red-700" },
      { label: "Anomalias pendientes", value: anomaliasMock.filter((item) => item.estado === "pendiente").length, detail: "Requieren revision", color: "text-yellow-700" },
      { label: "Incidentes abiertos", value: incidentesMock.filter((item) => item.estado === "abierto").length, detail: "Seguimiento activo", color: "text-red-700" },
    ];
  }, [userRole]);

  const activityTitle = userRole === "admin" ? "Ultimas actividades" : "Ultimas anomalias";
  const rows = userRole === "admin" ? actividadesMock : anomaliasMock;

  return (
    <div className="space-y-6">
      {userRole === "supervisor" && <div className="rounded-xl border border-purple-200 bg-purple-50 p-4"><div className="flex gap-3"><Shield className="mt-0.5 h-5 w-5 shrink-0 text-purple-700" /><div><h2 className="text-sm text-purple-950">Acceso de Supervisor</h2><p className="text-sm text-purple-800">Perfil operativo: consulta beneficiarios, gestiona anomalias e incidentes, y revisa auditoria.</p></div></div></div>}
      <div className="grid gap-4 sm:grid-cols-2 xl:grid-cols-4">{metrics.map((metric) => <MetricCard key={metric.label} {...metric} />)}</div>
      <div className="overflow-hidden rounded-xl border border-border bg-card"><div className="border-b border-border bg-muted/30 px-5 py-4"><h2 className="text-sm">{activityTitle}</h2></div><div className="overflow-x-auto"><table className="w-full min-w-[720px]"><thead className="border-b border-border"><tr>{userRole === "admin" ? ["Fecha", "Usuario", "Accion", "Detalle"].map((header) => <th key={header} className="px-5 py-3 text-left text-xs uppercase tracking-wide text-muted-foreground">{header}</th>) : ["Fecha", "Beneficiario", "Tipo", "Estado"].map((header) => <th key={header} className="px-5 py-3 text-left text-xs uppercase tracking-wide text-muted-foreground">{header}</th>)}</tr></thead><tbody className="divide-y divide-border">{rows.map((row) => userRole === "admin" ? <tr key={row.id} className="hover:bg-accent/20"><td className="px-5 py-3 text-sm">{"fecha" in row ? row.fecha : ""}</td><td className="px-5 py-3 text-sm">{"usuario" in row ? row.usuario : ""}</td><td className="px-5 py-3 text-sm">{"accion" in row ? row.accion : ""}</td><td className="px-5 py-3 text-sm text-muted-foreground">{"detalle" in row ? row.detalle : ""}</td></tr> : <tr key={row.id} className="hover:bg-accent/20"><td className="px-5 py-3 text-sm">{"fecha" in row ? row.fecha : ""}</td><td className="px-5 py-3 text-sm">{"beneficiario" in row ? row.beneficiario : ""}</td><td className="px-5 py-3 text-sm">{"tipo" in row ? row.tipo : ""}</td><td className="px-5 py-3 text-sm capitalize">{"estado" in row ? row.estado : ""}</td></tr>)}</tbody></table></div></div>
    </div>
  );
}

export default function App() {
  const [user, setUser] = useState<AppUser | null>(null);
  const [activeTab, setActiveTab] = useState<Tab>("dashboard");
  const [authLoading, setAuthLoading] = useState(true);

  useEffect(() => {
    let cancelled = false;

    const loadSession = async () => {
      const { data } = await supabase.auth.getSession();

      if (!data.session) {
        if (!cancelled) {
          setUser(null);
          setAuthLoading(false);
        }
        return;
      }

      try {
        const profile = await fetchProfile(data.session);
        if (!cancelled) {
          const hashTab = window.location.hash.replace("#", "");
          setActiveTab(isTab(hashTab) && canAccessTab(profile.role, hashTab) ? hashTab : getDefaultTab(profile.role));
          setUser(profile);
        }
      } catch {
        await supabase.auth.signOut();
        if (!cancelled) setUser(null);
      } finally {
        if (!cancelled) setAuthLoading(false);
      }
    };

    loadSession();

    const { data: listener } = supabase.auth.onAuthStateChange((_event, session) => {
      if (!session) {
        setUser(null);
        setActiveTab("dashboard");
        setAuthLoading(false);
      }
    });

    return () => {
      cancelled = true;
      listener.subscription.unsubscribe();
    };
  }, []);

  const availableNavItems = user ? getNavItems(user.role) : [];
  const visibleTab = user && canAccessTab(user.role, activeTab) ? activeTab : user ? getDefaultTab(user.role) : "dashboard";
  const current = availableNavItems.find((item) => item.id === visibleTab);

  useEffect(() => {
    if (!user) return;
    if (activeTab !== visibleTab) setActiveTab(visibleTab);
    if (window.location.hash !== `#${visibleTab}`) window.history.replaceState(null, "", `#${visibleTab}`);
  }, [activeTab, user, visibleTab]);

  const navigate = (tab: Tab) => {
    if (!user || !canAccessTab(user.role, tab)) return;
    setActiveTab(tab);
    window.history.replaceState(null, "", `#${tab}`);
  };

  const handleLogin = (userData: AppUser) => {
    setActiveTab(getDefaultTab(userData.role));
    setUser(userData);
    window.history.replaceState(null, "", `#${getDefaultTab(userData.role)}`);
  };

  const handleLogout = async () => {
    await supabase.auth.signOut();
    setUser(null);
    setActiveTab("dashboard");
    window.history.replaceState(null, "", window.location.pathname);
  };

  if (authLoading) {
    return (
      <div className="flex min-h-screen items-center justify-center bg-background text-sm text-muted-foreground">
        Verificando sesion...
      </div>
    );
  }

  if (!user) return <Login onLogin={handleLogin} />;

  const renderActiveTab = () => {
    switch (visibleTab) {
      case "dashboard": return <Dashboard userRole={user.role} />;
      case "beneficiarios": return <Beneficiarios readOnly={user.role === "supervisor"} />;
      case "recargas": return user.role === "admin" ? <Recargas /> : null;
      case "tarjetas": return user.role === "admin" ? <Tarjetas /> : null;
      case "anomalias": return user.role === "supervisor" ? <Anomalias /> : null;
      case "incidentes": return user.role === "supervisor" ? <Incidentes /> : null;
      case "reportes": return <Reportes role={user.role} />;
      case "auditoria": return <Auditoria />;
      case "configuracion": return <Configuracion role={user.role} />;
      default: return <Dashboard userRole={user.role} />;
    }
  };

  return (
    <div className="flex min-h-screen bg-background">
      <aside className="hidden w-64 shrink-0 flex-col border-r border-sidebar-border bg-sidebar md:flex">
        <div className="border-b border-sidebar-border px-5 py-6"><div className="flex items-center gap-3"><div className="flex h-11 w-11 items-center justify-center rounded-xl bg-white p-1 shadow-sm"><img src={logoUrl} alt="Gobierno de Obera" className="h-full w-full object-contain" /></div><div><p className="text-sm leading-tight text-sidebar-foreground">Sistema Boletos</p><p className="text-xs leading-tight text-sidebar-foreground opacity-60">Obera, Misiones</p></div></div></div>
        <nav className="flex-1 space-y-1 px-3 py-4">{availableNavItems.map((item) => <button key={item.id} onClick={() => navigate(item.id)} className={`flex w-full items-center gap-3 rounded-xl px-3 py-2.5 text-left transition-colors ${visibleTab === item.id ? "bg-sidebar-primary text-sidebar-primary-foreground" : "text-sidebar-foreground hover:bg-sidebar-accent hover:text-sidebar-accent-foreground"}`}>{item.icon}<span className="min-w-0 flex-1"><span className="block text-sm leading-tight">{item.label}</span><span className={`block text-xs leading-tight ${visibleTab === item.id ? "opacity-70" : "text-muted-foreground"}`}>{item.desc}</span></span>{visibleTab === item.id && <ChevronRight className="h-4 w-4 opacity-50" />}</button>)}</nav>
        <div className="space-y-1 border-t border-sidebar-border px-3 py-4"><div className="mb-2 px-3 py-2"><div className="mb-1 flex items-center gap-2">{user.role === "admin" ? <UserIcon className="h-3.5 w-3.5 text-blue-600" /> : <Shield className="h-3.5 w-3.5 text-purple-600" />}<span className="text-xs text-muted-foreground">{user.role === "admin" ? "Administrador" : "Supervisor"}</span></div><p className="truncate text-xs text-sidebar-foreground">{user.nombre}</p></div><button onClick={handleLogout} className="flex w-full items-center gap-3 rounded-xl px-3 py-2.5 text-sidebar-foreground transition-colors hover:bg-red-50 hover:text-destructive"><LogOut className="h-5 w-5" /><span className="text-sm">Cerrar sesion</span></button></div>
      </aside>
      <div className="flex min-w-0 flex-1 flex-col"><div className="hidden h-16 shrink-0 overflow-hidden border-b border-border bg-[#07366d] lg:block"><img src={bannerUrl} alt="Gobierno de la Ciudad de Obera" className="h-full w-full object-cover object-center" /></div><header className="flex shrink-0 items-center justify-between border-b border-border bg-card px-6 py-4"><div><h1>{current?.label ?? "Dashboard"}</h1><p className="text-xs text-muted-foreground">{current?.desc ?? "Resumen"}</p></div><div className="flex items-center gap-3"><button className="relative rounded-xl p-2 text-muted-foreground transition-colors hover:bg-accent"><Bell className="h-5 w-5" /><span className="absolute right-1.5 top-1.5 h-2 w-2 rounded-full bg-destructive" /></button><div className="flex items-center gap-2 border-l border-border pl-3"><div className={`flex h-8 w-8 items-center justify-center rounded-xl bg-white p-0.5 shadow-sm`}><img src={logoUrl} alt="" className="h-full w-full object-contain" /></div><div className="hidden sm:block"><p className="text-xs leading-tight text-foreground">{user.nombre}</p><p className="text-xs leading-tight text-muted-foreground">{user.role === "admin" ? "Administrador" : "Supervisor"}</p></div></div></div></header><div className="flex gap-1 overflow-x-auto border-b border-border bg-card px-4 md:hidden">{availableNavItems.map((item) => <button key={item.id} onClick={() => navigate(item.id)} className={`flex items-center gap-2 whitespace-nowrap border-b-2 px-4 py-3 text-sm transition-colors ${visibleTab === item.id ? "border-foreground text-foreground" : "border-transparent text-muted-foreground hover:text-foreground"}`}>{item.icon}{item.label}</button>)}</div><main className="flex-1 overflow-auto p-6">{renderActiveTab()}</main></div>
    </div>
  );
}
