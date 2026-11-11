"use client";

import * as React from "react";

export interface LanyardLink {
  label: string;
  href: string;
}

export interface LanyardMember {
  id: string;
  /** Accessible name, printed on both faces of the badge. */
  name: string;
  role: string;
  /** Company or team line printed under the role, e.g. "Acme · Design". */
  team?: string;
  /** Portrait, cropped to a circle. A square image works best. */
  image: string;
  /** One or two sentences printed on the back. */
  bio?: string;
  /** Short chips on the back such as "Design systems" or "Since 2021". */
  tags?: string[];
  /** Contact links on the back. */
  links?: LanyardLink[];
  /** Team colour tone. */
  tone?: 1 | 2 | 3 | 4 | 5;
  /** Extra lanyard length in pixels at a badge; it scales with the badge. */
  drop?: number;
}

export interface TeamLanyardRailLabels {
  /** Hint under the name while a badge faces the front. */
  flip: string;
  /** Hint under the name while a badge shows its back. */
  back: string;
  /** Prefix of the carousel dots on narrow screens. */
  show: string;
}

export interface TeamLanyardRailProps extends React.ComponentProps<"section"> {
  items: LanyardMember[];
  eyebrow?: string;
  heading?: string;
  /** Shown under the rail while nobody is selected. */
  caption?: string;
  /** Call to action rendered under the caption. */
  action?: React.ReactNode;
  /** Turns the badges to the front and flips them one by one until the visitor interacts. */
  autoplay?: boolean;
  /** Milliseconds a badge shows its back during autoplay. */
  interval?: number;
  /** Badge facing the front (controlled). */
  active?: number | null;
  onActiveChange?: (index: number | null) => void;
  /** Badge turned to its back (controlled). */
  flipped?: number | null;
  onFlippedChange?: (index: number | null) => void;
  labels?: TeamLanyardRailLabels;
}

const RATIO = 96 / 62;
const EM = 11.2;
const GAP = 0.08;
const PERSPECTIVE = 1000;
const MAX_STRETCH = 70;
const FIRST_DELAY = 1200;
const FLIP_DELAY = 750;
const SWING_K = 26;
const SWING_DAMP = 2.4;
const LAG = 0.12;
const REEL_K = 220;
const REEL_ZETA = 0.52;
const REST_Y = [7, -8, 6, -7, 8, -6, 7, -8, 6];
const REST_Z = [-1.4, 1.2, -1.6, 1.4, -1.2, 1.5, -1.3, 1.6, -1.2];
const DROPS = [4, 16, 0, 10, 18, 2, 14, 8, 12];

const DEFAULT_LABELS: TeamLanyardRailLabels = {
  flip: "Klik kartu atau tekan Enter untuk melihat detail punggung ID Card",
  back: "Klik lagi atau tekan Esc untuk membalik ke kartu depan",
  show: "Lihat",
};

const METAL = "linear-gradient(to right, #475569, #cbd5e1 38%, #64748b 70%, #334155)";
const PLASTIC = "linear-gradient(180deg, #e2e8f0, #94a3b8)";

function clamp(value: number, min: number, max: number) {
  return Math.max(min, Math.min(max, value));
}

function hash(text: string) {
  let h = 2166136261;
  for (let i = 0; i < text.length; i++) {
    h ^= text.charCodeAt(i);
    h = Math.imul(h, 16777619);
  }
  return h >>> 0;
}

function random(seed: number) {
  let a = seed || 1;
  return () => {
    a = (a + 0x6d2b79f5) | 0;
    let t = Math.imul(a ^ (a >>> 15), 1 | a);
    t = (t + Math.imul(t ^ (t >>> 7), 61 | t)) ^ t;
    return ((t ^ (t >>> 14)) >>> 0) / 4294967296;
  };
}

function qrPath(seed: number) {
  const size = 21;
  const next = random(seed);
  const corners = [[0, 0], [size - 7, 0], [0, size - 7]];
  let d = "";
  for (let y = 0; y < size; y++) {
    for (let x = 0; x < size; x++) {
      const corner = corners.find(([cx = 0, cy = 0]) => x >= cx && x < cx + 7 && y >= cy && y < cy + 7);
      const quiet = (x < 8 && y < 8) || (x >= size - 8 && y < 8) || (x < 8 && y >= size - 8);
      let on: boolean;
      if (corner) on = Math.max(Math.abs(x - (corner[0] ?? 0) - 3), Math.abs(y - (corner[1] ?? 0) - 3)) !== 2;
      else if (quiet) on = false;
      else if (x === 6 || y === 6) on = (x + y) % 2 === 0;
      else on = next() > 0.52;
      if (on) d += `M${x} ${y}h1v1h-1z`;
    }
  }
  return d;
}

function barcode(seed: number) {
  const next = random(seed ^ 0x9e3779b9);
  let x = 0;
  let d = "";
  while (x < 92) {
    const w = 1 + Math.floor(next() * 3);
    d += `M${x} 0h${w}v20h-${w}z`;
    x += w + 1 + Math.floor(next() * 2.2);
  }
  return { d, width: x };
}

function soft(distance: number, max: number) {
  const knee = max * 0.75;
  if (distance <= knee) return distance;
  return knee + (max - knee) * (1 - Math.exp(-(distance - knee) / (max - knee)));
}

/**
 * Calculates responsive width and pitch:
 * At laptop screen (~1024px - 1440px), exactly up to 4 ID cards fit in view!
 */
function getLayoutMetrics(stageWidth: number) {
  let W: number;
  if (stageWidth >= 1100) {
    W = 225;
  } else if (stageWidth >= 900) {
    W = 210;
  } else if (stageWidth >= 640) {
    W = 195;
  } else {
    W = clamp(Math.round(stageWidth * 0.72), 175, 205);
  }
  const pitch = Math.round(W * 1.24);
  return { W, pitch };
}

function geometry(W: number, items: LanyardMember[]) {
  const u = W / 220; // normalized to standard card width
  const H = W * RATIO;
  const railR = Math.max(4, 5 * u);
  const railY = 16 + railR;
  const ring = 10 * u;
  const pivotY = railY + ring * 0.8;
  const strapW = Math.max(12, 16 * u);
  const crimp = 8 * u;
  const reel = 26 * u;
  const cordRest = 14 * u;
  const clipH = 15 * u;
  const clipW = 34 * u;
  const base = 56 * u;
  const straps = items.map((item, i) => base + Math.max(0, item.drop ?? DROPS[i % DROPS.length] ?? 0) * u);
  const reelTops = straps.map((len) => pivotY + len + crimp * 0.6);
  const clipTops = reelTops.map((top) => top + reel * 0.82 + cordRest);
  const cardTops = clipTops.map((top) => top + clipH * 0.62);
  const pendulum = cardTops.map((top) => top + H / 2 - pivotY);
  const restLength = pivotY + base + crimp * 0.6 + reel * 0.82 + cordRest + clipH * 0.62 + H / 2 - pivotY;
  const bottom = Math.max(0, ...cardTops.map((top) => top + H));
  return {
    W, H, u, railR, railY, ring, pivotY, strapW, crimp, reel, cordRest, clipH, clipW, straps, reelTops, clipTops, cardTops, pendulum,
    swingK: pendulum.map((len) => (SWING_K * restLength) / len),
    couple: pendulum.map((len) => (0.22 * 57.3) / len),
    maxStretch: Math.round(MAX_STRETCH * Math.min(1.2, W / 200)),
    height: Math.ceil(bottom + 20 * u + 10),
  };
}

type Sim = {
  x: number[]; vx: number[]; px: number[]; tx: number[];
  sw: number[]; vsw: number[]; beta: number[];
  ry: number[]; vry: number[]; tr: number[];
  rz: number[]; vrz: number[]; tz: number[];
  lift: number[]; vlift: number[]; tl: number[];
  pop: number[]; vpop: number[]; tp: number[];
  st: number[]; vst: number[];
  drag: number; grab: number; pull: number; free: number; last: number; raf: number;
};

function emptySim(): Sim {
  return {
    x: [], vx: [], px: [], tx: [], sw: [], vsw: [], beta: [], ry: [], vry: [], tr: [], rz: [], vrz: [], tz: [],
    lift: [], vlift: [], tl: [], pop: [], vpop: [], tp: [], st: [], vst: [],
    drag: -1, grab: 0, pull: -1, free: 0, last: 0, raf: 0,
  };
}

function spring(value: number[], velocity: number[], target: number, i: number, k: number, zeta: number, h: number) {
  const v = velocity[i] ?? 0;
  const x = value[i] ?? 0;
  const next = v + (-k * (x - target) - 2 * zeta * Math.sqrt(k) * v) * h;
  velocity[i] = next;
  value[i] = x + next * h;
}

function LinkIcon({ label }: { label: string }) {
  const l = label.toLowerCase();
  if (l.includes("github")) {
    return (
      <svg aria-hidden="true" viewBox="0 0 16 16" className="size-[1.1em] shrink-0 fill-current">
        <path d="M8 0C3.58 0 0 3.58 0 8a8 8 0 0 0 5.47 7.59c.4.07.55-.17.55-.38 0-.19-.01-.82-.01-1.49-2.01.37-2.53-.49-2.69-.94-.09-.23-.48-.94-.82-1.13-.28-.15-.68-.52-.01-.53.63-.01 1.08.58 1.23.82.72 1.21 1.87.87 2.33.66.07-.52.28-.87.51-1.07-1.78-.2-3.64-.89-3.64-3.95 0-.87.31-1.59.82-2.15-.08-.2-.36-1.02.08-2.12 0 0 .67-.21 2.2.82.64-.18 1.32-.27 2-.27.68 0 1.36.09 2 .27 1.53-1.04 2.2-.82 2.2-.82.44 1.1.16 1.92.08 2.12.51.56.82 1.27.82 2.15 0 3.07-1.87 3.75-3.65 3.95.29.25.54.73.54 1.48 0 1.07-.01 1.93-.01 2.2 0 .21.15.46.55.38A8.01 8.01 0 0 0 16 8c0-4.42-3.58-8-8-8Z" />
      </svg>
    );
  }
  return (
    <svg aria-hidden="true" viewBox="0 0 16 16" className="size-[1.1em] shrink-0 fill-none stroke-current stroke-[1.75]">
      <path d="M6 3.5H3.5a2 2 0 0 0-2 2v7a2 2 0 0 0 2 2h7a2 2 0 0 0 2-2V10" strokeLinecap="round" strokeLinejoin="round" />
      <path d="M9.5 1.5h5v5" strokeLinecap="round" strokeLinejoin="round" />
      <path d="M14.5 1.5 7 9" strokeLinecap="round" />
    </svg>
  );
}

const LINK_ROW = "inline-flex items-center gap-[0.3em] rounded-[0.4em] px-[0.3em] py-[0.14em] text-[0.68em] font-medium leading-tight";

function Band({ tall }: { tall?: boolean }) {
  return (
    <span
      aria-hidden="true"
      className={`absolute inset-x-0 top-0 block overflow-hidden ${tall ? "h-[4.4em]" : "h-[2.2em]"}`}
      style={{
        background: "linear-gradient(165deg, #050f1d 0%, #081a34 50%, #061325 100%)"
      }}
    >
      {/* Repeating Islamic/Geometric Watermark Pattern matching card back */}
      <svg className="absolute inset-0 size-full opacity-[0.14] pointer-events-none" xmlns="http://www.w3.org/2000/svg">
        <defs>
          <pattern id="band-card-pattern" width="24" height="24" patternUnits="userSpaceOnUse">
            <path d="M12 0L14.5 9.5L24 12L14.5 14.5L12 24L9.5 14.5L0 12L9.5 9.5Z" fill="white" />
            <circle cx="12" cy="12" r="2" fill="none" stroke="white" strokeWidth="0.8" />
            <circle cx="0" cy="0" r="1.2" fill="white" />
            <circle cx="24" cy="0" r="1.2" fill="white" />
            <circle cx="0" cy="24" r="1.2" fill="white" />
            <circle cx="24" cy="24" r="1.2" fill="white" />
          </pattern>
        </defs>
        <rect width="100%" height="100%" fill="url(#band-card-pattern)" />
      </svg>
      <span className="absolute inset-x-0 bottom-0 h-px bg-blue-900/40" />
    </span>
  );
}

function Hole() {
  return (
    <span
      aria-hidden="true"
      className="absolute left-1/2 top-[0.68em] block h-[0.52em] w-[2.6em] -translate-x-1/2 rounded-full bg-white z-20"
      style={{ boxShadow: "inset 0 0.08em 0.18em rgba(0,0,0,0.5), 0 0.05em 0 rgba(255,255,255,0.4)" }}
    />
  );
}

function Finish() {
  return (
    <>
      <span aria-hidden="true" className="pointer-events-none absolute inset-y-0 -left-1/2 block w-[200%] opacity-65" style={{ background: "linear-gradient(100deg, transparent 40%, rgba(255,255,255,0.3) 48%, rgba(255,255,255,0.08) 52%, transparent 58%)", transform: "translateX(var(--gx, 0%))" }} />
      <span aria-hidden="true" className="pointer-events-none absolute inset-0 block bg-black" style={{ opacity: "var(--shade, 0)" }} />
    </>
  );
}

function Silhouette() {
  return (
    <svg aria-hidden="true" viewBox="0 0 40 40" className="size-full text-slate-400">
      <circle cx="20" cy="15" r="7" fill="currentColor" />
      <path d="M6 38c1.5-8 7-12 14-12s12.5 4 14 12z" fill="currentColor" />
    </svg>
  );
}

const BadgeFaces = React.memo(function BadgeFaces({ item }: { item: LanyardMember }) {
  const seed = React.useMemo(() => hash(`${item.id}:${item.name}`), [item.id, item.name]);
  const bars = React.useMemo(() => barcode(seed), [seed]);
  const digits = String(seed % 1000000000).padStart(9, "0");
  const [failed, setFailed] = React.useState(false);

  return (
    <>
      {/* Front Face of ID Card — First Original Design (White Card, Blue Top Band, Centered Portrait, Barcode) */}
      <span
        data-face="front"
        className="absolute inset-0 flex flex-col items-center overflow-hidden rounded-[0.85em] border border-slate-200 bg-white px-[0.75em] pb-[0.7em] text-slate-900 shadow-md [backface-visibility:hidden] select-none"
        style={{ transform: "translateZ(1px)" }}
      >
        <Band tall />
        <Hole />

        {/* Official IKAPMI Logo & Name on Front Face Header */}
        <div className="relative z-10 mt-[1.35em] flex items-center justify-center gap-1.5 w-full">
          <img src="assets/logo_ikapmi_hd.png" alt="Logo IKAPMI" className="size-[1.3em] object-contain drop-shadow" />
          <span className="text-[0.52em] font-extrabold uppercase tracking-widest text-white drop-shadow">IKAPMI BANDUNG</span>
        </div>

        {/* Officer Portrait (Centered Circular with Shadow & White Ring) */}
        <span className="relative mt-[0.5em] block size-[5.3em] shrink-0 rounded-full bg-white p-[0.2em] shadow-md">
          <span className="relative block size-full overflow-hidden rounded-full bg-slate-100">
            <Silhouette />
            {!failed && (
              <img
                src={item.image}
                alt={item.name}
                draggable={false}
                decoding="async"
                onError={() => setFailed(true)}
                className="pointer-events-none absolute inset-0 block size-full select-none object-cover"
              />
            )}
          </span>
        </span>

        {/* Officer Name & Role */}
        <span className="mt-[0.55em] block w-full truncate text-center text-[1.05em] font-extrabold leading-tight tracking-tight text-slate-900">
          {item.name}
        </span>
        <span className="mt-[0.15em] block w-full truncate text-center text-[0.8em] font-bold leading-snug text-[#0b2140]">
          {item.role}
        </span>
        {item.team && (
          <span className="mt-[0.35em] block w-full truncate text-center text-[0.54em] font-medium uppercase tracking-[0.09em] text-slate-500">
            {item.team}
          </span>
        )}

        {/* Barcode & Digits */}
        <span className="mt-auto block w-full border-t border-dashed border-slate-200 pt-[0.45em]">
          <svg aria-hidden="true" viewBox={`0 0 ${bars.width} 20`} preserveAspectRatio="none" className="block h-[1.45em] w-full text-slate-800">
            <path d={bars.d} fill="currentColor" />
          </svg>
          <span className="mt-[0.2em] block text-center font-mono text-[0.52em] tracking-[0.3em] text-slate-400">
            {digits}
          </span>
        </span>
        <Finish />
      </span>

      {/* Back Face of ID Card — Kept Current Design (Just the IKAPMI Logo on Deep Navy Textured Ground) */}
      <span
        data-face="back"
        className="absolute inset-0 flex flex-col items-center justify-center overflow-hidden rounded-[0.85em] border border-blue-950/60 text-white shadow-2xl [backface-visibility:hidden] select-none"
        style={{
          transform: "rotateY(180deg) translateZ(1px)",
          background: "linear-gradient(165deg, #050f1d 0%, #081a34 50%, #061325 100%)"
        }}
      >
        <Hole />

        {/* Elegant Repeating Geometric Watermark Pattern */}
        <svg className="absolute inset-0 size-full opacity-[0.09] pointer-events-none" xmlns="http://www.w3.org/2000/svg">
          <defs>
            <pattern id="card-back-pattern" width="28" height="28" patternUnits="userSpaceOnUse">
              <path d="M14 0L17 11L28 14L17 17L14 28L11 17L0 14L11 11Z" fill="white" />
              <circle cx="14" cy="14" r="2.5" fill="none" stroke="white" strokeWidth="0.8" />
              <circle cx="0" cy="0" r="1.5" fill="white" />
              <circle cx="28" cy="0" r="1.5" fill="white" />
              <circle cx="0" cy="28" r="1.5" fill="white" />
              <circle cx="28" cy="28" r="1.5" fill="white" />
            </pattern>
          </defs>
          <rect width="100%" height="100%" fill="url(#card-back-pattern)" />
        </svg>

        {/* Centered Large Official IKAPMI Logo */}
        <div className="relative z-10 flex flex-col items-center justify-center p-[1em]">
          <div className="relative flex items-center justify-center">
            {/* Soft ambient radial glow behind logo */}
            <span className="absolute size-[9em] rounded-full bg-blue-500/20 blur-2xl pointer-events-none" />
            <img
              src="assets/logo_ikapmi_hd.png"
              alt="Logo Resmi IKAPMI Regional Bandung"
              draggable={false}
              className="relative size-[7.2em] object-contain drop-shadow-[0_12px_32px_rgba(0,0,0,0.7)] transition-transform duration-300 hover:scale-105"
            />
          </div>
        </div>

        <Finish />
      </span>

      {/* Card 3D Thickness Side Edges */}
      {[0, 1].map((side) => (
        <span
          key={side}
          aria-hidden="true"
          className="absolute inset-y-[0.85em] block w-[2px]"
          style={{
            [side ? "right" : "left"]: 0,
            transform: `translateX(${side ? 1 : -1}px) rotateY(90deg)`,
            background: "#081a34"
          }}
        />
      ))}
    </>
  );
});

export function TeamLanyardRail({
  items,
  eyebrow,
  heading,
  caption,
  action,
  autoplay = false,
  interval = 3200,
  active: activeProp,
  onActiveChange,
  flipped: flippedProp,
  onFlippedChange,
  labels = DEFAULT_LABELS,
  className,
  ...rest
}: TeamLanyardRailProps) {
  const uid = React.useId().replace(/[^a-zA-Z0-9_-]/g, "");
  const count = items.length;
  const stageRef = React.useRef(null as HTMLDivElement | null);
  const slots = React.useRef([] as (HTMLDivElement | null)[]);
  const swings = React.useRef([] as (HTMLSpanElement | null)[]);
  const straps = React.useRef([] as (HTMLSpanElement | null)[]);
  const cords = React.useRef([] as (HTMLSpanElement | null)[]);
  const hangs = React.useRef([] as (HTMLSpanElement | null)[]);
  const buttons = React.useRef([] as (HTMLButtonElement | null)[]);
  const flips = React.useRef([] as (HTMLSpanElement | null)[]);
  const shadows = React.useRef([] as (HTMLSpanElement | null)[]);
  const linkLayers = React.useRef([] as (HTMLDivElement | null)[]);

  const sim = React.useRef(emptySim());
  const [stageWidth, setStageWidth] = React.useState(1200);
  const metrics = React.useMemo(() => getLayoutMetrics(stageWidth), [stageWidth]);
  const { W, pitch } = metrics;

  const [innerActive, setInnerActive] = React.useState(null as number | null);
  const [innerFlipped, setInnerFlipped] = React.useState(null as number | null);
  const [focusIndex, setFocusIndex] = React.useState(0);
  const [reduced, setReduced] = React.useState(false);
  const [playing, setPlaying] = React.useState(autoplay);
  const [scrollX, setScrollX] = React.useState(0);

  const pendingOpen = React.useRef(-1);
  const pointer = React.useRef({
    id: -1,
    index: -1,
    x: 0,
    y: 0,
    mode: "",
    kind: "",
    lastX: 0,
    lastY: 0,
    lastT: 0,
    v: 0,
    startScroll: 0,
    hoverX: 0,
    hoverT: 0,
    hoverHit: -1,
  });

  const valid = (value: number | null | undefined) => (value === null || value === undefined || value < 0 || value >= count ? null : value);
  const active = valid(activeProp !== undefined ? activeProp : innerActive);
  const flipped = valid(flippedProp !== undefined ? flippedProp : innerFlipped);
  const geo = React.useMemo(() => geometry(W, items), [W, items]);

  // Calculate track boundaries
  const startPad = W / 2 + 36;
  const totalContentWidth = startPad + (count - 1) * pitch + W / 2 + 36;
  const maxScroll = Math.max(0, totalContentWidth - stageWidth);

  const scrollRef = React.useRef({ current: 0, target: 0, max: maxScroll });
  scrollRef.current.max = maxScroll;

  const live = React.useRef({
    active,
    flipped,
    width: stageWidth,
    W,
    pitch,
    startPad,
    maxScroll,
    geo,
    reduced,
    count,
    activeControlled: false,
    flippedControlled: false
  });
  live.current = {
    ...live.current,
    active,
    flipped,
    width: stageWidth,
    W,
    pitch,
    startPad,
    maxScroll,
    geo,
    reduced,
    count,
    activeControlled: activeProp !== undefined,
    flippedControlled: flippedProp !== undefined
  };

  const callbacks = React.useRef({ onActiveChange, onFlippedChange });
  callbacks.current = { onActiveChange, onFlippedChange };

  const setActive = React.useCallback((index: number | null) => {
    const L = live.current;
    if (L.active === index) return;
    L.active = index;
    if (!L.activeControlled) setInnerActive(index);
    callbacks.current.onActiveChange?.(index);
  }, []);

  const setFlipped = React.useCallback((index: number | null) => {
    const L = live.current;
    if (L.flipped === index) return;
    L.flipped = index;
    if (!L.flippedControlled) setInnerFlipped(index);
    callbacks.current.onFlippedChange?.(index);
  }, []);

  React.useEffect(() => {
    const media = window.matchMedia("(prefers-reduced-motion: reduce)");
    const update = () => setReduced(media.matches);
    update();
    media.addEventListener("change", update);
    return () => media.removeEventListener("change", update);
  }, []);

  React.useEffect(() => { setPlaying(autoplay); }, [autoplay]);

  React.useLayoutEffect(() => {
    const stage = stageRef.current;
    if (!stage) return;
    const measure = (width: number) => {
      setStageWidth((old) => (Math.abs(old - width) < 1 ? old : width));
    };
    measure(stage.clientWidth);
    const observer = new ResizeObserver((entries) => {
      const box = entries[0];
      if (box) measure(box.contentRect.width);
    });
    observer.observe(stage);
    return () => observer.disconnect();
  }, []);

  const paint = React.useCallback((i: number) => {
    const s = sim.current;
    const g = live.current.geo;
    const slot = slots.current[i];
    if (!slot) return;
    slot.style.transform = `translate3d(${((s.x[i] ?? 0) - g.W / 2).toFixed(2)}px,0,0)`;
    const sw = s.sw[i] ?? 0;
    const swing = swings.current[i];
    if (swing) swing.style.transform = `rotate(${sw.toFixed(3)}deg)`;
    const st = s.st[i] ?? 0;
    straps.current[i]?.style.setProperty("--stretch", `${st.toFixed(2)}px`);
    const cord = cords.current[i];
    if (cord) cord.style.transform = `scaleY(${Math.max(0.12, (g.cordRest + st) / g.cordRest).toFixed(4)})`;
    const lift = s.lift[i] ?? 0;
    const pop = s.pop[i] ?? 0;
    const hang = hangs.current[i];
    if (hang) hang.style.transform = `translate3d(0,${(st - 4 * lift).toFixed(2)}px,0) rotate(${((s.beta[i] ?? 0) - sw + (s.rz[i] ?? 0)).toFixed(3)}deg) scale(${(1 + 0.08 * pop).toFixed(4)})`;
    const ry = s.ry[i] ?? 0;
    const flip = flips.current[i];
    const facing = Math.abs(Math.cos((ry * Math.PI) / 180));
    if (flip) {
      flip.style.transform = `perspective(${PERSPECTIVE}px) rotateY(${ry.toFixed(2)}deg)`;
      flip.style.setProperty("--shade", ((1 - facing) * 0.45).toFixed(3));
      const phi = ((((ry + 90) % 180) + 180) % 180) - 90;
      flip.style.setProperty("--gx", `${(phi * 0.9).toFixed(1)}%`);
    }
    const shadow = shadows.current[i];
    if (shadow) {
      shadow.style.transform = `translate3d(${(g.W * 0.045 + lift * 3 * g.u).toFixed(2)}px,${(g.H * 0.03 + lift * 7 * g.u).toFixed(2)}px,0) scale(${(Math.max(0.12, facing) * (1 + 0.03 * lift + 0.05 * pop)).toFixed(3)},${(1 + 0.03 * lift + 0.05 * pop).toFixed(3)})`;
      shadow.style.opacity = (0.72 + 0.28 * lift).toFixed(3);
    }
    const layer = linkLayers.current[i];
    const on = !!layer && Math.abs(ry - 180) < (layer.style.visibility === "visible" ? 24 : 9);
    if (layer) {
      layer.style.opacity = on ? "1" : "0";
      layer.style.visibility = on ? "visible" : "hidden";
    }
    flip?.style.setProperty("--drawn", on ? "0" : "1");
  }, []);

  const step = React.useCallback((now: number) => {
    const s = sim.current;
    const L = live.current;
    const n = L.count;
    const g = L.geo;
    const dt = s.last ? Math.min(0.1, (now - s.last) / 1000) : 1 / 60;
    s.last = now;
    const sub = Math.max(3, Math.ceil(dt / 0.006));
    const h = dt / sub;
    let busy = false;

    // Smoothly interpolate scroll target
    const scroll = scrollRef.current;
    const scrollDiff = scroll.target - scroll.current;
    if (Math.abs(scrollDiff) > 0.15) {
      scroll.current += scrollDiff * 0.16;
      busy = true;
    } else {
      scroll.current = scroll.target;
    }

    // Update target positions for each badge based on scroll
    for (let i = 0; i < n; i++) {
      s.tx[i] = L.startPad + i * L.pitch - scroll.current;
    }

    for (let k = 0; k < sub; k++) {
      for (let i = 0; i < n; i++) {
        const before = s.vx[i] ?? 0;
        if (i !== s.drag) {
          const restoring = now > s.free;
          const ax = restoring ? -130 * ((s.x[i] ?? 0) - (s.tx[i] ?? 0)) - 2 * Math.sqrt(130) * 0.86 * before : -3.2 * before;
          s.vx[i] = before + ax * h;
          s.x[i] = (s.x[i] ?? 0) + (s.vx[i] ?? 0) * h;
        }
      }

      for (let i = 0; i < n; i++) {
        const dv = (s.vx[i] ?? 0) - (s.px[i] ?? 0);
        s.px[i] = s.vx[i] ?? 0;
        if (i !== s.pull) {
          const sw = s.sw[i] ?? 0;
          const vsw = clamp((s.vsw[i] ?? 0) + (g.couple[i] ?? 0.07) * clamp(dv, -900, 900), -90, 90);
          const next = vsw + (-(g.swingK[i] ?? SWING_K) * sw - SWING_DAMP * vsw) * h;
          s.vsw[i] = next;
          s.sw[i] = clamp(sw + next * h, -18, 18);
        }
        s.beta[i] = (s.beta[i] ?? 0) + ((s.sw[i] ?? 0) - (s.beta[i] ?? 0)) * Math.min(1, h / LAG);
        spring(s.ry, s.vry, s.tr[i] ?? 0, i, 170, 0.62, h);
        spring(s.rz, s.vrz, s.tz[i] ?? 0, i, 120, 0.8, h);
        spring(s.lift, s.vlift, s.tl[i] ?? 0, i, 200, 0.75, h);
        spring(s.pop, s.vpop, s.tp[i] ?? 0, i, 160, 0.55, h);
        if (i !== s.pull) {
          spring(s.st, s.vst, 0, i, REEL_K, REEL_ZETA, h);
          s.st[i] = Math.max(-g.cordRest * 0.85, s.st[i] ?? 0);
        }
      }
    }

    for (let i = 0; i < n; i++) {
      paint(i);
      if (
        Math.abs(s.vx[i] ?? 0) > 0.4 || (now > s.free && Math.abs((s.x[i] ?? 0) - (s.tx[i] ?? 0)) > 0.25) ||
        Math.abs((s.ry[i] ?? 0) - (s.tr[i] ?? 0)) > 0.05 || Math.abs(s.vry[i] ?? 0) > 0.05 ||
        Math.abs((s.rz[i] ?? 0) - (s.tz[i] ?? 0)) > 0.02 || Math.abs(s.vrz[i] ?? 0) > 0.05 ||
        Math.abs((s.lift[i] ?? 0) - (s.tl[i] ?? 0)) > 0.002 || Math.abs(s.vlift[i] ?? 0) > 0.01 ||
        Math.abs((s.pop[i] ?? 0) - (s.tp[i] ?? 0)) > 0.002 || Math.abs(s.vpop[i] ?? 0) > 0.01 ||
        Math.abs(s.sw[i] ?? 0) > 0.02 || Math.abs(s.vsw[i] ?? 0) > 0.05 || Math.abs((s.beta[i] ?? 0) - (s.sw[i] ?? 0)) > 0.01 ||
        Math.abs(s.st[i] ?? 0) > 0.05 || Math.abs(s.vst[i] ?? 0) > 0.1
      ) busy = true;
    }

    if (s.drag >= 0 || s.pull >= 0 || now < s.free) busy = true;

    if (busy) {
      s.raf = requestAnimationFrame(step);
    } else {
      s.raf = 0;
      s.last = 0;
      for (let i = 0; i < n; i++) {
        if (now > s.free) { s.x[i] = s.tx[i] ?? 0; s.vx[i] = 0; s.px[i] = 0; }
        s.sw[i] = 0; s.vsw[i] = 0; s.beta[i] = 0; s.st[i] = 0; s.vst[i] = 0;
        s.ry[i] = s.tr[i] ?? 0; s.vry[i] = 0; s.rz[i] = s.tz[i] ?? 0; s.vrz[i] = 0;
        s.lift[i] = s.tl[i] ?? 0; s.vlift[i] = 0; s.pop[i] = s.tp[i] ?? 0; s.vpop[i] = 0;
        paint(i);
      }
    }
  }, [paint]);

  const kick = React.useCallback(() => {
    const s = sim.current;
    if (live.current.reduced) {
      cancelAnimationFrame(s.raf);
      s.raf = 0;
      const scroll = scrollRef.current;
      scroll.current = scroll.target;
      for (let i = 0; i < live.current.count; i++) {
        s.tx[i] = live.current.startPad + i * live.current.pitch - scroll.current;
        s.x[i] = s.tx[i] ?? 0;
        paint(i);
      }
      return;
    }
    if (!s.raf) {
      s.last = 0;
      s.raf = requestAnimationFrame(step);
    }
  }, [step, paint]);

  // Update layout when metrics, active, flipped change
  React.useLayoutEffect(() => {
    const s = sim.current;
    const L = live.current;
    const fresh = s.x.length !== count;
    for (let i = 0; i < count; i++) {
      const tx = L.startPad + i * L.pitch - scrollRef.current.current;
      s.tx[i] = tx;
      const front = flipped === i || active === i;
      s.tr[i] = flipped === i ? 180 : active === i ? 0 : REST_Y[i % REST_Y.length] ?? 0;
      s.tz[i] = front ? 0 : REST_Z[i % REST_Z.length] ?? 0;
      s.tl[i] = front ? 1 : 0;
      s.tp[i] = flipped === i ? 1 : 0;
      if (fresh) {
        s.x[i] = tx; s.vx[i] = 0; s.px[i] = 0; s.sw[i] = 0; s.vsw[i] = 0; s.beta[i] = 0; s.st[i] = 0; s.vst[i] = 0;
        s.ry[i] = s.tr[i] ?? 0; s.vry[i] = 0; s.rz[i] = s.tz[i] ?? 0; s.vrz[i] = 0;
        s.lift[i] = s.tl[i] ?? 0; s.vlift[i] = 0; s.pop[i] = s.tp[i] ?? 0; s.vpop[i] = 0;
      }
    }
    for (const key of ["x", "vx", "px", "tx", "sw", "vsw", "beta", "ry", "vry", "tr", "rz", "vrz", "tz", "lift", "vlift", "tl", "pop", "vpop", "tp", "st", "vst"] as const) {
      s[key].length = count;
    }
    if (fresh) for (let i = 0; i < count; i++) paint(i);
    kick();
  }, [W, pitch, stageWidth, active, flipped, count, paint, kick]);

  const stop = React.useCallback(() => setPlaying(false), []);

  const scrollToCard = React.useCallback((index: number) => {
    const L = live.current;
    const cardCenter = L.startPad + index * L.pitch;
    const target = clamp(cardCenter - L.width / 2, 0, scrollRef.current.max);
    scrollRef.current.target = target;
    setScrollX(target);
    kick();
  }, [kick]);

  const scrollByCards = React.useCallback((num: number) => {
    const L = live.current;
    const target = clamp(scrollRef.current.target + num * L.pitch, 0, scrollRef.current.max);
    scrollRef.current.target = target;
    setScrollX(target);
    kick();
  }, [kick]);

  // Autoplay effect
  React.useEffect(() => {
    if (!playing || reduced || count <= 1) return;
    const timer = window.setInterval(() => {
      setActive((old) => {
        const next = old === null ? 0 : (old + 1) % count;
        scrollToCard(next);
        return next;
      });
    }, interval);
    return () => window.clearInterval(timer);
  }, [playing, reduced, count, interval, setActive, scrollToCard]);

  // Escape key turns back flipped badge
  React.useEffect(() => {
    if (flipped === null) return;
    const onKey = (event: KeyboardEvent) => {
      if (event.key !== "Escape" || event.defaultPrevented) return;
      setFlipped(null);
    };
    document.addEventListener("keydown", onKey);
    return () => document.removeEventListener("keydown", onKey);
  }, [flipped, setFlipped]);

  const toggle = React.useCallback((index: number) => {
    stop();
    const next = live.current.flipped === index ? null : index;
    if (next !== null) {
      setActive(index);
      // Ensure clicked card is in full view
      const L = live.current;
      const cardLeft = L.startPad + index * L.pitch - L.W / 2;
      const cardRight = cardLeft + L.W;
      const viewLeft = scrollRef.current.target;
      const viewRight = viewLeft + L.width;
      if (cardLeft < viewLeft + 20) {
        scrollRef.current.target = clamp(cardLeft - 40, 0, scrollRef.current.max);
        setScrollX(scrollRef.current.target);
        kick();
      } else if (cardRight > viewRight - 20) {
        scrollRef.current.target = clamp(cardRight - L.width + 40, 0, scrollRef.current.max);
        setScrollX(scrollRef.current.target);
        kick();
      }
    }
    setFlipped(next);
  }, [stop, setActive, setFlipped, kick]);

  const nearest = (clientX: number, clientY: number) => {
    const stage = stageRef.current;
    if (!stage) return null;
    const box = stage.getBoundingClientRect();
    const x = clientX - box.left;
    const y = clientY - box.top;
    const g = live.current.geo;
    const s = sim.current;
    if (y < g.railY - 12) return null;
    let best = null as number | null;
    let distance = Infinity;
    for (let i = 0; i < live.current.count; i++) {
      if (y > (g.cardTops[i] ?? 0) + g.H + Math.max(0, s.st[i] ?? 0) + 8) continue;
      const d = Math.abs(x - (s.x[i] ?? 0));
      if (d < g.W / 2 + 10 && d < distance) {
        best = i;
        distance = d;
      }
    }
    return best;
  };

  const onPointerDown = (event: React.PointerEvent) => {
    if (event.button !== 0) return;
    const hit = nearest(event.clientX, event.clientY);
    const now = performance.now();
    pendingOpen.current = -1;
    pointer.current = {
      id: event.pointerId,
      index: hit ?? -1,
      x: event.clientX,
      y: event.clientY,
      mode: "",
      kind: event.pointerType,
      lastX: event.clientX,
      lastY: event.clientY,
      lastT: now,
      v: 0,
      startScroll: scrollRef.current.target,
      hoverX: event.clientX,
      hoverT: now,
      hoverHit: -1,
    };
  };

  const onPointerMove = (event: React.PointerEvent) => {
    const p = pointer.current;
    const s = sim.current;
    const L = live.current;
    const stage = stageRef.current;
    const now = performance.now();

    if (p.id === event.pointerId && stage) {
      const dx = event.clientX - p.x;
      const dy = event.clientY - p.y;
      if (!p.mode && Math.hypot(dx, dy) > 7) {
        if (Math.abs(dy) > Math.abs(dx) && p.index >= 0 && dy > 0) {
          p.mode = "pull";
          s.pull = p.index;
        } else {
          p.mode = "scroll";
        }
        stop();
        if (stage.isConnected) stage.setPointerCapture(event.pointerId);
      }

      const elapsed = Math.max(1, now - p.lastT);
      p.v = p.v * 0.6 + ((event.clientX - p.lastX) / elapsed) * 0.4;
      p.lastX = event.clientX;
      p.lastY = event.clientY;
      p.lastT = now;

      if (p.mode === "pull") {
        const i = p.index;
        s.st[i] = soft(Math.max(0, dy), L.geo.maxStretch);
        s.vst[i] = 0;
        const angle = clamp((-Math.atan2(dx, (L.geo.pendulum[i] ?? 200) + (s.st[i] ?? 0)) * 180) / Math.PI, -16, 16);
        s.vsw[i] = ((angle - (s.sw[i] ?? 0)) / elapsed) * 1000 * 0.5;
        s.sw[i] = angle;
        if (L.reduced) paint(i);
        else kick();
      } else if (p.mode === "scroll") {
        const nextScroll = clamp(p.startScroll - dx, 0, scrollRef.current.max);
        scrollRef.current.target = nextScroll;
        setScrollX(nextScroll);
        kick();
      }
      return;
    }

    if (event.pointerType !== "mouse" || p.id >= 0) return;
    const hit = nearest(event.clientX, event.clientY);
    p.hoverX = event.clientX;
    p.hoverT = now;
    if (hit !== null && hit !== L.active) {
      setActive(hit);
    }
  };

  const finishPointer = (event: React.PointerEvent, cancelled: boolean) => {
    const p = pointer.current;
    if (p.id !== event.pointerId) return;
    const s = sim.current;
    const L = live.current;
    const stage = stageRef.current;
    if (stage?.hasPointerCapture(event.pointerId)) stage.releasePointerCapture(event.pointerId);
    pointer.current = { ...p, id: -1 };

    if (p.mode === "pull") {
      const i = s.pull;
      s.pull = -1;
      if (L.reduced) {
        s.st[i] = 0; s.vst[i] = 0; s.sw[i] = 0; s.vsw[i] = 0; s.beta[i] = 0; paint(i);
      } else {
        kick();
      }
      return;
    }

    if (p.mode === "scroll") {
      const fling = clamp(-p.v * 180, -L.pitch * 2, L.pitch * 2);
      const nextScroll = clamp(scrollRef.current.target + fling, 0, scrollRef.current.max);
      scrollRef.current.target = nextScroll;
      setScrollX(nextScroll);
      kick();
      return;
    }

    if (cancelled || p.mode || p.index < 0) return;
    stop();
    toggle(p.index);
  };

  const onWheel = (event: React.WheelEvent) => {
    const dx = Math.abs(event.deltaX) > 0 ? event.deltaX : (event.shiftKey ? event.deltaY : 0);
    if (Math.abs(dx) > 0) {
      event.preventDefault();
      stop();
      const next = clamp(scrollRef.current.target + dx * 1.25, 0, scrollRef.current.max);
      scrollRef.current.target = next;
      setScrollX(next);
      kick();
    }
  };

  const onKeyDown = (event: React.KeyboardEvent) => {
    const L = live.current;
    if (event.key === "Escape") {
      if (L.flipped !== null) { event.preventDefault(); setFlipped(null); }
      return;
    }
    if (!["ArrowRight", "ArrowLeft", "Home", "End"].includes(event.key)) return;
    event.preventDefault();
    stop();
    const from = L.active ?? focusIndex;
    const next = event.key === "Home" ? 0 : event.key === "End" ? L.count - 1 : clamp(from + (event.key === "ArrowRight" ? 1 : -1), 0, L.count - 1);
    setActive(next);
    scrollToCard(next);
    buttons.current[next]?.focus({ preventScroll: true });
  };

  const g = geo;
  const base = W / EM;
  const current = active ?? flipped;
  const person = current === null ? null : items[current] ?? null;
  const showingBack = current !== null && current === flipped;
  const line1 = person ? `${person.name} — ${person.role}` : caption;
  const line2 = person ? (showingBack ? labels.back : labels.flip) : "";

  return (
    <div
      {...rest}
      data-slot="team-lanyard-rail"
      data-mode="rail"
      data-active={active ?? ""}
      data-flipped={flipped ?? ""}
      className={`relative isolate w-full select-none ${className ?? ""}`}
    >
      {/* Interactive Rail Stage */}
      <div
        ref={stageRef}
        data-stage
        role="group"
        aria-label={heading ?? "Struktur Kepengurusan IKAPMI"}
        aria-roledescription="lanyard rail"
        className="relative mt-2 w-full touch-pan-y select-none cursor-grab active:cursor-grabbing"
        style={{ height: g.height, overflowX: "clip" }}
        onPointerMove={onPointerMove}
        onPointerDown={onPointerDown}
        onPointerUp={(event) => finishPointer(event, false)}
        onPointerCancel={(event) => finishPointer(event, true)}
        onWheel={onWheel}
        onKeyDown={onKeyDown}
      >
        {/* Metallic Hanging Rail Bar */}
        <div aria-hidden="true" data-rail className="pointer-events-none absolute inset-x-0 z-0" style={{ top: g.railY - g.railR, height: g.railR * 2 }}>
          <div className="absolute inset-x-0 h-3 rounded-full bg-slate-400/20 blur-[5px]" style={{ top: g.railR * 2 + 2 }} />
          <div className="absolute inset-0 rounded-full" style={{ background: "linear-gradient(to bottom, #f1f5f9 0%, #ffffff 20%, #cbd5e1 40%, #94a3b8 64%, #475569 100%)", boxShadow: "0 1px 2px rgba(0,0,0,0.12)" }} />
          <div className="absolute inset-0 rounded-full opacity-40 mix-blend-overlay" style={{ background: "repeating-linear-gradient(90deg, transparent 0 2px, rgba(255,255,255,0.4) 2px 3px, transparent 3px 7px)" }} />
          {[0, 1].map((side) => (
            <div key={side} className="absolute top-1/2 h-8 w-4 -translate-y-1/2 rounded-[3px]" style={{ [side ? "right" : "left"]: 6, background: "linear-gradient(to right, #e2e8f0, #94a3b8, #475569)", boxShadow: "0 3px 6px rgba(0,0,0,0.15)" }}>
              <span className="absolute left-1/2 top-1.5 size-1 -translate-x-1/2 rounded-full bg-slate-700/40" />
              <span className="absolute bottom-1.5 left-1/2 size-1 -translate-x-1/2 rounded-full bg-slate-700/40" />
            </div>
          ))}
        </div>

        {/* Lanyard Badges */}
        {items.map((item, i) => {
          const isActive = active === i;
          const isFlipped = flipped === i;
          const strap = g.straps[i] ?? 0;
          const reelTop = g.reelTops[i] ?? 0;
          const clipTop = g.clipTops[i] ?? 0;
          const cardOffset = (g.cardTops[i] ?? 0) - clipTop;
          const links = (item.links ?? []).slice(0, 3);
          return (
            <div
              key={item.id}
              ref={(node) => { slots.current[i] = node; }}
              data-lanyard={i}
              className="pointer-events-none absolute left-0 top-0"
              style={{ width: W, height: g.height, zIndex: isFlipped ? 40 : isActive ? 30 : 10 + i, transform: `translate3d(${((sim.current.x[i] ?? 0) - W / 2).toFixed(2)}px,0,0)` }}
            >
              {/* Rail Ring */}
              <span aria-hidden="true" className="absolute block rounded-full" style={{ left: W / 2 - 4.5 * g.u, top: g.railY - g.ring, width: 9 * g.u, height: g.ring * 2, border: `${Math.max(1.8, 2.4 * g.u).toFixed(2)}px solid #cbd5e1`, boxShadow: "inset 1px 0 0 rgba(0,0,0,0.25), 1px 1px 2px rgba(0,0,0,0.18)" }} />
              
              {/* Swing Arm */}
              <span ref={(node) => { swings.current[i] = node; }} data-swing className="absolute inset-0 block" style={{ transformOrigin: `${W / 2}px ${g.pivotY}px` }}>
                
                {/* Lanyard Strap with Uniform Royal Blue Ribbon */}
                <span ref={(node) => { straps.current[i] = node; }} data-strap aria-hidden="true" className="absolute inset-0 block" style={{ ["--stretch" as string]: "0px" }}>
                  <span className="absolute block bg-black/15 blur-[2px]" style={{ left: W / 2 - g.strapW / 2 + 3 * g.u, top: g.pivotY + 3, width: g.strapW, height: strap }} />
                  <span
                    className="absolute block"
                    style={{
                      left: W / 2 - g.strapW / 2,
                      top: g.pivotY - 2,
                      width: g.strapW,
                      height: strap + 2,
                      background: [
                        "repeating-linear-gradient(135deg, rgba(255,255,255,0.15) 0 1px, transparent 1px 3px)",
                        "repeating-linear-gradient(45deg, rgba(0,0,0,0.12) 0 1px, transparent 1px 3px)",
                        "linear-gradient(90deg, #050f1d 0%, #081a34 16%, #0f2e59 48%, #081a34 80%, #040c17 100%)",
                      ].join(","),
                    }}
                  >
                    <span className="absolute inset-y-0 left-[1.5px] right-[1.5px] block border-x border-dashed border-white/35" />
                    <span className="absolute inset-x-0 top-0 block bg-black/25" style={{ height: 7 * g.u }} />
                    <span className="absolute inset-x-[2px] block border-t border-dashed border-white/45" style={{ top: 9 * g.u }} />
                  </span>
                  
                  {/* Metal loop */}
                  <svg aria-hidden="true" className="absolute overflow-visible" style={{ left: W / 2 - g.strapW * 0.75, top: g.pivotY - 4 * g.u, width: g.strapW * 1.5, height: 8 * g.u }} viewBox="0 0 30 16" preserveAspectRatio="none">
                    <rect x="2" y="3" width="26" height="10" rx="5" fill="none" stroke="#cbd5e1" strokeWidth="3" />
                    <path d="M7 4.5 H23" stroke="white" strokeOpacity="0.6" strokeWidth="1" />
                  </svg>
                  
                  {/* Metal Crimp */}
                  <span className="absolute block rounded-[2px]" style={{ left: W / 2 - g.strapW / 2 - 1.5, top: g.pivotY + strap - g.crimp * 0.4, width: g.strapW + 3, height: g.crimp, background: METAL, boxShadow: "0 1px 1.5px rgba(0,0,0,0.3)" }} />
                  
                  {/* Cord Reel */}
                  <span
                    className="absolute block rounded-full"
                    style={{
                      left: W / 2 - g.reel / 2,
                      top: reelTop,
                      width: g.reel,
                      height: g.reel,
                      background: "radial-gradient(circle at 34% 30%, #13325c 0%, #081a34 52%, #050f1d 100%)",
                      boxShadow: "inset 0 -1px 2px rgba(0,0,0,0.4), 0 2px 3px rgba(0,0,0,0.25)",
                    }}
                  >
                    <span className="absolute inset-[14%] block rounded-full border border-white/20" />
                    <span className="absolute left-1/2 top-1/2 block size-[32%] -translate-x-1/2 -translate-y-1/2 rounded-full" style={{ background: METAL }} />
                  </span>
                  
                  {/* Retractable Cord */}
                  <span ref={(node) => { cords.current[i] = node; }} className="absolute block w-[1.5px] bg-slate-700" style={{ left: W / 2 - 0.75, top: reelTop + g.reel * 0.82, height: g.cordRest, transformOrigin: "50% 0" }} />
                </span>

                {/* Hang Arm (Card + Clip) */}
                <span ref={(node) => { hangs.current[i] = node; }} data-hang className="absolute left-0 block" style={{ top: clipTop, width: W, height: cardOffset + g.H, transformOrigin: `${W / 2}px 0px` }}>
                  
                  {/* Shadow */}
                  <span aria-hidden="true" className="absolute left-0 block" style={{ top: cardOffset, width: W, height: g.H, filter: `blur(${Math.max(4, 8 * g.u).toFixed(1)}px)` }}>
                    <span ref={(node) => { shadows.current[i] = node; }} data-shadow className="absolute inset-0 block rounded-[12px] bg-black/20" />
                  </span>

                  {/* Interactive ID Badge Button */}
                  <button
                    ref={(node) => { buttons.current[i] = node; }}
                    type="button"
                    data-badge={i}
                    data-flipped={isFlipped ? "true" : "false"}
                    data-active={isActive || undefined}
                    tabIndex={i === (active ?? focusIndex) ? 0 : -1}
                    aria-label={`${item.name}, ${item.role}`}
                    aria-describedby={`${uid}-caption`}
                    aria-pressed={isFlipped}
                    className="pointer-events-auto absolute left-0 cursor-pointer rounded-[0.85em] p-0 text-left outline-none focus-visible:ring-2 focus-visible:ring-blue-600 focus-visible:ring-offset-2 transition-transform duration-200 hover:scale-[1.02]"
                    style={{ top: cardOffset, width: W, height: g.H, fontSize: base }}
                    onFocus={() => { setFocusIndex(i); if (pointer.current.id < 0) { stop(); setActive(i); } }}
                    onClick={(event) => { const pending = pendingOpen.current; pendingOpen.current = -1; if (event.detail === 0 || pending === i) toggle(i); }}
                  >
                    <span ref={(node) => { flips.current[i] = node; }} data-flip className="absolute inset-0 block [transform-style:preserve-3d]" style={{ transform: `perspective(${PERSPECTIVE}px) rotateY(${REST_Y[i % REST_Y.length] ?? 0}deg)` }}>
                      <BadgeFaces item={item} />
                    </span>
                  </button>

                  {/* Metal Badge Clip */}
                  <span aria-hidden="true" className="pointer-events-none absolute block" style={{ left: W / 2 - g.clipW / 2, top: 0, width: g.clipW, height: g.clipH + 10 * g.u }}>
                    <span className="absolute left-1/2 block -translate-x-1/2 rounded-b-[2px]" style={{ top: g.clipH * 0.7, width: g.clipW * 0.42, height: cardOffset - g.clipH * 0.7 + 0.72 * base + 0.3 * base, background: PLASTIC }} />
                    <span className="absolute inset-x-0 top-0 block" style={{ height: g.clipH, clipPath: "polygon(24% 0, 76% 0, 100% 72%, 94% 100%, 6% 100%, 0 72%)", background: PLASTIC }} />
                    <span className="absolute block bg-white/60" style={{ left: "30%", right: "30%", top: 1, height: 1 }} />
                    <span className="absolute left-1/2 block -translate-x-1/2 rounded-full bg-white" style={{ top: g.clipH * 0.14, width: g.clipH * 0.34, height: g.clipH * 0.34, boxShadow: "inset 0 1px 1px rgba(0,0,0,0.4)" }} />
                  </span>

                  {/* Back Face Clickable Contact Links */}
                  {isFlipped && links.length > 0 && (
                    <div ref={(node) => { linkLayers.current[i] = node; }} data-links className="pointer-events-none absolute left-0 transition-opacity duration-150" style={{ top: cardOffset, width: W, height: g.H, fontSize: base, opacity: 0, visibility: "hidden" }}>
                      <div className="absolute bottom-[0.75em] left-[0.6em] flex flex-col items-start gap-[0.1em]">
                        {links.map((link) => (
                          <a key={link.label} href={link.href} target="_blank" rel="noopener noreferrer" onPointerDown={(event) => { event.stopPropagation(); stop(); }} onFocus={stop} className={`${LINK_ROW} pointer-events-auto text-slate-800 bg-white/90 hover:bg-blue-50 hover:text-blue-700 shadow-sm border border-slate-200 outline-none`}>
                            <LinkIcon label={link.label} />
                            {link.label}
                          </a>
                        ))}
                      </div>
                    </div>
                  )}

                </span>
              </span>
            </div>
          );
        })}

        {/* Soft edge gradients indicating more content to the right/left */}
        {scrollX > 10 && (
          <div aria-hidden="true" className="pointer-events-none absolute inset-y-0 left-0 z-40 w-16 bg-gradient-to-r from-[#f8faf9] to-transparent transition-opacity" />
        )}
        {scrollX < maxScroll - 10 && (
          <div aria-hidden="true" className="pointer-events-none absolute inset-y-0 right-0 z-40 w-24 bg-gradient-to-l from-[#f8faf9] to-transparent transition-opacity" />
        )}

        {/* Prev / Next Floating Navigation Buttons */}
        {scrollX > 10 && (
          <button
            type="button"
            onClick={(e) => { e.stopPropagation(); scrollByCards(-1); }}
            aria-label="Geser ke kiri"
            className="absolute left-3 top-1/2 -translate-y-1/2 z-50 flex items-center justify-center size-11 rounded-full bg-white/90 hover:bg-white text-slate-800 shadow-xl border border-slate-200/90 backdrop-blur-md transition-all hover:scale-110 active:scale-95 cursor-pointer"
          >
            <svg className="size-5" fill="none" viewBox="0 0 24 24" stroke="currentColor" strokeWidth={2.5}>
              <path strokeLinecap="round" strokeLinejoin="round" d="M15 19l-7-7 7-7" />
            </svg>
          </button>
        )}

        {scrollX < maxScroll - 10 && (
          <button
            type="button"
            onClick={(e) => { e.stopPropagation(); scrollByCards(1); }}
            aria-label="Geser ke kanan"
            className="absolute right-3 top-1/2 -translate-y-1/2 z-50 flex items-center gap-2 pl-3.5 pr-2.5 py-2.5 rounded-full bg-white/95 hover:bg-white text-slate-900 shadow-xl border border-slate-200/90 backdrop-blur-md transition-all hover:scale-105 active:scale-95 cursor-pointer group"
          >
            <span className="text-xs font-bold text-blue-700 hidden sm:inline">Geser</span>
            <div className="flex items-center justify-center size-7 rounded-full bg-[#081a34] text-white hover:bg-[#0c2242] group-hover:bg-blue-800 transition-colors">
              <svg className="size-4" fill="none" viewBox="0 0 24 24" stroke="currentColor" strokeWidth={2.5}>
                <path strokeLinecap="round" strokeLinejoin="round" d="M9 5l7 7-7 7" />
              </svg>
            </div>
          </button>
        )}
      </div>

      {/* Navigation Dots Indicator for all 9 members */}
      {count > 1 && (
        <div className="relative z-10 mt-3 flex justify-center items-center gap-2" role="group" aria-label={labels.show}>
          {items.map((item, i) => {
            const isCurrent = active === i;
            return (
              <button
                key={item.id}
                type="button"
                aria-label={`${labels.show} ${item.name}`}
                aria-current={isCurrent}
                onClick={() => { stop(); scrollToCard(i); setActive(i); }}
                className={`h-2 rounded-full outline-none transition-all duration-300 cursor-pointer ${
                  isCurrent ? "w-7 bg-[#081a34] shadow-sm" : "w-2 bg-slate-300 hover:bg-slate-400"
                }`}
              />
            );
          })}
        </div>
      )}

      {/* Live Badge Caption */}
      <div className="relative z-10 flex flex-col items-center gap-2 px-6 pb-2 pt-2 text-center">
        <div id={`${uid}-caption`} aria-live="polite">
          <p className="text-lg font-bold text-slate-900">{line1}</p>
          {showingBack && person?.bio && <span className="sr-only">{person.bio}</span>}
        </div>
        {action}
      </div>
    </div>
  );
}

export default TeamLanyardRail;
