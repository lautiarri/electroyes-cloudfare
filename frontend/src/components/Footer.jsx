import { MessageCircle, Phone, Mail, MapPin } from "lucide-react";

export default function Footer() {
  return (
    <footer className="mt-24 bg-[#111214] text-neutral-300">
      <div className="max-w-7xl mx-auto px-5 lg:px-8 py-14 grid gap-10 md:grid-cols-4">
        <div>
          <div className="flex items-center gap-3 mb-4">
            <span className="hex-badge">EY</span>
            <span className="text-xl font-extrabold">
              <span style={{ color: "#F5675A" }}>Electro</span>
              <span className="text-white"> Yes</span>
            </span>
          </div>
          <p className="text-sm text-neutral-400 leading-relaxed">
            Servicio técnico de confianza y tienda online de electrodomésticos.
          </p>
        </div>

        <div>
          <h4 className="text-white text-sm font-semibold mb-4 uppercase tracking-wider">Tienda</h4>
          <ul className="space-y-2 text-sm">
            <li><a href="/tienda" className="hover:text-[#F5675A] transition-colors">Catálogo</a></li>
            <li><a href="/tienda/carrito" className="hover:text-[#F5675A] transition-colors">Carrito</a></li>
          </ul>
        </div>

        <div>
          <h4 className="text-white text-sm font-semibold mb-4 uppercase tracking-wider">Servicios</h4>
          <ul className="space-y-2 text-sm">
            <li><a href="https://electroyes.com.ar" className="hover:text-[#F5675A] transition-colors">Reparaciones</a></li>
            <li><a href="https://electroyes.com.ar" className="hover:text-[#F5675A] transition-colors">Instalaciones AC</a></li>
          </ul>
        </div>

        <div>
          <h4 className="text-white text-sm font-semibold mb-4 uppercase tracking-wider">Contacto</h4>
          <ul className="space-y-3 text-sm">
            <li className="flex items-start gap-2">
              <MessageCircle className="w-4 h-4 mt-0.5 shrink-0" />
              <a href="https://wa.me/5491151529070" className="hover:text-[#F5675A]">WhatsApp +54 9 11 5152-9070</a>
            </li>
            <li className="flex items-start gap-2"><Phone className="w-4 h-4 mt-0.5 shrink-0" /> +54 9 11 5152-9070</li>
            <li className="flex items-start gap-2"><Mail className="w-4 h-4 mt-0.5 shrink-0" /> info@electroyes.com.ar</li>
            <li className="flex items-start gap-2"><MapPin className="w-4 h-4 mt-0.5 shrink-0" /> California 2082, CABA</li>
          </ul>
        </div>
      </div>

      <div className="border-t border-white/5 py-5 text-center text-xs text-neutral-500">
        © {new Date().getFullYear()} Electro Yes · Todos los derechos reservados
      </div>
    </footer>
  );
}
