import { useState } from "react";
import { useNavigate, Link } from "react-router-dom";
import { ArrowLeft, Loader2 } from "lucide-react";
import { toast } from "sonner";
import { useCart } from "../context/CartContext";
import { formatPrice } from "../lib/format";
import api from "../lib/api";

export default function Checkout() {
  const { items, total, clear } = useCart();
  const nav = useNavigate();
  const [form, setForm] = useState({ first_name: "", last_name: "", phone: "", email: "" });
  const [submitting, setSubmitting] = useState(false);

  if (items.length === 0) {
    return (
      <div className="max-w-2xl mx-auto px-5 py-24 text-center">
        <h2 className="text-2xl font-bold">Tu carrito está vacío</h2>
        <Link to="/tienda" className="btn-coral mt-6"><ArrowLeft className="w-4 h-4" /> Volver al catálogo</Link>
      </div>
    );
  }

  const handleSubmit = async (e) => {
    e.preventDefault();
    if (!form.first_name || !form.last_name || !form.phone || !form.email) {
      toast.error("Completá todos los campos");
      return;
    }
    setSubmitting(true);
    try {
      const order = await api.createOrder({
        ...form,
        items: items.map((i) => ({
          product_id: i.product_id,
          code: i.code,
          name: i.name,
          quantity: i.quantity,
          unit_price: i.unit_price,
          subtotal: i.unit_price * i.quantity,
        })),
      });
      clear();
      nav(`/tienda/confirmacion/${order.id}`, { state: { order } });
    } catch (err) {
      toast.error(err?.response?.data?.detail || "No se pudo generar el pedido");
    } finally {
      setSubmitting(false);
    }
  };

  const update = (k) => (e) => setForm((f) => ({ ...f, [k]: e.target.value }));

  return (
    <div className="max-w-5xl mx-auto px-5 lg:px-8 py-10 sm:py-14" data-testid="checkout-page">
      <Link to="/tienda/carrito" className="text-sm text-[hsl(var(--ey-ink-soft))] hover:text-[hsl(var(--ey-coral-strong))] mb-6 inline-flex items-center gap-1.5">
        <ArrowLeft className="w-4 h-4" /> Volver al carrito
      </Link>

      <h1 className="text-3xl sm:text-4xl font-extrabold tracking-tight mb-8">Finalizar pedido</h1>

      <div className="grid lg:grid-cols-3 gap-8">
        <form onSubmit={handleSubmit} className="lg:col-span-2 bg-white rounded-2xl border border-[hsl(var(--border))] p-6 sm:p-8 space-y-5">
          <div>
            <h3 className="text-lg font-extrabold mb-1">Tus datos</h3>
            <p className="text-sm text-[hsl(var(--ey-ink-soft))]">Nos vamos a contactar por teléfono o email para coordinar.</p>
          </div>

          <div className="grid sm:grid-cols-2 gap-4">
            <Field label="Nombre" value={form.first_name} onChange={update("first_name")} testId="checkout-first-name" />
            <Field label="Apellido" value={form.last_name} onChange={update("last_name")} testId="checkout-last-name" />
            <Field label="Teléfono" value={form.phone} onChange={update("phone")} type="tel" testId="checkout-phone" />
            <Field label="Email" value={form.email} onChange={update("email")} type="email" testId="checkout-email" />
          </div>

          <button
            type="submit"
            disabled={submitting}
            className="btn-coral w-full justify-center mt-4"
            data-testid="checkout-submit-btn"
          >
            {submitting ? <><Loader2 className="w-4 h-4 animate-spin" /> Enviando pedido...</> : "Confirmar pedido"}
          </button>
        </form>

        <aside className="bg-white rounded-2xl border border-[hsl(var(--border))] p-6 h-fit">
          <h3 className="font-extrabold mb-4">Resumen</h3>
          <div className="space-y-3 max-h-72 overflow-y-auto no-scrollbar">
            {items.map((it) => (
              <div key={it.product_id} className="flex justify-between text-sm gap-3">
                <div className="min-w-0">
                  <div className="font-semibold truncate">{it.name}</div>
                  <div className="text-xs text-neutral-400">x {it.quantity}</div>
                </div>
                <div className="font-semibold shrink-0">{formatPrice(it.unit_price * it.quantity)}</div>
              </div>
            ))}
          </div>
          <div className="mt-5 pt-4 border-t border-[hsl(var(--border))] flex justify-between items-baseline">
            <span className="font-semibold">Total</span>
            <span className="text-2xl font-extrabold" style={{ color: "hsl(var(--ey-coral-strong))" }}>
              {formatPrice(total)}
            </span>
          </div>
        </aside>
      </div>
    </div>
  );
}

function Field({ label, value, onChange, type = "text", testId }) {
  return (
    <label className="block">
      <span className="block text-xs font-bold uppercase tracking-wider text-[hsl(var(--ey-ink-soft))] mb-1.5">{label}</span>
      <input
        required
        type={type}
        value={value}
        onChange={onChange}
        className="w-full px-4 py-2.5 rounded-xl border border-[hsl(var(--border))] bg-white focus:outline-none focus:border-[hsl(var(--ey-coral))]"
        data-testid={testId}
      />
    </label>
  );
}
