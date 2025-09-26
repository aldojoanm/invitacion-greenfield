// Hero.tsx
import { useEffect, useRef, useState } from "react";
import "./Hero.css";

type HeroProps = { onEnter: () => void };

export default function Hero({ onEnter }: HeroProps) {
  const videoRef = useRef<HTMLVideoElement | null>(null);
  const [ready, setReady] = useState(false);
  const [logoCycle, setLogoCycle] = useState(0); // fuerza reinicio de animación del logo

  useEffect(() => {
    const v = videoRef.current;
    if (!v) return;

    const onCanPlay = () => {
      try {
        v.defaultPlaybackRate = 1.5;
        v.playbackRate = 1.5;
      } catch {}
      setReady(true);
    };

    const onEnded = () => {
      // Cada fin de video: re-montamos el logo para reiniciar caída
      setLogoCycle((n) => n + 1);
      try { v.play(); } catch {}
    };

    v.addEventListener("canplay", onCanPlay);
    v.addEventListener("ended", onEnded);
    v.muted = true;
    if (v.readyState >= 3) onCanPlay();

    return () => {
      v.removeEventListener("canplay", onCanPlay);
      v.removeEventListener("ended", onEnded);
    };
  }, []);

  return (
    <section className={`hero ${ready ? "is-ready" : ""}`} aria-label="Portada">
      <video
        ref={videoRef}
        className="hero-video-bg"
        autoPlay
        muted
        loop
        playsInline
        preload="auto"
      >
        <source src="/inicio.mp4" type="video/mp4" />
        <source src="/inicio.webm" type="video/webm" />
        <source src="/inicio.mov" type="video/quicktime" />
        Tu navegador no soporta video HTML5.
      </video>

      {/* Viñeta (sin filtro verde) */}
      <div className="hero-vignette" aria-hidden="true" />

      {/* LOGO NEXT FARMING: FIJO, MÁS GRANDE, SIN FUNCIÓN DE BOTÓN */}
      <div key={logoCycle} className="hero-logo is-fixed" aria-hidden="true">
        <img
          src="/logos/LOGO-NEXT-FARMING-BLANCO1.png"
          alt="Next Farming"
          width={320}
          height={320}
          decoding="async"
          loading="eager"
          draggable={false}
        />
      </div>

      {/* Botón estilo footer centrado: respira y llama a onEnter (igual que antes) */}
      <button
        type="button"
        className="btn-rsvp btn-rsvp--floating"
        onClick={onEnter}
        aria-label="Ir a la siguiente sección"
      >
        <span className="btn-label">INVITADO ESPECIAL</span>
      </button>
    </section>
  );
}
