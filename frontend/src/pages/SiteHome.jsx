import { useEffect } from "react";

export default function SiteHome() {
  useEffect(() => {
    window.location.replace("/preview-site/");
  }, []);
  return (
    <div style={{ minHeight: "100vh", display: "flex", alignItems: "center", justifyContent: "center", fontFamily: "system-ui" }}>
      Cargando sitio pixel-perfect...
    </div>
  );
}
