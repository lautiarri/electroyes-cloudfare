import Header from "./Header";
import Footer from "./Footer";
import { MessageCircle } from "lucide-react";

export default function Layout({ children }) {
  return (
    <div className="min-h-screen flex flex-col bg-[hsl(var(--background))]">
      <Header />
      <main className="flex-1 pt-20">{children}</main>
      <Footer />
      <a
        href="https://wa.me/5491151529070"
        target="_blank"
        rel="noopener noreferrer"
        className="fixed bottom-6 right-6 bg-gradient-to-br from-red-400 to-red-500 text-white w-16 h-16 rounded-full shadow-2xl hover:from-red-500 hover:to-red-600 transition-all flex items-center justify-center z-50 hover:scale-110 animate-bounce"
        aria-label="Contactar por WhatsApp"
      >
        <MessageCircle size={32} />
      </a>
    </div>
  );
}
