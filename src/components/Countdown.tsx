import { useEffect, useMemo, useRef, useState } from "react";
import "./Countdown.css";

type CountdownProps = { targetDate?: string };
type Left = { days: number; hours: number; minutes: number; seconds: number };

export default function Countdown({
  targetDate = "2025-10-24T19:00:00-04:00",
}: CountdownProps) {
  const sectionRef = useRef<HTMLElement | null>(null);

  const startDate = useMemo(() => new Date(targetDate), [targetDate]);

  const calc = (): Left | null => {
    const diff = +startDate - Date.now();
    if (diff <= 0) return null;
    return {
      days: Math.floor(diff / 86400000),
      hours: Math.floor((diff % 86400000) / 3600000),
      minutes: Math.floor((diff % 3600000) / 60000),
      seconds: Math.floor((diff % 60000) / 1000),
    };
  };

  const [left, setLeft] = useState<Left | null>(calc());
  useEffect(() => {
    const id = setInterval(() => setLeft(calc()), 1000);
    return () => clearInterval(id);
  }, [targetDate]);

  const outerRef = useRef<HTMLDivElement | null>(null);
  const innerRef = useRef<HTMLDivElement | null>(null);
  const [scale, setScale] = useState(1);
  useEffect(() => {
    const fit = () => {
      const outer = outerRef.current, inner = innerRef.current;
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
    return () => { ro?.disconnect?.(); window.removeEventListener("resize", fit); };
  }, []);

  const handleAddToCalendar = () => {
    const start = new Date(startDate);
    const end = new Date(start.getTime() + 4 * 60 * 60 * 1000);
    const toICS = (d: Date) =>
      d.toISOString().replace(/[-:]/g, "").replace(/\.\d{3}Z$/, "Z");
    const url =
      `https://calendar.google.com/calendar/render?action=TEMPLATE` +
      `&text=${encodeURIComponent("Fisiología de Plantas · Prof. Chavarría")}` +
      `&dates=${toICS(start)}/${toICS(end)}` +
      `&details=${encodeURIComponent("Sesión técnica aplicada para mejorar rendimiento, manejo del estrés y eficiencia hídrica.")}` +
      `&location=${encodeURIComponent("Hotel Los Tajibos — Santa Cruz de la Sierra")}`;
    window.open(url, "_blank");
  };

  useEffect(() => {
    const root = sectionRef.current;
    if (!root) return;

    const revealEls = Array.from(root.querySelectorAll<HTMLElement>("[data-anim]"));
    const io = new IntersectionObserver(
      (entries) =>
        entries.forEach((en) => {
          const el = en.target as HTMLElement;
          if (en.isIntersecting) el.classList.add("in");
          else el.classList.remove("in");
        }),
      { threshold: 0.25, rootMargin: "0px 0px -12% 0px" }
    );
    revealEls.forEach((el) => io.observe(el));

    const parEls = Array.from(root.querySelectorAll<HTMLElement>("[data-parallax]"));
    const videoEl = root.querySelector<HTMLElement>(".xp-bg-video");
    const tintEl  = root.querySelector<HTMLElement>(".xp-bg-tint");

    let raf = 0;
    const onScroll = () => {
      if (raf) return;
      raf = requestAnimationFrame(() => {
        raf = 0;
        const r = (root && typeof root.getBoundingClientRect === "function")
          ? root.getBoundingClientRect()
          : null;
        if (!r) return;
        const vh = window.innerHeight || document.documentElement.clientHeight;
        const p = Math.min(1, Math.max(0, (vh - r.top) / (vh + r.height)));
        parEls.forEach((el) => {
          const k = parseFloat(el.dataset.parallax || "0");
          const y = (p - 0.5) * k;
          el.style.setProperty("--parY", `${y}px`);
        });
        if (videoEl) videoEl.style.transform = `translate3d(0, ${((p - 0.5) * 8)}px, 0) scale(1.02)`;
        if (tintEl)  (tintEl as HTMLElement).style.opacity = String(Math.min(0.95, 0.80 + Math.abs(p - .5)));
      });
    };
    onScroll();
    window.addEventListener("scroll", onScroll, { passive: true });
    window.addEventListener("resize", onScroll);
    return () => {
      io.disconnect();
      window.removeEventListener("scroll", onScroll);
      window.removeEventListener("resize", onScroll);
      if (raf) cancelAnimationFrame(raf);
    };
  }, []);

  return (
    <section className="xp-count-section" ref={sectionRef}>
      <div className="xp-bg-wrap" aria-hidden>
        <video className="xp-bg-video" src="/bg2.mp4" autoPlay muted loop playsInline preload="auto" poster="/media/bg2.png" />
        <div className="xp-bg-tint" /><div className="xp-bg-vignette" />
      </div>

      <div className="xp-count-wrap">
        <div className="xp-location xp-location--hero" data-anim="fade-up" style={{ ["--d" as any]: "0ms" }} data-parallax="10">
          <a className="m-item link-ghost m-item--hero" href="https://www.google.com/maps/search/?api=1&query=Hotel+Los+Tajibos+Santa+Cruz" target="_blank" rel="noopener noreferrer">
            <svg viewBox="0 0 24 24" aria-hidden><path d="M12 22s7-6 7-11a7 7 0 1 0-14 0c0 5 7 11 7 11Z M12 10.5a2.5 2.5 0 1 0 0-5 2.5 2.5 0 0 0 0 5Z"/></svg>
            Hotel Los Tajibos — Santa Cruz
          </a>
        </div>

        <div className="xp-meta" data-anim="fade-up" style={{ ["--d" as any]: "80ms" }} data-parallax="12">
          <span className="m-item">
            <svg viewBox="0 0 24 24" aria-hidden><path d="M7 2v2M17 2v2M3 9h18M4 6h16a1 1 0 0 1 1 1v13a1 1 0 0 1-1 1H4a1 1 0 0 1-1-1Z"/></svg>
            Vie 24 Oct
          </span>
          <span className="m-dot" aria-hidden />
          <span className="m-item">
            <svg viewBox="0 0 24 24" aria-hidden><path d="M12 7v5l3 2M12 22a10 10 0 1 0 0-20 10 10 0 0 0 0 20Z"/></svg>
            19:00
          </span>
        </div>

        <div className="timer-outer" ref={outerRef}>
          <div className="timer-scale" style={{ transform: `scale(${scale})` }}>
            <div className="timer" ref={innerRef} role="timer" aria-live="polite" data-anim="fade-up" style={{ ["--d" as any]: "160ms" }}>
              {left ? (
                <>
                  <div className="t-block" aria-label={`${left.days} días`}><span className="t-num">{String(left.days).padStart(2,"0")}</span><span className="t-lbl">DÍAS</span></div>
                  <span className="t-colon" aria-hidden>:</span>
                  <div className="t-block" aria-label={`${left.hours} horas`}><span className="t-num">{String(left.hours).padStart(2,"0")}</span><span className="t-lbl">HRS</span></div>
                  <span className="t-colon" aria-hidden>:</span>
                  <div className="t-block" aria-label={`${left.minutes} minutos`}><span className="t-num">{String(left.minutes).padStart(2,"0")}</span><span className="t-lbl">MIN</span></div>
                </>
              ) : (
                <div className="xp-live" data-anim="pop">¡El evento ha comenzado!</div>
              )}
            </div>
          </div>
        </div>

        <div className="xp-cta-row" data-anim="fade-up" style={{ ["--d" as any]: "320ms" }} data-parallax="-6">
          <button className="btn-minimal" onClick={handleAddToCalendar}>Agendar evento</button>
        </div>

        <div className="brand" data-anim="scale-fade" style={{ ["--d" as any]: "380ms" }} data-parallax="16">
          <img className="brand-logo" src="/logos/logo-guiados.png" alt="Guiados" width={320} height={320} loading="eager" />
        </div>
      </div>
    </section>
  );
}
