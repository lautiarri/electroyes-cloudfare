import Header from "./Header";
import Footer from "./Footer";

export default function Layout({ children }) {
  return (
    <div className="min-h-screen flex flex-col bg-[hsl(var(--background))]">
      <Header />
      <main className="flex-1 pt-20">{children}</main>
      <Footer />
      <a href="https://wa.me/5491151529070" target="_blank" rel="noopener noreferrer" aria-label="WhatsApp" className="fixed bottom-6 right-6 w-14 h-14 rounded-full flex items-center justify-center shadow-2xl z-40 text-white" style={{background:"linear-gradient(135deg,#FF7B6E,#ee4d3e)"}}>
        <svg xmlns="http://www.w3.org/2000/svg" width="28" height="28" fill="currentColor" viewBox="0 0 24 24"><path d="M20.52 3.48A11.9 11.9 0 0 0 12 0C5.37 0 0 5.37 0 12a11.9 11.9 0 0 0 1.64 6.06L0 24l6.09-1.6A11.9 11.9 0 0 0 12 24c6.63 0 12-5.37 12-12 0-3.2-1.25-6.21-3.48-8.52ZM12 21.82a9.83 9.83 0 0 1-5-1.36l-.36-.21-3.62.95.97-3.53-.24-.37A9.82 9.82 0 1 1 21.82 12 9.85 9.85 0 0 1 12 21.82Zm5.4-7.36c-.3-.15-1.75-.86-2.02-.96-.27-.1-.47-.15-.67.15-.2.3-.77.96-.94 1.16-.17.2-.35.22-.65.07-.3-.15-1.24-.46-2.36-1.46-.87-.78-1.46-1.73-1.63-2.02-.17-.3-.02-.46.13-.6.13-.14.3-.35.44-.52.14-.17.19-.3.29-.5.1-.2.05-.37-.02-.52-.07-.15-.67-1.6-.92-2.2-.24-.58-.49-.5-.67-.51-.17 0-.37-.02-.57-.02s-.52.07-.79.37c-.27.3-1.04 1.02-1.04 2.47 0 1.46 1.07 2.87 1.22 3.07.15.2 2.1 3.2 5.08 4.49.71.31 1.26.5 1.69.63.71.23 1.36.2 1.87.12.57-.08 1.75-.71 2-1.4.25-.7.25-1.29.17-1.4-.07-.13-.27-.2-.57-.35Z"/></svg>
      </a>
    </div>
  );
}
