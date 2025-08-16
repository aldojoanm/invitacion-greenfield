import "./Hero.css";

type HeroProps = { onEnter: () => void };

export default function Hero({ onEnter }: HeroProps) {
  return (
    <section className="hero">

      <video
        className="hero-video-bg"
        autoPlay
        loop
        muted
        playsInline
        preload="auto"
      >
        <source src="/nuevologo.mp4" type="video/mp4" />
        Tu navegador no soporta video HTML5.
      </video>

      <button type="button" className="hero-btn" onClick={onEnter}>
        INGRESAR
      </button>
    </section>
  );
}
