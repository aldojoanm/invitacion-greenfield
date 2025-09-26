import { useEffect, useRef } from "react";
import "./Inicio.css";

type Props = { rsvpUrl?: string };

export default function EventInvite({
  rsvpUrl = "https://www.jotform.com/build/240398360211652",
}: Props) {
  const rootRef = useRef<HTMLElement | null>(null);

  useEffect(() => {
    const root = rootRef.current;
    if (!root) return;

    // Reveal
    const revealEls = Array.from(root.querySelectorAll<HTMLElement>("[data-reveal]"));
    const io = new IntersectionObserver(
      (entries) => {
        for (const e of entries) {
          const el = e.target as HTMLElement;
          if (e.isIntersecting) {
            el.classList.add("is-in");
            el.classList.remove("is-out");
          } else {
            el.classList.remove("is-in");
            el.classList.add("is-out");
          }
        }
      },
      { threshold: 0.35, rootMargin: "0px 0px -10% 0px" }
    );
    revealEls.forEach((el) => io.observe(el));

    // Parallax
    const parallaxEls = Array.from(root.querySelectorAll<HTMLElement>("[data-parallax]"));
    let ticking = false;
    const onScroll = () => {
      if (ticking) return;
      ticking = true;
      requestAnimationFrame(() => {
        const y = window.scrollY || window.pageYOffset;
        parallaxEls.forEach((el) => {
          const speed = Number(el.dataset.speed || "0.12");
          el.style.setProperty("--py", `${y * speed}px`);
        });
        ticking = false;
      });
    };
    window.addEventListener("scroll", onScroll, { passive: true });
    onScroll();

    return () => {
      window.removeEventListener("scroll", onScroll);
      io.disconnect();
    };
  }, []);

  return (
    <>
      <section className="invite-hero" ref={rootRef}>
        <div
          className="invite-hero__bg"
          data-parallax
          data-speed="0.12"
          data-reveal="bg"
          style={{ ["--d" as any]: "0ms", backgroundImage: "url(/media/planta.png)" }}
          aria-hidden="true"
        />
        {/* Filtro verde oscuro */}
        <div className="invite-hero__tint" aria-hidden="true" />

        <div className="invite-hero__wrap">
          {/* IMPORTANT: área relativa para posicionar elementos individualmente en móvil */}
          <div className="invite-hero__copy">

            {/* LOGO GREENFIELD (manejo individual) */}
            <div
              className="gf-logo"
              data-parallax
              data-speed="0.06"
              data-reveal="logo"
              style={{ ["--d" as any]: "160ms" }}
            >
              <img
                src="/logos/logo-greenfield-blanco.png"
                alt="Greenfield"
                width={110}
                height={110}
              />
            </div>

            {/* TÍTULO (2 líneas, centrado) */}
            <h1
              className="intro-title"
              data-parallax
              data-speed="0.045"
              data-reveal="title"
              style={{ ["--d" as any]: "320ms" }}
            >
              <span>Te invitamos a un</span>
              <span>encuentro único</span>
            </h1>

            {/* CLAIM IZQUIERDA */}
            <div
              className="claim-block"
              data-parallax
              data-speed="0.04"
              data-reveal="text"
              style={{ ["--d" as any]: "480ms" }}
            >
              <img src="/logos/01.png" alt="Conectando la fisiología con la agricultura del futuro" className="claim-logo" />
            </div>

            {/* LOGO AGRONEXT */}
            <div
              className="agronext-logo"
              data-parallax
              data-speed="0.035"
              data-reveal="text"
              style={{ ["--d" as any]: "560ms" }}
            >
              <img src="/logos/02.png" alt="AgroNext" />
            </div>

            {/* DISERTANTE */}
            <p
              className="speaker"
              data-parallax
              data-speed="0.03"
              data-reveal="text"
              style={{ ["--d" as any]: "600ms" }}
            >
              Disertante: <strong>Prof. Geraldo Chavarría</strong>
              <span className="dot dot--muted" aria-hidden="true" /> <span className="country">Brasil</span>
            </p>

          </div>
        </div>
      </section>

      {/* Botón: NO tocado */}
      <a
        className="btn-rsvp btn-rsvp--floating"
        href={rsvpUrl}
        target="_blank"
        rel="noopener noreferrer"
      >
        Confirmar asistencia
      </a>
    </>
  );
}
