import { Link, NavLink } from "react-router-dom";
import { ShoppingCart, Menu, X } from "lucide-react";
import { useState } from "react";
import { useCart } from "../context/CartContext";

const nav = [
  { to: "/tienda", label: "Tienda", end: true },
  { to: "https://electroyes.com.ar/#servicios", label: "Servicios", external: true },
  { to: "https://electroyes.com.ar/#zonas", label: "Zonas", external: true },
  { to: "https://electroyes.com.ar/#contacto", label: "Contacto", external: true },
];

export default function Header() {
  const { count } = useCart();
  const [open, setOpen] = useState(false);

  return (
    <header className="sticky top-0 z-50 bg-white/85 backdrop-blur-md border-b border-[hsl(var(--border))]">
      <div className="max-w-7xl mx-auto px-5 lg:px-8 h-16 flex items-center justify-between">
        <Link to="/tienda" className="flex items-center gap-3" data-testid="header-logo-link">
          <span className="hex-badge">EY</span>
          <span className="text-lg sm:text-xl font-extrabold tracking-tight">
            <span style={{ color: "hsl(var(--ey-coral-strong))" }}>Electro</span>
            <span className="text-[hsl(var(--foreground))]"> Yes</span>
          </span>
        </Link>

        <nav className="hidden md:flex items-center gap-7">
          {nav.map((n) =>
            n.external ? (
              <a
                key={n.label}
                href={n.to}
                className="text-sm font-medium text-[hsl(var(--ey-ink-soft))] hover:text-[hsl(var(--ey-coral-strong))] transition-colors"
              >
                {n.label}
              </a>
            ) : (
              <NavLink
                key={n.label}
                to={n.to}
                end={n.end}
                className={({ isActive }) =>
                  `text-sm font-medium transition-colors ${
                    isActive
                      ? "text-[hsl(var(--ey-coral-strong))]"
                      : "text-[hsl(var(--ey-ink-soft))] hover:text-[hsl(var(--ey-coral-strong))]"
                  }`
                }
              >
                {n.label}
              </NavLink>
            )
          )}
        </nav>

        <div className="flex items-center gap-3">
          <Link
            to="/tienda/carrito"
            data-testid="header-cart-link"
            className="relative inline-flex items-center gap-2 px-3 py-2 rounded-full border border-[hsl(var(--border))] hover:border-[hsl(var(--ey-coral))] hover:bg-[hsl(var(--ey-coral-soft))] transition-all"
          >
            <ShoppingCart className="w-5 h-5" strokeWidth={2.2} />
            <span className="hidden sm:inline text-sm font-semibold">Carrito</span>
            {count > 0 && (
              <span
                data-testid="cart-count-badge"
                className="absolute -top-1 -right-1 min-w-[20px] h-5 px-1 rounded-full bg-[hsl(var(--ey-coral-strong))] text-white text-[11px] font-bold flex items-center justify-center"
              >
                {count}
              </span>
            )}
          </Link>
          <button
            className="md:hidden p-2"
            onClick={() => setOpen((v) => !v)}
            data-testid="mobile-menu-toggle"
            aria-label="Menú"
          >
            {open ? <X className="w-6 h-6" /> : <Menu className="w-6 h-6" />}
          </button>
        </div>
      </div>

      {open && (
        <div className="md:hidden border-t border-[hsl(var(--border))] bg-white">
          <div className="flex flex-col p-4 gap-3">
            {nav.map((n) =>
              n.external ? (
                <a
                  key={n.label}
                  href={n.to}
                  className="text-sm font-medium text-[hsl(var(--ey-ink-soft))]"
                  onClick={() => setOpen(false)}
                >
                  {n.label}
                </a>
              ) : (
                <NavLink
                  key={n.label}
                  to={n.to}
                  end={n.end}
                  className="text-sm font-medium text-[hsl(var(--ey-ink-soft))]"
                  onClick={() => setOpen(false)}
                >
                  {n.label}
                </NavLink>
              )
            )}
          </div>
        </div>
      )}
    </header>
  );
}
