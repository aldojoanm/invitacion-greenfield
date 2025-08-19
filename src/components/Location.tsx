import React, { useEffect } from "react";
import "./Location.css";

const ReceptionLocation: React.FC = () => {
  // Animaciones on-scroll
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

  return (
    <section className="agenda-section">
      <div className="agenda-wrap">
        <p className="agenda-intro" data-anim="fade-up" style={d(40)}>
          Te invitamos a ser parte de una nueva
          edición de Experience AgroPartners. 02 - 03 de Octubre.
        </p>

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
          {/* Botón que abre el link (no agranda el QR) */}
          <a
            href="https://bio.link/agropartners"
            className="qr-btn"
            aria-label="Abrir enlace de AgroPartners"
            target="_blank"
            rel="noopener noreferrer"
            style={{ display: "inline-block", textDecoration: "none", cursor: "pointer" }}
          >
            {/* mantenemos tu animación en el IMG */}
            <img data-anim="pop" style={d(60)} src="/logos/Qr.png" alt="Código QR — abrir enlace" />
          </a>
          <span data-anim="fade-up" style={d(180)}>Conoce más</span>
        </div>
      </div>
    </section>
  );
};

export default ReceptionLocation;
