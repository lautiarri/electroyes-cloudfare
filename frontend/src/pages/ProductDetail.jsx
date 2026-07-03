import { useEffect, useState } from "react";
import { useParams, Link, useNavigate } from "react-router-dom";
import { ChevronLeft, ChevronRight, Minus, Plus, ShoppingCart, ArrowLeft } from "lucide-react";
import { toast } from "sonner";
import api from "../lib/api";
import { formatPrice } from "../lib/format";
import { useCart } from "../context/CartContext";

export default function ProductDetail() {
  const { code } = useParams();
  const nav = useNavigate();
  const { addItem } = useCart();
  const [product, setProduct] = useState(null);
  const [loading, setLoading] = useState(true);
  const [notFound, setNotFound] = useState(false);
  const [activeImg, setActiveImg] = useState(0);
  const [qty, setQty] = useState(1);

  useEffect(() => {
    setLoading(true);
    setNotFound(false);
    api
      .getProduct(code)
      .then((p) => setProduct(p))
      .catch(() => setNotFound(true))
      .finally(() => setLoading(false));
  }, [code]);

  if (loading)
    return (
      <div className="max-w-6xl mx-auto px-5 py-16">
        <div className="animate-pulse grid md:grid-cols-2 gap-10">
          <div className="aspect-square bg-neutral-200 rounded-2xl" />
          <div className="space-y-4">
            <div className="h-6 bg-neutral-200 rounded w-1/3" />
            <div className="h-10 bg-neutral-200 rounded w-3/4" />
            <div className="h-4 bg-neutral-200 rounded w-full" />
            <div className="h-4 bg-neutral-200 rounded w-4/5" />
          </div>
        </div>
      </div>
    );

  if (notFound || !product)
    return (
      <div className="max-w-3xl mx-auto px-5 py-24 text-center">
        <h2 className="text-2xl font-bold">Producto no encontrado</h2>
        <p className="text-[hsl(var(--ey-ink-soft))] mt-2">El producto que buscás ya no está disponible.</p>
        <Link to="/tienda" className="btn-coral mt-6"><ArrowLeft className="w-4 h-4" />Volver al catálogo</Link>
      </div>
    );

  const images = product.images && product.images.length ? product.images : [null];
  const outOfStock = product.stock <= 0;
  const clampedQty = Math.max(1, Math.min(qty, product.stock || 1));

  const handleAdd = () => {
    addItem(product, clampedQty);
    toast.success(`${product.name} agregado al carrito`, { description: `Cantidad: ${clampedQty}` });
  };

  const nextImg = () => setActiveImg((i) => (i + 1) % images.length);
  const prevImg = () => setActiveImg((i) => (i - 1 + images.length) % images.length);

  return (
    <div className="max-w-6xl mx-auto px-5 lg:px-8 py-8 sm:py-12" data-testid="product-detail-page">
      <button
        onClick={() => nav(-1)}
        className="text-sm text-[hsl(var(--ey-ink-soft))] hover:text-[hsl(var(--ey-coral-strong))] mb-6 inline-flex items-center gap-1.5"
      >
        <ArrowLeft className="w-4 h-4" /> Volver
      </button>

      <div className="grid md:grid-cols-2 gap-8 lg:gap-14">
        <div>
          <div className="relative aspect-square bg-white rounded-2xl border border-[hsl(var(--border))] overflow-hidden flex items-center justify-center">
            {images[activeImg] ? (
              <img
                src={images[activeImg]}
                alt={product.name}
                className="w-full h-full object-contain fade-in"
                key={activeImg}
              />
            ) : (
              <span className="text-neutral-300 text-sm">Sin imagen</span>
            )}
            {images.length > 1 && (
              <>
                <button
                  onClick={prevImg}
                  className="absolute left-3 top-1/2 -translate-y-1/2 w-9 h-9 rounded-full bg-white/95 border shadow flex items-center justify-center hover:bg-white"
                  data-testid="product-image-prev"
                >
                  <ChevronLeft className="w-5 h-5" />
                </button>
                <button
                  onClick={nextImg}
                  className="absolute right-3 top-1/2 -translate-y-1/2 w-9 h-9 rounded-full bg-white/95 border shadow flex items-center justify-center hover:bg-white"
                  data-testid="product-image-next"
                >
                  <ChevronRight className="w-5 h-5" />
                </button>
              </>
            )}
          </div>

          {images.length > 1 && (
            <div className="mt-3 flex gap-2 overflow-x-auto no-scrollbar">
              {images.map((img, i) => (
                <button
                  key={i}
                  onClick={() => setActiveImg(i)}
                  className={`w-20 h-20 rounded-lg border-2 overflow-hidden shrink-0 bg-white ${
                    i === activeImg
                      ? "border-[hsl(var(--ey-coral))]"
                      : "border-[hsl(var(--border))]"
                  }`}
                  data-testid={`product-thumb-${i}`}
                >
                  {img && <img src={img} alt="" className="w-full h-full object-contain" />}
                </button>
              ))}
            </div>
          )}
        </div>

        <div>
          <div className="text-xs font-bold tracking-widest text-neutral-400 uppercase" data-testid="product-code">
            Cód: {product.code}
          </div>
          <h1 className="mt-2 text-3xl sm:text-4xl lg:text-5xl font-extrabold tracking-tight leading-tight" data-testid="product-name">
            {product.name}
          </h1>

          <div className="mt-6 flex items-baseline gap-3">
            <span className="text-4xl font-extrabold" style={{ color: "hsl(var(--ey-coral-strong))" }} data-testid="product-price">
              {formatPrice(product.price)}
            </span>
            {outOfStock ? (
              <span className="text-xs font-bold px-2.5 py-1 rounded-full bg-neutral-800 text-white">SIN STOCK</span>
            ) : (
              <span className="text-xs font-semibold px-2.5 py-1 rounded-full bg-[hsl(var(--ey-coral-soft))] text-[hsl(var(--ey-coral-strong))]" data-testid="product-stock">
                {product.stock} disponibles
              </span>
            )}
          </div>

          {product.description && (
            <div className="mt-8">
              <h3 className="text-sm font-bold uppercase tracking-wider text-[hsl(var(--ey-ink-soft))] mb-2">Descripción</h3>
              <p className="text-[15px] leading-relaxed text-[hsl(var(--ey-ink-soft))] whitespace-pre-line" data-testid="product-description">
                {product.description}
              </p>
            </div>
          )}

          <div className="mt-10 flex flex-col sm:flex-row gap-4 items-stretch sm:items-center">
            <div className="inline-flex items-center border border-[hsl(var(--border))] rounded-full bg-white overflow-hidden">
              <button
                onClick={() => setQty((q) => Math.max(1, q - 1))}
                className="w-11 h-11 flex items-center justify-center hover:bg-[hsl(var(--ey-coral-soft))] disabled:opacity-40"
                disabled={outOfStock}
                data-testid="qty-decrement"
              >
                <Minus className="w-4 h-4" />
              </button>
              <input
                type="number"
                min={1}
                max={product.stock}
                value={qty}
                onChange={(e) => setQty(parseInt(e.target.value) || 1)}
                className="w-14 text-center font-bold border-none outline-none bg-transparent"
                disabled={outOfStock}
                data-testid="qty-input"
              />
              <button
                onClick={() => setQty((q) => Math.min(product.stock || 1, q + 1))}
                className="w-11 h-11 flex items-center justify-center hover:bg-[hsl(var(--ey-coral-soft))] disabled:opacity-40"
                disabled={outOfStock}
                data-testid="qty-increment"
              >
                <Plus className="w-4 h-4" />
              </button>
            </div>

            <button
              onClick={handleAdd}
              disabled={outOfStock}
              className="btn-coral flex-1 sm:flex-initial justify-center"
              data-testid="add-to-cart-btn"
            >
              <ShoppingCart className="w-5 h-5" />
              {outOfStock ? "Sin stock" : "Agregar al carrito"}
            </button>
          </div>
        </div>
      </div>
    </div>
  );
}
