import { Link, useLocation, useParams } from "react-router-dom";
import { CheckCircle2, ShoppingBag } from "lucide-react";
import { formatPrice } from "../lib/format";

export default function OrderConfirmation() {
  const { state } = useLocation();
  const { id } = useParams();
  const order = state?.order;

  return (
    <div className="max-w-2xl mx-auto px-5 py-16 sm:py-24 text-center" data-testid="order-confirmation-page">
      <div className="inline-flex items-center justify-center w-20 h-20 rounded-full bg-[hsl(var(--ey-coral-soft))] mb-6">
        <CheckCircle2 className="w-11 h-11" style={{ color: "hsl(var(--ey-coral-strong))" }} strokeWidth={2} />
      </div>
      <h1 className="text-3xl sm:text-4xl font-extrabold tracking-tight">¡Pedido enviado con éxito!</h1>
      <p className="mt-3 text-[hsl(var(--ey-ink-soft))] max-w-md mx-auto">
        En breve nos pondremos en contacto para coordinar el pago y la entrega. Guardá tu número de pedido.
      </p>
      <div className="mt-6 inline-block bg-white border border-[hsl(var(--border))] rounded-full px-6 py-2 text-sm font-mono font-bold" data-testid="order-id">
        # {(id || "").slice(0, 8).toUpperCase()}
      </div>

      {order && (
        <div className="mt-8 bg-white rounded-2xl border border-[hsl(var(--border))] p-6 text-left">
          <div className="text-sm text-[hsl(var(--ey-ink-soft))]">
            <div><b>Nombre:</b> {order.first_name} {order.last_name}</div>
            <div><b>Email:</b> {order.email}</div>
            <div><b>Teléfono:</b> {order.phone}</div>
          </div>
          <div className="mt-4 pt-4 border-t space-y-2">
            {order.items.map((i) => (
              <div key={i.code} className="flex justify-between text-sm">
                <span className="truncate">{i.name} × {i.quantity}</span>
                <span className="font-semibold">{formatPrice(i.subtotal)}</span>
              </div>
            ))}
          </div>
          <div className="mt-4 pt-4 border-t flex justify-between items-baseline">
            <span className="font-semibold">Total</span>
            <span className="text-xl font-extrabold" style={{ color: "hsl(var(--ey-coral-strong))" }}>{formatPrice(order.total)}</span>
          </div>
        </div>
      )}

      <Link to="/tienda" className="btn-coral mt-10" data-testid="back-to-catalog-btn">
        <ShoppingBag className="w-4 h-4" /> Volver al catálogo
      </Link>
    </div>
  );
}
