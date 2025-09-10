// Hero.tsx
import { useEffect, useRef, useState } from "react";
import "./Hero.css";

type HeroProps = { onEnter: () => void };

const EXIT_MS = 900;

export default function Hero({ onEnter }: HeroProps) {
  const videoRef = useRef<HTMLVideoElement | null>(null);
  const [ready, setReady] = useState(false);
  const [exiting, setExiting] = useState(false);

  const startExit = () => {
    if (exiting) return;
    setExiting(true);
    window.setTimeout(() => onEnter(), EXIT_MS);
  };

  useEffect(() => {
    const v = videoRef.current;
    if (!v) return;

    const onCanPlay = () => {
      try {
        v.defaultPlaybackRate = 3.5;
        v.playbackRate = 3.5;
      } catch {}
      setReady(true);
    };
    const onEnded = () => startExit();

    v.addEventListener("canplay", onCanPlay);
    v.addEventListener("ended", onEnded);
    v.muted = true;
    if (v.readyState >= 3) onCanPlay();

    return () => {
      v.removeEventListener("canplay", onCanPlay);
      v.removeEventListener("ended", onEnded);
    };
  }, [onEnter]);

  const onKeyDown = (e: React.KeyboardEvent<HTMLElement>) => {
    if (e.key === "Enter" || e.key === " ") {
      e.preventDefault();
      startExit();
    }
  };

  return (
    <section
      className={`hero ${ready ? "is-ready" : ""} ${exiting ? "is-exiting" : ""}`}
      aria-label="Portada"
      role="button"
      tabIndex={0}
      onClick={startExit}
      onKeyDown={onKeyDown}
      aria-describedby="heroHint"
    >
      <video
        ref={videoRef}
        className="hero-video-bg"
        autoPlay
        muted
        playsInline
        preload="auto"
      >
        <source src="/video2.mp4" type="video/mp4" />
        <source src="/video2.webm" type="video/webm" />
        <source src="/video2.mov" type="video/quicktime" />
        Tu navegador no soporta video HTML5.
      </video>

      <div className="hero-filter" aria-hidden="true" />
      <div className="hero-vignette" aria-hidden="true" />
      <div className="hero-fade" aria-hidden="true" />

      <div className="hero-hint" aria-hidden="true">CLICK EN LA PANTALLA</div>
      <span id="heroHint" className="sr-only">Haz clic para continuar o espera a que finalice el video.</span>
    </section>
  );
}
