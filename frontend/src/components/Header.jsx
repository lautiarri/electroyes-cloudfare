import { Link } from "react-router-dom";
import { ShoppingCart, Menu, X, MessageCircle, ArrowLeft } from "lucide-react";
import { useState } from "react";
import { useCart } from "../context/CartContext";

export default function Header() {
  const { count } = useCart();
  const [open, setOpen] = useState(false);

  return (
    <header className="fixed top-0 left-0 right-0 bg-white shadow-md z-50">
      <div className="max-w-6xl mx-auto px-4 py-3">
        <div className="flex items-center justify-between">
          <Link to="/tienda" className="flex items-center space-x-3" data-testid="header-logo-link">
            <img src="/electroyes-logo.png" alt="Electro Yes" className="h-12 w-12" />
            <span className="text-2xl font-bold">
              <span className="text-red-500">Electro</span>
              <span className="text-gray-800"> Yes</span>
            </span>
          </Link>

          <nav className="hidden md:flex items-center space-x-6">
            <a href="https://electroyes.com.ar" className="text-gray-700 hover:text-red-500 transition-colors font-medium inline-flex items-center gap-1.5"><ArrowLeft size={16}/> Volver al sitio</a>
            <Link
              to="/tienda/carrito"
              data-testid="header-cart-link"
              className="relative border-2 border-red-500 text-red-500 px-5 py-2 rounded-full hover:bg-red-50 transition-all font-medium flex items-center space-x-2"
            >
              <ShoppingCart size={18} />
              <span>Carrito</span>
              {count > 0 && (
                <span
                  data-testid="cart-count-badge"
                  className="absolute -top-1 -right-1 min-w-[20px] h-5 px-1 rounded-full bg-red-500 text-white text-[11px] font-bold flex items-center justify-center"
                >
                  {count}
                </span>
              )}
            </Link>
            <a
              href="https://wa.me/5491151529070"
              target="_blank"
              rel="noopener noreferrer"
              className="bg-gradient-to-r from-red-400 to-red-500 text-white px-6 py-2 rounded-full hover:from-red-500 hover:to-red-600 transition-all font-medium flex items-center space-x-2 shadow-lg"
            >
              <MessageCircle size={18} />
              <span>WhatsApp</span>
            </a>
          </nav>

          <button
            onClick={() => setOpen((v) => !v)}
            className="md:hidden text-gray-700 hover:text-red-500"
            data-testid="mobile-menu-toggle"
            aria-label="Menú"
          >
            {open ? <X size={28} /> : <Menu size={28} />}
          </button>
        </div>

        {open && (
          <nav className="md:hidden mt-4 pb-4 flex flex-col space-y-4">
            <a href="/" className="text-gray-700 font-medium inline-flex items-center gap-1.5"><ArrowLeft size={16}/> Volver al sitio</a>
            <Link
              to="/tienda/carrito"
              onClick={() => setOpen(false)}
              className="border-2 border-red-500 text-red-500 px-6 py-2 rounded-full font-medium flex items-center justify-center space-x-2"
            >
              <ShoppingCart size={18} />
              <span>Carrito {count > 0 && `(${count})`}</span>
            </Link>
            <a
              href="https://wa.me/5491151529070"
              target="_blank"
              rel="noopener noreferrer"
              className="bg-gradient-to-r from-red-400 to-red-500 text-white px-6 py-2 rounded-full font-medium flex items-center justify-center space-x-2 shadow-lg"
            >
              <MessageCircle size={18} />
              <span>WhatsApp</span>
            </a>
          </nav>
        )}
      </div>
    </header>
  );
}
