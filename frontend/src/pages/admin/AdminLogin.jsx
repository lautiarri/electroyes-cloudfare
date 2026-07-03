import { useState } from "react";
import { Navigate, useNavigate } from "react-router-dom";
import { Lock, Loader2 } from "lucide-react";
import { toast } from "sonner";
import api from "../../lib/api";

export default function AdminLogin() {
  const [username, setUsername] = useState("");
  const [password, setPassword] = useState("");
  const [loading, setLoading] = useState(false);
  const nav = useNavigate();

  if (localStorage.getItem("ey_admin_token")) {
    return <Navigate to="/tienda/admin" replace />;
  }

  const handle = async (e) => {
    e.preventDefault();
    setLoading(true);
    try {
      const { token } = await api.adminLogin(username, password);
      localStorage.setItem("ey_admin_token", token);
      toast.success("¡Bienvenido!");
      nav("/tienda/admin");
    } catch (err) {
      toast.error(err?.response?.data?.detail || "Error de autenticación");
    } finally {
      setLoading(false);
    }
  };

  return (
    <div className="min-h-[70vh] flex items-center justify-center px-5" data-testid="admin-login-page">
      <div className="w-full max-w-md bg-white rounded-2xl border border-[hsl(var(--border))] p-8 shadow-sm">
        <div className="inline-flex items-center justify-center w-12 h-12 rounded-full bg-[hsl(var(--ey-coral-soft))] mb-4">
          <Lock className="w-6 h-6" style={{ color: "hsl(var(--ey-coral-strong))" }} />
        </div>
        <h1 className="text-2xl font-extrabold">Panel de administración</h1>
        <p className="text-sm text-[hsl(var(--ey-ink-soft))] mt-1">Ingresá con tus credenciales.</p>

        <form onSubmit={handle} className="mt-6 space-y-4">
          <div>
            <label className="block text-xs font-bold uppercase tracking-wider text-[hsl(var(--ey-ink-soft))] mb-1.5">Usuario</label>
            <input
              value={username}
              onChange={(e) => setUsername(e.target.value)}
              className="w-full px-4 py-2.5 rounded-xl border border-[hsl(var(--border))] focus:outline-none focus:border-[hsl(var(--ey-coral))]"
              required
              data-testid="admin-username"
            />
          </div>
          <div>
            <label className="block text-xs font-bold uppercase tracking-wider text-[hsl(var(--ey-ink-soft))] mb-1.5">Contraseña</label>
            <input
              type="password"
              value={password}
              onChange={(e) => setPassword(e.target.value)}
              className="w-full px-4 py-2.5 rounded-xl border border-[hsl(var(--border))] focus:outline-none focus:border-[hsl(var(--ey-coral))]"
              required
              data-testid="admin-password"
            />
          </div>
          <button type="submit" disabled={loading} className="btn-coral w-full justify-center" data-testid="admin-login-btn">
            {loading ? <><Loader2 className="w-4 h-4 animate-spin" /> Ingresando...</> : "Ingresar"}
          </button>
        </form>
      </div>
    </div>
  );
}
