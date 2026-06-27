import { useState } from "react";
import { AlertCircle, Lock, LogIn, Shield, User } from "lucide-react";
import { Role } from "../data/appData";
import bannerUrl from "../../../imagenes/Banner.png";
import logoUrl from "../../../imagenes/Logo.PNG";

interface LoginProps {
  onLogin: (user: { username: string; role: Role; nombre: string }) => void;
}

const USUARIOS = [
  { username: "admin", password: "admin123", role: "admin" as const, nombre: "Administrador Municipal" },
  { username: "supervisor", password: "super123", role: "supervisor" as const, nombre: "Supervisor de Transporte" },
  { username: "maria.gonzalez", password: "maria123", role: "admin" as const, nombre: "María González" },
  { username: "juan.perez", password: "juan123", role: "supervisor" as const, nombre: "Juan Pérez" },
];

export function Login({ onLogin }: LoginProps) {
  const [username, setUsername] = useState("");
  const [password, setPassword] = useState("");
  const [error, setError] = useState("");
  const [loading, setLoading] = useState(false);

  const handleSubmit = (event: React.FormEvent) => {
    event.preventDefault();
    setError("");
    setLoading(true);

    setTimeout(() => {
      const usuario = USUARIOS.find((item) => item.username === username && item.password === password);

      if (usuario) {
        onLogin({ username: usuario.username, role: usuario.role, nombre: usuario.nombre });
        return;
      }

      setError("Usuario o contraseña incorrectos");
      setLoading(false);
    }, 500);
  };

  return (
    <div className="flex min-h-screen items-center justify-center bg-slate-100 p-4">
      <div className="w-full max-w-md overflow-hidden rounded-2xl border border-border bg-card shadow-xl">
        <div className="h-24 bg-[#07366d]">
          <img src={bannerUrl} alt="Gobierno de la Ciudad de Obera" className="h-full w-full object-cover object-center" />
        </div>

        <div className="px-8 pb-8 pt-6">
          <div className="mb-8 text-center">
            <div className="mb-4 inline-flex h-20 w-20 items-center justify-center rounded-2xl bg-white p-2 shadow-lg ring-1 ring-border">
              <img src={logoUrl} alt="Gobierno de Obera" className="h-full w-full object-contain" />
            </div>
            <h1 className="mb-2 text-2xl text-foreground md:text-3xl">Sistema de Gestión de Boletos</h1>
            <p className="text-sm text-muted-foreground">Acceso interno municipal</p>
          </div>

          <div className="mb-6">
            <h2 className="mb-1 text-xl text-foreground">Iniciar sesión</h2>
            <p className="text-sm text-muted-foreground">Administradores y supervisores autorizados</p>
          </div>

          <form onSubmit={handleSubmit} className="space-y-5">
            <div className="space-y-2">
              <label className="flex items-center gap-2 text-sm text-foreground">
                <User className="h-4 w-4 text-muted-foreground" />
                Usuario
              </label>
              <input
                type="text"
                value={username}
                onChange={(event) => {
                  setUsername(event.target.value);
                  setError("");
                }}
                placeholder="Ingrese su usuario"
                className="w-full rounded-xl border border-border bg-background px-4 py-3 text-sm text-foreground outline-none transition-colors focus:border-blue-500"
                required
                autoComplete="username"
              />
            </div>

            <div className="space-y-2">
              <label className="flex items-center gap-2 text-sm text-foreground">
                <Lock className="h-4 w-4 text-muted-foreground" />
                Contraseña
              </label>
              <input
                type="password"
                value={password}
                onChange={(event) => {
                  setPassword(event.target.value);
                  setError("");
                }}
                placeholder="Ingrese su contraseña"
                className="w-full rounded-xl border border-border bg-background px-4 py-3 text-sm text-foreground outline-none transition-colors focus:border-blue-500"
                required
                autoComplete="current-password"
              />
            </div>

            {error && (
              <div className="flex items-center gap-2 rounded-xl border border-red-200 bg-red-50 p-3 text-sm text-red-800">
                <AlertCircle className="h-4 w-4 shrink-0" />
                <span>{error}</span>
              </div>
            )}

            <button
              type="submit"
              disabled={loading || !username || !password}
              className="flex w-full items-center justify-center gap-2 rounded-xl bg-blue-700 py-3 text-white shadow-md transition hover:bg-blue-800 disabled:cursor-not-allowed disabled:opacity-50"
            >
              {loading ? (
                <>
                  <div className="h-4 w-4 animate-spin rounded-full border-2 border-white border-t-transparent" />
                  Verificando...
                </>
              ) : (
                <>
                  <LogIn className="h-4 w-4" />
                  Iniciar sesión
                </>
              )}
            </button>
          </form>
        </div>

        <div className="mx-8 mb-8 rounded-xl border border-blue-200 bg-blue-50 p-4">
          <div className="mb-3 flex items-start gap-2">
            <Shield className="mt-0.5 h-4 w-4 shrink-0 text-blue-700" />
            <div>
              <h3 className="mb-1 text-sm font-medium text-blue-900">Credenciales de prueba</h3>
              <p className="text-xs text-blue-700">Para demo y desarrollo:</p>
            </div>
          </div>
          <div className="space-y-2 text-xs">
            <div className="rounded-lg border border-blue-100 bg-white p-2 text-blue-900"><strong>Administrador:</strong> admin / admin123</div>
            <div className="rounded-lg border border-blue-100 bg-white p-2 text-blue-900"><strong>Supervisor:</strong> supervisor / super123</div>
          </div>
        </div>
      </div>
    </div>
  );
}
