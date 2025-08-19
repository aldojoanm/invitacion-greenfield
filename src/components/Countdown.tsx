import { useEffect, useMemo, useRef, useState } from "react";
import "./Countdown.css";

type CountdownProps = {
  /** Ej.: "2025-10-02T08:00:00" (hora local) */
  targetDate?: string;
};

export default function Countdown({
  targetDate = "2025-10-02T08:00:00",
}: CountdownProps) {
  const sectionRef = useRef<HTMLElement | null>(null);

  // ====== lógica del contador ======
  const startDate = useMemo(() => new Date(targetDate), [targetDate]);

  const calc = () => {
    const d = +startDate - Date.now();
    if (d <= 0) return null;
    return {
      days: Math.floor(d / 86400000),
      hours: Math.floor((d % 86400000) / 3600000),
      minutes: Math.floor((d % 3600000) / 60000),
      seconds: Math.floor((d % 60000) / 1000),
    };
  };

  const [left, setLeft] = useState(calc());
  useEffect(() => {
    const id = setInterval(() => setLeft(calc()), 1000);
    return () => clearInterval(id);
  }, [targetDate]);

  /** Auto-fit en móvil */
  const outerRef = useRef<HTMLDivElement | null>(null);
  const innerRef = useRef<HTMLDivElement | null>(null);
  const [scale, setScale] = useState(1);

  useEffect(() => {
    const fit = () => {
      const outer = outerRef.current;
      const inner = innerRef.current;
      if (!outer || !inner) return;
      const available = outer.clientWidth;
      const needed = inner.scrollWidth;
      const s = Math.min(1, (available - 2) / Math.max(needed, 1));
      setScale(Number.isFinite(s) ? s : 1);
    };
    fit();

    const RO: typeof ResizeObserver | undefined = (window as any).ResizeObserver;
    const ro = RO ? new RO(fit) : null;
    if (ro && outerRef.current) ro.observe(outerRef.current);
    if (ro && innerRef.current) ro.observe(innerRef.current);
    window.addEventListener("resize", fit);
    return () => {
      ro?.disconnect?.();
      window.removeEventListener("resize", fit);
    };
  }, []);

  // ====== Google Calendar (forzado a 02/oct/2025 08:00) ======
  const handleAddToCalendar = () => {
    // Mes en JS es base 0 → 9 = Octubre
    const start = new Date(2025, 9, 2, 8, 0, 0);
    const end = new Date(start.getTime() + 4 * 60 * 60 * 1000);

    const z = (t: Date) =>
      new Date(t.getTime() - t.getTimezoneOffset() * 60000)
        .toISOString()
        .replace(/[-:]/g, "")
        .replace(/\.\d{3}Z$/, "Z");

    const url =
      `https://calendar.google.com/calendar/render?action=TEMPLATE` +
      `&text=${encodeURIComponent("Experience AgroPartners")}` +
      `&dates=${z(start)}/${z(end)}` +
      `&details=${encodeURIComponent("Jornada técnica de Experience AgroPartners.")}` +
      `&location=${encodeURIComponent("San Pedro, Km 27 — La Planchada")}`;

    window.open(url, "_blank");
  };

  // ====== Animaciones de entrada por scroll ======
  useEffect(() => {
    const root = sectionRef.current;
    if (!root) return;

    // reveal on view (una vez)
    const revealEls = Array.from(
      root.querySelectorAll<HTMLElement>("[data-anim]")
    );
    const io = new IntersectionObserver(
      (entries) => {
        entries.forEach((en) => {
          const el = en.target as HTMLElement;
          if (en.isIntersecting) {
            el.classList.add("in");
            io.unobserve(el); // dispara una sola vez
          }
        });
      },
      { threshold: 0.2, rootMargin: "0px 0px -10% 0px" }
    );
    revealEls.forEach((el) => io.observe(el));

    // parallax suave mientras se hace scroll
    const parEls = Array.from(
      root.querySelectorAll<HTMLElement>("[data-parallax]")
    );
    const onScroll = () => {
      const r = root.getBoundingClientRect();
      const vh = window.innerHeight || document.documentElement.clientHeight;
      // progreso de 0 (arriba fuera) a 1 (abajo fuera)
      const p = Math.min(1, Math.max(0, (vh - r.top) / (vh + r.height)));
      parEls.forEach((el) => {
        const k = parseFloat(el.dataset.parallax || "0"); // fuerza
        const y = (p - 0.5) * k; // px
        el.style.setProperty("--parY", `${y}px`);
      });
    };
    onScroll();
    window.addEventListener("scroll", onScroll, { passive: true });
    window.addEventListener("resize", onScroll);
    return () => {
      io.disconnect();
      window.removeEventListener("scroll", onScroll);
      window.removeEventListener("resize", onScroll);
    };
  }, []);

  return (
    <section className="xp-count-section" ref={sectionRef}>
      <div className="xp-count-wrap" data-anim="fade-up">
        <img
          className="xp-logo"
          src="/logos/experience-agropartners.png"
          alt="Agropartners"
          data-anim="scale-fade"
          data-parallax="26"
          style={{ ["--d" as any]: "0ms" }}
        />

        <div className="xp-count-outer" ref={outerRef}>
          <div
            className="xp-count-scaler"
            style={{ transform: `scale(${scale})` }}
          >
            <div className="xp-countdown" ref={innerRef}>
              {left ? (
                <>
                  <div className="unit" data-anim="fade-up" style={{ ["--d" as any]: "60ms" }}>
                    <div className="num">{left.days}</div>
                    <div className="lbl">DÍAS</div>
                  </div>
                  <div className="unit" data-anim="fade-up" style={{ ["--d" as any]: "120ms" }}>
                    <div className="num">{left.hours}</div>
                    <div className="lbl">HRS</div>
                  </div>
                  <div className="unit" data-anim="fade-up" style={{ ["--d" as any]: "180ms" }}>
                    <div className="num">{left.minutes}</div>
                    <div className="lbl">MIN</div>
                  </div>
                  <div className="unit" data-anim="fade-up" style={{ ["--d" as any]: "240ms" }}>
                    <div className="num">{left.seconds}</div>
                    <div className="lbl">SEG</div>
                  </div>
                </>
              ) : (
                <div className="xp-live" data-anim="pop">
                  ¡El evento ha comenzado!
                </div>
              )}
            </div>
          </div>
        </div>

        <div
          className="xp-meta"
          data-anim="fade-up"
          data-parallax="-10"
          style={{ ["--d" as any]: "160ms" }}
        >
          <span className="pill pill--date">02 - 03 Octubre</span>
          <span className="dot" />
          <span className="pill">08:00 Hrs</span>
        </div>

          {/* CTA calendario + ubicación */}
          <div className="xp-cta-col">
            <button
              className="xp-cta"
              onClick={handleAddToCalendar}
              data-anim="pop"
              data-parallax="-6"
              style={{ ["--d" as any]: "220ms" }}
              aria-label="Agregar Experience AgroPartners al calendario (02/oct/2025 08:00)"
            >
              Agendar el evento
            </button>

            <a
              className="xp-cta-map"
              href="https://goo.gl/maps/vbqjabdURShWJ5u87?g_st=ac"
              target="_blank"
              rel="noopener noreferrer"
              data-anim="pop"
              data-parallax="-6"
              style={{ ["--d" as any]: "260ms" }}
              aria-label="Abrir ubicación en Google Maps"
            >
              <img src="/logos/icono-ubicacion.png" alt="Ubicación" />
            </a>
          </div>
      </div>
    </section>
  );
}
