import * as React from "react";
import { createPortal } from "react-dom";

export interface CoverflowSlide {
  id?: string;
  src: string;
  alt?: string;
  title?: string;
  subtitle?: string;
  meta?: { label: string; value: string }[];
}

export interface CoverflowCarouselProps {
  slides: CoverflowSlide[];
  rotate?: number;
  depth?: number;
  perspective?: number;
  falloff?: number;
  fade?: number;
  cardWidth?: string;
  gap?: number;
  loop?: boolean;
  showCaption?: boolean;
  showPagination?: boolean;
  showNavigation?: boolean;
  autoplay?: boolean;
  autoplayInterval?: number;
  label?: string;
  className?: string;
  cardClassName?: string;
}

export function CoverflowCarousel({
  slides,
  rotate = 44,
  depth = 0.65,
  perspective = 3,
  falloff = 0.56,
  fade = 0.12,
  cardWidth = "clamp(200px, 28vw, 360px)",
  gap = 0.08,
  loop = true,
  showCaption = true,
  showPagination = true,
  showNavigation = true,
  autoplay = true,
  autoplayInterval = 3800,
  label = "Galeri IKAPMI Bandung",
  className = "",
  cardClassName = "",
}: CoverflowCarouselProps) {
  const count = slides.length;
  const containerRef = React.useRef<HTMLDivElement | null>(null);
  const cardRefs = React.useRef<(HTMLDivElement | null)[]>([]);
  const currentPos = React.useRef(0);
  const targetPos = React.useRef(0);
  const cardPixelWidth = React.useRef(280);
  const rafId = React.useRef<number | null>(null);
  const pointerState = React.useRef<{
    id: number;
    x: number;
    pos: number;
    v: number;
    t: number;
    moved: boolean;
  } | null>(null);

  const [activeIndex, setActiveIndex] = React.useState(0);
  const [isPlaying, setIsPlaying] = React.useState(autoplay);
  const [lightboxIndex, setLightboxIndex] = React.useState<number | null>(null);

  const normalizeIndex = React.useCallback(
    (pos: number) => {
      return (Math.round(pos) % count + count) % count;
    },
    [count]
  );

  const updateCardTransforms = React.useCallback(() => {
    const w = cardPixelWidth.current;
    if (!w) return;

    const spacing = w * (1 + gap);
    const curr = currentPos.current;

    cardRefs.current.forEach((el, idx) => {
      if (!el) return;

      let offset = idx - curr;
      if (loop) {
        offset = ((offset % count) + count) % count;
        if (offset > count / 2) offset -= count;
      }

      const absOffset = Math.abs(offset);
      const k = Math.pow(absOffset, falloff);
      const angle = Math.min(rotate * k, 82) * Math.sign(offset);

      el.style.transform = `translateX(calc(-50% + ${offset * spacing}px)) translateZ(${-depth * w * k}px) rotateY(${-angle}deg)`;

      const loopFade = loop ? Math.min(1, Math.max(0, count / 2 - absOffset)) : 1;
      el.style.opacity = String(Math.max(0, 1 - fade * absOffset) * loopFade);
      el.style.zIndex = String(100 - Math.round(absOffset));
    });
  }, [count, depth, fade, falloff, gap, loop, rotate]);

  const smoothScrollTo = React.useCallback(
    (target: number) => {
      if (rafId.current !== null) {
        cancelAnimationFrame(rafId.current);
      }
      targetPos.current = target;
      setActiveIndex(normalizeIndex(target));

      const step = () => {
        const diff = target - currentPos.current;
        if (Math.abs(diff) < 0.0005) {
          currentPos.current = target;
          updateCardTransforms();
          rafId.current = null;
          return;
        }
        currentPos.current += diff * 0.16;
        updateCardTransforms();
        rafId.current = requestAnimationFrame(step);
      };
      rafId.current = requestAnimationFrame(step);
    },
    [normalizeIndex, updateCardTransforms]
  );

  const clampTarget = React.useCallback(
    (val: number) => {
      return loop ? val : Math.max(0, Math.min(count - 1, val));
    },
    [count, loop]
  );

  const goToSlide = React.useCallback(
    (idx: number) => {
      const nearest = loop
        ? idx + Math.round((targetPos.current - idx) / count) * count
        : idx;
      smoothScrollTo(clampTarget(nearest));
    },
    [clampTarget, count, loop, smoothScrollTo]
  );

  const stepSlide = React.useCallback(
    (dir: number) => {
      smoothScrollTo(clampTarget(Math.round(targetPos.current) + dir));
    },
    [clampTarget, smoothScrollTo]
  );

  // Pointer Drag Gestures
  const handlePointerDown = (e: React.PointerEvent) => {
    if (rafId.current !== null) {
      cancelAnimationFrame(rafId.current);
      rafId.current = null;
    }
    e.currentTarget.setPointerCapture(e.pointerId);
    targetPos.current = currentPos.current;
    pointerState.current = {
      id: e.pointerId,
      x: e.clientX,
      pos: currentPos.current,
      v: 0,
      t: performance.now(),
      moved: false,
    };
  };

  const handlePointerMove = (e: React.PointerEvent) => {
    const s = pointerState.current;
    if (!s || s.id !== e.pointerId) return;

    const w = cardPixelWidth.current * (1 + gap);
    if (!w) return;

    const now = performance.now();
    const prevPos = currentPos.current;
    const deltaX = e.clientX - s.x;

    if (Math.abs(deltaX) > 4) {
      s.moved = true;
    }

    currentPos.current = clampTarget(s.pos - deltaX / w);
    s.v = ((currentPos.current - prevPos) / Math.max(now - s.t, 1)) * 1000;
    s.t = now;

    const norm = normalizeIndex(currentPos.current);
    if (norm !== activeIndex) {
      setActiveIndex(norm);
    }
    updateCardTransforms();
  };

  const handlePointerUp = (e: React.PointerEvent) => {
    const s = pointerState.current;
    if (!s || s.id !== e.pointerId) return;
    pointerState.current = null;

    const momentum = Math.max(-2, Math.min(2, s.v * 0.18));
    smoothScrollTo(clampTarget(Math.round(currentPos.current + momentum)));
  };

  // Keyboard navigation
  const handleKeyDown = (e: React.KeyboardEvent) => {
    if (e.key === "ArrowLeft") {
      e.preventDefault();
      stepSlide(-1);
    } else if (e.key === "ArrowRight") {
      e.preventDefault();
      stepSlide(1);
    }
  };

  // Resize Observer to keep layout responsive
  React.useLayoutEffect(() => {
    const container = containerRef.current;
    if (!container) return;

    const measure = () => {
      const firstCard = cardRefs.current[0];
      if (firstCard) {
        cardPixelWidth.current = firstCard.offsetWidth;
        updateCardTransforms();
      }
    };

    measure();
    const ro = new ResizeObserver(measure);
    ro.observe(container);
    return () => ro.disconnect();
  }, [updateCardTransforms]);

  // Autoplay effect
  React.useEffect(() => {
    if (!isPlaying) return;

    const timer = setInterval(() => {
      stepSlide(1);
    }, autoplayInterval);

    return () => clearInterval(timer);
  }, [isPlaying, autoplayInterval, stepSlide]);

  // Clean up RAF on unmount
  React.useEffect(() => {
    return () => {
      if (rafId.current !== null) cancelAnimationFrame(rafId.current);
    };
  }, []);

  const activeSlide = slides[activeIndex];

  return (
    <div
      className={`relative w-full select-none ${className}`}
      style={{ ["--cf-card" as any]: cardWidth }}
      role="region"
      aria-roledescription="carousel"
      aria-label={label}
      onMouseEnter={() => setIsPlaying(false)}
      onMouseLeave={() => setIsPlaying(autoplay)}
    >
      {/* 3D Viewport Stage */}
      <div className="relative">
        <div
          ref={containerRef}
          tabIndex={0}
          onPointerDown={handlePointerDown}
          onPointerMove={handlePointerMove}
          onPointerUp={handlePointerUp}
          onPointerCancel={handlePointerUp}
          onKeyDown={handleKeyDown}
          className="cursor-grab overflow-hidden py-10 sm:py-14 outline-none focus-visible:ring-2 focus-visible:ring-blue-600 active:cursor-grabbing"
          style={{
            perspective: `calc(var(--cf-card) * ${perspective})`,
            touchAction: "pan-y",
          }}
        >
          <div
            className="relative select-none"
            style={{
              height: "var(--cf-card)",
              transformStyle: "preserve-3d",
            }}
          >
            {slides.map((slide, idx) => {
              const isCenter = idx === activeIndex;
              return (
                <div
                  key={slide.id || idx}
                  ref={(el) => {
                    cardRefs.current[idx] = el;
                  }}
                  role="group"
                  aria-roledescription="slide"
                  aria-label={`${idx + 1} of ${count}`}
                  onClick={() => {
                    if (pointerState.current?.moved) return;
                    if (isCenter) {
                      setLightboxIndex(idx);
                    } else {
                      goToSlide(idx);
                    }
                  }}
                  className={`absolute left-1/2 top-0 aspect-[4/3] sm:aspect-square overflow-hidden rounded-2xl sm:rounded-3xl bg-slate-900/10 shadow-[0_15px_35px_rgba(0,0,0,0.18)] border border-white/60 will-change-transform cursor-pointer transition-shadow hover:shadow-[0_20px_45px_rgba(8,26,52,0.28)] group ${cardClassName}`}
                  style={{
                    width: "var(--cf-card)",
                  }}
                >
                  <img
                    src={slide.src}
                    alt={slide.alt || slide.title || `Foto Galeri ${idx + 1}`}
                    draggable={false}
                    loading={Math.abs(idx - activeIndex) < 5 ? "eager" : "lazy"}
                    className="h-full w-full select-none object-cover transition-transform duration-500 group-hover:scale-105"
                  />

                  {/* Gradient overlay on bottom */}
                  <div className="absolute inset-0 bg-gradient-to-t from-black/70 via-black/10 to-transparent opacity-60 group-hover:opacity-80 transition-opacity pointer-events-none" />

                  {/* Center Card Badge / Zoom Hint */}
                  {isCenter && (
                    <div className="absolute top-3 right-3 z-10 flex items-center gap-1.5 px-2.5 py-1 rounded-full bg-black/60 backdrop-blur-md text-white text-[11px] font-medium border border-white/20 shadow-md">
                      <svg className="w-3.5 h-3.5" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                        <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M21 21l-6-6m2-5a7 7 0 11-14 0 7 7 0 0114 0zM10 7v3m0 0v3m0-3h3m-3 0H7" />
                      </svg>
                      <span>Perbesar</span>
                    </div>
                  )}

                  {/* Card Mini Pill Label */}
                  <div className="absolute bottom-3 left-3 right-3 z-10 text-white pointer-events-none">
                    <p className="text-xs font-semibold truncate drop-shadow-md">
                      {slide.title}
                    </p>
                  </div>
                </div>
              );
            })}
          </div>
        </div>

        {/* Prev / Next Floating Navigation Buttons */}
        {showNavigation && (
          <>
            <button
              type="button"
              aria-label="Previous slide"
              onClick={() => stepSlide(-1)}
              className="absolute left-2 sm:left-6 top-1/2 z-[150] -translate-y-1/2 flex items-center justify-center size-11 rounded-full bg-white/90 hover:bg-white text-slate-900 shadow-xl border border-slate-200/80 backdrop-blur-md transition-all hover:scale-110 active:scale-95 cursor-pointer"
            >
              <svg className="size-5" fill="none" viewBox="0 0 24 24" stroke="currentColor" strokeWidth={2.5}>
                <path strokeLinecap="round" strokeLinejoin="round" d="M15 19l-7-7 7-7" />
              </svg>
            </button>
            <button
              type="button"
              aria-label="Next slide"
              onClick={() => stepSlide(1)}
              className="absolute right-2 sm:right-6 top-1/2 z-[150] -translate-y-1/2 flex items-center justify-center size-11 rounded-full bg-white/90 hover:bg-white text-slate-900 shadow-xl border border-slate-200/80 backdrop-blur-md transition-all hover:scale-110 active:scale-95 cursor-pointer"
            >
              <svg className="size-5" fill="none" viewBox="0 0 24 24" stroke="currentColor" strokeWidth={2.5}>
                <path strokeLinecap="round" strokeLinejoin="round" d="M9 5l7 7-7 7" />
              </svg>
            </button>
          </>
        )}
      </div>

      {/* Synchronized Caption & Meta Information */}
      {showCaption && activeSlide && (
        <div className="mt-2 flex flex-col items-center px-4 text-center">
          <div className="inline-flex items-center gap-2 px-3 py-1 rounded-full bg-slate-100 text-slate-700 text-xs font-semibold mb-2 border border-slate-200/70">
            <span>Foto {activeIndex + 1} dari {count}</span>
            <span className="text-slate-300">•</span>
            <span className="text-brand-700 font-bold">
              {activeSlide.meta?.[0]?.value || "Dokumentasi"}
            </span>
          </div>

          <h3 className="text-lg sm:text-2xl font-bold tracking-tight text-slate-900 max-w-xl transition-all duration-300">
            {activeSlide.title}
          </h3>

          {activeSlide.subtitle && (
            <p className="mt-1 text-xs sm:text-sm text-slate-600 max-w-lg">
              {activeSlide.subtitle}
            </p>
          )}

          {/* Quick Category / Info Tags */}
          <div className="mt-4 flex flex-wrap items-center justify-center gap-2">
            {activeSlide.meta?.map((m) => (
              <span
                key={m.label}
                className="inline-flex items-center gap-1.5 px-2.5 py-1 rounded-lg bg-white border border-slate-200 text-[11px] text-slate-600 shadow-sm"
              >
                <span className="font-semibold text-slate-800">{m.label}:</span>
                <span>{m.value}</span>
              </span>
            ))}
          </div>
        </div>
      )}

      {/* Scrub Bar / Pagination Dots */}
      {showPagination && (
        <div className="mt-6 flex flex-col items-center justify-center gap-3 px-4">
          <div className="w-full max-w-md flex items-center gap-2">
            <span className="text-[11px] font-mono text-slate-400">01</span>
            <input
              type="range"
              min={0}
              max={count - 1}
              value={activeIndex}
              onChange={(e) => goToSlide(Number(e.target.value))}
              aria-label="Navigasi cepat galeri"
              className="w-full h-1.5 bg-slate-200 rounded-lg appearance-none cursor-pointer accent-blue-900"
            />
            <span className="text-[11px] font-mono text-slate-400">
              {String(count).padStart(2, "0")}
            </span>
          </div>

          <p className="text-[11px] text-slate-500">
            Geser kartu atau tekan tombol panah <kbd className="px-1.5 py-0.5 rounded bg-slate-100 border border-slate-300 text-[10px]">←</kbd> <kbd className="px-1.5 py-0.5 rounded bg-slate-100 border border-slate-300 text-[10px]">→</kbd> untuk menelusuri momen
          </p>
        </div>
      )}

      {/* High-Resolution Fullscreen Lightbox Modal mounted directly to document.body */}
      {lightboxIndex !== null && typeof document !== "undefined" && createPortal(
        <div
          className="fixed inset-0 flex items-center justify-center bg-black/95 backdrop-blur-md p-4 sm:p-8"
          style={{ zIndex: 9999999 }}
          onClick={() => setLightboxIndex(null)}
        >
          <div
            className="relative max-w-5xl max-h-[90vh] flex flex-col items-center"
            onClick={(e) => e.stopPropagation()}
          >
            {/* Close Button */}
            <button
              type="button"
              onClick={() => setLightboxIndex(null)}
              aria-label="Tutup foto"
              className="absolute -top-12 right-0 sm:-right-4 text-white/80 hover:text-white p-2 rounded-full bg-white/10 hover:bg-white/20 transition-colors cursor-pointer"
            >
              <svg className="size-6" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M6 18L18 6M6 6l12 12" />
              </svg>
            </button>

            {/* Modal Image */}
            <img
              src={slides[lightboxIndex].src}
              alt={slides[lightboxIndex].alt}
              className="max-h-[75vh] w-auto max-w-full rounded-2xl object-contain shadow-2xl border border-white/15"
            />

            {/* Modal Caption */}
            <div className="mt-4 text-center text-white">
              <h4 className="text-base sm:text-lg font-bold">
                {slides[lightboxIndex].title}
              </h4>
              <p className="text-xs text-white/70 mt-1">
                {slides[lightboxIndex].subtitle} ({lightboxIndex + 1} / {count})
              </p>
            </div>

            {/* Modal Prev / Next */}
            <button
              type="button"
              onClick={() => {
                const prev = (lightboxIndex - 1 + count) % count;
                setLightboxIndex(prev);
                goToSlide(prev);
              }}
              aria-label="Foto sebelumnya"
              className="absolute left-2 sm:-left-14 top-1/2 -translate-y-1/2 p-3 rounded-full bg-black/60 text-white hover:bg-black/90 transition-colors cursor-pointer"
            >
              <svg className="size-6" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M15 19l-7-7 7-7" />
              </svg>
            </button>
            <button
              type="button"
              onClick={() => {
                const next = (lightboxIndex + 1) % count;
                setLightboxIndex(next);
                goToSlide(next);
              }}
              aria-label="Foto selanjutnya"
              className="absolute right-2 sm:-right-14 top-1/2 -translate-y-1/2 p-3 rounded-full bg-black/60 text-white hover:bg-black/90 transition-colors cursor-pointer"
            >
              <svg className="size-6" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M9 5l7 7-7 7" />
              </svg>
            </button>
          </div>
        </div>,
        document.body
      )}
    </div>
  );
}

export default CoverflowCarousel;
