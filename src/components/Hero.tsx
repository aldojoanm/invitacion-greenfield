// Hero.tsx
import { useEffect, useRef, useState } from "react";
import "./Hero.css";

type HeroProps = { onEnter: () => void };

export default function Hero({ onEnter }: HeroProps) {
  const videoRef = useRef<HTMLVideoElement | null>(null);
  const [ready, setReady] = useState(false);
  const [logoCycle, setLogoCycle] = useState(0); // ← fuerza reinicio de animación del logo

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
      // Cada fin de video: re-montamos el logo para reiniciar caída + bounce
      setLogoCycle((n) => n + 1);
      // Si por algún motivo el loop no reanuda, aseguramos el play:
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

      {/* LOGO animado y clickeable (igual que el botón Conocimiento) */}
      <button
        key={logoCycle}                 // ← remonta para reiniciar animaciones
        type="button"
        className="hero-logo"
        onClick={onEnter}
        aria-label="Entrar"
      >
        <img
          src="/logos/logo-greenfield-blanco.png"
          alt="Greenfield"
          width={220}
          height={220}
          decoding="async"
          loading="eager"
          draggable={false}
        />
      </button>
    </section>
  );
}
