import React, { useEffect, useState } from "react";
import "./Location.css";

const ReceptionLocation: React.FC = () => {
  // ===== Animaciones on-scroll existentes =====
  useEffect(() => {
    const scope = document.querySelector(".agenda-section");
    if (!scope) return;

    const targets = scope.querySelectorAll<HTMLElement>("[data-anim]");
    const io = new IntersectionObserver(
      (entries) => {
        entries.forEach((e) => {
          if (e.isIntersecting) e.target.classList.add("in");
          else e.target.classList.remove("in");
        });
      },
      { threshold: 0.2, rootMargin: "0px 0px -10% 0px" }
    );

    targets.forEach((el) => io.observe(el));
    return () => io.disconnect();
  }, []);

  // helper para delay por elemento
  const d = (ms: number) => ({ ["--d" as any]: `${ms}ms` });

  // ===== Flecha de "scroll" SOLO móvil =====
  const [showHint, setShowHint] = useState(false);

  // Mostrar solo en móviles (según el mismo breakpoint de tu CSS: 600px)
  useEffect(() => {
    const mq = window.matchMedia("(max-width: 600px)");
    const update = () => setShowHint(mq.matches); // visible al cargar si es móvil
    update();
    const onChange = (e: MediaQueryListEvent) => setShowHint(e.matches);
    mq.addEventListener?.("change", onChange);
    return () => mq.removeEventListener?.("change", onChange);
  }, []);

  // Ocultar al primer scroll/gesto
  useEffect(() => {
    if (!showHint) return;
    const hide = () => setShowHint(false);
    window.addEventListener("scroll", hide, { passive: true, once: true });
    window.addEventListener("touchmove", hide, { passive: true, once: true });
    window.addEventListener("wheel", hide, { passive: true, once: true });
    return () => {
      window.removeEventListener("scroll", hide);
      window.removeEventListener("touchmove", hide);
      window.removeEventListener("wheel", hide);
    };
  }, [showHint]);

  return (
    <section className="agenda-section">
      <div className="agenda-wrap">
        <p className="agenda-intro" data-anim="fade-up" style={d(40)}>
          Te invitamos a ser parte de una nueva
          edición de Experience AgroPartners.
        </p>

        {/* Flecha indicativa SOLO móvil (debajo del texto) */}
        {showHint && (
          <img
            className="scroll-hint"
            src="/logos/flecha.png"
            alt="Desliza hacia abajo"
            aria-hidden="true"
          />
        )}

        <ul className="agenda-list">
          <li data-anim="fade-up" style={d(80)}>
            <span className="agenda-dot" />
            <span className="time">08:00</span>
            <span className="desc">Desayuno</span>
          </li>
          <li data-anim="fade-up" style={d(160)}>
            <span className="agenda-dot" />
            <span className="time">09:00</span>
            <span className="desc">Visita estaciones</span>
          </li>
          <li data-anim="fade-up" style={d(240)}>
            <span className="agenda-dot" />
            <span className="time">12:00</span>
            <span className="desc">Almuerzo</span>
          </li>
          <li data-anim="fade-up" style={d(320)}>
            <span className="agenda-dot" />
            <span className="time">13:30</span>
            <span className="desc">Charla técnica</span>
          </li>
        </ul>

        <h3 className="stations-title" data-anim="fade-up" style={d(80)}>
          Además visite las estaciones de:
        </h3>

        <div className="stations-logos">
          <img data-anim="scale-fade" style={d(0)}   src="/logos/PartnersLab.png"    alt="PartnersLab" />
          <img data-anim="scale-fade" style={d(100)} src="/logos/BuenasPracticas.png" alt="Buenas Prácticas Agrícolas" />
          <img data-anim="scale-fade" style={d(200)} src="/logos/HagamosNegocios.png" alt="Hagamos Negocios" />
          <img data-anim="scale-fade" style={d(300)} src="/logos/Calidad.png"         alt="Control de Calidad" />
        </div>

        <div className="qr-box">
          <a
            href="https://bio.link/agropartners"
            className="qr-btn"
            aria-label="Abrir enlace de AgroPartners"
            target="_blank"
            rel="noopener noreferrer"
            style={{ display: "inline-block", textDecoration: "none", cursor: "pointer" }}
          >
            <img data-anim="pop" style={d(60)} src="/logos/Qr.png" alt="Código QR — abrir enlace" />
          </a>
          <span data-anim="fade-up" style={d(180)}>Conoce más</span>
        </div>
      </div>
    </section>
  );
};

export default ReceptionLocation;
