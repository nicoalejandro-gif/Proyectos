import { useEffect, useMemo, useState } from "react";
import {
  AlertTriangle,
  BarChart3,
  Bell,
  ChevronRight,
  LayoutDashboard,
  LogOut,
  Settings,
  Shield,
  Ticket,
  User as UserIcon,
  Users,
} from "lucide-react";
import type { ReactNode } from "react";
import { Anomalias } from "./components/Anomalias";
import { Beneficiarios } from "./components/Beneficiarios";
import { Login } from "./components/Login";
import { Recargas } from "./components/Recargas";
import { Reportes } from "./components/Reportes";
import { actividadesMock, anomaliasMock, beneficiariosMock, recargasMock, type Role } from "./data/mockData";

type Tab = "dashboard" | "beneficiarios" | "recargas" | "anomalias" | "reportes";

interface User {
  username: string;
  role: Role;
  nombre: string;
}

interface NavItem {
  id: Tab;
  label: string;
  icon: ReactNode;
  desc: string;
  roles: Role[];
}

const navItems: NavItem[] = [
  { id: "dashboard", label: "Dashboard", icon: <LayoutDashboard className="h-5 w-5" />, desc: "Resumen administrativo", roles: ["admin", "supervisor"] },
  { id: "beneficiarios", label: "Beneficiarios", icon: <Users className="h-5 w-5" />, desc: "Gestión del padrón", roles: ["admin"] },
  { id: "recargas", label: "Recargas", icon: <Ticket className="h-5 w-5" />, desc: "Acreditación de boletos", roles: ["admin"] },
  { id: "anomalias", label: "Anomalías", icon: <AlertTriangle className="h-5 w-5" />, desc: "Control de incidentes", roles: ["supervisor"] },
  { id: "reportes", label: "Reportes", icon: <BarChart3 className="h-5 w-5" />, desc: "Indicadores y auditoría", roles: ["supervisor"] },
];

function getNavItems(role: Role) {
  return navItems.filter((item) => item.roles.includes(role));
}

function getDefaultTab(role: Role): Tab {
  return getNavItems(role)[0]?.id ?? "dashboard";
}

function canAccessTab(role: Role, tab: Tab) {
  return getNavItems(role).some((item) => item.id === tab);
}

function isRole(value: unknown): value is Role {
  return value === "admin" || value === "supervisor";
}

function parseStoredUser(value: string): User | null {
  try {
    const parsed = JSON.parse(value) as Partial<User>;

    if (typeof parsed.username === "string" && typeof parsed.nombre === "string" && isRole(parsed.role)) {
      return { username: parsed.username, nombre: parsed.nombre, role: parsed.role };
    }
  } catch {
    return null;
  }

  return null;
}

function Dashboard({ userRole }: { userRole: Role }) {
  const metrics = useMemo(
    () => [
      { label: "Beneficiarios activos", value: beneficiariosMock.filter((item) => item.estado === "activo").length, detail: "Habilitados para operar", color: "text-green-700" },
      { label: "Beneficiarios bloqueados", value: beneficiariosMock.filter((item) => item.estado === "bloqueado").length, detail: "Tarjetas o cuentas bloqueadas", color: "text-yellow-700" },
      { label: "Recargas realizadas hoy", value: recargasMock.filter((item) => item.fecha === "2026-06-19").length, detail: "Operaciones registradas", color: "text-blue-700" },
      { label: "Anomalías pendientes", value: anomaliasMock.filter((item) => item.estado === "pendiente").length, detail: "Requieren revisión", color: "text-red-700" },
    ],
    []
  );

  return (
    <div className="space-y-6">
      {userRole === "supervisor" && (
        <div className="rounded-xl border border-purple-200 bg-purple-50 p-4">
          <div className="flex gap-3">
            <Shield className="mt-0.5 h-5 w-5 shrink-0 text-purple-700" />
            <div>
              <h2 className="text-sm text-purple-950">Acceso de Supervisor</h2>
              <p className="text-sm text-purple-800">Perfil habilitado para consultar reportes, gestionar anomalías, revisar incidencias y consultar auditorías.</p>
            </div>
          </div>
        </div>
      )}

      <div className="grid gap-4 sm:grid-cols-2 xl:grid-cols-4">
        {metrics.map((metric) => (
          <div key={metric.label} className="rounded-xl border border-border bg-card p-5">
            <p className="text-xs uppercase tracking-wide text-muted-foreground">{metric.label}</p>
            <p className={`mt-3 text-3xl ${metric.color}`}>{metric.value}</p>
            <p className="mt-1 text-xs text-muted-foreground">{metric.detail}</p>
          </div>
        ))}
      </div>

      <div className="overflow-hidden rounded-xl border border-border bg-card">
        <div className="border-b border-border bg-muted/30 px-5 py-4">
          <h2 className="text-sm">Actividad reciente</h2>
        </div>
        <div className="overflow-x-auto">
          <table className="w-full min-w-[720px]">
            <thead className="border-b border-border">
              <tr>
                {["Fecha", "Usuario", "Acción", "Detalle"].map((header) => (
                  <th key={header} className="px-5 py-3 text-left text-xs uppercase tracking-wide text-muted-foreground">{header}</th>
                ))}
              </tr>
            </thead>
            <tbody className="divide-y divide-border">
              {actividadesMock.map((activity) => (
                <tr key={activity.id} className="hover:bg-accent/20">
                  <td className="px-5 py-3 text-sm">{activity.fecha}</td>
                  <td className="px-5 py-3 text-sm">{activity.usuario}</td>
                  <td className="px-5 py-3 text-sm">{activity.accion}</td>
                  <td className="px-5 py-3 text-sm text-muted-foreground">{activity.detalle}</td>
                </tr>
              ))}
            </tbody>
          </table>
        </div>
      </div>
    </div>
  );
}

export default function App() {
  const [user, setUser] = useState<User | null>(null);
  const [activeTab, setActiveTab] = useState<Tab>("dashboard");

  useEffect(() => {
    const savedUser = localStorage.getItem("user");
    if (!savedUser) return;

    const parsedUser = parseStoredUser(savedUser);

    if (parsedUser) {
      setActiveTab(getDefaultTab(parsedUser.role));
      setUser(parsedUser);
    } else {
      localStorage.removeItem("user");
    }
  }, []);

  const availableNavItems = user ? getNavItems(user.role) : [];
  const visibleTab = user && canAccessTab(user.role, activeTab) ? activeTab : user ? getDefaultTab(user.role) : "dashboard";
  const current = availableNavItems.find((item) => item.id === visibleTab);

  useEffect(() => {
    if (user && activeTab !== visibleTab) setActiveTab(visibleTab);
  }, [activeTab, user, visibleTab]);

  const handleLogin = (userData: User) => {
    localStorage.setItem("user", JSON.stringify(userData));
    setActiveTab(getDefaultTab(userData.role));
    setUser(userData);
  };

  const handleLogout = () => {
    setUser(null);
    setActiveTab("dashboard");
    localStorage.removeItem("user");
  };

  if (!user) return <Login onLogin={handleLogin} />;

  const renderActiveTab = () => {
    switch (visibleTab) {
      case "dashboard":
        return <Dashboard userRole={user.role} />;
      case "beneficiarios":
        return user.role === "admin" ? <Beneficiarios /> : null;
      case "recargas":
        return user.role === "admin" ? <Recargas /> : null;
      case "anomalias":
        return user.role === "supervisor" ? <Anomalias /> : null;
      case "reportes":
        return user.role === "supervisor" ? <Reportes /> : null;
      default:
        return <Dashboard userRole={user.role} />;
    }
  };

  return (
    <div className="flex min-h-screen bg-background">
      <aside className="hidden w-64 shrink-0 flex-col border-r border-sidebar-border bg-sidebar md:flex">
        <div className="border-b border-sidebar-border px-5 py-6">
          <div className="flex items-center gap-3">
            <div className="flex h-9 w-9 items-center justify-center rounded-xl bg-blue-700 shadow-md">
              <Ticket className="h-5 w-5 text-white" />
            </div>
            <div>
              <p className="text-sm leading-tight text-sidebar-foreground">Sistema Boletos</p>
              <p className="text-xs leading-tight text-sidebar-foreground opacity-60">Oberá, Misiones</p>
            </div>
          </div>
        </div>

        <nav className="flex-1 space-y-1 px-3 py-4">
          {availableNavItems.map((item) => (
            <button
              key={item.id}
              onClick={() => setActiveTab(item.id)}
              className={`flex w-full items-center gap-3 rounded-xl px-3 py-2.5 text-left transition-colors ${
                visibleTab === item.id
                  ? "bg-sidebar-primary text-sidebar-primary-foreground"
                  : "text-sidebar-foreground hover:bg-sidebar-accent hover:text-sidebar-accent-foreground"
              }`}
            >
              {item.icon}
              <span className="min-w-0 flex-1">
                <span className="block text-sm leading-tight">{item.label}</span>
                <span className={`block text-xs leading-tight ${visibleTab === item.id ? "opacity-70" : "text-muted-foreground"}`}>{item.desc}</span>
              </span>
              {visibleTab === item.id && <ChevronRight className="h-4 w-4 opacity-50" />}
            </button>
          ))}
        </nav>

        <div className="space-y-1 border-t border-sidebar-border px-3 py-4">
          <div className="mb-2 px-3 py-2">
            <div className="mb-1 flex items-center gap-2">
              {user.role === "admin" ? <UserIcon className="h-3.5 w-3.5 text-blue-600" /> : <Shield className="h-3.5 w-3.5 text-purple-600" />}
              <span className="text-xs text-muted-foreground">{user.role === "admin" ? "Administrador" : "Supervisor"}</span>
            </div>
            <p className="truncate text-xs text-sidebar-foreground">{user.nombre}</p>
          </div>
          <button className="flex w-full items-center gap-3 rounded-xl px-3 py-2.5 text-sidebar-foreground transition-colors hover:bg-sidebar-accent">
            <Settings className="h-5 w-5" />
            <span className="text-sm">Configuración</span>
          </button>
          <button onClick={handleLogout} className="flex w-full items-center gap-3 rounded-xl px-3 py-2.5 text-sidebar-foreground transition-colors hover:bg-red-50 hover:text-destructive">
            <LogOut className="h-5 w-5" />
            <span className="text-sm">Cerrar sesión</span>
          </button>
        </div>
      </aside>

      <div className="flex min-w-0 flex-1 flex-col">
        <header className="flex shrink-0 items-center justify-between border-b border-border bg-card px-6 py-4">
          <div>
            <h1>{current?.label ?? "Dashboard"}</h1>
            <p className="text-xs text-muted-foreground">{current?.desc ?? "Resumen administrativo"}</p>
          </div>
          <div className="flex items-center gap-3">
            <button className="relative rounded-xl p-2 text-muted-foreground transition-colors hover:bg-accent">
              <Bell className="h-5 w-5" />
              <span className="absolute right-1.5 top-1.5 h-2 w-2 rounded-full bg-destructive" />
            </button>
            <div className="flex items-center gap-2 border-l border-border pl-3">
              <div className={`flex h-8 w-8 items-center justify-center rounded-xl text-xs text-white ${user.role === "admin" ? "bg-blue-700" : "bg-purple-700"}`}>{user.nombre.charAt(0)}</div>
              <div className="hidden sm:block">
                <p className="text-xs leading-tight text-foreground">{user.nombre}</p>
                <p className="text-xs leading-tight text-muted-foreground">{user.role === "admin" ? "Administrador" : "Supervisor"}</p>
              </div>
            </div>
          </div>
        </header>

        <div className="flex gap-1 overflow-x-auto border-b border-border bg-card px-4 md:hidden">
          {availableNavItems.map((item) => (
            <button
              key={item.id}
              onClick={() => setActiveTab(item.id)}
              className={`flex items-center gap-2 whitespace-nowrap border-b-2 px-4 py-3 text-sm transition-colors ${visibleTab === item.id ? "border-foreground text-foreground" : "border-transparent text-muted-foreground hover:text-foreground"}`}
            >
              {item.icon}
              {item.label}
            </button>
          ))}
        </div>

        <main className="flex-1 overflow-auto p-6">
          {renderActiveTab()}
        </main>
      </div>
    </div>
  );
}
