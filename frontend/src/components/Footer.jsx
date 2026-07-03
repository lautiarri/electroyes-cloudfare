import { Phone, Mail, MapPin } from "lucide-react";

export default function Footer() {
  const currentYear = new Date().getFullYear();
  return (
    <footer className="bg-gray-900 text-white py-12">
      <div className="max-w-6xl mx-auto px-4">
        <div className="grid grid-cols-1 md:grid-cols-3 gap-8 mb-8">
          <div>
            <div className="flex items-center space-x-3 mb-4">
              <img src="/electroyes-logo.png" alt="Electro Yes" className="h-12 w-12" />
              <span className="text-2xl font-bold">Electro Yes</span>
            </div>
            <p className="text-gray-400">
              Servicio técnico de confianza para todos tus electrodomésticos.
            </p>
          </div>

          <div>
            <h3 className="text-xl font-bold mb-4">Contacto</h3>
            <div className="space-y-3">
              <div className="flex items-center space-x-3">
                <Phone size={18} className="text-red-400" />
                <span className="text-gray-400">+54 9 11 5152-9070</span>
              </div>
              <div className="flex items-center space-x-3">
                <Mail size={18} className="text-red-400" />
                <span className="text-gray-400">info@electroyes.com.ar</span>
              </div>
              <div className="flex items-center space-x-3">
                <MapPin size={18} className="text-red-400" />
                <span className="text-gray-400">Capital Federal y GBA</span>
              </div>
            </div>
          </div>

          <div>
            <h3 className="text-xl font-bold mb-4">Horarios</h3>
            <div className="space-y-2 text-gray-400">
              <p>Lunes a viernes de 09:00 a 18:00hs</p>
            </div>
          </div>
        </div>

        <div className="border-t border-gray-800 pt-8 text-center text-gray-400">
          <p>&copy; {currentYear} Electro Yes. Todos los derechos reservados.</p>
        </div>
      </div>
    </footer>
  );
}
