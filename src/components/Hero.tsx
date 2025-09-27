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

    // 🔐 Asegurar flags de autoplay-friendly (iOS/Android)
    v.muted = true;                            // JS flag
    v.setAttribute("muted", "");               // iOS quirk
    (v as any).playsInline = true;             // JS flag
    v.setAttribute("playsinline", "");         // iOS quirk
    v.removeAttribute("controls");             // sin controles

    // 👉 Intenta reproducir inmediatamente
    const tryPlay = () => v.play().catch(() => {});
    tryPlay();

    // ✅ Ajusta velocidad SOLO cuando ya está reproduciendo
    const onPlay = () => {
      try {
        v.defaultPlaybackRate = 1.5;
        v.playbackRate = 1.5;
      } catch {}
    };

    const onCanPlay = () => setReady(true);
    const onEnded = () => {
      setCycle((n) => n + 1);
      tryPlay();
    };

    // 🟢 Fallback: primer toque/click del usuario “desbloquea” autoplay en algunos móviles
    const unlock = () => {
      tryPlay();
      window.removeEventListener("touchstart", unlock);
      window.removeEventListener("click", unlock);
    };
    window.addEventListener("touchstart", unlock, { once: true, passive: true });
    window.addEventListener("click", unlock, { once: true });

    v.addEventListener("play", onPlay);
    v.addEventListener("canplay", onCanPlay);
    v.addEventListener("ended", onEnded);

    // Si ya está listo al montar
    if (v.readyState >= 3) onCanPlay();

    return () => {
      window.removeEventListener("touchstart", unlock);
      window.removeEventListener("click", unlock);
      v.removeEventListener("play", onPlay);
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
        playsInline
        loop
        preload="auto"
      >
        <source src="/Fondo-Nexfarming.mp4" type="video/mp4" />
        <source src="/Fondo-Nexfarming.webm" type="video/webm" />
        {/* Opcional: MOV puede fallar en Android — puedes quitar esta línea si da problemas */}
        <source src="/Fondo-Nexfarming.mov" type="video/quicktime" />
        Tu navegador no soporta video HTML5.
      </video>

      <div className="hero-vignette" aria-hidden="true" />

      <div className="logo-greenfield" aria-hidden="true">
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

      <div className="logo-next" aria-hidden="true">
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
