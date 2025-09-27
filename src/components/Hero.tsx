// Hero.tsx
import { useEffect, useRef, useState } from "react";
import "./Hero.css";

type HeroProps = { onEnter: () => void };

export default function Hero({ onEnter }: HeroProps) {
  const videoRef = useRef<HTMLVideoElement | null>(null);
  const [ready, setReady] = useState(false);
  const [cycle, setCycle] = useState(0);

  useEffect(() => {
    const v = videoRef.current;
    if (!v) return;

    // --- FIX autoplay móvil: forzar muted/playsInline + reintentos y fallback por toque ---
    v.muted = true;
    v.playsInline = true;

    const tryPlay = () => v.play().catch(() => { /* silencio si el navegador exige gesto */ });

    // intento inmediato
    tryPlay();
    // intento cuando haya data cargada
    const onLoadedData = () => tryPlay();
    v.addEventListener("loadeddata", onLoadedData);

    // si el navegador exige gesto de usuario, un solo toque en cualquier parte
    const onFirstTouch = () => { tryPlay(); window.removeEventListener("touchstart", onFirstTouch); };
    window.addEventListener("touchstart", onFirstTouch, { once: true, passive: true });
    // -------------------------------------------------------------------------------

    const onCanPlay = () => {
      try { v.defaultPlaybackRate = 1.5; v.playbackRate = 1.5; } catch {}
      setReady(true);
    };
    const onEnded = () => {
      setCycle(n => n + 1);
      try { v.play(); } catch {}
    };

    v.addEventListener("canplay", onCanPlay);
    v.addEventListener("ended", onEnded);
    v.muted = true;
    if (v.readyState >= 3) onCanPlay();

    return () => {
      v.removeEventListener("loadeddata", onLoadedData);
      window.removeEventListener("touchstart", onFirstTouch);
      v.removeEventListener("canplay", onCanPlay);
      v.removeEventListener("ended", onEnded);
    };
  }, []);

  return (
    <section className={`hero ${ready ? "is-ready" : ""}`} aria-label="Portada">
      <video
        ref={videoRef}
        className="hero-video-bg"
        autoPlay muted loop playsInline preload="auto"
      >
        <source src="/Fondo-Nexfarming.mp4" type="video/mp4" />
        <source src="/Fondo-Nexfarming.webm" type="video/webm" />
        <source src="/Fondo-Nexfarming.mov" type="video/quicktime" />
        Tu navegador no soporta video HTML5.
      </video>

      <div className="hero-vignette" aria-hidden="true" />

      {/* GREENFIELD: arriba (caída) */}
      <div key={`gf-${cycle}`} className="logo-greenfield" aria-hidden="true">
        <img
          src="/logos/gf4.png"
          alt="Greenfield"
          width={320}
          height={320}
          decoding="async"
          loading="eager"
          draggable={false}
        />
      </div>

      {/* NEXTFARMING: centrado (slide-in der→izq) */}
      <div key={`nx-${cycle}`} className="logo-next" aria-hidden="true">
        <img
          src="/logos/LOGO-NEXT-FARMING-BLANCO1.png"
          alt="Next Farming"
          width={520}
          height={520}
          decoding="async"
          loading="eager"
          draggable={false}
        />
      </div>

      {/* Logo Guiados: esquina inferior izquierda */}
      <div className="brand-corner" aria-hidden="true">
        <img
          src="/logos/logo-guiados2.png"
          alt="Guiados"
          width={180}
          height={64}
          decoding="async"
          loading="eager"
          draggable={false}
        />
      </div>

      {/* Botón SOLO del Hero */}
      <button
        type="button"
        className="btn-hero"
        onClick={onEnter}
        aria-label="Ir a la siguiente sección"
      >
        <span className="btn-label">INVITADO ESPECIAL</span>
      </button>
    </section>
  );
}
