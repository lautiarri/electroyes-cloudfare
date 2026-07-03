import { Link, useNavigate } from "react-router-dom";
import { Trash2, Minus, Plus, ArrowLeft, ShoppingBag } from "lucide-react";
import { useCart } from "../context/CartContext";
import { formatPrice } from "../lib/format";

export default function Cart() {
  const { items, updateQty, removeItem, total } = useCart();
  const nav = useNavigate();

  if (items.length === 0) {
    return (
      <div className="max-w-3xl mx-auto px-5 py-20 text-center" data-testid="cart-empty">
        <ShoppingBag className="w-14 h-14 mx-auto text-neutral-300 mb-4" />
        <h2 className="text-2xl font-extrabold">Tu carrito está vacío</h2>
        <p className="text-[hsl(var(--ey-ink-soft))] mt-2">Agregá productos desde el catálogo para comenzar.</p>
        <Link to="/tienda" className="btn-coral mt-6"><ArrowLeft className="w-4 h-4" /> Ir al catálogo</Link>
      </div>
    );
  }

  return (
    <div className="max-w-5xl mx-auto px-5 lg:px-8 py-10 sm:py-14" data-testid="cart-page">
      <div className="flex items-end justify-between mb-8 gap-4 flex-wrap">
        <h1 className="text-3xl sm:text-4xl font-extrabold tracking-tight">Tu carrito</h1>
        <Link to="/tienda" className="text-sm font-semibold text-[hsl(var(--ey-coral-strong))] hover:underline">
          ← Seguir comprando
        </Link>
      </div>

      <div className="grid lg:grid-cols-3 gap-8">
        <div className="lg:col-span-2 space-y-4">
          {items.map((it) => (
            <div
              key={it.product_id}
              className="bg-white rounded-2xl border border-[hsl(var(--border))] p-4 flex gap-4 items-center"
              data-testid={`cart-item-${it.code}`}
            >
              <div className="w-20 h-20 sm:w-24 sm:h-24 bg-[hsl(var(--ey-cream))] rounded-xl flex items-center justify-center overflow-hidden shrink-0">
                {it.image ? (
                  <img src={it.image} alt={it.name} className="w-full h-full object-contain" />
                ) : (
                  <ShoppingBag className="w-6 h-6 text-neutral-300" />
                )}
              </div>
              <div className="flex-1 min-w-0">
                <div className="text-[11px] font-bold text-neutral-400 tracking-wider uppercase">Cód: {it.code}</div>
                <div className="font-semibold line-clamp-2">{it.name}</div>
                <div className="text-sm text-[hsl(var(--ey-ink-soft))]">{formatPrice(it.unit_price)} c/u</div>
              </div>
              <div className="flex flex-col items-end gap-2">
                <div className="inline-flex items-center border border-[hsl(var(--border))] rounded-full bg-white">
                  <button
                    onClick={() => updateQty(it.product_id, it.quantity - 1)}
                    className="w-8 h-8 flex items-center justify-center hover:bg-[hsl(var(--ey-coral-soft))]"
                    data-testid={`cart-qty-dec-${it.code}`}
                  >
                    <Minus className="w-3 h-3" />
                  </button>
                  <span className="w-8 text-center text-sm font-bold" data-testid={`cart-qty-${it.code}`}>{it.quantity}</span>
                  <button
                    onClick={() => updateQty(it.product_id, it.quantity + 1)}
                    className="w-8 h-8 flex items-center justify-center hover:bg-[hsl(var(--ey-coral-soft))]"
                    data-testid={`cart-qty-inc-${it.code}`}
                  >
                    <Plus className="w-3 h-3" />
                  </button>
                </div>
                <div className="font-extrabold" style={{ color: "hsl(var(--ey-coral-strong))" }}>
                  {formatPrice(it.quantity * it.unit_price)}
                </div>
                <button
                  onClick={() => removeItem(it.product_id)}
                  className="text-neutral-400 hover:text-red-500 transition-colors p-1"
                  data-testid={`cart-remove-${it.code}`}
                  aria-label="Eliminar"
                >
                  <Trash2 className="w-4 h-4" />
                </button>
              </div>
            </div>
          ))}
        </div>

        <aside className="bg-white rounded-2xl border border-[hsl(var(--border))] p-6 h-fit sticky top-24" data-testid="cart-summary">
          <h3 className="text-lg font-extrabold mb-4">Resumen</h3>
          <div className="flex justify-between text-sm text-[hsl(var(--ey-ink-soft))] mb-2">
            <span>Productos</span>
            <span>{items.reduce((s, i) => s + i.quantity, 0)}</span>
          </div>
          <div className="flex justify-between items-baseline pt-4 border-t border-[hsl(var(--border))]">
            <span className="text-sm font-semibold">Total</span>
            <span className="text-2xl font-extrabold" style={{ color: "hsl(var(--ey-coral-strong))" }} data-testid="cart-total">
              {formatPrice(total)}
            </span>
          </div>
          <button
            onClick={() => nav("/tienda/checkout")}
            className="btn-coral w-full justify-center mt-6"
            data-testid="generate-order-btn"
          >
            GENERAR PEDIDO
          </button>
          <p className="text-[11px] text-neutral-400 mt-3 text-center leading-relaxed">
            Al generar el pedido nos comunicaremos con vos para coordinar el pago y la entrega.
          </p>
        </aside>
      </div>
    </div>
  );
}
