import { Link } from "react-router-dom";
import { MessageCircle, Wrench, Tv, Microwave, Coffee, Refrigerator, Flame, Wind, Shield, Zap, Award, Sparkles, MapPin, Phone, Mail, Clock, ShoppingBag, Menu, X } from "lucide-react";
import { useState } from "react";

const WA = "https://wa.me/5491151529070";

const services = [
  { icon: Wrench, title: "Lavarropas", desc: "Reparación y mantenimiento de lavarropas de todas las marcas" },
  { icon: Tv, title: "TV", desc: "Servicio técnico especializado en televisores LCD, LED y Smart TV" },
  { icon: Microwave, title: "Microondas", desc: "Reparación de microondas con repuestos originales" },
  { icon: Coffee, title: "Pequeños Electrodomésticos", desc: "Reparación de planchas, cafeteras, licuadoras y más" },
  { icon: Refrigerator, title: "Heladeras", desc: "Service completo de heladeras y freezers, recarga de gas" },
  { icon: Flame, title: "Hornos Eléctricos", desc: "Reparación de hornos eléctricos y anafes" },
  { icon: Wind, title: "Aires Acondicionados", desc: "Instalación, reparación y mantenimiento de equipos de aire" },
];

const acFeatures = ["Instalación de equipos Split", "Tendido de cañerías y cableado", "Carga de gas refrigerante", "Prueba de funcionamiento", "Garantía por escrito", "Personal matriculado", "Materiales de primera calidad"];
const acBadges = [
  { icon: Shield, title: "Garantía", desc: "Trabajo garantizado por escrito" },
  { icon: Zap, title: "Rápido", desc: "Instalación en el día" },
  { icon: Award, title: "Certificado", desc: "Personal matriculado" },
  { icon: Sparkles, title: "Calidad", desc: "Materiales premium" },
];

const zones = ["Capital Federal", "Zona Norte GBA", "Zona Oeste GBA", "Zona Sur GBA", "Vicente López", "San Isidro", "San Martín", "Tres de Febrero", "La Matanza", "Lomas de Zamora", "Avellaneda", "Quilmes"];

function EYLogo({ size = 44 }) {
  return (
    <span style={{
      width: size, height: size,
      background: "linear-gradient(135deg,#FF7B6E 0%,#ee4d3e 100%)",
      clipPath: "polygon(25% 0%, 75% 0%, 100% 50%, 75% 100%, 25% 100%, 0% 50%)",
      display: "inline-flex", alignItems: "center", justifyContent: "center",
      color: "#fff", fontWeight: 800, fontSize: size * 0.4,
    }}>EY</span>
  );
}

export default function SiteHome() {
  const [open, setOpen] = useState(false);
  return (
    <div className="bg-white text-neutral-900" style={{ fontFamily: "Manrope, system-ui, sans-serif" }}>
      {/* HEADER */}
      <header className="sticky top-0 z-50 bg-white/95 backdrop-blur-md border-b border-neutral-100">
        <div className="max-w-7xl mx-auto px-5 lg:px-8 h-16 flex items-center justify-between">
          <a href="#inicio" className="flex items-center gap-3">
            <EYLogo />
            <span className="text-xl font-extrabold"><span style={{color:"#ee4d3e"}}>Electro</span> Yes</span>
          </a>
          <nav className="hidden lg:flex items-center gap-7">
            {[["Inicio","#inicio"],["Servicios","#servicios"],["Instalaciones de Aire","#instalaciones"],["Zonas","#zonas"],["Contacto","#contacto"]].map(([l,h])=>(
              <a key={l} href={h} className="text-sm font-medium text-neutral-700 hover:text-[#ee4d3e] transition-colors">{l}</a>
            ))}
            <Link to="/tienda" data-testid="header-tienda-btn" className="inline-flex items-center gap-2 px-4 py-2 rounded-full border-2 border-[#ee4d3e] text-[#ee4d3e] text-sm font-bold hover:bg-[#ffefec] transition-all">
              <ShoppingBag className="w-4 h-4" /> Tienda
            </Link>
            <a href={WA} className="inline-flex items-center gap-2 px-5 py-2.5 rounded-full text-sm font-bold text-white shadow-lg" style={{background:"linear-gradient(135deg,#FF7B6E,#ee4d3e)",boxShadow:"0 8px 20px -6px rgba(238,77,62,.5)"}}>
              <MessageCircle className="w-4 h-4" /> WhatsApp
            </a>
          </nav>
          <button className="lg:hidden p-2" onClick={()=>setOpen(v=>!v)} aria-label="menu">{open?<X/>:<Menu/>}</button>
        </div>
        {open && (
          <div className="lg:hidden border-t bg-white px-5 py-4 flex flex-col gap-3">
            {[["Inicio","#inicio"],["Servicios","#servicios"],["Instalaciones de Aire","#instalaciones"],["Zonas","#zonas"],["Contacto","#contacto"]].map(([l,h])=>(
              <a key={l} href={h} onClick={()=>setOpen(false)} className="text-sm font-medium text-neutral-700">{l}</a>
            ))}
            <Link to="/tienda" onClick={()=>setOpen(false)} className="inline-flex items-center gap-2 text-sm font-bold text-[#ee4d3e]"><ShoppingBag className="w-4 h-4"/>Tienda Online</Link>
            <a href={WA} className="inline-flex items-center gap-2 text-sm font-bold text-white px-4 py-2 rounded-full self-start" style={{background:"linear-gradient(135deg,#FF7B6E,#ee4d3e)"}}><MessageCircle className="w-4 h-4"/>WhatsApp</a>
          </div>
        )}
      </header>

      {/* HERO */}
      <section id="inicio" className="relative overflow-hidden" style={{background:"linear-gradient(135deg,#fdf6f5 0%,#fff 100%)"}}>
        <div className="max-w-7xl mx-auto px-5 lg:px-8 py-16 lg:py-24 grid lg:grid-cols-2 gap-10 items-center">
          <div>
            <h1 className="text-5xl lg:text-6xl font-extrabold tracking-tight leading-[1.05]">
              Servicio Técnico<br/>de <span style={{color:"#ee4d3e"}}>Confianza</span>
            </h1>
            <p className="mt-6 text-base lg:text-lg text-neutral-600 max-w-lg leading-relaxed">
              Reparación profesional de lavarropas, TV, microondas, heladeras, hornos eléctricos y pequeños electrodomésticos. También realizamos instalaciones de aire acondicionado con garantía y calidad certificada.
            </p>
            <a href={WA} className="mt-8 inline-flex items-center gap-2 px-7 py-3.5 rounded-full font-bold text-white text-base" style={{background:"linear-gradient(135deg,#FF7B6E,#ee4d3e)",boxShadow:"0 12px 28px -8px rgba(238,77,62,.55)"}}>
              <MessageCircle className="w-5 h-5" /> Solicitar Turno por WhatsApp
            </a>
          </div>
          <div className="flex justify-center">
            <div style={{width:340,height:380,background:"linear-gradient(135deg,#ffb3a8 0%,#f5675a 100%)",clipPath:"polygon(25% 0%,75% 0%,100% 50%,75% 100%,25% 100%,0% 50%)",display:"flex",alignItems:"center",justifyContent:"center"}}>
              <Wrench className="w-32 h-32 text-white/40" strokeWidth={1.5}/>
            </div>
          </div>
        </div>
      </section>

      {/* SERVICIOS */}
      <section id="servicios" className="py-20 bg-white">
        <div className="max-w-7xl mx-auto px-5 lg:px-8">
          <div className="text-center mb-14">
            <h2 className="text-4xl lg:text-5xl font-extrabold">Nuestros Servicios</h2>
            <p className="mt-3 text-neutral-500 text-lg">Soluciones profesionales para todos tus electrodomésticos</p>
          </div>
          <div className="grid md:grid-cols-2 lg:grid-cols-3 gap-6">
            {services.map(({icon:Icon,title,desc})=>(
              <div key={title} className="rounded-2xl p-7 border border-neutral-100 hover:shadow-xl hover:-translate-y-1 transition-all" style={{background:"linear-gradient(135deg,#fff,#fdf6f5)"}}>
                <div className="w-14 h-14 rounded-xl flex items-center justify-center mb-4" style={{background:"linear-gradient(135deg,#FF7B6E,#ee4d3e)"}}>
                  <Icon className="w-7 h-7 text-white" />
                </div>
                <h3 className="text-xl font-extrabold mb-2">{title}</h3>
                <p className="text-neutral-500 text-sm leading-relaxed">{desc}</p>
              </div>
            ))}
          </div>
        </div>
      </section>

      {/* INSTALACIONES AIRE */}
      <section id="instalaciones" className="py-20" style={{background:"linear-gradient(135deg,#fdf6f5,#fff)"}}>
        <div className="max-w-7xl mx-auto px-5 lg:px-8">
          <div className="text-center mb-14">
            <h2 className="text-4xl lg:text-5xl font-extrabold">Instalaciones de <span style={{color:"#ee4d3e"}}>Aire Acondicionado</span></h2>
            <p className="mt-3 text-neutral-600 text-lg max-w-2xl mx-auto">Instalamos tu equipo de aire acondicionado de forma profesional y segura. Trabajamos con todas las marcas y modelos, garantizando un funcionamiento óptimo.</p>
          </div>
          <div className="grid lg:grid-cols-2 gap-10 items-start">
            <div className="bg-white rounded-3xl p-8 shadow-sm border border-neutral-100">
              <h3 className="text-2xl font-extrabold mb-6">¿Qué incluye la instalación?</h3>
              <ul className="space-y-3">
                {acFeatures.map(f=>(
                  <li key={f} className="flex items-start gap-3">
                    <span className="mt-1 w-5 h-5 rounded-full flex items-center justify-center shrink-0" style={{background:"#ee4d3e"}}><svg className="w-3 h-3 text-white" viewBox="0 0 20 20" fill="currentColor"><path fillRule="evenodd" d="M16.7 5.3a1 1 0 010 1.4l-8 8a1 1 0 01-1.4 0l-4-4a1 1 0 111.4-1.4L8 12.6l7.3-7.3a1 1 0 011.4 0z"/></svg></span>
                    <span className="text-neutral-700">{f}</span>
                  </li>
                ))}
              </ul>
            </div>
            <div className="grid grid-cols-2 gap-4">
              {acBadges.map(({icon:Icon,title,desc})=>(
                <div key={title} className="bg-white rounded-2xl p-6 border border-neutral-100 text-center hover:shadow-lg transition-all">
                  <div className="w-12 h-12 rounded-xl mx-auto mb-3 flex items-center justify-center" style={{background:"linear-gradient(135deg,#FF7B6E,#ee4d3e)"}}><Icon className="w-6 h-6 text-white"/></div>
                  <h4 className="font-extrabold mb-1">{title}</h4>
                  <p className="text-sm text-neutral-500">{desc}</p>
                </div>
              ))}
            </div>
          </div>
        </div>
      </section>

      {/* ZONAS */}
      <section id="zonas" className="py-20 bg-white">
        <div className="max-w-7xl mx-auto px-5 lg:px-8">
          <div className="text-center mb-14">
            <h2 className="text-4xl lg:text-5xl font-extrabold">Zonas de <span style={{color:"#ee4d3e"}}>Cobertura</span></h2>
            <p className="mt-3 text-neutral-500 text-lg">Llegamos a tu hogar en toda el área metropolitana</p>
            <p className="mt-4 text-neutral-600 max-w-2xl mx-auto">Brindamos servicio técnico a domicilio en Capital Federal y Gran Buenos Aires. Nuestros técnicos están listos para atenderte en las siguientes zonas:</p>
          </div>
          <div className="grid grid-cols-2 md:grid-cols-3 lg:grid-cols-4 gap-4 max-w-5xl mx-auto">
            {zones.map(z=>(
              <div key={z} className="flex items-center gap-3 rounded-xl px-4 py-3 border border-neutral-100 bg-gradient-to-br from-white to-[#fdf6f5]">
                <MapPin className="w-5 h-5 text-[#ee4d3e] shrink-0"/>
                <span className="font-semibold text-sm">{z}</span>
              </div>
            ))}
          </div>
          <p className="text-center mt-10 text-neutral-500">¿No encontrás tu zona? <a href={WA} className="text-[#ee4d3e] font-bold underline-offset-2 hover:underline">Consultanos</a> y coordinamos tu servicio.</p>
        </div>
      </section>

      {/* CONTACTO */}
      <section id="contacto" className="py-20" style={{background:"linear-gradient(135deg,#fdf6f5,#fff)"}}>
        <div className="max-w-7xl mx-auto px-5 lg:px-8">
          <div className="text-center mb-14">
            <h2 className="text-4xl lg:text-5xl font-extrabold">Contacto</h2>
            <p className="mt-3 text-neutral-500 text-lg">Estamos listos para ayudarte. Comunicate con nosotros.</p>
          </div>
          <div className="grid lg:grid-cols-2 gap-10">
            <div className="space-y-4">
              <h3 className="text-2xl font-extrabold mb-4">Información de Contacto</h3>
              <a href={WA} className="flex items-start gap-4 p-5 rounded-2xl text-white" style={{background:"linear-gradient(135deg,#FF7B6E,#ee4d3e)"}}>
                <MessageCircle className="w-6 h-6 mt-1"/>
                <div><div className="font-extrabold">WhatsApp</div><div className="text-sm">+54 9 11 5152-9070</div><div className="text-xs opacity-90">Click para chatear</div></div>
              </a>
              {[
                {icon:Phone,title:"Teléfono",lines:["+54 9 11 5152-9070"]},
                {icon:Mail,title:"Email",lines:["info@electroyes.com.ar"]},
                {icon:MapPin,title:"Dirección",lines:["California 2082","CP: 1289, CABA","Deposito D124"]},
                {icon:Clock,title:"Horarios",lines:["Lunes a viernes de 09:00 a 18:00hs"]},
              ].map(({icon:Icon,title,lines})=>(
                <div key={title} className="flex items-start gap-4 p-5 bg-white rounded-2xl border border-neutral-100">
                  <div className="w-11 h-11 rounded-xl flex items-center justify-center shrink-0" style={{background:"#ffefec"}}><Icon className="w-5 h-5 text-[#ee4d3e]"/></div>
                  <div><div className="font-extrabold">{title}</div>{lines.map(l=><div key={l} className="text-sm text-neutral-600">{l}</div>)}</div>
                </div>
              ))}
            </div>
            <div className="bg-white rounded-3xl p-8 border border-neutral-100 shadow-sm">
              <h3 className="text-2xl font-extrabold mb-6">Formulario de Consulta</h3>
              <form onSubmit={(e)=>{e.preventDefault();window.location.href=WA;}} className="space-y-4">
                <div><label className="block text-sm font-semibold mb-1.5">Nombre completo</label><input required className="w-full px-4 py-3 rounded-xl border border-neutral-200 focus:outline-none focus:border-[#ee4d3e]"/></div>
                <div><label className="block text-sm font-semibold mb-1.5">Mensaje</label><textarea required rows={5} className="w-full px-4 py-3 rounded-xl border border-neutral-200 focus:outline-none focus:border-[#ee4d3e]"/></div>
                <button type="submit" className="w-full py-3.5 rounded-full font-bold text-white" style={{background:"linear-gradient(135deg,#FF7B6E,#ee4d3e)",boxShadow:"0 10px 24px -8px rgba(238,77,62,.5)"}}>Enviar Consulta</button>
                <a href={WA} className="block text-center text-sm text-[#ee4d3e] font-semibold mt-2">Contactar por WhatsApp</a>
              </form>
            </div>
          </div>
        </div>
      </section>

      {/* FOOTER */}
      <footer className="bg-[#111214] text-neutral-300 py-10">
        <div className="max-w-7xl mx-auto px-5 lg:px-8 flex flex-col md:flex-row justify-between items-center gap-4">
          <div className="flex items-center gap-3">
            <EYLogo size={36}/>
            <span className="text-lg font-extrabold text-white"><span style={{color:"#ee4d3e"}}>Electro</span> Yes</span>
          </div>
          <div className="text-sm text-neutral-500">© {new Date().getFullYear()} Electro Yes · Servicio Técnico</div>
          <div className="flex gap-4 text-sm">
            <a href={WA} className="hover:text-[#ee4d3e]">WhatsApp</a>
            <Link to="/tienda" className="hover:text-[#ee4d3e]">Tienda</Link>
          </div>
        </div>
      </footer>

      {/* WA floating */}
      <a href={WA} aria-label="WhatsApp" className="fixed bottom-6 right-6 w-14 h-14 rounded-full flex items-center justify-center shadow-2xl z-40" style={{background:"linear-gradient(135deg,#FF7B6E,#ee4d3e)"}}>
        <MessageCircle className="w-7 h-7 text-white"/>
      </a>
    </div>
  );
}
