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
          style={{ ["--d" as any]: "0ms" }}
          aria-hidden="true"
        />

        <div className="invite-hero__wrap">
          <div className="invite-hero__copy">
            <div className="title-group">
              <img
                className="brand-mark"
                src="/logos/logo-greenfield-blanco.png"
                alt="Greenfield"
                width={140}
                height={140}
                data-parallax
                data-speed="0.06"
                data-reveal="logo"
                style={{ ["--d" as any]: "220ms" }}
              />

              <h1
                className="title"
                data-parallax
                data-speed="0.045"
                data-reveal="title"
                style={{ ["--d" as any]: "420ms" }}
              >
                <span className="title-row title-row--sm">El futuro del campo</span>
                <span className="title-row title-row--sm">comienza con la</span>
                <span className="title-row title-row--xl">FISIOLOGÍA</span>
              </h1>

              <p
                className="lead"
                data-parallax
                data-speed="0.03"
                data-reveal="text"
                style={{ ["--d" as any]: "620ms" }}
              >
                Disertante: <strong>Prof. Geraldo Chavarría</strong>
                <span className="dot dot--muted" aria-hidden="true" />
                <span className="country">Brasil</span>
              </p>
            </div>
          </div>
        </div>
      </section>

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
