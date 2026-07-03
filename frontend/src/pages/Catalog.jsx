import { useEffect, useMemo, useState } from "react";
import { Link } from "react-router-dom";
import { Search, ShoppingBag } from "lucide-react";
import api from "../lib/api";
import { formatPrice } from "../lib/format";

export default function Catalog() {
  const [products, setProducts] = useState([]);
  const [loading, setLoading] = useState(true);
  const [q, setQ] = useState("");

  useEffect(() => {
    api
      .listProducts()
      .then(setProducts)
      .catch(() => setProducts([]))
      .finally(() => setLoading(false));
  }, []);

  const filtered = useMemo(() => {
    const s = q.trim().toLowerCase();
    if (!s) return products;
    return products.filter(
      (p) =>
        p.name.toLowerCase().includes(s) ||
        p.code.toLowerCase().includes(s) ||
        (p.description || "").toLowerCase().includes(s)
    );
  }, [products, q]);

  return (
    <div className="max-w-7xl mx-auto px-5 lg:px-8 py-10 sm:py-14" data-testid="catalog-page">
      <div className="flex flex-col sm:flex-row sm:items-end sm:justify-between gap-6 mb-10">
        <div>
          <p className="text-sm font-semibold uppercase tracking-widest text-[hsl(var(--ey-coral-strong))] mb-2">
            Tienda online
          </p>
          <h1 className="text-4xl sm:text-5xl lg:text-6xl font-extrabold tracking-tight">
            Todos nuestros <span style={{ color: "hsl(var(--ey-coral-strong))" }}>productos</span>
          </h1>
          <p className="mt-3 text-[hsl(var(--ey-ink-soft))] max-w-lg">
            Electrodomésticos y accesorios seleccionados. Stock rotativo, precios claros y sin vueltas.
          </p>
        </div>
        <div className="relative w-full sm:w-72">
          <Search className="absolute left-3 top-1/2 -translate-y-1/2 w-4 h-4 text-neutral-400" />
          <input
            data-testid="catalog-search-input"
            value={q}
            onChange={(e) => setQ(e.target.value)}
            placeholder="Buscar por nombre o código..."
            className="w-full pl-9 pr-4 py-2.5 rounded-full border border-[hsl(var(--border))] bg-white text-sm focus:outline-none focus:border-[hsl(var(--ey-coral))]"
          />
        </div>
      </div>

      {loading && (
        <div className="grid grid-cols-2 sm:grid-cols-3 lg:grid-cols-4 gap-5">
          {Array.from({ length: 8 }).map((_, i) => (
            <div key={i} className="card-product animate-pulse">
              <div className="product-thumb bg-neutral-200" />
              <div className="h-4 bg-neutral-200 rounded mt-4 w-3/4" />
              <div className="h-4 bg-neutral-200 rounded mt-2 w-1/2" />
            </div>
          ))}
        </div>
      )}

      {!loading && filtered.length === 0 && (
        <div className="text-center py-24" data-testid="catalog-empty">
          <ShoppingBag className="w-12 h-12 mx-auto text-neutral-400 mb-4" />
          <p className="text-lg font-semibold">Aún no hay productos cargados</p>
          <p className="text-sm text-[hsl(var(--ey-ink-soft))] mt-1">
            Volvé pronto — estamos preparando el catálogo.
          </p>
        </div>
      )}

      {!loading && filtered.length > 0 && (
        <div className="grid grid-cols-2 sm:grid-cols-3 lg:grid-cols-4 gap-5" data-testid="catalog-grid">
          {filtered.map((p, idx) => (
            <Link
              key={p.id}
              to={`/tienda/producto/${p.code}`}
              className="card-product fade-in"
              style={{ animationDelay: `${idx * 40}ms` }}
              data-testid={`product-card-${p.code}`}
            >
              <div className="product-thumb">
                {p.images && p.images[0] ? (
                  <img src={p.images[0]} alt={p.name} />
                ) : (
                  <ShoppingBag className="w-10 h-10 text-neutral-300" />
                )}
              </div>
              <div className="pt-4 pb-1 flex-1 flex flex-col">
                <div className="text-[11px] font-semibold text-neutral-400 tracking-wider uppercase">
                  Cód: {p.code}
                </div>
                <h3 className="mt-1 font-semibold text-sm sm:text-base line-clamp-2 min-h-[42px]">
                  {p.name}
                </h3>
                <div className="mt-auto pt-3 flex items-baseline justify-between">
                  <span className="text-lg font-extrabold" style={{ color: "hsl(var(--ey-coral-strong))" }}>
                    {formatPrice(p.price)}
                  </span>
                  {p.stock <= 0 && (
                    <span className="text-[10px] font-bold px-2 py-1 rounded-full bg-neutral-200 text-neutral-600">
                      SIN STOCK
                    </span>
                  )}
                </div>
              </div>
            </Link>
          ))}
        </div>
      )}
    </div>
  );
}
