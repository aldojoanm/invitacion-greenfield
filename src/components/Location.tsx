import React, { useEffect, useRef } from "react";
import "./Location.css";

const ReceptionLocation: React.FC = () => {
  const sectionRef = useRef<HTMLElement | null>(null);

  useEffect(() => {
    const host = sectionRef.current;
    if (!host) return;

    // ==== IntersectionObserver: reveals ====
    const toReveal = host.querySelectorAll<HTMLElement>(".reveal");
    const io = new IntersectionObserver(
      (entries) => entries.forEach(e => { if (e.isIntersecting) (e.target as HTMLElement).classList.add("in"); }),
      { threshold: 0.15 }
    );
    toReveal.forEach(el => io.observe(el));

    // ==== Parallax: video, tint y elementos con data-parallax ====
    const parallaxEls = host.querySelectorAll<HTMLElement>("[data-parallax]");
    const videoEl = host.querySelector<HTMLElement>(".bg-video");
    const tintEl  = host.querySelector<HTMLElement>(".bg-tint");

    let raf = 0;
    const onScroll = () => {
      if (raf) return;
      raf = requestAnimationFrame(() => {
        raf = 0;
        const rect = host.getBoundingClientRect();
        const top = rect.top; // negativo al hacer scroll
        parallaxEls.forEach((el) => {
          const sp = parseFloat(el.dataset.parallax || "0");
          el.style.transform = `translate3d(0, ${top * sp}px, 0)`;
        });
        if (videoEl) videoEl.style.transform = `translate3d(0, ${top * 0.06}px, 0) scale(1.02)`;
        if (tintEl)  tintEl.style.opacity   = String(Math.min(0.95, 0.80 + Math.abs(top)/2000));
      });
    };
    onScroll();
    window.addEventListener("scroll", onScroll, { passive: true });
    window.addEventListener("resize", onScroll);

    return () => {
      io.disconnect();
      window.removeEventListener("scroll", onScroll);
      window.removeEventListener("resize", onScroll);
      if (raf) cancelAnimationFrame(raf);
    };
  }, []);

  return (
    <section ref={sectionRef} className="invite-section invite--video">
      {/* VIDEO DE FONDO */}
      <div className="bg-wrap" aria-hidden>
        <video
          className="bg-video"
          src="/bg2.mp4"
          autoPlay muted loop playsInline preload="auto"
          poster="/media/bg2.png"
        />
        <div className="bg-tint" />
        <div className="bg-vignette" />
      </div>

      {/* CONTENIDO */}
      <div className="invite-wrap" data-parallax="0.04">
        {/* Sello de fecha (elegante) */}
        <div className="date-seal reveal scale d0" data-parallax="0.08" aria-label="Fecha">
          <span className="dow">VIE</span>
          <span className="day">24</span>
          <span className="mon">OCT</span>
        </div>

        <h2 className="invite-title reveal up d1" data-parallax="0.10">
          Fisiología de Plantas
        </h2>

        <p className="invite-lead reveal up d2" data-parallax="0.12">
          Prof. Geraldo Chavarría · Brasil
        </p>

        {/* Línea tipográfica con hora y lugar */}
        <p className="info-line reveal fade d3" data-parallax="0.14">
          <span className="line" aria-hidden />
          <span className="info">19:00 · Hotel Los Tajibos — Santa Cruz de la Sierra</span>
          <span className="line" aria-hidden />
        </p>

        {/* Copy corto e invitante */}
        <p className="invite-text reveal up d4" data-parallax="0.16">
          Te esperamos: ciencia aplicada que rinde en campo.
        </p>
      </div>
    </section>
  );
};

export default ReceptionLocation;
