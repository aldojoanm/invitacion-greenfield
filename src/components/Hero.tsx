// Hero.tsx
import { useEffect, useRef, useState } from "react";
import "./Hero.css";

type HeroProps = { onEnter: () => void };

export default function Hero({ onEnter }: HeroProps) {
  const videoRef = useRef<HTMLVideoElement | null>(null);
  const [ready, setReady] = useState(false);

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

    v.addEventListener("canplay", onCanPlay);
    v.muted = true;
    if (v.readyState >= 3) onCanPlay();

    return () => v.removeEventListener("canplay", onCanPlay);
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
        <source src="/video1.mp4" type="video/mp4" />
        <source src="/video1.webm" type="video/webm" />
        <source src="/video1.mov" type="video/quicktime" />
        Tu navegador no soporta video HTML5.
      </video>

      <div className="hero-filter" aria-hidden="true" />
      <div className="hero-vignette" aria-hidden="true" />

      <button type="button" className="hero-cta" onClick={onEnter}>
        Conocimiento
      </button>
    </section>
  );
}
