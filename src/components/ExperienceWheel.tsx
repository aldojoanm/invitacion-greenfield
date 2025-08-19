// ExperienceWheel.tsx
import { useEffect, useRef, useState } from "react";
import "./ExperienceWheel.css";

const SIZE = 720;
const CX = SIZE / 2;
const CY = SIZE / 2;

const TOP_RING = 350;
const OUTER_EPS = 0.8;

const ARM_COUNT = 6;
const STEP = 360 / ARM_COUNT;

const SEP_DEG = 3.0;
const SEP_COLOR = "#2d3136";

const WINDOW_TOL = 0.2;
const HOLE_SPAN = STEP - SEP_DEG - WINDOW_TOL;
const HOLE_CENTER = 0;
const HOLE_INNER_R = 110;
const CORNER_PX = 0;

// Ángulo inicial para centrar una franja completa en la abertura
const START_ANGLE = HOLE_CENTER - STEP / 2;

const SLOT_OFFSET_PX = 0;
const SLOT_DEPTH_PX = 90;
const SLOT_TRIM_DEG = 10;
const SLOT_CORNER_PX = 0;

const AA_PX = 1.4;
const AA_DEG = 0.5;
const TOPMASK_AA_PX = 0.5;
const TOPMASK_AA_DEG = 0;

const TEXT_LEFT_PAD = 2;

const TOP_LOGO_SRC = "/logos/experience.png";
const TOP_LOGO_W = 300;
const TOP_LOGO_H = 250;
const TOP_LOGO_PAD = 18;

const BOTTOM_LOGO_SRC = "/logos/Agropartnerts.png";
const BOTTOM_LOGO_W = 150;
const BOTTOM_LOGO_H = 280;
const BOTTOM_LOGO_PAD = 18;

const STRIPE_FILL = "#2d3136";
const STRIPE_H = 160;
const STRIPE_RX = 5;
const STRIPE_INSET = 120;
const STRIPE_DIAG_DEG = 65;

const STRIPE_Y_OFFSET = 0;
const STRIPE_CONTENT_OFFSET_Y = 0;

const DOTS_SRC = "/logos/puntos.png";
const DOTS_H = 70;
const DOTS_Y_OFFSET = 5;
const DOTS_GAP_ABOVE = 5;
const DOTS_OPACITY = 1;
const DOTS_X_PAD = 0;

const SLOT_BG_COLOR = "#3f4348";

const DRAG_SENS = 2;
const AUTO_ROTATE_DEG_PER_SEC = 4; // velocidad suave

// Iconos encabezado
const LEFT_ICON_SRC  = "/logos/icono-calendario.png";
const RIGHT_ICON_SRC = "/logos/icono-ubicacion.png";
const ICON_W = 22;
const ICON_H = 22;
const LEFT_ICON_DY  = -65;
const RIGHT_ICON_DY = -65;
const LEFT_ICON_DX  = -39;
const RIGHT_ICON_DX =  52;

/** === NUEVO: pista “girar” con imagen ===
 *  Ajusta aquí la posición/rotación y tamaño del PNG.
 */
const HINT_IMG_SRC    = "/logos/girar.png";
const HINT_IMG_W      = 120;      // ancho del PNG
const HINT_IMG_H      = 90;       // alto del PNG
const HINT_IMG_RADIUS = TOP_RING + 20; // qué tan afuera del aro
const HINT_IMG_ANGLE  = -32;      // ángulo alrededor del círculo (0=derecha, 90=abajo)
const HINT_IMG_ROT    = -20;      
const HINT_IMG_DX     = -30;        
const HINT_IMG_DY     = 500;        

// ---------------- helpers geom ----------------
function sectorPath(
  cx: number, cy: number, rOuter: number, rInner: number,
  startDeg: number, endDeg: number, cornerPx: number = 0
) {
  const toRad = (d: number) => (d * Math.PI) / 180,
    toDeg = (r: number) => (r * 180) / Math.PI;
  const cornerDeg = cornerPx > 0 ? toDeg(cornerPx / rOuter) : 0;
  const s0 = startDeg + cornerDeg,
    e0 = endDeg - cornerDeg;
  const largeArc = Math.abs(endDeg - startDeg) > 180 ? 1 : 0;
  const p = (r: number, aDeg: number) => {
    const a = toRad(aDeg);
    return { x: cx + r * Math.cos(a), y: cy + r * Math.sin(a) };
  };
  const P1 = p(rOuter, s0),
    P2 = p(rOuter, e0),
    C_top = p(rOuter - cornerPx, e0 + cornerDeg),
    C_bottom = p(rOuter - cornerPx, s0 - cornerDeg),
    B_top = p(rInner, endDeg),
    B_bottom = p(rInner, startDeg);
  return [
    `M ${P1.x} ${P1.y}`,
    `A ${rOuter} ${rOuter} 0 ${largeArc} 1 ${P2.x} ${P2.y}`,
    cornerPx > 0
      ? `Q ${C_top.x} ${C_top.y} ${B_top.x} ${B_top.y}`
      : `L ${B_top.x} ${B_top.y}`,
    `L ${B_bottom.x} ${B_bottom.y}`,
    cornerPx > 0
      ? `Q ${C_bottom.x} ${C_bottom.y} ${P1.x} ${P1.y}`
      : `L ${P1.x} ${P1.y}`,
    "Z",
  ].join(" ");
}
function stripePath(x: number, y: number, w: number, h: number, r: number, deg: number) {
  const rad = (d: number) => (d * Math.PI) / 180;
  const tipRun = (h - r) / Math.tan(rad(deg));
  const xR = x + w, yB = y + h;
  return [
    `M ${xR - r} ${y}`,
    `A ${r} ${r} 0 0 1 ${xR} ${y + r}`,
    `L ${xR} ${yB - r}`,
    `A ${r} ${r} 0 0 1 ${xR - r} ${yB}`,
    `L ${x - tipRun} ${yB}`,
    `L ${x} ${y + r}`,
    `A ${r} ${r} 0 0 1 ${x + r} ${y}`,
    `L ${xR - r} ${y}`,
    "Z",
  ].join(" ");
}
function pointerAngle(e: PointerEvent, svg: SVGSVGElement) {
  const r = svg.getBoundingClientRect(),
    cx = r.left + r.width / 2,
    cy = r.top + r.height / 2;
  const x = e.clientX - cx,
    y = e.clientY - cy;
  return (Math.atan2(y, x) * 180) / Math.PI;
}
function polar(
  cx: number, cy: number, radius: number, deg: number
) {
  const a = (deg * Math.PI) / 180;
  return { x: cx + radius * Math.cos(a), y: cy + radius * Math.sin(a) };
}

type LineCfg = {
  text: string;
  bold?: boolean;
  italic?: boolean;
  size?: number;
  dx?: number;
  dy?: number;
  gap?: number;
  ls?: number | string;
  ws?: number | string;
};
type ColumnCfg = {
  xPad?: number;
  gap?: number;
  startOffset?: number;
  align?: "left" | "right";
  rightPad?: number;
  lines: LineCfg[];
};
type StripeTxtCfg = {
  color: string;
  accent: string;
  fontFamily: string;
  dividerPct: number;
  dividerPad?: number;
  left: ColumnCfg;
  right: ColumnCfg;
};

const STRIPE_TXT: StripeTxtCfg = {
  color: "#ffffff",
  accent: "#ffffffff",
  fontFamily:
    "'Inter Tight', 'SF Pro Text', 'Helvetica Neue', 'Segoe UI Variable Text', 'Noto Sans', system-ui, sans-serif",
  dividerPct: 0.25,
  dividerPad: 16,
  left: {
    align: "right",
    rightPad: 18,
    xPad: 12,
    gap: 20,
    startOffset: -10,
    lines: [
      { text: "02 - 03", bold: true, size: 22, ls: 1 },
      { text: "Octubre", bold: true, size: 24, dy: 2, ls: 0.5 },
      { text: "08:00 Hrs", size: 18, ls: 1.5 },
    ],
  },
  right: {
    gap: 25,
    startOffset: -10,
    lines: [
      { text: "Propiedad", size: 23, ls: 1 },
      { text: "El Porvenir", bold: true, size: 20, ls: 1 },
      { text: "San Pedro, Km.27", size: 15, dy: -5, ls: 0.3 },
      { text: "La Planchada", size: 14, dy: -8, ls: 0.5 },
    ],
  },
};

type ArmCfg = {
  color: string;
  textLines: string[];
  boldIndex?: number;
  textFill?: string;
  textSize?: number;
  textLineGap?: number;
  textAngleOffset?: number;
  textDx?: number;
  textDy?: number;
  textLineDx?: number[];
  textLineDy?: number[];
  logoSrc: string;
  logoScale?: number;
  logoRot?: number;
  logoDx?: number;
  logoDy?: number;
};

const ARM_CONFIG: ArmCfg[] = [
  { color: "#93328e", textLines: ["Sanidad","superior para","mejores","resultados."], boldIndex:0, textFill:"#fff", textSize:18, textLineGap:20, logoSrc:"/logos/Manejocampeon.png", logoScale:2, logoRot:120, textLineDy:[5,0,0,0] },
  { color: "#640a2a", textLines: ["Semillas de","calidad","productividad,","asegurada."], boldIndex:1, textFill:"#fff", textSize:18, textLineGap:20, logoSrc:"/logos/Conecta.png", logoScale:2, logoRot:60, textLineDy:[5,0,0,0] },
  { color: "#406975", textLines: ["Aplicar con","precisión","producir con","visión."], boldIndex:1, textFill:"#fff", textSize:18, textLineGap:20, logoSrc:"/logos/Certero.png", logoScale:0.8, logoRot:0, textLineDy:[5,0,0,0] },
  { color: "#058b5e", textLines: ["Soluciones","biológicas hacia","una agricultura","sostenible."], boldIndex:3, textFill:"#fff", textSize:18, textLineGap:20, logoSrc:"/logos/Origen.png", logoScale:2, logoRot:300, textLineDy:[5,0,0,0] },
  { color: "#936a56", textLines: ["Nutrición","estratégica","para potenciar","el rendimiento."], boldIndex:0, textFill:"#fff", textSize:18, textLineGap:20, logoSrc:"/logos/Elemental.png", logoScale:1.7, logoRot:240, textLineDy:[5,0,0,0] },
  { color: "#706f6f", textLines: ["Manejo","completo y","eficiente para","cada cultivo."], boldIndex:0, textFill:"#fff", textSize:18, textLineGap:20, logoSrc:"/logos/Portecnico.png", logoScale:0.75, logoRot:180, textLineDy:[5,0,0,0] },
];

export default function ExperienceWheel() {
  const [angle, setAngle] = useState(START_ANGLE);
  const ref = useRef<SVGSVGElement | null>(null);
  const dragging = useRef(false);
  const prevAngle = useRef(0);

  useEffect(() => {
    const el = ref.current;
    if (!el) return;
    const onDown = (e: PointerEvent) => {
      dragging.current = true;
      el.setPointerCapture?.(e.pointerId);
      prevAngle.current = pointerAngle(e, el);
    };
    const onMove = (e: PointerEvent) => {
      if (!dragging.current) return;
      const a = pointerAngle(e, el);
      setAngle((p) => p + (a - prevAngle.current) * DRAG_SENS);
      prevAngle.current = a;
    };
    const onUp = (e: PointerEvent) => {
      dragging.current = false;
      try { el.releasePointerCapture?.(e.pointerId); } catch {}
    };
    const onCancel = () => { dragging.current = false; };
    el.addEventListener("pointerdown", onDown);
    window.addEventListener("pointermove", onMove);
    window.addEventListener("pointerup", onUp);
    window.addEventListener("pointercancel", onCancel);
    return () => {
      el.removeEventListener("pointerdown", onDown);
      window.removeEventListener("pointermove", onMove);
      window.removeEventListener("pointerup", onUp);
      window.removeEventListener("pointercancel", onCancel);
    };
  }, []);
  useEffect(() => {
    const onKey = (e: KeyboardEvent) => {
      if (e.key === "ArrowLeft") setAngle((a) => a - 5);
      if (e.key === "ArrowRight") setAngle((a) => a + 5);
    };
    window.addEventListener("keydown", onKey);
    return () => window.removeEventListener("keydown", onKey);
  }, []);

  // auto-rotación suave (pausa al arrastrar)
  useEffect(() => {
    let raf = 0;
    let last = performance.now();
    const loop = (now: number) => {
      const dt = (now - last) / 1000;
      last = now;
      if (!dragging.current) {
        setAngle((a) => a + AUTO_ROTATE_DEG_PER_SEC * dt);
      }
      raf = requestAnimationFrame(loop);
    };
    raf = requestAnimationFrame(loop);
    return () => cancelAnimationFrame(raf);
  }, []);

  const baseStart = HOLE_CENTER - HOLE_SPAN / 2;
  const baseEnd = HOLE_CENTER + HOLE_SPAN / 2;

  const SAFE_EPS_R = 2;
  const slotOuter = TOP_RING - Math.max(0, SLOT_OFFSET_PX);
  const slotInner = Math.max(
    slotOuter - Math.max(0, SLOT_DEPTH_PX),
    HOLE_INNER_R + SAFE_EPS_R
  );

  const slotSpanDeg = STEP - 2 * SLOT_TRIM_DEG;
  const slotHalfRad = (slotSpanDeg * Math.PI) / 360;
  const imgW = slotOuter - slotInner + 2;
  const imgH = 2 * (slotOuter * Math.sin(slotHalfRad)) + 2;
  const rSlot = (slotOuter + slotInner) / 2;

  const stripeX = CX - TOP_RING + STRIPE_INSET;
  const stripeW = 2 * TOP_RING - 2 * STRIPE_INSET;
  const stripeY = CY - STRIPE_H / 2 + STRIPE_Y_OFFSET;

  const windowPathD = sectorPath(
    CX, CY, TOP_RING + TOPMASK_AA_PX, HOLE_INNER_R - TOPMASK_AA_PX,
    baseStart - TOPMASK_AA_DEG, baseEnd + TOPMASK_AA_DEG, CORNER_PX
  );
  const stripeD = stripePath(
    stripeX, stripeY, stripeW, STRIPE_H, STRIPE_RX, STRIPE_DIAG_DEG
  );

  const leftSafeX = stripeX + (STRIPE_TXT.left.xPad ?? 0);
  const dividerX = stripeX + stripeW * STRIPE_TXT.dividerPct;
  const rightStartX = dividerX + (STRIPE_TXT.dividerPad ?? 22);

  const leftAnchor: "start" | "end" =
    (STRIPE_TXT.left.align ?? "left") === "right" ? "end" : "start";
  const leftBaseX =
    (STRIPE_TXT.left.align ?? "left") === "right"
      ? dividerX - (STRIPE_TXT.left.rightPad ?? 16)
      : leftSafeX;

  // Posición del PNG “girar”
  const hintPos = polar(CX, CY, HINT_IMG_RADIUS, HINT_IMG_ANGLE);

  return (
    <div className="wheel-page">
      <video className="bg-video" autoPlay loop muted playsInline preload="auto" aria-hidden>
        <source src="/bg.mp4" type="video/mp4" />
      </video>

      <div className="wheel-container intro">
        <svg ref={ref} className="wheel-svg" viewBox={`0 0 ${SIZE} ${SIZE}`}>
          <defs>
            <mask id="topMask" maskUnits="userSpaceOnUse" maskContentUnits="userSpaceOnUse">
              <rect x="0" y="0" width={SIZE} height={SIZE} fill="black" />
              <circle cx={CX} cy={CY} r={TOP_RING} fill="white" />
              <path d={windowPathD} fill="black" />
            </mask>
            <mask id="stripeCut">
              <rect x="0" y="0" width={SIZE} height={SIZE} fill="black" />
              <path d={stripeD} fill="white" />
              <path d={windowPathD} fill="black" />
            </mask>
            <radialGradient id="edgeFade" cx="50%" cy="50%" r="60%">
              <stop offset="0%" stopColor="#4b4f55" />
              <stop offset="100%" stopColor="#3f4348" />
            </radialGradient>
            <mask id="outerClip">
              <rect x="0" y="0" width={SIZE} height={SIZE} fill="black" />
              <circle cx={CX} cy={CY} r={TOP_RING - OUTER_EPS} fill="white" />
            </mask>
          </defs>

          {/* disco inferior con brazos */}
          <g transform={`rotate(${angle} ${CX} ${CY})`}>
            {ARM_CONFIG.map((cfg, i) => {
              const start = i * STEP,
                end = (i + 1) * STEP,
                mid = (start + end) / 2;

              const wedgePath = sectorPath(
                CX, CY, TOP_RING, HOLE_INNER_R, start, end, CORNER_PX
              );
              const slotPathMask = sectorPath(
                CX, CY, slotOuter + AA_PX, slotInner - AA_PX,
                start + SLOT_TRIM_DEG - AA_DEG,
                end - SLOT_TRIM_DEG + AA_DEG,
                SLOT_CORNER_PX
              );
              const maskId = `arm-mask-${i}`;
              const clipId = `clip-slot-${i}`;
              const slotPathExact = sectorPath(
                CX, CY, slotOuter + 0.6, slotInner - 0.6,
                start + SLOT_TRIM_DEG - 0.25,
                end - SLOT_TRIM_DEG + 0.25,
                SLOT_CORNER_PX
              );

              const rTextX = CX + HOLE_INNER_R + TEXT_LEFT_PAD + (cfg.textDx ?? 0);
              const lineGap = cfg.textLineGap ?? 20;
              const n = cfg.textLines.length;
              const firstDy = -((n - 1) * lineGap) / 2;

              const rad = (mid * Math.PI) / 180;
              const imgCx = CX + (rSlot + (cfg.logoDx ?? 0)) * Math.cos(rad);
              const imgCy = CY + (rSlot + (cfg.logoDy ?? 0)) * Math.sin(rad);
              const imgRot = (cfg.logoRot ?? 0) + mid;

              return (
                <g key={i}>
                  <defs>
                    <mask id={maskId} maskUnits="userSpaceOnUse" maskContentUnits="userSpaceOnUse">
                      <rect x="0" y="0" width={SIZE} height={SIZE} fill="black" />
                      <path d={wedgePath} fill="white" />
                      <path d={slotPathMask} fill="black" />
                    </mask>
                    <clipPath id={clipId} clipPathUnits="userSpaceOnUse">
                      <path d={slotPathExact} />
                    </clipPath>
                  </defs>

                  <path d={wedgePath} fill={cfg.color} mask={`url(#${maskId})`} />
                  <path d={slotPathMask} fill={SLOT_BG_COLOR} mask="url(#outerClip)" />

                  <g clipPath={`url(#${clipId})`}>
                    <g transform={`translate(${imgCx}, ${imgCy}) rotate(${imgRot}) scale(${cfg.logoScale ?? 1})`}>
                      <image
                        href={cfg.logoSrc}
                        x={-imgW / 2}
                        y={-imgH / 2}
                        width={imgW}
                        height={imgH}
                        preserveAspectRatio="xMidYMid meet"
                        style={{ pointerEvents: "none" }}
                      />
                    </g>
                  </g>

                  <g transform={`rotate(${mid + (cfg.textAngleOffset ?? 0)} ${CX} ${CY})`}>
                    <text
                      x={rTextX}
                      y={CY + (cfg.textDy ?? 0)}
                      textAnchor="start"
                      fontFamily={STRIPE_TXT.fontFamily}
                      fontSize={cfg.textSize ?? 18}
                      fill={cfg.textFill ?? "#fff"}
                      style={{ pointerEvents: "none" }}
                    >
                      {cfg.textLines.map((line, j) => {
                        const isBold = (cfg.boldIndex ?? -1) === j;
                        const perLineDx = cfg.textLineDx?.[j] ?? 0;
                        const perLineDy = cfg.textLineDy?.[j] ?? 0;
                        return (
                          <tspan
                            key={j}
                            x={rTextX + perLineDx}
                            dy={(j === 0 ? firstDy : lineGap) + perLineDy}
                            fontWeight={isBold ? 600 : 300}
                            fontStyle="normal"
                          >
                            {line}
                          </tspan>
                        );
                      })}
                    </text>
                  </g>

                  <path
                    d={sectorPath(CX, CY, TOP_RING + 1, HOLE_INNER_R - 1, start - SEP_DEG / 2, start + SEP_DEG / 2, 0)}
                    fill={SEP_COLOR}
                  />
                </g>
              );
            })}
          </g>

          {/* disco superior (base) */}
          <g className="top-visual" mask="url(#topMask)" shapeRendering="geometricPrecision">
            <circle cx={CX} cy={CY} r={TOP_RING} fill="url(#edgeFade)" />
            <circle cx={CX} cy={CY} r={TOP_RING} fill="none" stroke="#7a7f86" strokeWidth={1.5} opacity={0.7} />
            <circle cx={CX} cy={CY} r={TOP_RING - 24} fill="none" stroke="rgba(0,0,0,0.08)" strokeWidth={1} strokeDasharray="4 6" />
          </g>

          {/* overlay de VIDEO solo sobre la rueda superior */}
          <foreignObject x="0" y="0" width={SIZE} height={SIZE} mask="url(#topMask)" style={{ pointerEvents: "none" }}>
            <video
              autoPlay
              loop
              muted
              playsInline
              preload="auto"
              src="/bg.mp4"
              style={{
                width: "100%",
                height: "100%",
                objectFit: "cover",
                opacity: 0.12,
                filter: "grayscale(1) contrast(.9) brightness(.9)",
              }}
            />
          </foreignObject>

          {/* franja */}
          <path className="stripe" d={stripeD} fill={STRIPE_FILL} mask="url(#stripeCut)" />

          {/* puntos sobre franja */}
          {(() => {
            const x = CX - TOP_RING + STRIPE_INSET + DOTS_X_PAD;
            const w = 2 * TOP_RING - 2 * STRIPE_INSET - DOTS_X_PAD * 2;
            const stripeTop = CY - STRIPE_H / 2 + STRIPE_Y_OFFSET;
            const y = stripeTop - DOTS_GAP_ABOVE - DOTS_H + DOTS_Y_OFFSET;
            return (
              <image
                href={DOTS_SRC}
                x={x}
                y={y}
                width={w}
                height={DOTS_H}
                preserveAspectRatio="xMidYMid slice"
                opacity={DOTS_OPACITY}
                mask="url(#topMask)"
                style={{ pointerEvents: "none" }}
              />
            );
          })()}

          {/* textos de franja + ICONOS encabezado */}
          <g mask="url(#stripeCut)" style={{ pointerEvents: "none" }}>
            <line
              x1={dividerX} y1={stripeY + 16}
              x2={dividerX} y2={stripeY + STRIPE_H - 16}
              stroke={STRIPE_TXT.accent} strokeWidth={3} strokeLinecap="round" opacity={0.95}
            />

            <g transform={`translate(0, ${STRIPE_CONTENT_OFFSET_Y})`}>
              {/* Icono Calendario (izq) */}
              <image
                href={LEFT_ICON_SRC}
                x={leftBaseX - ICON_W / 2 + LEFT_ICON_DX}
                y={CY + LEFT_ICON_DY}
                width={ICON_W}
                height={ICON_H}
                preserveAspectRatio="xMidYMid meet"
              />
              {/* Icono Ubicación (der) */}
              <image
                href={RIGHT_ICON_SRC}
                x={rightStartX - ICON_W / 2 + RIGHT_ICON_DX}
                y={CY + RIGHT_ICON_DY}
                width={ICON_W}
                height={ICON_H}
                preserveAspectRatio="xMidYMid meet"
              />

              {/* Texto izquierda */}
              <text
                x={leftBaseX}
                y={CY}
                fill={STRIPE_TXT.color}
                textAnchor={leftAnchor}
                fontFamily={STRIPE_TXT.fontFamily}
              >
                {STRIPE_TXT.left.lines.map((ln, i) => (
                  <tspan
                    key={i}
                    x={leftBaseX + (ln.dx ?? 0)}
                    dy={
                      (i === 0
                        ? (STRIPE_TXT.left.startOffset ?? -(STRIPE_TXT.left.gap ?? 18))
                        : (ln.gap ?? (STRIPE_TXT.left.gap ?? 18))
                      ) + (ln.dy ?? 0)
                    }
                    fontWeight={ln.bold ? 600 : 300}
                    fontStyle={ln.italic ? "italic" : "normal"}
                    fontSize={ln.size ?? 16}
                    style={{
                      letterSpacing: typeof ln.ls === "number" ? `${ln.ls}px` : ln.ls,
                      wordSpacing: typeof ln.ws === "number" ? `${ln.ws}px` : ln.ws,
                    }}
                  >
                    {ln.text}
                  </tspan>
                ))}
              </text>

              {/* Texto derecha */}
              <text
                x={rightStartX}
                y={CY}
                fill={STRIPE_TXT.color}
                textAnchor="start"
                fontFamily={STRIPE_TXT.fontFamily}
              >
                {STRIPE_TXT.right.lines.map((ln, i) => (
                  <tspan
                    key={i}
                    x={rightStartX + (ln.dx ?? 0)}
                    dy={
                      (i === 0
                        ? (STRIPE_TXT.right.startOffset ?? -(STRIPE_TXT.right.gap ?? 16) * 1.5)
                        : (ln.gap ?? (STRIPE_TXT.right.gap ?? 16))
                      ) + (ln.dy ?? 0)
                    }
                    fontWeight={ln.bold ? 600 : 300}
                    fontStyle={ln.italic ? "italic" : "normal"}
                    fontSize={ln.size ?? 16}
                    style={{
                      letterSpacing: typeof ln.ls === "number" ? `${ln.ls}px` : ln.ls,
                      wordSpacing: typeof ln.ws === "number" ? `${ln.ws}px` : ln.ws,
                    }}
                  >
                    {ln.text}
                  </tspan>
                ))}
              </text>
            </g>
          </g>

          {/* logos fijos */}
          <image className="logo-top" href={TOP_LOGO_SRC}
            x={CX - TOP_LOGO_W / 2}
            y={CY - TOP_RING + TOP_LOGO_PAD}
            width={TOP_LOGO_W}
            height={TOP_LOGO_H}
            preserveAspectRatio="xMidYMid meet"
            style={{ pointerEvents: "none" }}
          />
          <image className="logo-bottom" href={BOTTOM_LOGO_SRC}
            x={CX - BOTTOM_LOGO_W / 2}
            y={CY + TOP_RING - BOTTOM_LOGO_PAD - BOTTOM_LOGO_H}
            width={BOTTOM_LOGO_W}
            height={BOTTOM_LOGO_H}
            preserveAspectRatio="xMidYMid meet"
            style={{ pointerEvents: "none" }}
          />

          {/* === NUEVO: imagen “girar” con fade lento === */}
          <g style={{ pointerEvents: "none" }}
             transform={`translate(${hintPos.x + HINT_IMG_DX}, ${hintPos.y + HINT_IMG_DY}) rotate(${HINT_IMG_ROT})`}>
            <image
              className="hint-fade"
              href={HINT_IMG_SRC}
              x={-HINT_IMG_W / 2}
              y={-HINT_IMG_H / 2}
              width={HINT_IMG_W}
              height={HINT_IMG_H}
              preserveAspectRatio="xMidYMid meet"
            />
          </g>
        </svg>
      </div>
    </div>
  );
}
